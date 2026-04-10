using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillSense.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyRequestSubscriptionFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BusinessName",
                table: "companies",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CityProvince",
                table: "companies",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompanySize",
                table: "companies",
                type: "character varying(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "companies",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "companies",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullAddress",
                table: "companies",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Industry",
                table: "companies",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryAdminFullName",
                table: "companies",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryAdminPhone",
                table: "companies",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryAdminRole",
                table: "companies",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WebsiteUrl",
                table: "companies",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "company_account_requests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    BusinessName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Industry = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    CompanySize = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    WebsiteUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    Country = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    CityProvince = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    FullAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    PrimaryAdminFullName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PrimaryAdminEmail = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                    PrimaryAdminPhone = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    PrimaryAdminRole = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    RequestedPlanId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BillingCycle = table.Column<int>(type: "integer", nullable: true),
                    BusinessRegistrationNumber = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    TaxId = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ReviewNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ReviewedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReviewedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SubmittedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_company_account_requests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "company_invitations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                    Role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    TokenHash = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ExpiresAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AcceptedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_company_invitations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_company_invitations_companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "company_subscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlanId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BillingCycle = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    StartsAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndsAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TrialEndsAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AutoRenews = table.Column<bool>(type: "boolean", nullable: false),
                    LastEnforcedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_company_subscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_company_subscriptions_companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "company_request_documents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyAccountRequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentType = table.Column<int>(type: "integer", nullable: false),
                    OriginalFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    StorageKey = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    StorageProvider = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    UploadedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_company_request_documents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_company_request_documents_company_account_requests_CompanyA~",
                        column: x => x.CompanyAccountRequestId,
                        principalTable: "company_account_requests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_company_account_requests_Status",
                table: "company_account_requests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_company_account_requests_SubmittedAtUtc",
                table: "company_account_requests",
                column: "SubmittedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_company_invitations_CompanyId",
                table: "company_invitations",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_company_invitations_Email",
                table: "company_invitations",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_company_invitations_TokenHash",
                table: "company_invitations",
                column: "TokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_company_request_documents_CompanyAccountRequestId",
                table: "company_request_documents",
                column: "CompanyAccountRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_company_subscriptions_CompanyId_CreatedAtUtc",
                table: "company_subscriptions",
                columns: new[] { "CompanyId", "CreatedAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "company_invitations");

            migrationBuilder.DropTable(
                name: "company_request_documents");

            migrationBuilder.DropTable(
                name: "company_subscriptions");

            migrationBuilder.DropTable(
                name: "company_account_requests");

            migrationBuilder.DropColumn(
                name: "BusinessName",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "CityProvince",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "CompanySize",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "FullAddress",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "Industry",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "PrimaryAdminFullName",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "PrimaryAdminPhone",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "PrimaryAdminRole",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "WebsiteUrl",
                table: "companies");
        }
    }
}
