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
        // Loads public jobs.
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

        // Loads public job.
        public async Task<JobListItemResponse?> GetPublicJobAsync(Guid id, CancellationToken ct = default)
            => await cacheService.GetOrCreateAsync($"jobs:public:detail:{id}", TimeSpan.FromSeconds(120), async () =>
            {
                var job = await jobSeekerRepository.GetPublishedJobByIdAsync(id, ct);
                return job is null ? null : Map(job);
            });

        // Applies the requested operation.
        public async Task<ResumeUploadResponse> ApplyAsync(Guid jobId, ApplyToJobRequest request, Stream fileStream, string fileName, string contentType, Guid? jobSeekerUserId, CancellationToken ct = default)
        {
            var job = await jobSeekerRepository.GetPublishedJobByIdAsync(jobId, ct)
                ?? throw new InvalidOperationException("Published job not found.");

            if (jobSeekerUserId.HasValue
                && await resumeUploadService.HasActiveApplicationAsync(jobId, jobSeekerUserId.Value, ct))
            {
                throw new InvalidOperationException("You have already applied to this job.");
            }

            var response = await resumeUploadService.EnqueueUploadAsync(fileStream, fileName, contentType, jobId, job.Title, companyId: job.CompanyId, fullName: request.FullName, email: request.Email, postalCode: request.PostalCode, location: request.Location, jobSeekerUserId: jobSeekerUserId, ct: ct);
            response.Message = "Application submitted successfully. We have started processing your resume.";
            cacheService.RemoveByPrefix("dashboard:recruiter:");
            cacheService.RemoveByPrefix($"dashboard:jobseeker:{jobSeekerUserId}");
            return response;
        }

        // Loads my applications.
        public async Task<PagedResult<JobSeekerApplicationResponse>> GetMyApplicationsAsync(Guid userId, int pageNumber, int pageSize, string? search, string? status, DateTime? startDate, DateTime? endDate, bool archivedOnly = false, CancellationToken ct = default)
        {
            var pagedApplications = await jobSeekerRepository.GetApplicationsByUserAsync(userId, pageNumber, pageSize, search, status, startDate, endDate, archivedOnly, ct);
            return new PagedResult<JobSeekerApplicationResponse>
            {
                Items = pagedApplications.Items.Select(MapApplication).ToList(),
                PageNumber = pagedApplications.PageNumber,
                PageSize = pagedApplications.PageSize,
                TotalCount = pagedApplications.TotalCount,
                TotalPages = pagedApplications.TotalPages
            };
        }

        // Loads dashboard summary.
        public async Task<object> GetDashboardSummaryAsync(Guid userId, string range, CancellationToken ct = default)
        {
            var normalizedRange = (range ?? "this_week").Trim().ToLowerInvariant();
            var (start, end, granularity) = ResolveRange(normalizedRange);
            var analytics = await jobSeekerRepository.GetApplicationAnalyticsAsync(userId, start, end, granularity, ct);
            var recentApps = await jobSeekerRepository.GetApplicationsByUserAsync(userId, 1, 5, null, null, null, null, false, ct);
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

        // Loads saved jobs.
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

        // Saves job.
        public async Task SaveJobAsync(Guid userId, Guid jobId, CancellationToken ct = default)
        {
            var job = await jobSeekerRepository.GetPublishedJobByIdAsync(jobId, ct) ?? throw new KeyNotFoundException("Job not found.");
            if (await jobSeekerRepository.IsJobSavedAsync(userId, jobId, ct)) return;
            await jobSeekerRepository.SaveJobAsync(new SavedJobEntity { UserId = userId, JobId = jobId, Id = Guid.NewGuid() }, ct);
        }

        // Removes saved job.
        public Task RemoveSavedJobAsync(Guid userId, Guid jobId, CancellationToken ct = default)
            => jobSeekerRepository.RemoveSavedJobAsync(userId, jobId, ct);

        // Loads my profile.
        public async Task<object> GetMyProfileAsync(Guid userId, CancellationToken ct = default)
        {
            var profile = await jobSeekerRepository.GetProfileAsync(userId, ct) ?? new JobSeekerProfileEntity { UserId = userId };
            return ToProfileResponse(profile);
        }

        // Updates my profile.
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

        // Loads application detail.
        public async Task<JobSeekerApplicationResponse> GetApplicationDetailAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        {
            var item = await jobSeekerRepository.GetApplicationDetailAsync(userId, applicationId, ct)
                ?? throw new KeyNotFoundException("Application not found.");

            return MapApplication(item);
        }

        // Loads offer.
        public async Task<OfferResponse> GetOfferAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        {
            var offer = await jobSeekerRepository.GetLatestOfferByApplicationIdAsync(userId, applicationId, ct)
                ?? throw new KeyNotFoundException("Offer not found.");

            offer = await EnsureOfferExpirationStateAsync(offer, ct);
            return MapOffer(offer);
        }

        // Handles accept offer.
        public async Task<OfferResponse> AcceptOfferAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        {
            var entity = await jobSeekerRepository.GetApplicationEntityAsync(userId, applicationId, ct)
                ?? throw new KeyNotFoundException("Application not found.");
            var offer = await jobSeekerRepository.GetLatestOfferByApplicationIdAsync(userId, applicationId, ct)
                ?? throw new KeyNotFoundException("Offer not found.");

            offer = await EnsureOfferExpirationStateAsync(offer, ct);
            ValidateOfferApplicationConsistency(entity, offer);
            ValidateApplicationForOfferAcceptance(entity);
            ValidatePendingOfferResponse(offer);

            await using var transaction = await jobSeekerRepository.BeginSerializableTransactionAsync(ct);
            var now = dateTimeProvider.UtcNow;
            offer.Status = JobOfferStatus.Accepted;
            offer.RespondedAtUtc = now;
            offer.UpdatedAtUtc = now;
            var companyId = await jobSeekerRepository.GetApplicationCompanyIdAsync(userId, applicationId, ct)
                ?? (entity.CompanyId != Guid.Empty ? (Guid?)entity.CompanyId : null)
                ?? throw new InvalidOperationException("This offer is missing company information and cannot be accepted right now.");
            var existingHire = await jobSeekerRepository.GetHireByOfferIdAsync(offer.Id, ct)
                ?? await jobSeekerRepository.GetHireByApplicationIdAsync(userId, applicationId, ct);

            entity.Status = ResumeSubmissionStatus.Hired;
            entity.CompanyId = companyId;
            entity.HireDateUtc = now;
            entity.HiredByRecruiterId = offer.SentByUserId;
            entity.AcceptedOfferId = offer.Id;
            entity.UpdatedAtUtc = now;

            if (existingHire is null)
            {
                if (!entity.JobSeekerUserId.HasValue)
                {
                    throw new InvalidOperationException("Application is not linked to a job seeker account.");
                }

                await jobSeekerRepository.AddHireAsync(new HireEntity
                {
                    Id = Guid.NewGuid(),
                    CompanyId = companyId,
                    RecruiterId = offer.SentByUserId,
                    JobSeekerId = entity.JobSeekerUserId.Value,
                    JobId = entity.JobId,
                    OfferId = offer.Id,
                    ApplicationId = entity.Id,
                    HiredAtUtc = now,
                    Status = HireStatus.Active,
                    CreatedAtUtc = now,
                    UpdatedAtUtc = now,
                }, ct);
            }

            await jobSeekerRepository.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            await notificationService.CreateNotificationAsync(new CreateNotificationRequest
            {
                UserId = offer.SentByUserId,
                Title = "Offer accepted",
                Message = $"{entity.FullName ?? entity.Email ?? "Candidate"} accepted the offer.",
                Type = NotificationType.Success,
                RelatedEntityId = entity.Id,
            }, ct);

            cacheService.RemoveByPrefix("dashboard:recruiter:");
            cacheService.RemoveByPrefix($"dashboard:jobseeker:{userId}");
            return MapOffer(offer);
        }

        // Handles decline offer.
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

        // Handles withdraw application.
        public async Task WithdrawApplicationAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        {
            var entity = await jobSeekerRepository.GetVisibleApplicationEntityAsync(userId, applicationId, ct) ?? throw new KeyNotFoundException("Application not found.");
            if (entity.Status is ResumeSubmissionStatus.Hired or ResumeSubmissionStatus.Rejected)
                throw new InvalidOperationException("This application can no longer be withdrawn.");

            var latestOffer = await jobSeekerRepository.GetLatestOfferByApplicationIdAsync(userId, applicationId, ct);
            if (latestOffer is not null)
            {
                latestOffer = await EnsureOfferExpirationStateAsync(latestOffer, ct);
                if (latestOffer.ApplicationId == entity.Id && latestOffer.Status == JobOfferStatus.Pending)
                {
                    latestOffer.Status = JobOfferStatus.Cancelled;
                    latestOffer.UpdatedAtUtc = dateTimeProvider.UtcNow;
                }
            }

            entity.Status = ResumeSubmissionStatus.Failed;
            entity.UpdatedAtUtc = dateTimeProvider.UtcNow;
            await jobSeekerRepository.SaveChangesAsync(ct);
        }

        // Archives application history.
        public async Task ArchiveApplicationHistoryAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        {
            var entity = await jobSeekerRepository.GetVisibleApplicationEntityAsync(userId, applicationId, ct)
                ?? throw new KeyNotFoundException("Application not found.");

            entity.IsHiddenFromJobSeekerHistory = true;
            entity.JobSeekerHistoryArchivedAtUtc = dateTimeProvider.UtcNow;
            entity.JobSeekerHistoryDeletedAtUtc = null;
            entity.UpdatedAtUtc = dateTimeProvider.UtcNow;
            await jobSeekerRepository.SaveChangesAsync(ct);
        }

        // Restores application history.
        public async Task UnarchiveApplicationHistoryAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        {
            var entity = await jobSeekerRepository.GetArchivedApplicationEntityAsync(userId, applicationId, ct)
                ?? throw new KeyNotFoundException("Archived application not found.");

            entity.IsHiddenFromJobSeekerHistory = false;
            entity.JobSeekerHistoryArchivedAtUtc = null;
            entity.UpdatedAtUtc = dateTimeProvider.UtcNow;
            await jobSeekerRepository.SaveChangesAsync(ct);
        }

        // Deletes application history.
        public async Task DeleteApplicationHistoryAsync(Guid userId, Guid applicationId, CancellationToken ct = default)
        {
            var entity = await jobSeekerRepository.GetApplicationEntityAsync(userId, applicationId, ct)
                ?? throw new KeyNotFoundException("Application not found.");

            entity.IsHiddenFromJobSeekerHistory = true;
            entity.JobSeekerHistoryDeletedAtUtc = dateTimeProvider.UtcNow;
            entity.UpdatedAtUtc = dateTimeProvider.UtcNow;
            await jobSeekerRepository.SaveChangesAsync(ct);
        }

        // Maps application.
        private JobSeekerApplicationResponse MapApplication(ApplicationListItemData item)
        {
            var currentStage = ResolveCurrentStage(item.Status);
            var hasOffer = item.OfferId.HasValue || item.Status is ResumeSubmissionStatus.Offer or ResumeSubmissionStatus.Hired;
            var isHired = item.Status == ResumeSubmissionStatus.Hired;

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
                HiredAtUtc = item.Status == ResumeSubmissionStatus.Hired ? item.HireDateUtc ?? item.UpdatedAtUtc : null,
                CreatedAtUtc = item.CreatedAtUtc,
                UpdatedAtUtc = item.UpdatedAtUtc,
                Offer = MapOffer(item),
            };
        }

        // Resolves current stage.
        private static string ResolveCurrentStage(ResumeSubmissionStatus status)
            => status switch
            {
                ResumeSubmissionStatus.Recommended => "Under Review",
                ResumeSubmissionStatus.Completed => "Under Review",
                ResumeSubmissionStatus.Shortlisted => "Shortlisted",
                ResumeSubmissionStatus.Interview => "Interview",
                ResumeSubmissionStatus.Offer => "Offer",
                ResumeSubmissionStatus.Hired => "Hired",
                ResumeSubmissionStatus.Rejected => "Rejected",
                ResumeSubmissionStatus.Failed => "Withdrawn",
                ResumeSubmissionStatus.Pending or ResumeSubmissionStatus.Processing => "Applied",
                _ => "Applied"
            };

        // Resolves recruiter name.
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

        // Handles to profile response.
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

        // Handles map.
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

        // Normalizes multiline text.
        private static string NormalizeMultilineText(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return string.Empty;
            var lines = text.Split('\n', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
                .Select(line => line.Replace("\r", string.Empty).Trim());
            return string.Join(Environment.NewLine, lines);
        }

        // Ensures offer expiration state.
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

        // Validates pending offer response.
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

        // Ensures the offer is still tied to the selected application.
        private static void ValidateOfferApplicationConsistency(ResumeSubmissionEntity application, JobOfferEntity offer)
        {
            if (offer.ApplicationId != application.Id)
            {
                throw new InvalidOperationException("Cannot accept this offer because the related application is no longer active.");
            }
        }

        // Only active application records can continue the offer response flow.
        private static void ValidateApplicationForOfferAcceptance(ResumeSubmissionEntity application)
        {
            if (application.Status == ResumeSubmissionStatus.Failed)
            {
                throw new InvalidOperationException("This offer can no longer be accepted because the application has been withdrawn.");
            }

            if (application.JobSeekerHistoryDeletedAtUtc.HasValue
                || application.Status is ResumeSubmissionStatus.Rejected or ResumeSubmissionStatus.Hired)
            {
                throw new InvalidOperationException("Cannot accept this offer because the related application is no longer active.");
            }

            if (application.Status != ResumeSubmissionStatus.Offer)
            {
                throw new InvalidOperationException("Cannot accept this offer because the related application is no longer active.");
            }
        }

        // Maps offer.
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
                Benefits = offer.Benefits,
                SalaryText = offer.SalaryText,
                SalaryAmount = offer.SalaryAmount,
                SalaryType = offer.SalaryType,
                Currency = offer.Currency,
                EmploymentType = offer.EmploymentType,
                WorkSetup = offer.WorkSetup,
                StartDate = offer.StartDate,
                EndDate = offer.EndDate,
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

        // Maps offer.
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
                Benefits = item.OfferBenefits,
                SalaryText = item.OfferSalaryText ?? string.Empty,
                SalaryAmount = item.OfferSalaryAmount ?? 0,
                SalaryType = item.OfferSalaryType ?? string.Empty,
                Currency = item.OfferCurrency ?? "PHP",
                EmploymentType = item.OfferEmploymentType ?? string.Empty,
                WorkSetup = item.OfferWorkSetup ?? string.Empty,
                StartDate = item.OfferStartDate,
                EndDate = item.OfferEndDate,
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
