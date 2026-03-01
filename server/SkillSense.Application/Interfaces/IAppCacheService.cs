namespace SkillSense.Application.Interfaces;

public interface IAppCacheService
{
    Task<T> GetOrCreateAsync<T>(string key, TimeSpan ttl, Func<Task<T>> factory);
    void Remove(string key);
    void RemoveByPrefix(string prefix);
}
