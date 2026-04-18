using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Options;
using SkillSense.Infrastructure.Options;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Infrastructure.BackgroundJobs;

public sealed class ResumeProcessingWorker(
    IServiceScopeFactory scopeFactory,
    IOptions<ResumeProcessingWorkerOptions> workerOptions,
    IOptions<ResumeProcessingOptions> processingOptions,
    IResumeProcessingMonitor processingMonitor,
    ILogger<ResumeProcessingWorker> logger) : BackgroundService
{
    private readonly ResumeProcessingWorkerOptions _options = workerOptions.Value;
    private readonly ResumeProcessingOptions _processingOptions = processingOptions.Value;
    private readonly string _workerInstanceId = Guid.NewGuid().ToString("N");

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _options.Validate();
        if (logger.IsEnabled(LogLevel.Information))
        {
            logger.LogInformation(
                "ResumeProcessingWorker started. WorkerInstanceId={WorkerInstanceId} BatchSize={BatchSize}, MaxParallelResumes={MaxParallelResumes}, InitialBackoff={InitialBackoff}, MaxBackoff={MaxBackoff}",
                _workerInstanceId,
                _options.BatchSize,
                _options.MaxParallelResumes,
                _options.InitialBackoff,
                _options.MaxBackoff);
        }
        processingMonitor.RecordWorkerStarted();

        var currentBackoff = _options.InitialBackoff;

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                processingMonitor.RecordWorkerHeartbeat();
                logger.LogDebug("Polling for pending resume submissions.");

                var processedCount = await ProcessClaimedBatchWithConcurrencyAsync(stoppingToken);

                if (processedCount > 0)
                {
                    logger.LogInformation("Processed {ProcessedCount} resume submission(s).", processedCount);
                    processingMonitor.RecordWorkerHeartbeat();
                    currentBackoff = _options.InitialBackoff;
                    continue;
                }

                if (logger.IsEnabled(LogLevel.Debug))
                {
                    logger.LogDebug("No pending resume submissions found. Sleeping for {Delay}.", currentBackoff);
                }
                await Task.Delay(currentBackoff, stoppingToken);
                currentBackoff = DoubleBackoff(currentBackoff, _options.MaxBackoff);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                if (logger.IsEnabled(LogLevel.Information))
                {
                    logger.LogInformation("ResumeProcessingWorker stop requested.");
                }
                break;
            }
            catch (Exception ex)
            {
                processingMonitor.RecordWorkerFailure(ex);
                logger.LogError(ex, "Error while processing resume queue. Retrying after {Delay}.", currentBackoff);

                try
                {
                    await Task.Delay(currentBackoff, stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }

                currentBackoff = DoubleBackoff(currentBackoff, _options.MaxBackoff);
            }
        }

        logger.LogInformation("ResumeProcessingWorker stopped.");
    }

    private static TimeSpan DoubleBackoff(TimeSpan value, TimeSpan max)
    {
        var doubledTicks = value.Ticks > long.MaxValue / 2 ? long.MaxValue : value.Ticks * 2;
        var doubled = TimeSpan.FromTicks(doubledTicks);
        return doubled <= max ? doubled : max;
    }

    private async Task<int> ProcessClaimedBatchWithConcurrencyAsync(CancellationToken stoppingToken)
    {
        Guid[] submissionIds;
        using (var claimScope = scopeFactory.CreateScope())
        {
            var submissionRepository = claimScope.ServiceProvider.GetRequiredService<IResumeSubmissionRepository>();
            var claimedBatch = await submissionRepository.ClaimProcessableBatchAsync(
                _options.BatchSize,
                DateTime.UtcNow,
                _processingOptions.MaxRetryAttempts,
                stoppingToken);

            submissionIds = [.. claimedBatch.Select(x => x.Id)];
        }

        if (submissionIds.Length == 0)
        {
            return 0;
        }

        var maxConcurrency = Math.Min(_options.MaxParallelResumes, submissionIds.Length);
        if (logger.IsEnabled(LogLevel.Information))
        {
            logger.LogInformation(
                "WorkerInstanceId={WorkerInstanceId} claimed {ClaimedCount} submission(s). Processing with max concurrency {MaxConcurrency}.",
                _workerInstanceId,
                submissionIds.Length,
                maxConcurrency);
        }

        using var gate = new SemaphoreSlim(maxConcurrency, maxConcurrency);
        var tasks = submissionIds.Select(id => ProcessSubmissionInIsolatedScopeAsync(id, gate, stoppingToken));
        var outcomes = await Task.WhenAll(tasks);
        return outcomes.Count(x => x);
    }

    private async Task<bool> ProcessSubmissionInIsolatedScopeAsync(Guid submissionId, SemaphoreSlim gate, CancellationToken stoppingToken)
    {
        await gate.WaitAsync(stoppingToken);
        try
        {
            using var submissionScope = scopeFactory.CreateScope();
            var processingService = submissionScope.ServiceProvider.GetRequiredService<IResumeProcessingService>();
            return await processingService.ProcessClaimedSubmissionAsync(submissionId, stoppingToken);
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            processingMonitor.RecordWorkerFailure(ex);
            logger.LogError(ex, "WorkerInstanceId={WorkerInstanceId} failed to process claimed resume submission {SubmissionId}.", _workerInstanceId, submissionId);
            return false;
        }
        finally
        {
            gate.Release();
        }
    }
}
