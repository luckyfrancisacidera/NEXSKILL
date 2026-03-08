using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillSense.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class JobSeekerModelUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "job_seeker_profiles",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "job_seeker_profiles",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExperienceSummary",
                table: "job_seeker_profiles",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "job_seeker_profiles",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "job_seeker_profiles",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "job_seeker_profiles",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfessionalTitle",
                table: "job_seeker_profiles",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResumeUrl",
                table: "job_seeker_profiles",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Skills",
                table: "job_seeker_profiles",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "job_seeker_profiles",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "password_reset_pins",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Pin = table.Column<string>(type: "character varying(6)", maxLength: 6, nullable: false),
                    ExpiresAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Used = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_password_reset_pins", x => x.Id);
                    table.ForeignKey(
                        name: "FK_password_reset_pins_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "saved_jobs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    JobId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_saved_jobs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_saved_jobs_jobs_JobId",
                        column: x => x.JobId,
                        principalTable: "jobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_saved_jobs_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_password_reset_pins_UserId",
                table: "password_reset_pins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_password_reset_pins_UserId_Pin_Used",
                table: "password_reset_pins",
                columns: new[] { "UserId", "Pin", "Used" });

            migrationBuilder.CreateIndex(
                name: "IX_saved_jobs_JobId",
                table: "saved_jobs",
                column: "JobId");

            migrationBuilder.CreateIndex(
                name: "IX_saved_jobs_UserId_JobId",
                table: "saved_jobs",
                columns: new[] { "UserId", "JobId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "password_reset_pins");

            migrationBuilder.DropTable(
                name: "saved_jobs");

            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "job_seeker_profiles");

            migrationBuilder.DropColumn(
                name: "Bio",
                table: "job_seeker_profiles");

            migrationBuilder.DropColumn(
                name: "ExperienceSummary",
                table: "job_seeker_profiles");

            migrationBuilder.DropColumn(
                name: "FullName",
                table: "job_seeker_profiles");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "job_seeker_profiles");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "job_seeker_profiles");

            migrationBuilder.DropColumn(
                name: "ProfessionalTitle",
                table: "job_seeker_profiles");

            migrationBuilder.DropColumn(
                name: "ResumeUrl",
                table: "job_seeker_profiles");

            migrationBuilder.DropColumn(
                name: "Skills",
                table: "job_seeker_profiles");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "job_seeker_profiles");
        }
    }
}
