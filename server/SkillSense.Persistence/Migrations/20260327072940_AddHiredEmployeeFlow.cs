using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillSense.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHiredEmployeeFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AcceptedOfferId",
                table: "resume_submissions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "HireDateUtc",
                table: "resume_submissions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "HiredByRecruiterId",
                table: "resume_submissions",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_resume_submissions_AcceptedOfferId",
                table: "resume_submissions",
                column: "AcceptedOfferId");

            migrationBuilder.CreateIndex(
                name: "IX_resume_submissions_HiredByRecruiterId",
                table: "resume_submissions",
                column: "HiredByRecruiterId");

            migrationBuilder.Sql("""
                UPDATE "resume_submissions"
                SET "Status" = 'Hired'
                WHERE "Status" = 'Hire';
                """);

            migrationBuilder.Sql("""
                UPDATE "resume_submissions"
                SET "HireDateUtc" = COALESCE("HireDateUtc", "UpdatedAtUtc")
                WHERE "Status" = 'Hired'
                  AND "HireDateUtc" IS NULL;
                """);

            migrationBuilder.Sql("""
                UPDATE "resume_submissions" AS rs
                SET "AcceptedOfferId" = latest_offer."Id",
                    "HiredByRecruiterId" = latest_offer."SentByUserId"
                FROM (
                    SELECT DISTINCT ON ("ApplicationId")
                        "ApplicationId",
                        "Id",
                        "SentByUserId"
                    FROM "job_offers"
                    WHERE "Status" = 'Accepted'
                    ORDER BY "ApplicationId", COALESCE("RespondedAtUtc", "UpdatedAtUtc", "CreatedAtUtc") DESC
                ) AS latest_offer
                WHERE rs."Id" = latest_offer."ApplicationId"
                  AND rs."Status" = 'Hired'
                  AND (rs."AcceptedOfferId" IS NULL OR rs."HiredByRecruiterId" IS NULL);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "resume_submissions"
                SET "Status" = 'Hire'
                WHERE "Status" = 'Hired';
                """);

            migrationBuilder.DropIndex(
                name: "IX_resume_submissions_AcceptedOfferId",
                table: "resume_submissions");

            migrationBuilder.DropIndex(
                name: "IX_resume_submissions_HiredByRecruiterId",
                table: "resume_submissions");

            migrationBuilder.DropColumn(
                name: "AcceptedOfferId",
                table: "resume_submissions");

            migrationBuilder.DropColumn(
                name: "HireDateUtc",
                table: "resume_submissions");

            migrationBuilder.DropColumn(
                name: "HiredByRecruiterId",
                table: "resume_submissions");
        }
    }
}
