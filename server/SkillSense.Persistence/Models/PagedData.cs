namespace SkillSense.Persistence.Models;

public sealed class PagedData<T>
{
    public IReadOnlyList<T> Items { get; set; } = [];
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}

public sealed class MyApplicationData
{
    public Guid Id { get; set; }
    public Guid JobId { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}
