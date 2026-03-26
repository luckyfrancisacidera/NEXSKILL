using System.Text.Json;
using SkillSense.Application.Contracts.Jobseeker.Request;
using SkillSense.Application.Contracts.Jobseeker.Response;
using SkillSense.Application.Contracts.Notifications;
using SkillSense.Application.Contracts.Offers;
using SkillSense.Application.Contracts.Recruiter.Response;
using SkillSense.Application.Contracts.Response;
using SkillSense.Application.Interfaces;
using SkillSense.Application.Interfaces.Jobseeker;
using SkillSense.Domain.Entities;
using SkillSense.Persistence.Interfaces;
using SkillSense.Persistence.Models;

namespace SkillSense.Application.Services.Jobseeker
{
    public sealed class JobSeekerService(
        IJobSeekerRepository jobSeekerRepository,
        IResumeUploadService resumeUploadService,
        IAppCacheService cacheService,
        IDateTimeProvider dateTimeProvider,
        INotificationService notificationService) : IJobSeekerService
    {
        public async Task<PagedResult<JobListItemResponse>> GetPublicJobsAsync(int pageNumber, int pageSize, string? search, string? sortBy, string? sortDir, CancellationToken ct = default)
        {
            var cacheKey = $"jobs:public:list:{pageNumber}:{pageSize}:{search}:{sortBy}:{sortDir}";
            return await cacheService.GetOrCreateAsync(cacheKey, TimeSpan.FromSeconds(60), async () =>
            {
                var pagedJobs = await jobSeekerRepository.GetPublishedJobsAsync(pageNumber, pageSize, search, sortBy, sortDir, ct);
                return new PagedResult<JobListItemResponse>
                {
                    Items = pagedJobs.Items.Select(Map).ToList(),
                    PageNumber = pagedJobs.PageNumber,
                    PageSize = pagedJobs.PageSize,
                    TotalCount = pagedJobs.TotalCount,
                    TotalPages = pagedJobs.TotalPages
                };
            });
        }

        public async Task<JobListItemResponse?> GetPublicJobAsync(Guid id, CancellationToken ct = default)
            => await cacheService.GetOrCreateAsync($"jobs:public:detail:{id}", TimeSpan.FromSeconds(120), async () =>
            {
                var job = await jobSeekerRepository.GetPublishedJobByIdAsync(id, ct);
                return job is null ? null : Map(job);
            });

        public async Task<ResumeUploadResponse> ApplyAsync(Guid jobId, ApplyToJobRequest request, Stream fileStream, string fileName, string contentType, Guid? jobSeekerUserId, CancellationToken ct = default)
        {
            var job = await jobSeekerRepository.GetPublishedJobByIdAsync(jobId, ct)
                ?? throw new InvalidOperationException("Published job not found.");

            if (jobSeekerUserId.HasValue
                && await resumeUploadService.HasActiveApplicationAsync(jobId, jobSeekerUserId.Value, ct))
            {
                throw new InvalidOperationException("You have already applied to this job.");
            }

            var response = await resumeUploadService.EnqueueUploadAsync(fileStream, fileName, contentType, jobId, job.Title, request.FullName, request.Email, request.PostalCode, request.Location, jobSeekerUserId, ct);
            response.Message = "Application submitted successfully. We have started processing your resume.";
            cacheService.RemoveByPrefix("dashboard:recruiter:");
            cacheService.RemoveByPrefix($"dashboard:jobseeker:{jobSeekerUserId}");
            return response;
        }

        public async Task<PagedResult<JobSeekerApplicationResponse>> GetMyApplicationsAsync(Guid userId, int pageNumber, int pageSize, string? search, string? status, DateTime? startDate, DateTime? endDate, CancellationToken ct = default)
        {
            var pagedApplications = await jobSeekerRepository.GetApplicationsByUserAsync(userId, pageNumber, pageSize, search, status, startDate, endDate, ct);
            return new PagedResult<JobSeekerApplicationResponse>
            {
                Items = pagedApplications.Items.Select(MapApplication).ToList(),
                PageNumber = pagedApplications.PageNumber,
                PageSize = pagedApplications.PageSize,
                TotalCount = pagedApplications.TotalCount,
                TotalPages = pagedApplications.TotalPages
            };
        }

        public async Task<object> GetDashboardSummaryAsync(Guid userId, string range, CancellationToken ct = default)
        {
            var normalizedRange = (range ?? "this_week").Trim().ToLowerInvariant();
            var (start, end, granularity) = ResolveRange(normalizedRange);
            var analytics = await jobSeekerRepository.GetApplicationAnalyticsAsync(userId, start, end, granularity, ct);
            var recentApps = await jobSeekerRepository.GetApplicationsByUserAsync(userId, 1, 5, null, null, null, null, ct);
            var recentApplicationResponses = recentApps.Items.Select(MapApplication).ToList();
            var savedJobs = await jobSeekerRepository.GetSavedJobsAsync(userId, null, ct);

            return new
            {
                status = new
                {
                    applied = recentApplicationResponses.Count(x => x.CurrentStage == "Applied" || x.CurrentStage == "Shortlisted"),
                    interview = recentApplicationResponses.Count(x => x.CurrentStage == "Interview"),
                    offer = recentApplicationResponses.Count(x => x.CurrentStage == "Offer")
                },
                saved_jobs = savedJobs.Take(4).Select(x => new
                {
                    id = x.JobId,
                    title = x.Title,
                    company = x.Company,
                    location = x.Location,
                    salary_min = x.SalaryMin,
                    salary_max = x.SalaryMax,
                    currency = x.Currency,
                    job_type = x.EmploymentType,
                    is_saved = true
                }).ToList(),
                recent_applications = recentApplicationResponses.Select(x => new
                {
                    id = x.Id,
                    job_title = x.JobTitle,
                    company = x.CompanyName,
                    applied_at = x.CreatedAtUtc,
                    status = x.CurrentStage
                }).ToList(),
                analytics = new
                {
                    labels = analytics.Select(x => x.Date.ToString(granularity == "month" ? "MMM yyyy" : "MMM dd")).ToList(),
                    counts = analytics.Select(x => x.Count).ToList(),
                    total = analytics.Sum(x => x.Count),
                    range = normalizedRange
                }
            };
        }

        public async Task<IReadOnlyList<object>> GetSavedJobsAsync(Guid userId, string? search, CancellationToken ct = default)
        {
            var items = await jobSeekerRepository.GetSavedJobsAsync(userId, search, ct);
            return items.Select(x => (object)new
            {
                id = x.JobId,
                title = x.Title,
                company = x.Company,
                location = x.Location,
                description = x.Description,
                salary_min = x.SalaryMin,
                salary_max = x.SalaryMax,
                currency = x.Currency,
                job_type = x.EmploymentType,
                is_saved = true,
                saved_at = x.SavedAtUtc
            }).ToList();
        }

        public async Task SaveJobAsync(Guid userId, Guid jobId, CancellationToken ct = default)
        {
            var job = await jobSeekerRepository.GetPublishedJobByIdAsync(jobId, ct) ?? throw new KeyNotFoundException("Job not found.");
            if (await jobSeekerRepository.IsJobSavedAsync(userId, jobId, ct)) return;
            await jobSeekerRepository.SaveJobAsync(new SavedJobEntity { UserId = userId, JobId = jobId, Id = Guid.NewGuid() }, ct);
        }

        public Task RemoveSavedJobAsync(Guid userId, Guid jobId, CancellationToken ct = default)
            => jobSeekerRepository.RemoveSavedJobAsync(userId, jobId, ct);

        public async Task<object> GetMyProfileAsync(Guid userId, CancellationToken ct = default)
        {
            var profile = await jobSeekerRepository.GetProfileAsync(userId, ct) ?? new JobSeekerProfileEntity { UserId = userId };
            return ToProfileResponse(profile);
        }

        public async Task<object> UpdateMyProfileAsync(Guid userId, JobSeekerProfileRequest request, CancellationToken ct = default)
        {
            var profile = await jobSeekerRepository.GetProfileAsync(userId, ct);
            if (profile is null)
            {
                profile = new JobSeekerProfileEntity { Id = Guid.NewGuid(), UserId = userId };
            }

            profile.FullName = request.FullName?.Trim();
            profile.Phone = request.Phone?.Trim();
            profile.Location = request.Location?.Trim();
            profile.ProfessionalTitle = request.ProfessionalTitle?.Trim();
            profile.Skills = request.Skills?.Trim();
            profile.Bio = request.Bio?.Trim();
            profile.ExperienceSummary = request.ExperienceSummary?.Trim();
            profile.ResumeUrl = request.ResumeUrl?.Trim();
            profile.AvatarUrl = request.AvatarUrl?.Trim();
            profile.UpdatedAtUtc = dateTimeProvider.UtcNow;

            await jobSeekerRepository.UpsertProfileAsync(profile, ct);
            return ToProfileResponse(profile);
        }

        public async Task<JobSeekerApplicationResponse> GetApplicationDetailAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        {
            var item = await jobSeekerRepository.GetApplicationDetailAsync(userId, applicationId, ct)
                ?? throw new KeyNotFoundException("Application not found.");

            return MapApplication(item);
        }

        public async Task<OfferResponse> GetOfferAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        {
            var offer = await jobSeekerRepository.GetLatestOfferByApplicationIdAsync(userId, applicationId, ct)
                ?? throw new KeyNotFoundException("Offer not found.");

            offer = await EnsureOfferExpirationStateAsync(offer, ct);
            return MapOffer(offer);
        }

        public async Task<OfferResponse> AcceptOfferAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        {
            var entity = await jobSeekerRepository.GetApplicationEntityAsync(userId, applicationId, ct)
                ?? throw new KeyNotFoundException("Application not found.");
            var offer = await jobSeekerRepository.GetLatestOfferByApplicationIdAsync(userId, applicationId, ct)
                ?? throw new KeyNotFoundException("Offer not found.");

            offer = await EnsureOfferExpirationStateAsync(offer, ct);
            ValidatePendingOfferResponse(offer);

            offer.Status = JobOfferStatus.Accepted;
            offer.RespondedAtUtc = dateTimeProvider.UtcNow;
            offer.UpdatedAtUtc = dateTimeProvider.UtcNow;
            entity.Status = ResumeSubmissionStatus.Offer;
            entity.UpdatedAtUtc = dateTimeProvider.UtcNow;
            await jobSeekerRepository.SaveChangesAsync(ct);

            await notificationService.CreateNotificationAsync(new CreateNotificationRequest
            {
                UserId = offer.SentByUserId,
                Title = "Offer accepted",
                Message = $"{entity.FullName ?? entity.Email ?? "Candidate"} accepted the offer.",
                Type = NotificationType.Success,
                RelatedEntityId = entity.Id,
            }, ct);

            return MapOffer(offer);
        }

        public async Task<OfferResponse> DeclineOfferAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        {
            var entity = await jobSeekerRepository.GetApplicationEntityAsync(userId, applicationId, ct)
                ?? throw new KeyNotFoundException("Application not found.");
            var offer = await jobSeekerRepository.GetLatestOfferByApplicationIdAsync(userId, applicationId, ct)
                ?? throw new KeyNotFoundException("Offer not found.");

            offer = await EnsureOfferExpirationStateAsync(offer, ct);
            ValidatePendingOfferResponse(offer);

            offer.Status = JobOfferStatus.Declined;
            offer.RespondedAtUtc = dateTimeProvider.UtcNow;
            offer.UpdatedAtUtc = dateTimeProvider.UtcNow;
            entity.Status = ResumeSubmissionStatus.Offer;
            entity.UpdatedAtUtc = dateTimeProvider.UtcNow;
            await jobSeekerRepository.SaveChangesAsync(ct);

            await notificationService.CreateNotificationAsync(new CreateNotificationRequest
            {
                UserId = offer.SentByUserId,
                Title = "Offer declined",
                Message = $"{entity.FullName ?? entity.Email ?? "Candidate"} declined the offer.",
                Type = NotificationType.Warning,
                RelatedEntityId = entity.Id,
            }, ct);

            return MapOffer(offer);
        }

        public async Task WithdrawApplicationAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        {
            var entity = await jobSeekerRepository.GetVisibleApplicationEntityAsync(userId, applicationId, ct) ?? throw new KeyNotFoundException("Application not found.");
            if (entity.Status is ResumeSubmissionStatus.Hire or ResumeSubmissionStatus.Rejected)
                throw new InvalidOperationException("This application can no longer be withdrawn.");
            entity.Status = ResumeSubmissionStatus.Failed;
            entity.UpdatedAtUtc = dateTimeProvider.UtcNow;
            await jobSeekerRepository.SaveChangesAsync(ct);
        }

        public async Task HideApplicationFromHistoryAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        {
            var entity = await jobSeekerRepository.GetVisibleApplicationEntityAsync(userId, applicationId, ct)
                ?? throw new KeyNotFoundException("Application not found.");

            if (entity.Status is not (ResumeSubmissionStatus.Failed or ResumeSubmissionStatus.Hire))
            {
                throw new InvalidOperationException("Only withdrawn or hired applications can be removed from your visible history.");
            }

            entity.IsHiddenFromJobSeekerHistory = true;
            entity.UpdatedAtUtc = dateTimeProvider.UtcNow;
            await jobSeekerRepository.SaveChangesAsync(ct);
        }

        private JobSeekerApplicationResponse MapApplication(ApplicationListItemData item)
        {
            var currentStage = ResolveCurrentStage(item.Status);
            var hasOffer = item.OfferId.HasValue || item.Status is ResumeSubmissionStatus.Offer or ResumeSubmissionStatus.Hire;
            var isHired = item.Status == ResumeSubmissionStatus.Hire;

            return new JobSeekerApplicationResponse
            {
                Id = item.Id,
                JobId = item.JobId,
                JobTitle = item.JobTitle,
                Company = item.CompanyName,
                CompanyName = item.CompanyName,
                RecruiterName = ResolveRecruiterName(item.RecruiterName, item.RecruiterEmail),
                RecruiterEmail = item.RecruiterEmail,
                FullName = item.FullName,
                Email = item.Email,
                Status = currentStage,
                CurrentStage = currentStage,
                HasOffer = hasOffer,
                IsHired = isHired,
                OfferedAtUtc = item.Status == ResumeSubmissionStatus.Offer ? item.UpdatedAtUtc : null,
                HiredAtUtc = item.Status == ResumeSubmissionStatus.Hire ? item.UpdatedAtUtc : null,
                CreatedAtUtc = item.CreatedAtUtc,
                UpdatedAtUtc = item.UpdatedAtUtc,
                Offer = MapOffer(item),
            };
        }

        private static string ResolveCurrentStage(ResumeSubmissionStatus status)
            => status switch
            {
                ResumeSubmissionStatus.Completed => "Under Review",
                ResumeSubmissionStatus.Shortlisted => "Shortlisted",
                ResumeSubmissionStatus.Interview => "Interview",
                ResumeSubmissionStatus.Offer => "Offer",
                ResumeSubmissionStatus.Hire => "Hired",
                ResumeSubmissionStatus.Rejected => "Rejected",
                ResumeSubmissionStatus.Failed => "Withdrawn",
                ResumeSubmissionStatus.Pending or ResumeSubmissionStatus.Processing => "Applied",
                _ => "Applied"
            };

        private static string? ResolveRecruiterName(string? recruiterName, string? recruiterEmail)
        {
            if (!string.IsNullOrWhiteSpace(recruiterName))
            {
                return recruiterName;
            }

            if (!string.IsNullOrWhiteSpace(recruiterEmail))
            {
                return recruiterEmail;
            }

            return null;
        }

        private static object ToProfileResponse(JobSeekerProfileEntity profile) => new
        {
            full_name = profile.FullName,
            phone = profile.Phone,
            location = profile.Location,
            professional_title = profile.ProfessionalTitle,
            skills = profile.Skills,
            bio = profile.Bio,
            experience_summary = profile.ExperienceSummary,
            resume_url = profile.ResumeUrl,
            avatar_url = profile.AvatarUrl,
            updated_at_utc = profile.UpdatedAtUtc
        };

        private (DateTime Start, DateTime End, string Granularity) ResolveRange(string range)
        {
            var now = dateTimeProvider.UtcNow;
            return range switch
            {
                "last_week" => (now.Date.AddDays(-13), now.Date.AddDays(-7).AddDays(1).AddTicks(-1), "day"),
                "this_month" => (new DateTime(now.Year, now.Month, 1), now, "day"),
                "last_month" => (new DateTime(now.Year, now.Month, 1).AddMonths(-1), new DateTime(now.Year, now.Month, 1).AddTicks(-1), "day"),
                "this_year" => (new DateTime(now.Year, 1, 1), now, "month"),
                "last_year" => (new DateTime(now.Year - 1, 1, 1), new DateTime(now.Year, 1, 1).AddTicks(-1), "month"),
                _ => (now.Date.AddDays(-(int)now.DayOfWeek), now, "day")
            };
        }

        private static JobListItemResponse Map(JobEntity x)
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
                RequiredSkills = JsonSerializer.Deserialize<List<string>>(x.RequiredSkillsJson) ?? [],
                PreferredSkills = JsonSerializer.Deserialize<List<string>>(x.PreferredSkillsJson) ?? [],
                CompanyName = x.CompanyNameSnapshot,
                CompanyEmail = x.CompanyEmailSnapshot,
                Description = NormalizeMultilineText(x.Description),
                Responsibilities = NormalizeMultilineText(x.ResponsibilitiesText),
                ExperienceLevel = x.ExperienceLevel,
                MinYears = x.MinYears,
                Education = x.Education,
                MinEducation = x.Education,
                PostedDateUtc = x.PostedDateUtc
            };

