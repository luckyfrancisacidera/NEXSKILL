using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillSense.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateJobEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RecruiterId",
                table: "jobs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_jobs_RecruiterId",
                table: "jobs",
                column: "RecruiterId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_jobs_RecruiterId",
                table: "jobs");

            migrationBuilder.DropColumn(
                name: "RecruiterId",
                table: "jobs");
        }
    }
}
