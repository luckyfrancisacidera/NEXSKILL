using System.Globalization;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Domain.Entities;

namespace SkillSense.Application.Common.Recruiter;

internal static class RecruiterDashboardComposer
{
    public static RecruiterDashboardSummaryResponse BuildSummary(
        IReadOnlyCollection<ResumeSubmissionEntity> current,
        IReadOnlyCollection<ResumeSubmissionEntity> previous)
        => new()
        {
            TotalApplicants = BuildMetric(current.Count, previous.Count),
            TotalShortlisted = BuildMetric(current.Count(x => x.Status == ResumeSubmissionStatus.Shortlisted), previous.Count(x => x.Status == ResumeSubmissionStatus.Shortlisted)),
            TotalInterview = BuildMetric(current.Count(x => x.Status == ResumeSubmissionStatus.Interview), previous.Count(x => x.Status == ResumeSubmissionStatus.Interview)),
            TotalOffer = BuildMetric(current.Count(x => x.Status == ResumeSubmissionStatus.Offer), previous.Count(x => x.Status == ResumeSubmissionStatus.Offer)),
            TotalHired = BuildMetric(current.Count(x => x.Status == ResumeSubmissionStatus.Hire), previous.Count(x => x.Status == ResumeSubmissionStatus.Hire)),
        };

    public static RecruiterDashboardTrendsResponse BuildTrends(
        IReadOnlyCollection<ResumeSubmissionEntity> applications,
        string groupBy,
        IReadOnlyDictionary<Guid, (string Title, string Department)> jobLookup)
    {
        string ResolveLabel(ResumeSubmissionEntity item)
            => groupBy switch
            {
                "week" => $"W{ISOWeek.GetWeekOfYear(item.CreatedAtUtc)} {item.CreatedAtUtc.Year}",
                "month" => item.CreatedAtUtc.ToString("yyyy-MM"),
                "year" => item.CreatedAtUtc.Year.ToString(),
                "department" => jobLookup.TryGetValue(item.JobId, out var job) ? job.Department : "Unassigned",
                "job" => jobLookup.TryGetValue(item.JobId, out var job) ? job.Title : "Unknown",
                _ => item.CreatedAtUtc.ToString("yyyy-MM")
            };

        var labels = applications.Select(ResolveLabel).Distinct().OrderBy(x => x).ToList();
        var metricsByLabel = labels.ToDictionary(label => label, _ => new TrendAccumulator());

        foreach (var application in applications)
        {
            var label = ResolveLabel(application);
            if (!metricsByLabel.TryGetValue(label, out var metric))
            {
                continue;
            }

            metric.Applicants++;
            if (application.Status == ResumeSubmissionStatus.Shortlisted)
            {
                metric.Shortlisted++;
            }
            else if (application.Status == ResumeSubmissionStatus.Interview)
            {
                metric.Interview++;
            }
            else if (application.Status == ResumeSubmissionStatus.Hire)
            {
                metric.Hired++;
            }
        }

        return new RecruiterDashboardTrendsResponse
        {
            Labels = labels,
            Datasets =
            [
                CreateTrendDataset("applicants", "Applicants", "#4F46E5", "rgba(79,70,229,0.2)", labels, metricsByLabel, x => x.Applicants),
                CreateTrendDataset("shortlisted", "Shortlisted", "#0EA5E9", "rgba(14,165,233,0.18)", labels, metricsByLabel, x => x.Shortlisted),
                CreateTrendDataset("interview", "Interview", "#F59E0B", "rgba(245,158,11,0.18)", labels, metricsByLabel, x => x.Interview),
                CreateTrendDataset("hired", "Hired", "#10B981", "rgba(16,185,129,0.18)", labels, metricsByLabel, x => x.Hired),
            ]
        };
    }

    private static MetricWithComparisonResponse BuildMetric(int current, int previous)
        => new()
        {
            Value = current,
            PreviousValue = previous,
            ComparisonPercent = previous <= 0 ? 0 : Math.Round(((decimal)(current - previous) / previous) * 100, 2),
        };

    private static TrendDatasetResponse CreateTrendDataset(
        string key,
        string label,
        string borderColor,
        string backgroundColor,
        IReadOnlyList<string> labels,
        IReadOnlyDictionary<string, TrendAccumulator> metricsByLabel,
        Func<TrendAccumulator, int> selector)
        => new()
        {
            Key = key,
            Label = label,
            BorderColor = borderColor,
            BackgroundColor = backgroundColor,
            Data = labels.Select(x => selector(metricsByLabel[x])).ToList(),
        };

    private sealed class TrendAccumulator
    {
        public int Applicants { get; set; }
        public int Shortlisted { get; set; }
        public int Interview { get; set; }
        public int Hired { get; set; }
    }
}
