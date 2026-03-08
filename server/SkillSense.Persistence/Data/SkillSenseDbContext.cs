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
        public DbSet<JobEntity> Jobs => Set<JobEntity>();
        public DbSet<ResumeSubmissionEntity> ResumeSubmissions => Set<ResumeSubmissionEntity>();
        public DbSet<ResumeScoreEntity> ResumeScores => Set<ResumeScoreEntity>();
        public DbSet<ResumeEmbeddingEntity> ResumeEmbeddings => Set<ResumeEmbeddingEntity>();
        public DbSet<CandidateExplanationEntity> CandidateExplanations => Set<CandidateExplanationEntity>();
        public DbSet<JobSeekerProfileEntity> JobSeekerProfiles => Set<JobSeekerProfileEntity>();
        public DbSet<RecruiterProfileEntity> RecruiterProfiles => Set<RecruiterProfileEntity>();
        public DbSet<AdminProfileEntity> AdminProfiles => Set<AdminProfileEntity>();

        #endregion

    }
}
