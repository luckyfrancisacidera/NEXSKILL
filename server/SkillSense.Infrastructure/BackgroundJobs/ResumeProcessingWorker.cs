using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SkillSense.Application.Interfaces;
using SkillSense.Infrastructure.Options;

namespace SkillSense.Infrastructure.BackgroundJobs;

public sealed class ResumeProcessingWorker(
    IServiceScopeFactory scopeFactory,
    IOptions<ResumeProcessingWorkerOptions> workerOptions,
    ILogger<ResumeProcessingWorker> logger) : BackgroundService
{
    private readonly ResumeProcessingWorkerOptions _options = workerOptions.Value;
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _options.Validate();

        var idleDeadlineUtc = DateTime.UtcNow.Add(_options.IdleTimeout);
        var currentBackoff = _options.InitialBackoff;

        while (!stoppingToken.IsCancellationRequested)
        {
            var nowUtc = DateTime.UtcNow;
            if (nowUtc >= idleDeadlineUtc)
            {
                logger.LogInformation(
                    "Stopping resume worker after {IdleTimeout} of inactivity.",
                    _options.IdleTimeout);
                break;
            }

            try
            {
                using var scope = scopeFactory.CreateScope();
                var processingService = scope.ServiceProvider.GetRequiredService<IResumeProcessingService>();
                var processedCount = await processingService.ProcessPendingBatchAsync(_options.BatchSize, stoppingToken);

                if (processedCount > 0)
                {
                    idleDeadlineUtc = DateTime.UtcNow.Add(_options.IdleTimeout);
                    currentBackoff = _options.InitialBackoff;
                    logger.LogDebug("Processed {ProcessedCount} resume submission(s).", processedCount);
                    continue;
                }

                var remainingIdle = idleDeadlineUtc - DateTime.UtcNow;
                if (remainingIdle <= TimeSpan.Zero)
                {
                    continue;
                }

                var delay = remainingIdle < currentBackoff ? remainingIdle : currentBackoff;
                await Task.Delay(delay, stoppingToken);
                currentBackoff = DoubleBackoff(currentBackoff, _options.MaxBackoff);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error processing resume queue");
                await Task.Delay(currentBackoff, stoppingToken);
                currentBackoff = DoubleBackoff(currentBackoff, _options.MaxBackoff);
            }

            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }
    }
    private static TimeSpan DoubleBackoff(TimeSpan value, TimeSpan max)
    {
        var doubledTicks = value.Ticks > long.MaxValue / 2 ? long.MaxValue : value.Ticks * 2;
        var doubled = TimeSpan.FromTicks(doubledTicks);
        return doubled <= max ? doubled : max;
    }
}
