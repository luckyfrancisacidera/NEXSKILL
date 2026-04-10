using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillSense.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminProfileCompanyForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM admin_profiles ap
                        LEFT JOIN companies c ON ap."CompanyId" = c."Id"
                        WHERE ap."CompanyId" IS NOT NULL
                          AND c."Id" IS NULL
                    ) THEN
                        RAISE EXCEPTION 'Cannot add FK FK_admin_profiles_companies_CompanyId because admin_profiles contains orphaned CompanyId values. Clean up invalid rows before applying this migration.';
                    END IF;
                END
                $$;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_admin_profiles_CompanyId",
                table: "admin_profiles",
                column: "CompanyId");

            migrationBuilder.AddForeignKey(
                name: "FK_admin_profiles_companies_CompanyId",
                table: "admin_profiles",
                column: "CompanyId",
                principalTable: "companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_admin_profiles_companies_CompanyId",
                table: "admin_profiles");

            migrationBuilder.DropIndex(
                name: "IX_admin_profiles_CompanyId",
                table: "admin_profiles");
        }
    }
}
