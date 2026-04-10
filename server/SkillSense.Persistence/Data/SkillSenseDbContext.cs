using System.Reflection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Data
{
    public class SkillSenseDbContext(DbContextOptions<SkillSenseDbContext> options) : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>(options)
    {
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }

        #region DbSets
        public DbSet<CompanyEntity> Companies => Set<CompanyEntity>();
        public DbSet<CompanyAccountRequestEntity> CompanyAccountRequests => Set<CompanyAccountRequestEntity>();
        public DbSet<CompanyRequestDocumentEntity> CompanyRequestDocuments => Set<CompanyRequestDocumentEntity>();
        public DbSet<CompanySubscriptionEntity> CompanySubscriptions => Set<CompanySubscriptionEntity>();
        public DbSet<CompanyInvitationEntity> CompanyInvitations => Set<CompanyInvitationEntity>();
        public DbSet<JobEntity> Jobs => Set<JobEntity>();
        public DbSet<ResumeSubmissionEntity> ResumeSubmissions => Set<ResumeSubmissionEntity>();
        public DbSet<ResumeScoreEntity> ResumeScores => Set<ResumeScoreEntity>();
        public DbSet<ResumeEmbeddingEntity> ResumeEmbeddings => Set<ResumeEmbeddingEntity>();
        public DbSet<CandidateExplanationEntity> CandidateExplanations => Set<CandidateExplanationEntity>();
        public DbSet<JobSeekerProfileEntity> JobSeekerProfiles => Set<JobSeekerProfileEntity>();
        public DbSet<RecruiterProfileEntity> RecruiterProfiles => Set<RecruiterProfileEntity>();
        public DbSet<AdminProfileEntity> AdminProfiles => Set<AdminProfileEntity>();
        public DbSet<SavedJobEntity> SavedJobs => Set<SavedJobEntity>();
        public DbSet<PasswordResetPinEntity> PasswordResetPins => Set<PasswordResetPinEntity>();
        public DbSet<InterviewEntity> Interviews => Set<InterviewEntity>();
        public DbSet<InterviewRescheduleRequestEntity> InterviewRescheduleRequests => Set<InterviewRescheduleRequestEntity>();
        public DbSet<NotificationEntity> Notifications => Set<NotificationEntity>();
        public DbSet<JobOfferEntity> JobOffers => Set<JobOfferEntity>();
        public DbSet<HireEntity> Hires => Set<HireEntity>();

        #endregion

    }
}
