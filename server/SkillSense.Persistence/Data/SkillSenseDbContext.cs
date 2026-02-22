using System.Reflection;
using Microsoft.EntityFrameworkCore;
using SkillSense.Domain.Entities;

namespace SkillSense.Persistence.Data
{
    public class SkillSenseDbContext(DbContextOptions<SkillSenseDbContext> options) : DbContext(options)
    {
        override protected void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly()); base.OnModelCreating(modelBuilder);
        }

        #region DbSets
        public DbSet<JobEntity> Jobs => Set<JobEntity>();
        public DbSet<ResumeSubmissionEntity> ResumeSubmissions => Set<ResumeSubmissionEntity>();
        public DbSet<ResumeScoreEntity> ResumeScores => Set<ResumeScoreEntity>();

        #endregion

    }
}
