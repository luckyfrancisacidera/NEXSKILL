using System.Globalization;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SkillSense.Application.Contracts.Recruiter.Request;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Request;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Recruiter;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Data;
using SkillSense.Persistence.Interfaces;

namespace SkillSense.Application.Services
{
    public sealed class RecruiterService(
        SkillSenseDbContext dbContext,
        IJobRepository jobRepository,
        ITextEmbeddingService embeddingService,
        IAppCacheService cacheService) : IRecruiterService
    {
        public async Task<RecruiterProfileResponse> GetProfileAsync(Guid recruiterId, CancellationToken ct = default)
        {
            var profile = await dbContext.RecruiterProfiles.FirstOrDefaultAsync(x => x.UserId == recruiterId, ct)
                ?? throw new InvalidOperationException("Recruiter profile not found.");

            return new RecruiterProfileResponse
            {
                CompanyName = profile.CompanyName,
                CompanyEmail = profile.CompanyEmail,
                IsComplete = !string.IsNullOrWhiteSpace(profile.CompanyName) && !string.IsNullOrWhiteSpace(profile.CompanyEmail)
            };
        }

        public async Task<RecruiterProfileResponse> UpsertProfileAsync(Guid recruiterId, RecruiterProfileRequest request, CancellationToken ct = default)
        {
            var profile = await dbContext.RecruiterProfiles.FirstOrDefaultAsync(x => x.UserId == recruiterId, ct)
                ?? throw new InvalidOperationException("Recruiter profile not found.");

            profile.CompanyName = request.CompanyName.Trim();
            profile.CompanyEmail = request.CompanyEmail.Trim();
            await dbContext.SaveChangesAsync(ct);

            return await GetProfileAsync(recruiterId, ct);
        }

        public async Task<JobListItemResponse> CreateJobAsync(Guid recruiterId, CreateJobRequest request, CancellationToken ct = default)
        {
            var profile = await EnsureProfileCompleteAsync(recruiterId, ct);
            if (string.IsNullOrWhiteSpace(request.Location)) throw new ArgumentException("location is required");
            if (request.NumberOfVacancies < 0) throw new ArgumentException("number_of_vacancies cannot be negative");
            var embedding = await embeddingService.EmbedAsync(request.Description, ct);

            var job = new JobEntity
            {
                Id = Guid.NewGuid(),
                RecruiterId = recruiterId,
                Title = request.Title,
                Description = request.Description,
                DescriptionEmbeddingJson = JsonSerializer.Serialize(embedding),
                ResponsibilitiesText = NormalizeMultilineText(request.Responsibilities),
                RequiredSkillsJson = JsonSerializer.Serialize(request.RequiredSkills),
                PreferredSkillsJson = JsonSerializer.Serialize(request.PreferredSkills),
                ExperienceLevel = request.ExperienceLevel,
                MinYears = request.MinYears,
                Education = request.Education ?? request.MinEducation,
                Department = request.Department,
                Benefits = request.Benefits,
                SalaryMinPerAnnum = request.SalaryMinPerAnnum,
                SalaryMaxPerAnnum = request.SalaryMaxPerAnnum,
                Currency = string.IsNullOrWhiteSpace(request.Currency) ? "PHP" : request.Currency,
                Location = request.Location,
                Schedule = request.Schedule,
                WorkSetup = (WorkSetup)(request.WorkSetup ?? 0),
                EmploymentType = (EmploymentType)(request.EmploymentType ?? 0),
                Status = ParseStatusOrDefault(request.Status),
                CreatedAtUtc = DateTime.UtcNow,
                PostedDateUtc = ParseStatusOrDefault(request.Status) == JobStatus.Published ? DateTime.UtcNow : null,
                CompanyNameSnapshot = profile.CompanyName,
                CompanyEmailSnapshot = profile.CompanyEmail,
                JobDescriptionStructuredJson = JsonSerializer.Serialize(BuildNormalizedJobDescription(request)),
                NumberOfVacancies = request.NumberOfVacancies
            };

            await jobRepository.AddAsync(job, ct);
            InvalidateRecruiterCaches(recruiterId);
            cacheService.RemoveByPrefix("jobs:public:list:");
            return Map(job, job.NumberOfVacancies);
        }

        public async Task<JobListItemResponse> UpdateJobAsync(Guid recruiterId, Guid jobId, UpdateJobRequest request, CancellationToken ct = default)
        {
            var job = await jobRepository.GetByIdForRecruiterAsync(jobId, recruiterId, ct) ?? throw new KeyNotFoundException("Job not found.");
            var embedding = await embeddingService.EmbedAsync(request.Description, ct);

            job.Title = request.Title;
            job.Description = request.Description;
            job.DescriptionEmbeddingJson = JsonSerializer.Serialize(embedding);
            job.ResponsibilitiesText = NormalizeMultilineText(request.Responsibilities);
            job.RequiredSkillsJson = JsonSerializer.Serialize(request.RequiredSkills);
            job.PreferredSkillsJson = JsonSerializer.Serialize(request.PreferredSkills);
            job.ExperienceLevel = request.ExperienceLevel;
            job.MinYears = request.MinYears;
            job.Education = request.Education ?? request.MinEducation;
            job.Department = request.Department;
            job.Benefits = request.Benefits;
            job.SalaryMinPerAnnum = request.SalaryMinPerAnnum;
            job.SalaryMaxPerAnnum = request.SalaryMaxPerAnnum;
            job.Currency = string.IsNullOrWhiteSpace(request.Currency) ? job.Currency : request.Currency;
            job.Location = request.Location;
            job.Schedule = request.Schedule;
            job.WorkSetup = (WorkSetup)(request.WorkSetup ?? (int)job.WorkSetup);
            job.EmploymentType = (EmploymentType)(request.EmploymentType ?? (int)job.EmploymentType);
            if (request.NumberOfVacancies < 0) throw new ArgumentException("number_of_vacancies cannot be negative");
            job.NumberOfVacancies = request.NumberOfVacancies;
            job.Status = ParseStatusOrDefault(request.Status);

            if (job.Status == JobStatus.Published && job.PostedDateUtc is null)
            {
                job.PostedDateUtc = DateTime.UtcNow;
            }

            job.JobDescriptionStructuredJson = JsonSerializer.Serialize(BuildNormalizedJobDescription(request));

            await jobRepository.UpdateAsync(job, ct);
            InvalidateAfterJobMutation(recruiterId, job.Id);

            var remainingVacancies = await GetRemainingVacanciesByJobIdAsync(job.Id, job.NumberOfVacancies, ct);
            return Map(job, remainingVacancies);
        }

        public async Task<PagedResult<JobListItemResponse>> GetJobsAsync(Guid recruiterId, int pageNumber, int pageSize, string? search, string? sortBy, string? sortDir, CancellationToken ct = default)
        {
            var cacheKey = $"jobs:recruiter:list:{recruiterId}:{pageNumber}:{pageSize}:{search}:{sortBy}:{sortDir}";
            return await cacheService.GetOrCreateAsync(cacheKey, TimeSpan.FromSeconds(30), async () =>
            {
                var query = dbContext.Jobs.AsNoTracking().Where(x => x.RecruiterId == recruiterId);
                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(x => x.Title.ToLower().Contains(search.ToLower()) || x.Location.ToLower().Contains(search.ToLower()));
                }

                query = (sortBy?.ToLowerInvariant(), sortDir?.ToLowerInvariant()) switch
                {
                    ("title", "asc") => query.OrderBy(x => x.Title),
                    ("title", _) => query.OrderByDescending(x => x.Title),
                    ("createdat", "asc") => query.OrderBy(x => x.CreatedAtUtc),
                    _ => query.OrderByDescending(x => x.CreatedAtUtc)
                };

                var totalCount = await query.CountAsync(ct);
                var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(ct);
                var remainingVacanciesByJobId = await BuildRemainingVacanciesLookupAsync(items, ct);

                return new PagedResult<JobListItemResponse>
                {
                    Items = items.Select(item => Map(item, remainingVacanciesByJobId.TryGetValue(item.Id, out var remaining) ? remaining : item.NumberOfVacancies)).ToList(),
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalCount = totalCount,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                };
            });
        }

