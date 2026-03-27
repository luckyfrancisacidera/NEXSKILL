using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillSense.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDedicatedHiresTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "hires",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    RecruiterId = table.Column<Guid>(type: "uuid", nullable: false),
                    JobSeekerId = table.Column<Guid>(type: "uuid", nullable: false),
                    JobId = table.Column<Guid>(type: "uuid", nullable: false),
                    OfferId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    HiredAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hires", x => x.Id);
                    table.ForeignKey(
                        name: "FK_hires_companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_hires_job_offers_OfferId",
                        column: x => x.OfferId,
                        principalTable: "job_offers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_hires_jobs_JobId",
                        column: x => x.JobId,
                        principalTable: "jobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_hires_resume_submissions_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "resume_submissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_hires_users_JobSeekerId",
                        column: x => x.JobSeekerId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_hires_users_RecruiterId",
                        column: x => x.RecruiterId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_hires_ApplicationId",
                table: "hires",
                column: "ApplicationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_hires_CompanyId",
                table: "hires",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_hires_CompanyId_Status_HiredAtUtc",
                table: "hires",
                columns: new[] { "CompanyId", "Status", "HiredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_hires_JobId",
                table: "hires",
                column: "JobId");

            migrationBuilder.CreateIndex(
                name: "IX_hires_JobSeekerId",
                table: "hires",
                column: "JobSeekerId");

            migrationBuilder.CreateIndex(
                name: "IX_hires_OfferId",
                table: "hires",
                column: "OfferId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_hires_RecruiterId",
                table: "hires",
                column: "RecruiterId");

            migrationBuilder.CreateIndex(
                name: "IX_hires_RecruiterId_Status_HiredAtUtc",
                table: "hires",
                columns: new[] { "RecruiterId", "Status", "HiredAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "hires");
        }
    }
}
