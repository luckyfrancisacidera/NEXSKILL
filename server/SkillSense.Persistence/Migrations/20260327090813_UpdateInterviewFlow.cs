using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillSense.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateInterviewFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "JobSeekerHistoryArchivedAtUtc",
                table: "resume_submissions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "JobSeekerHistoryDeletedAtUtc",
                table: "resume_submissions",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "JobSeekerHistoryArchivedAtUtc",
                table: "resume_submissions");

            migrationBuilder.DropColumn(
                name: "JobSeekerHistoryDeletedAtUtc",
                table: "resume_submissions");
        }
    }
}
