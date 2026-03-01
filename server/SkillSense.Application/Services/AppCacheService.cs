using Microsoft.Extensions.Caching.Memory;
using SkillSense.Application.Interfaces;

namespace SkillSense.Application.Services
{
    public sealed class AppCacheService(IMemoryCache memoryCache) : IAppCacheService
    {
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

        public void Remove(string key) => memoryCache.Remove(key);

        public void RemoveByPrefix(string prefix)
        {
            if (memoryCache is MemoryCache cache)
            {
                var entries = cache
                    .GetType()
                    .GetProperty("EntriesCollection", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)?
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
}
