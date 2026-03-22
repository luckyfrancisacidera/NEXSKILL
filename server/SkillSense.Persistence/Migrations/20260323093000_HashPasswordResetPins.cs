using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillSense.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class HashPasswordResetPins : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_password_reset_pins_UserId_Pin_Used",
                table: "password_reset_pins");

            migrationBuilder.AddColumn<string>(
                name: "PinHash",
                table: "password_reset_pins",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PinSalt",
                table: "password_reset_pins",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql("UPDATE password_reset_pins SET \"Used\" = TRUE;");

            migrationBuilder.DropColumn(
                name: "Pin",
                table: "password_reset_pins");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Pin",
                table: "password_reset_pins",
                type: "character varying(6)",
                maxLength: 6,
                nullable: false,
                defaultValue: "");

            migrationBuilder.DropColumn(
                name: "PinHash",
                table: "password_reset_pins");

            migrationBuilder.DropColumn(
                name: "PinSalt",
                table: "password_reset_pins");

            migrationBuilder.CreateIndex(
                name: "IX_password_reset_pins_UserId_Pin_Used",
                table: "password_reset_pins",
                columns: new[] { "UserId", "Pin", "Used" });
        }
    }
}
