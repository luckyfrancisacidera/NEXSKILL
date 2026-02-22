using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillSense.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateJobEmbeddings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "DescriptionEmbeddingJson",
                table: "jobs",
                type: "jsonb",
                nullable: false,
                defaultValueSql: "'{}'::jsonb",
                oldClrType: typeof(string),
                oldType: "jsonb");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "DescriptionEmbeddingJson",
                table: "jobs",
                type: "jsonb",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "jsonb",
                oldDefaultValueSql: "'{}'::jsonb");
        }
    }
}
