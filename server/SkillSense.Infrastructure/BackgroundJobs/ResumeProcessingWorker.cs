using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SkillSense.Application.Interfaces;

namespace SkillSense.Infrastructure.BackgroundJobs;

public sealed class ResumeProcessingWorker(IServiceScopeFactory scopeFactory, ILogger<ResumeProcessingWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var queueService = scope.ServiceProvider.GetRequiredService<IResumeQueueService>();
                await queueService.ProcessPendingAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error processing resume queue");
            }

            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }
    }
}
