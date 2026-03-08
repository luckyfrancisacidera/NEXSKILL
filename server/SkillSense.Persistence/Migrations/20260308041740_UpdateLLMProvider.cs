using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillSense.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateLLMProvider : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GapsJson",
                table: "candidate_explanations",
                type: "jsonb",
                nullable: false,
                defaultValueSql: "'[]'::jsonb");

            migrationBuilder.AddColumn<string>(
                name: "RawProviderResponse",
                table: "candidate_explanations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StrengthsJson",
                table: "candidate_explanations",
                type: "jsonb",
                nullable: false,
                defaultValueSql: "'[]'::jsonb");

            migrationBuilder.AddColumn<string>(
                name: "Summary",
                table: "candidate_explanations",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GapsJson",
                table: "candidate_explanations");

            migrationBuilder.DropColumn(
                name: "RawProviderResponse",
                table: "candidate_explanations");

            migrationBuilder.DropColumn(
                name: "StrengthsJson",
                table: "candidate_explanations");

            migrationBuilder.DropColumn(
                name: "Summary",
                table: "candidate_explanations");
        }
    }
}
