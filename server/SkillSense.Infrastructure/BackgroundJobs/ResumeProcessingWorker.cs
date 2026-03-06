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
        logger.LogInformation(
            "ResumeProcessingWorker started. BatchSize={BatchSize}, InitialBackoff={InitialBackoff}, MaxBackoff={MaxBackoff}",
            _options.BatchSize,
            _options.InitialBackoff,
            _options.MaxBackoff);

        var currentBackoff = _options.InitialBackoff;

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                logger.LogDebug("Polling for pending resume submissions.");

                using var scope = scopeFactory.CreateScope();
                var processingService = scope.ServiceProvider.GetRequiredService<IResumeProcessingService>();
                var processedCount = await processingService.ProcessPendingBatchAsync(_options.BatchSize, stoppingToken);

                if (processedCount > 0)
                {
                    logger.LogInformation("Processed {ProcessedCount} resume submission(s).", processedCount);
                    currentBackoff = _options.InitialBackoff;
                    continue;
                }

                logger.LogDebug("No pending resume submissions found. Sleeping for {Delay}.", currentBackoff);
                await Task.Delay(currentBackoff, stoppingToken);
                currentBackoff = DoubleBackoff(currentBackoff, _options.MaxBackoff);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                logger.LogInformation("ResumeProcessingWorker stop requested.");
                break;
            }
            catch (Exception ex)
            {
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
}