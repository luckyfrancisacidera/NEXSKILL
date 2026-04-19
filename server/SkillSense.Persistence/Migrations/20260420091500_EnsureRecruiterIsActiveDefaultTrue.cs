using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using SkillSense.Persistence.Data;

#nullable disable

namespace SkillSense.Persistence.Migrations
{
    [DbContext(typeof(SkillSenseDbContext))]
    [Migration("20260420091500_EnsureRecruiterIsActiveDefaultTrue")]
    public partial class EnsureRecruiterIsActiveDefaultTrue : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE users
                                ALTER COLUMN "IsActive" SET DEFAULT TRUE;
                """);

            migrationBuilder.Sql("""
                UPDATE users AS u
                                SET "IsActive" = TRUE
                                WHERE u."IsActive" = FALSE
                  AND EXISTS (
                      SELECT 1
                                            FROM "AspNetUserRoles" ur
                                            INNER JOIN "AspNetRoles" r ON ur."RoleId" = r."Id"
                                            WHERE ur."UserId" = u."Id"
                                                AND lower(r."Name") = 'recruiter'
                  );
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE users
                ALTER COLUMN "IsActive" DROP DEFAULT;
                """);
        }
    }
}
