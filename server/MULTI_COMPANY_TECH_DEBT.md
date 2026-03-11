# Multi-Company Refactor Technical Debt

## Remaining limitations

### Recruiter profile resolution still assumes one profile per recruiter user in several service flows
- `SkillSense.Application/Services/Recruiter/RecruiterService.cs` still resolves the active recruiter profile through `GetProfileByUserIdAsync(...)` for the main recruiter service entry points.
- `SkillSense.Application/Services/Interviews/InterviewService.cs` still derives company scope from `GetProfileByUserIdAsync(...)` when scheduling interviews.
- `SkillSense.Persistence/Repositories/RecruiterRepository.cs` now has company-scoped job/applicant queries, but its primary profile lookup is still user-based unless callers provide an explicit recruiter profile id.

This means the active recruiter profile header/claim is hardened around controller boundaries, but true multi-profile-per-user service behavior still needs a dedicated recruiter-profile-aware service contract pass.

### Historical offer timestamps cannot be reconstructed after hire
- `SkillSense.Application/Services/Jobseeker/JobSeekerService.cs` can expose `OfferedAtUtc` while the current status is `Offer` and `HiredAtUtc` while the current status is `Hire`.
- Once an application advances from `Offer` to `Hire`, the original offer timestamp is lost because `ResumeSubmissionEntity` only keeps a single mutable `UpdatedAtUtc` and no stage transition history.

If the UI needs exact historical `OfferedAtUtc` after hire, the next safe backend slice is to add stage-transition history or dedicated persisted offer/hire timestamps on resume submissions.
