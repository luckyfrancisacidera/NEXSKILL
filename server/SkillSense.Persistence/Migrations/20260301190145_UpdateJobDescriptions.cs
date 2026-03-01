using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillSense.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateJobDescriptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ApplicantUserId",
                table: "resume_submissions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "resume_submissions",
                type: "character varying(320)",
                maxLength: 320,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "resume_submissions",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "resume_submissions",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PostalCode",
                table: "resume_submissions",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompanyEmail",
                table: "recruiter_profiles",
                type: "character varying(320)",
                maxLength: 320,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                table: "recruiter_profiles",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Benefits",
                table: "jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompanyEmailSnapshot",
                table: "jobs",
                type: "character varying(320)",
                maxLength: 320,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompanyNameSnapshot",
                table: "jobs",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "jobs",
                type: "character varying(8)",
                maxLength: 8,
                nullable: false,
                defaultValue: "PHP");

            migrationBuilder.AddColumn<string>(
                name: "Department",
                table: "jobs",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EmploymentType",
                table: "jobs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "jobs",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "PostedDateUtc",
                table: "jobs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SalaryMaxPerAnnum",
                table: "jobs",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SalaryMinPerAnnum",
                table: "jobs",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Schedule",
                table: "jobs",
                type: "character varying(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WorkSetup",
                table: "jobs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_resume_submissions_ApplicantUserId",
                table: "resume_submissions",
                column: "ApplicantUserId");

            migrationBuilder.CreateIndex(
                name: "IX_jobs_CreatedAtUtc",
                table: "jobs",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_jobs_Status",
                table: "jobs",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_resume_submissions_ApplicantUserId",
                table: "resume_submissions");

            migrationBuilder.DropIndex(
                name: "IX_jobs_CreatedAtUtc",
                table: "jobs");

            migrationBuilder.DropIndex(
                name: "IX_jobs_Status",
                table: "jobs");

            migrationBuilder.DropColumn(
                name: "ApplicantUserId",
                table: "resume_submissions");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "resume_submissions");

            migrationBuilder.DropColumn(
                name: "FullName",
                table: "resume_submissions");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "resume_submissions");

            migrationBuilder.DropColumn(
                name: "PostalCode",
                table: "resume_submissions");

            migrationBuilder.DropColumn(
                name: "CompanyEmail",
                table: "recruiter_profiles");

            migrationBuilder.DropColumn(
                name: "CompanyName",
                table: "recruiter_profiles");

            migrationBuilder.DropColumn(
                name: "Benefits",
                table: "jobs");

            migrationBuilder.DropColumn(
                name: "CompanyEmailSnapshot",
                table: "jobs");

            migrationBuilder.DropColumn(
                name: "CompanyNameSnapshot",
                table: "jobs");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "jobs");

            migrationBuilder.DropColumn(
                name: "Department",
                table: "jobs");

            migrationBuilder.DropColumn(
                name: "EmploymentType",
                table: "jobs");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "jobs");

            migrationBuilder.DropColumn(
                name: "PostedDateUtc",
                table: "jobs");

            migrationBuilder.DropColumn(
                name: "SalaryMaxPerAnnum",
                table: "jobs");

            migrationBuilder.DropColumn(
                name: "SalaryMinPerAnnum",
                table: "jobs");

            migrationBuilder.DropColumn(
                name: "Schedule",
                table: "jobs");

            migrationBuilder.DropColumn(
                name: "WorkSetup",
                table: "jobs");
        }
    }
}