        private static string NormalizeMultilineText(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return string.Empty;
            var lines = text.Split('\n', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
                .Select(line => line.Replace("\r", string.Empty).Trim());
            return string.Join(Environment.NewLine, lines);
        }

        private async Task<JobOfferEntity> EnsureOfferExpirationStateAsync(JobOfferEntity offer, CancellationToken ct)
        {
            if (offer.Status != JobOfferStatus.Pending || !offer.ExpirationDate.HasValue)
            {
                return offer;
            }

            var today = DateOnly.FromDateTime(dateTimeProvider.UtcNow);
            if (offer.ExpirationDate.Value >= today)
            {
                return offer;
            }

            offer.Status = JobOfferStatus.Expired;
            offer.UpdatedAtUtc = dateTimeProvider.UtcNow;
            await jobSeekerRepository.SaveChangesAsync(ct);
            return offer;
        }

        private void ValidatePendingOfferResponse(JobOfferEntity offer)
        {
            if (offer.Status == JobOfferStatus.Accepted || offer.Status == JobOfferStatus.Declined)
            {
                throw new InvalidOperationException("This offer has already been responded to.");
            }

            if (offer.Status is JobOfferStatus.Cancelled or JobOfferStatus.Expired)
            {
                throw new InvalidOperationException("This offer can no longer be responded to.");
            }

            if (offer.Status != JobOfferStatus.Pending)
            {
                throw new InvalidOperationException("This offer is not available for response.");
            }
        }

        private OfferResponse MapOffer(JobOfferEntity offer)
        {
            var effectiveStatus = offer.Status == JobOfferStatus.Pending
                && offer.ExpirationDate.HasValue
                && offer.ExpirationDate.Value < DateOnly.FromDateTime(dateTimeProvider.UtcNow)
                    ? JobOfferStatus.Expired
                    : offer.Status;
            var canRespond = effectiveStatus == JobOfferStatus.Pending;

            return new OfferResponse
            {
                Id = offer.Id,
                ApplicationId = offer.ApplicationId,
                SentByUserId = offer.SentByUserId,
                Title = offer.Title,
                Message = offer.Message,
                SalaryText = offer.SalaryText,
                EmploymentType = offer.EmploymentType,
                StartDate = offer.StartDate,
                ExpirationDate = offer.ExpirationDate,
                Status = effectiveStatus.ToString(),
                SentAtUtc = offer.SentAtUtc,
                RespondedAtUtc = offer.RespondedAtUtc,
                CreatedAtUtc = offer.CreatedAtUtc,
                UpdatedAtUtc = offer.UpdatedAtUtc,
                CanAccept = canRespond,
                CanDecline = canRespond,
                CanMarkHired = false,
            };
        }

        private OfferResponse? MapOffer(ApplicationListItemData item)
        {
            if (!item.OfferId.HasValue || item.OfferStatus is null)
            {
                return null;
            }

            var effectiveStatus = item.OfferStatus == JobOfferStatus.Pending
                && item.OfferExpirationDate.HasValue
                && item.OfferExpirationDate.Value < DateOnly.FromDateTime(dateTimeProvider.UtcNow)
                    ? JobOfferStatus.Expired
                    : item.OfferStatus.Value;
            var canRespond = effectiveStatus == JobOfferStatus.Pending;

            return new OfferResponse
            {
                Id = item.OfferId.Value,
                ApplicationId = item.Id,
                SentByUserId = Guid.Empty,
                Title = item.OfferTitle ?? string.Empty,
                Message = item.OfferMessage ?? string.Empty,
                SalaryText = item.OfferSalaryText ?? string.Empty,
                EmploymentType = item.OfferEmploymentType ?? string.Empty,
                StartDate = item.OfferStartDate,
                ExpirationDate = item.OfferExpirationDate,
                Status = effectiveStatus.ToString(),
                SentAtUtc = item.OfferSentAtUtc ?? item.UpdatedAtUtc,
                RespondedAtUtc = item.OfferRespondedAtUtc,
                CreatedAtUtc = item.OfferSentAtUtc ?? item.CreatedAtUtc,
                UpdatedAtUtc = item.OfferRespondedAtUtc ?? item.OfferSentAtUtc ?? item.UpdatedAtUtc,
                CanAccept = canRespond,
                CanDecline = canRespond,
                CanMarkHired = false,
            };
        }
    }
}
