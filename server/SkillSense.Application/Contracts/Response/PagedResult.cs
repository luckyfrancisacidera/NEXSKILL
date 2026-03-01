using System.Text.Json.Serialization;

namespace SkillSense.Application.Contracts.Response
{
    public sealed class PagedResult<T>
    {
        [JsonPropertyName("items")]
        public IReadOnlyList<T> Items { get; set; } = [];

        [JsonPropertyName("pageNumber")]
        public int PageNumber { get; set; }

        [JsonPropertyName("pageSize")]
        public int PageSize { get; set; }

        [JsonPropertyName("totalCount")]
        public int TotalCount { get; set; }

        [JsonPropertyName("totalPages")]
        public int TotalPages { get; set; }
    }
}

