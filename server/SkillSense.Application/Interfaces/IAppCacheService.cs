namespace SkillSense.Application.Interfaces;

/// <summary>
/// Defines cache operations used by application services.
/// </summary>
public interface IAppCacheService
{
    /// <summary>
    /// Returns a cached value when present or creates and stores a new one for the provided key.
    /// </summary>
    Task<T> GetOrCreateAsync<T>(string key, TimeSpan ttl, Func<Task<T>> factory);

    /// <summary>
    /// Removes a single cached entry.
    /// </summary>
    void Remove(string key);

    /// <summary>
    /// Removes all cached entries whose keys start with the provided prefix.
    /// </summary>
    void RemoveByPrefix(string prefix);
}
