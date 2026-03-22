using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillSense.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountProfileAndEmailChangePins : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "users",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "users",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "users",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PendingEmail",
                table: "password_reset_pins",
                type: "character varying(320)",
                maxLength: 320,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Purpose",
                table: "password_reset_pins",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "VerifiedAtUtc",
                table: "password_reset_pins",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_password_reset_pins_UserId_PendingEmail_Purpose_Used",
                table: "password_reset_pins",
                columns: new[] { "UserId", "PendingEmail", "Purpose", "Used" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_password_reset_pins_UserId_PendingEmail_Purpose_Used",
                table: "password_reset_pins");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "users");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "users");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "users");

            migrationBuilder.DropColumn(
                name: "PendingEmail",
                table: "password_reset_pins");

            migrationBuilder.DropColumn(
                name: "Purpose",
                table: "password_reset_pins");

            migrationBuilder.DropColumn(
                name: "VerifiedAtUtc",
                table: "password_reset_pins");
        }
    }
}
