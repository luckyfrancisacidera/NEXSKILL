using Microsoft.Extensions.Options;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using SkillSense.Application.Interfaces;
using SkillSense.Infrastructure.Options;
using System.Text;

namespace SkillSense.Infrastructure.Services;

public sealed class SbertOnnxEmbeddingService : ITextEmbeddingService, IDisposable
{
    private readonly InferenceSession _session;
    private readonly WordPieceTokenizer _tokenizer;
    private readonly int _maxSequenceLength;

    public SbertOnnxEmbeddingService(IOptions<SbertOptions> options)
    {
        var settings = options.Value;

        if (string.IsNullOrWhiteSpace(settings.ModelPath) || !File.Exists(settings.ModelPath))
        {
            throw new FileNotFoundException($"SBERT ONNX model not found at '{settings.ModelPath}'.");
        }

        if (string.IsNullOrWhiteSpace(settings.VocabularyPath) || !File.Exists(settings.VocabularyPath))
        {
            throw new FileNotFoundException($"SBERT vocabulary file not found at '{settings.VocabularyPath}'.");
        }

        _maxSequenceLength = Math.Max(32, settings.MaxSequenceLength);
        _session = new InferenceSession(settings.ModelPath);
        _tokenizer = new WordPieceTokenizer(settings.VocabularyPath);
    }

    public Task<IReadOnlyList<float>> EmbedAsync(string text, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var encoded = _tokenizer.Encode(text ?? string.Empty, _maxSequenceLength);
        using var inputIds = OrtValue.CreateTensorValueFromMemory(encoded.InputIds, [1, _maxSequenceLength]);
        using var attentionMask = OrtValue.CreateTensorValueFromMemory(encoded.AttentionMask, [1, _maxSequenceLength]);
        using var tokenTypeIds = OrtValue.CreateTensorValueFromMemory(encoded.TokenTypeIds, [1, _maxSequenceLength]);

        var inputs = new Dictionary<string, OrtValue>
        {
            ["input_ids"] = inputIds,
            ["attention_mask"] = attentionMask,
            ["token_type_ids"] = tokenTypeIds,
        };

        using var results = _session.Run(new RunOptions(), inputs, _session.OutputNames);
        using var output = results[0];

        var values = output.GetTensorDataAsSpan<float>();
        var dims = output.GetTensorTypeAndShape().Shape;
        var hiddenSize = (int)dims[^1];

        var pooled = MeanPool(values, encoded.AttentionMask, hiddenSize, _maxSequenceLength);
        NormalizeInPlace(pooled);

        return Task.FromResult<IReadOnlyList<float>>(pooled);
    }

    private static List<float> MeanPool(ReadOnlySpan<float> tokenEmbeddings, long[] attentionMask, int hiddenSize, int sequenceLength)
    {
        var pooled = new float[hiddenSize];
        var tokenCount = 0f;

        for (var tokenIndex = 0; tokenIndex < sequenceLength; tokenIndex++)
        {
            if (attentionMask[tokenIndex] == 0)
            {
                continue;
            }

            tokenCount++;
            var offset = tokenIndex * hiddenSize;
            for (var dim = 0; dim < hiddenSize; dim++)
            {
                pooled[dim] += tokenEmbeddings[offset + dim];
            }
        }

        if (tokenCount <= 0)
        {
            tokenCount = 1;
        }

        for (var i = 0; i < pooled.Length; i++)
        {
            pooled[i] /= tokenCount;
        }

        return pooled.ToList();
    }

    private static void NormalizeInPlace(List<float> vector)
    {
        double sumSquares = 0;
        foreach (var value in vector)
        {
            sumSquares += value * value;
        }

        var norm = Math.Sqrt(sumSquares);
        if (norm <= 0)
        {
            return;
        }

        for (var i = 0; i < vector.Count; i++)
        {
            vector[i] = (float)(vector[i] / norm);
        }
    }

    public void Dispose()
    {
        _session.Dispose();
    }

    private sealed record EncodedTokens(long[] InputIds, long[] AttentionMask, long[] TokenTypeIds);

    private sealed class WordPieceTokenizer
    {
        private readonly Dictionary<string, int> _vocabulary;
        private readonly int _unkId;
        private readonly int _clsId;
        private readonly int _sepId;
        private readonly int _padId;

        public WordPieceTokenizer(string vocabularyPath)
        {
            _vocabulary = File.ReadAllLines(vocabularyPath)
                .Select((token, index) => new { token, index })
                .ToDictionary(x => x.token.Trim(), x => x.index, StringComparer.Ordinal);

            _unkId = ResolveId("[UNK]");
            _clsId = ResolveId("[CLS]");
            _sepId = ResolveId("[SEP]");
            _padId = ResolveId("[PAD]");
        }

        public EncodedTokens Encode(string text, int maxLength)
        {
            var tokenIds = new List<long>(maxLength) { _clsId };

            foreach (var token in BasicTokenize(text))
            {
                tokenIds.AddRange(WordPieceTokenize(token));
                if (tokenIds.Count >= maxLength - 1)
                {
                    break;
                }
            }

            tokenIds.Add(_sepId);

            if (tokenIds.Count > maxLength)
            {
                tokenIds = tokenIds.Take(maxLength).ToList();
                tokenIds[^1] = _sepId;
            }

            var inputIds = new long[maxLength];
            var mask = new long[maxLength];
            var tokenTypeIds = new long[maxLength];

            for (var i = 0; i < maxLength; i++)
            {
                if (i < tokenIds.Count)
                {
                    inputIds[i] = tokenIds[i];
                    mask[i] = 1;
                    tokenTypeIds[i] = 0;
                }
                else
                {
                    inputIds[i] = _padId;
                    mask[i] = 0;
                    tokenTypeIds[i] = 0;
                }
            }

            return new EncodedTokens(inputIds, mask, tokenTypeIds);
        }

        private IEnumerable<long> WordPieceTokenize(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                yield break;
            }

            var normalized = token.ToLowerInvariant();
            var start = 0;
            var subTokens = new List<long>();
            var isBad = false;

            while (start < normalized.Length)
            {
                var end = normalized.Length;
                int? currentId = null;

                while (start < end)
                {
                    var piece = normalized[start..end];
                    if (start > 0)
                    {
                        piece = $"##{piece}";
                    }

                    if (_vocabulary.TryGetValue(piece, out var id))
                    {
                        currentId = id;
                        break;
                    }

                    end--;
                }

                if (currentId is null)
                {
                    isBad = true;
                    break;
                }

                subTokens.Add(currentId.Value);
                start = end;
            }

            if (isBad)
            {
                yield return _unkId;
                yield break;
            }

            foreach (var id in subTokens)
            {
                yield return id;
            }
        }

        private static IEnumerable<string> BasicTokenize(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                yield break;
            }

            var builder = new StringBuilder();
            foreach (var ch in text)
            {
                if (char.IsLetterOrDigit(ch))
                {
                    builder.Append(ch);
                }
                else
                {
                    if (builder.Length > 0)
                    {
                        yield return builder.ToString();
                        builder.Clear();
                    }
                }
            }

            if (builder.Length > 0)
            {
                yield return builder.ToString();
            }
        }

        private int ResolveId(string token)
        {
            if (_vocabulary.TryGetValue(token, out var id))
            {
                return id;
            }

            throw new InvalidOperationException($"'{token}' is missing from SBERT vocabulary.");
        }
    }
}