        public async Task<JobListItemResponse?> GetJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default)
        {
            var job = await jobRepository.GetByIdForRecruiterAsync(jobId, recruiterId, ct);
            if (job is null)
            {
                return null;
            }

            var remainingVacancies = await GetRemainingVacanciesByJobIdAsync(job.Id, job.NumberOfVacancies, ct);
            return Map(job, remainingVacancies);
        }

        public async Task DeleteDraftJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default)
        {
            var job = await jobRepository.GetByIdForRecruiterAsync(jobId, recruiterId, ct) ?? throw new KeyNotFoundException("Job not found.");
            if (job.Status != JobStatus.Draft) throw new InvalidOperationException("Only draft jobs can be deleted.");
            await jobRepository.DeleteAsync(job, ct);
            InvalidateAfterJobMutation(recruiterId, jobId);
        }

        public async Task PublishJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default)
        {
            var job = await jobRepository.GetByIdAsync(jobId, ct) ?? throw new KeyNotFoundException("Job not found.");
            job.Status = JobStatus.Published;
            job.PostedDateUtc ??= DateTime.UtcNow;
            await jobRepository.UpdateAsync(job, ct);
            InvalidateAfterJobMutation(recruiterId, jobId);
        }

        public async Task CloseJobAsync(Guid recruiterId, Guid jobId, CancellationToken ct = default)
        {
            var job = await jobRepository.GetByIdAsync(jobId, ct) ?? throw new KeyNotFoundException("Job not found.");
            job.Status = JobStatus.Closed;
            await jobRepository.UpdateAsync(job, ct);
            InvalidateAfterJobMutation(recruiterId, jobId);
        }

        public async Task<RecruiterDashboardResponse> GetDashboardAsync(Guid recruiterId, DateTime? startDate, DateTime? endDate, string? department, string? jobRole, string? groupBy, CancellationToken ct = default)
        {
            var normalizedStartDate = startDate?.Date;
            var normalizedEndDate = endDate?.Date;
            if (normalizedStartDate.HasValue && normalizedEndDate.HasValue && normalizedStartDate.Value > normalizedEndDate.Value)
            {
                (normalizedStartDate, normalizedEndDate) = (normalizedEndDate, normalizedStartDate);
            }

            var normalizedDepartment = string.IsNullOrWhiteSpace(department) || department.Equals("all", StringComparison.OrdinalIgnoreCase) ? null : department.Trim();
            var normalizedRole = string.IsNullOrWhiteSpace(jobRole) || jobRole.Equals("all", StringComparison.OrdinalIgnoreCase) ? null : jobRole.Trim();
            var normalizedGroupBy = string.IsNullOrWhiteSpace(groupBy) ? "month" : groupBy.Trim().ToLowerInvariant();
            if (normalizedGroupBy is not ("week" or "month" or "year" or "department" or "job"))
            {
                normalizedGroupBy = "month";
            }

            var startUtc = normalizedStartDate.HasValue ? ToUtcStartOfDay(normalizedStartDate.Value) : (DateTime?)null;
            var endExclusiveUtc = normalizedEndDate.HasValue ? ToUtcStartOfDay(normalizedEndDate.Value).AddDays(1) : (DateTime?)null;

            var cacheKey = $"dashboard:recruiter:{recruiterId}:{normalizedStartDate:yyyyMMdd}:{normalizedEndDate:yyyyMMdd}:{normalizedDepartment}:{normalizedRole}:{normalizedGroupBy}";
            return await cacheService.GetOrCreateAsync(cacheKey, TimeSpan.FromSeconds(30), async () =>
            {
                var recruiterJobsBaseQuery = dbContext.Jobs.AsNoTracking().Where(j => j.RecruiterId == recruiterId);
                var departments = await recruiterJobsBaseQuery
                    .Where(j => j.Department != null && j.Department != string.Empty)
                    .Select(j => j.Department!)
                    .Distinct()
                    .OrderBy(v => v)
                    .ToListAsync(ct);
                var jobRoles = await recruiterJobsBaseQuery
                    .Select(j => j.Title)
                    .Distinct()
                    .OrderBy(v => v)
                    .ToListAsync(ct);
                var filterOptions = new RecruiterDashboardFilterOptionsResponse
                {
                    Departments = departments,
                    JobRoles = jobRoles,
                };

                var jobsQuery = recruiterJobsBaseQuery;

                if (normalizedDepartment is not null)
                {
                    jobsQuery = jobsQuery.Where(j => j.Department == normalizedDepartment);
                }

                if (normalizedRole is not null)
                {
                    jobsQuery = jobsQuery.Where(j => j.Title == normalizedRole);
                }

                var jobIds = await jobsQuery.Select(j => j.Id).ToListAsync(ct);
                var applicationsQuery = dbContext.ResumeSubmissions.AsNoTracking().Where(s => jobIds.Contains(s.JobId));
                if (startUtc.HasValue)
                {
                    applicationsQuery = applicationsQuery.Where(s => s.CreatedAtUtc >= startUtc.Value);
                }

                if (endExclusiveUtc.HasValue)
                {
                    applicationsQuery = applicationsQuery.Where(s => s.CreatedAtUtc < endExclusiveUtc.Value);
                }

                var applications = await applicationsQuery.ToListAsync(ct);

                var start = normalizedStartDate;
                var end = normalizedEndDate;
                var previousApplications = new List<ResumeSubmissionEntity>();
                if (start.HasValue && end.HasValue)
                {
                    var length = (end.Value - start.Value).Days + 1;
                    var prevStart = start.Value.AddDays(-length);
                    var prevEnd = start.Value.AddDays(-1);
                    var prevStartUtc = ToUtcStartOfDay(prevStart);
                    var prevEndExclusiveUtc = ToUtcStartOfDay(prevEnd).AddDays(1);

                    previousApplications = await dbContext.ResumeSubmissions.AsNoTracking()
                        .Where(s => jobIds.Contains(s.JobId) && s.CreatedAtUtc >= prevStartUtc && s.CreatedAtUtc < prevEndExclusiveUtc)
                        .ToListAsync(ct);
                }

                var summary = BuildSummary(applications, previousApplications);
                var jobLookup = await recruiterJobsBaseQuery
                    .Select(j => new { j.Id, j.Title, Department = j.Department ?? "Unassigned" })
                    .ToDictionaryAsync(j => j.Id, j => (j.Title, j.Department), ct);

                var trends = BuildTrends(applications, normalizedGroupBy, jobLookup);

                return new RecruiterDashboardResponse
                {
                    Filters = filterOptions,
                    Summary = summary,
                    Trends = trends,
                };
            });
        }

        public async Task<ApplicantScoresResponse> GetApplicantScoresAsync(Guid recruiterId, Guid? jobId, string? stage, string? search, int? recommendedTopPercent, CancellationToken ct = default)
        {
            var normalizedStage = string.IsNullOrWhiteSpace(stage) ? "all" : stage.Trim().ToLowerInvariant();
            var normalizedSearch = string.IsNullOrWhiteSpace(search) ? null : search.Trim().ToLowerInvariant();
            var topPercent = Math.Clamp(recommendedTopPercent ?? 10, 1, 100);

            var submissionsQuery = dbContext.ResumeSubmissions
                .AsNoTracking()
                .Join(dbContext.Jobs.AsNoTracking(), submission => submission.JobId, job => job.Id, (submission, job) => new { submission, job })
                .Join(dbContext.ResumeScores.AsNoTracking(), x => x.submission.Id, score => score.ResumeSubmissionId, (x, score) => new
                {
                    x.submission.Id,
                    x.submission.FullName,
                    x.submission.Email,
                    x.submission.CreatedAtUtc,
                    x.submission.JobId,
                    x.submission.Status,
                    JobTitle = x.job.Title,
                    x.job.RecruiterId,
                    Score = score.FinalWeightedScore
                })
                .Where(x => x.RecruiterId == recruiterId && (!jobId.HasValue || x.JobId == jobId.Value));

            if (normalizedSearch is not null)
            {
                submissionsQuery = submissionsQuery.Where(x =>
                    (x.FullName ?? string.Empty).ToLower().Contains(normalizedSearch) ||
                    (x.Email ?? string.Empty).ToLower().Contains(normalizedSearch) ||
                    x.JobTitle.ToLower().Contains(normalizedSearch));
            }

            var allItems = await submissionsQuery
                .OrderByDescending(x => x.CreatedAtUtc)
                .ToListAsync(ct);

            var recommendedCount = allItems.Count == 0 ? 0 : (int)Math.Ceiling(allItems.Count * (topPercent / 100d));
            var recommendedIds = allItems
                .OrderByDescending(x => x.Score)
                .Take(recommendedCount)
                .Select(x => x.Id)
                .ToHashSet();

            var projected = allItems.Select(x =>
            {
                var score = (int)Math.Round(x.Score);
                return new ApplicantScoreItemResponse
                {
                    ResumeSubmissionId = x.Id,
                    ApplicantName = string.IsNullOrWhiteSpace(x.FullName) ? "Unknown Applicant" : x.FullName!,
                    ApplicantEmail = string.IsNullOrWhiteSpace(x.Email) ? "-" : x.Email!,
                    JobId = x.JobId,
                    JobTitle = x.JobTitle,
                    Score = score,
                    SubmissionStatus = ResolveSubmissionStatus(x.Status, recommendedIds.Contains(x.Id)),
                    JobseekerStage = ResolveJobseekerStage(x.Status),
                    CreatedAtUtc = x.CreatedAtUtc,
                };
            }).ToList();

            var filtered = normalizedStage == "all"
                ? projected
                : projected.Where(x => x.SubmissionStatus.Equals(normalizedStage, StringComparison.OrdinalIgnoreCase)).ToList();

            var jobs = projected
                .GroupBy(x => new { x.JobId, x.JobTitle })
                .Select(group => new ApplicantScoreJobFilterResponse
                {
                    Id = group.Key.JobId,
                    Title = group.Key.JobTitle,
                    AllApplicants = group.Count(),
                    Recommended = group.Count(x => x.SubmissionStatus == "Recommended"),
                    Shortlisted = group.Count(x => x.SubmissionStatus == "Shortlisted"),
                    Interview = group.Count(x => x.SubmissionStatus == "Interview"),
                    Offer = group.Count(x => x.SubmissionStatus == "Offer"),
                    Hire = group.Count(x => x.SubmissionStatus == "Hire"),
                })
                .OrderBy(x => x.Title)
                .ToList();

            return new ApplicantScoresResponse
            {
                Items = filtered,
                Jobs = jobs,
                Counts = new ApplicantScoreCountsResponse
                {
                    AllApplicants = projected.Count,
                    Recommended = projected.Count(x => x.SubmissionStatus == "Recommended"),
                    Shortlisted = projected.Count(x => x.SubmissionStatus == "Shortlisted"),
                    Interview = projected.Count(x => x.SubmissionStatus == "Interview"),
                    Offer = projected.Count(x => x.SubmissionStatus == "Offer"),
                    Hire = projected.Count(x => x.SubmissionStatus == "Hire"),
                },
                Recommendation = new RecommendationSettingsResponse
                {
                    TopPercent = topPercent,
                }
            };
        }

        public async Task<ApplicantDetailResponse?> GetApplicantBySubmissionIdAsync(Guid recruiterId, Guid submissionId, CancellationToken ct = default)
        {
            var baseItem = (await GetApplicantScoresAsync(recruiterId, null, "all", null, 10, ct))
                 .Items
                 .FirstOrDefault(x => x.ResumeSubmissionId == submissionId);

            if (baseItem is null)
            {
                return null;
            }

            var parsedResumeJson = await dbContext.ResumeSubmissions
                .AsNoTracking()
                .Where(s => s.Id == submissionId)
                .Where(s => dbContext.Jobs.Any(j => j.Id == s.JobId && j.RecruiterId == recruiterId))
                .Select(s => s.ParsedResumeJson)
                .FirstOrDefaultAsync(ct);

            return new ApplicantDetailResponse
            {
                ResumeSubmissionId = baseItem.ResumeSubmissionId,
                ApplicantName = baseItem.ApplicantName,
                ApplicantEmail = baseItem.ApplicantEmail,
                JobId = baseItem.JobId,
                JobTitle = baseItem.JobTitle,
                Score = baseItem.Score,
                SubmissionStatus = baseItem.SubmissionStatus,
                JobseekerStage = baseItem.JobseekerStage,
                CreatedAtUtc = baseItem.CreatedAtUtc,
                ParsedResumeJson = ParseResumeJsonElement(parsedResumeJson),
            };

        }

        public async Task UpdateApplicantStatusAsync(Guid recruiterId, Guid submissionId, UpdateApplicantStageRequest request, CancellationToken ct = default)
        {
            if (!Enum.TryParse<ResumeSubmissionStatus>(request.Status, true, out var parsed))
            {
                throw new ArgumentException("Invalid applicant status.");
            }

            await using var transaction = await dbContext.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);
            var submission = await dbContext.ResumeSubmissions.FirstOrDefaultAsync(s => s.Id == submissionId, ct)
                ?? throw new KeyNotFoundException("Submission not found.");
            var job = await dbContext.Jobs.FirstOrDefaultAsync(j => j.Id == submission.JobId && j.RecruiterId == recruiterId, ct)
                ?? throw new KeyNotFoundException("Submission not found.");

            var now = DateTime.UtcNow;
            if (parsed == ResumeSubmissionStatus.Hire && submission.Status != ResumeSubmissionStatus.Hire)
            {
                var hiredCount = await dbContext.ResumeSubmissions.CountAsync(s => s.JobId == job.Id && s.Status == ResumeSubmissionStatus.Hire, ct);
                if (hiredCount >= job.NumberOfVacancies)
                {
                    throw new InvalidOperationException("Cannot hire applicant. The number of vacancies for this position has already been filled.");
                }
            }

            submission.Status = parsed;
            submission.UpdatedAtUtc = now;
            await dbContext.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            cacheService.RemoveByPrefix($"dashboard:recruiter:{recruiterId}:");
        }

        public async Task UpdateApplicantStatusesAsync(Guid recruiterId, BulkUpdateApplicantStageRequest request, CancellationToken ct = default)
        {
            var submissionIds = request.SubmissionIds.Distinct().ToList();
            foreach (var submissionId in submissionIds)
            {
                await UpdateApplicantStatusAsync(recruiterId, submissionId, new UpdateApplicantStageRequest { Status = request.Status }, ct);
            }

            cacheService.RemoveByPrefix($"dashboard:recruiter:{recruiterId}:");
        }

        private static JsonElement? ParseResumeJsonElement(string? parsedResumeJson)
        {
            if (string.IsNullOrWhiteSpace(parsedResumeJson))
            {
                return null;
            }

            try
            {
                using var document = JsonDocument.Parse(parsedResumeJson);
                return document.RootElement.Clone();
            }
            catch (JsonException)
            {
                return null;
            }
        }


        private static string ResolveJobseekerStage(ResumeSubmissionStatus status)
            => status switch
            {
                ResumeSubmissionStatus.Shortlisted => "Applied",
                ResumeSubmissionStatus.Interview => "Interview",
                ResumeSubmissionStatus.Offer => "Offer",
                ResumeSubmissionStatus.Hire => "Offer",
                ResumeSubmissionStatus.Rejected => "Rejected",
                _ => "Applied",
            };

        private static string ResolveSubmissionStatus(ResumeSubmissionStatus status, bool isRecommended)
            => status switch
            {
                ResumeSubmissionStatus.Shortlisted => "Shortlisted",
                ResumeSubmissionStatus.Interview => "Interview",
                ResumeSubmissionStatus.Offer => "Offer",
                ResumeSubmissionStatus.Hire => "Hire",
                ResumeSubmissionStatus.Rejected => "Rejected",
                _ => isRecommended ? "Recommended" : "Applied",
            };


        private static RecruiterDashboardSummaryResponse BuildSummary(IReadOnlyCollection<ResumeSubmissionEntity> current, IReadOnlyCollection<ResumeSubmissionEntity> previous)
            => new()
            {
                TotalApplicants = BuildMetric(current.Count, previous.Count),
                TotalShortlisted = BuildMetric(current.Count(x => x.Status == ResumeSubmissionStatus.Shortlisted), previous.Count(x => x.Status == ResumeSubmissionStatus.Shortlisted)),
                TotalInterview = BuildMetric(current.Count(x => x.Status == ResumeSubmissionStatus.Interview), previous.Count(x => x.Status == ResumeSubmissionStatus.Interview)),
                TotalOffer = BuildMetric(current.Count(x => x.Status == ResumeSubmissionStatus.Offer), previous.Count(x => x.Status == ResumeSubmissionStatus.Offer)),
                TotalHired = BuildMetric(current.Count(x => x.Status == ResumeSubmissionStatus.Hire), previous.Count(x => x.Status == ResumeSubmissionStatus.Hire)),
            };

        private static MetricWithComparisonResponse BuildMetric(int current, int previous)
        {
            var percent = previous <= 0 ? 0 : Math.Round(((decimal)(current - previous) / previous) * 100, 2);
            return new MetricWithComparisonResponse
            {
                Value = current,
                PreviousValue = previous,
                ComparisonPercent = percent,
            };
        }

        private static RecruiterDashboardTrendsResponse BuildTrends(IReadOnlyCollection<ResumeSubmissionEntity> applications, string groupBy, IReadOnlyDictionary<Guid, (string Title, string Department)> jobLookup)
        {
            string ResolveLabel(ResumeSubmissionEntity item)
                => groupBy switch
                {
                    "week" => $"W{ISOWeek.GetWeekOfYear(item.CreatedAtUtc)} {item.CreatedAtUtc.Year}",
                    "month" => item.CreatedAtUtc.ToString("yyyy-MM"),
                    "year" => item.CreatedAtUtc.Year.ToString(),
                    "department" => jobLookup.TryGetValue(item.JobId, out var job) ? job.Department : "Unassigned",
                    "job" => jobLookup.TryGetValue(item.JobId, out var j) ? j.Title : "Unknown",
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

            var datasets = new List<TrendDatasetResponse>
            {
                CreateTrendDataset("applicants", "Applicants", "#4F46E5", "rgba(79,70,229,0.2)", labels, metricsByLabel, x => x.Applicants),
                CreateTrendDataset("shortlisted", "Shortlisted", "#0EA5E9", "rgba(14,165,233,0.18)", labels, metricsByLabel, x => x.Shortlisted),
                CreateTrendDataset("interview", "Interview", "#F59E0B", "rgba(245,158,11,0.18)", labels, metricsByLabel, x => x.Interview),
                CreateTrendDataset("hired", "Hired", "#10B981", "rgba(16,185,129,0.18)", labels, metricsByLabel, x => x.Hired),
            };

            return new RecruiterDashboardTrendsResponse
            {
                Labels = labels,
                Datasets = datasets,
            };
        }

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


        private async Task<RecruiterProfileEntity> EnsureProfileCompleteAsync(Guid recruiterId, CancellationToken ct)
        {
            var profile = await dbContext.RecruiterProfiles.FirstOrDefaultAsync(x => x.UserId == recruiterId, ct)
                ?? throw new InvalidOperationException("Recruiter profile not found.");
            if (string.IsNullOrWhiteSpace(profile.CompanyName) || string.IsNullOrWhiteSpace(profile.CompanyEmail))
            {
                throw new InvalidOperationException("Recruiter company profile must be completed before creating jobs.");
            }

            return profile;
        }

        private static NormalizedJobDescription BuildNormalizedJobDescription(CreateJobRequest request)
            => new()
            {
                Title = request.Title ?? string.Empty,
                Description = request.Description ?? string.Empty,
                Responsibilities = (request.Responsibilities ?? string.Empty).Split(new[] { "\n", ";", "." }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
                RequiredSkills = request.RequiredSkills,
                PreferredSkills = request.PreferredSkills,
                MinimumYearsExperience = request.MinYears ?? 0,
                MinimumEducationLevel = request.MinEducation ?? request.Education ?? string.Empty,
                EducationRequirements = string.IsNullOrWhiteSpace(request.Education) ? [] : [request.Education],
                Metadata = new Dictionary<string, string> { ["experience_level"] = request.ExperienceLevel ?? string.Empty }
            };

        private static NormalizedJobDescription BuildNormalizedJobDescription(UpdateJobRequest request)
            => new()
            {
                Title = request.Title ?? string.Empty,
                Description = request.Description ?? string.Empty,
                Responsibilities = (request.Responsibilities ?? string.Empty).Split(new[] { "\n", ";", "." }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
                RequiredSkills = request.RequiredSkills,
                PreferredSkills = request.PreferredSkills,
                MinimumYearsExperience = request.MinYears ?? 0,
                MinimumEducationLevel = request.MinEducation ?? request.Education ?? string.Empty,
                EducationRequirements = string.IsNullOrWhiteSpace(request.Education) ? [] : [request.Education],
                Metadata = new Dictionary<string, string> { ["experience_level"] = request.ExperienceLevel ?? string.Empty }
            };

        private static JobStatus ParseStatusOrDefault(string? status)
        {
            if (string.IsNullOrWhiteSpace(status)) return JobStatus.Draft;
            return Enum.TryParse<JobStatus>(status, true, out var parsed) ? parsed : JobStatus.Draft;
        }

        private static JobListItemResponse Map(JobEntity x, int remainingVacancies)
            => new()
            {
                Id = x.Id,
                Title = x.Title,
                Department = x.Department,
                Benefits = x.Benefits,
                SalaryMinPerAnnum = x.SalaryMinPerAnnum,
                SalaryMaxPerAnnum = x.SalaryMaxPerAnnum,
                Currency = x.Currency,
                Location = x.Location,
                Schedule = x.Schedule,
                WorkSetup = x.WorkSetup.ToString(),
                EmploymentType = x.EmploymentType.ToString(),
                Status = x.Status.ToString(),
                CompanyName = x.CompanyNameSnapshot,
                CompanyEmail = x.CompanyEmailSnapshot,
                Description = x.Description,
                Responsibilities = NormalizeMultilineText(x.ResponsibilitiesText),
                RequiredSkills = JsonSerializer.Deserialize<List<string>>(x.RequiredSkillsJson) ?? [],
                PreferredSkills = JsonSerializer.Deserialize<List<string>>(x.PreferredSkillsJson) ?? [],
                ExperienceLevel = x.ExperienceLevel,
                MinYears = x.MinYears,
                Education = x.Education,
                MinEducation = x.Education,
                PostedDateUtc = x.PostedDateUtc,
                NumberOfVacancies = x.NumberOfVacancies,
                RemainingVacancies = Math.Max(0, remainingVacancies)
            };

        private async Task<Dictionary<Guid, int>> BuildRemainingVacanciesLookupAsync(IReadOnlyCollection<JobEntity> jobs, CancellationToken ct)
        {
            var jobIds = jobs.Select(x => x.Id).Distinct().ToList();
            if (jobIds.Count == 0)
            {
                return [];
            }

            var hiredCounts = await dbContext.ResumeSubmissions
                .AsNoTracking()
                .Where(x => jobIds.Contains(x.JobId) && x.Status == ResumeSubmissionStatus.Hire)
                .GroupBy(x => x.JobId)
                .Select(x => new { JobId = x.Key, Count = x.Count() })
                .ToDictionaryAsync(x => x.JobId, x => x.Count, ct);

            return jobs.ToDictionary(
                job => job.Id,
                job => Math.Max(0, job.NumberOfVacancies - hiredCounts.GetValueOrDefault(job.Id)));
        }

        private async Task<int> GetRemainingVacanciesByJobIdAsync(Guid jobId, int numberOfVacancies, CancellationToken ct)
        {
            var hiredCount = await dbContext.ResumeSubmissions
                .AsNoTracking()
                .CountAsync(x => x.JobId == jobId && x.Status == ResumeSubmissionStatus.Hire, ct);

            return Math.Max(0, numberOfVacancies - hiredCount);
        }

        private sealed class TrendAccumulator
        {
            public int Applicants { get; set; }
            public int Shortlisted { get; set; }
            public int Interview { get; set; }
            public int Hired { get; set; }
        }

        private static DateTime ToUtcStartOfDay(DateTime date)
            => DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);

        private static string NormalizeMultilineText(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return string.Empty;

            var lines = text
                .Split('\n', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
                .Select(line => line.Replace("\r", string.Empty).Trim());

            return string.Join(Environment.NewLine, lines);
        }

        private void InvalidateRecruiterCaches(Guid recruiterId)
        {
            cacheService.RemoveByPrefix($"jobs:recruiter:list:{recruiterId}:");
            cacheService.RemoveByPrefix($"dashboard:recruiter:{recruiterId}:");
        }

        private void InvalidateAfterJobMutation(Guid recruiterId, Guid jobId)
        {
            InvalidateRecruiterCaches(recruiterId);
            cacheService.Remove($"jobs:public:detail:{jobId}");
            cacheService.RemoveByPrefix("jobs:public:list:");
        }
    }
}