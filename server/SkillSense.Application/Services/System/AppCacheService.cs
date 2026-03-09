using global::System.Reflection;
using Microsoft.Extensions.Caching.Memory;
using SkillSense.Application.Interfaces;

namespace SkillSense.Application.Services.System;

/// <summary>
/// Provides lightweight in-memory caching for frequently requested application data.
/// </summary>
public sealed class AppCacheService(IMemoryCache memoryCache) : IAppCacheService
{
    /// <summary>
    /// Returns a cached item when present or creates, caches, and returns a new value.
    /// </summary>
    public async Task<T> GetOrCreateAsync<T>(string key, TimeSpan ttl, Func<Task<T>> factory)
    {
        if (memoryCache.TryGetValue<T>(key, out var value) && value is not null)
        {
            return value;
        }

        var created = await factory();
        memoryCache.Set(key, created, ttl);
        return created;
    }

    /// <summary>
    /// Removes a single cache entry by its exact key.
    /// </summary>
    public void Remove(string key) => memoryCache.Remove(key);

    /// <summary>
    /// Removes all cache entries whose keys share a common prefix.
    /// </summary>
    public void RemoveByPrefix(string prefix)
    {
        if (memoryCache is MemoryCache cache)
        {
            var entries = cache
                .GetType()
                .GetProperty("EntriesCollection", global::System.Reflection.BindingFlags.NonPublic | global::System.Reflection.BindingFlags.Instance)?
                .GetValue(cache) as dynamic;

            if (entries is null)
            {
                return;
            }

            var keys = new List<string>();
            foreach (var item in entries)
            {
                var key = item.GetType().GetProperty("Key")?.GetValue(item, null)?.ToString();
                if (!string.IsNullOrWhiteSpace(key) && key!.StartsWith(prefix, StringComparison.Ordinal))
                {
                    keys.Add(key);
                }
            }

            foreach (var key in keys)
            {
                memoryCache.Remove(key);
            }
        }
    }
}
