using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoreApp.Migrations
{
    /// <inheritdoc />
    public partial class AddChatFormsReports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppChatMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SenderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReceiverId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    ReadTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppChatMessages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppFormDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    FieldsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    SubmissionCount = table.Column<int>(type: "int", nullable: false),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppFormDefinitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppFormSubmissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FormId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DataJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppFormSubmissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppReportDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    ConfigJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastRunResult = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastRunTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppReportDefinitions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppChatMessages_CreationTime",
                table: "AppChatMessages",
                column: "CreationTime");

            migrationBuilder.CreateIndex(
                name: "IX_AppChatMessages_ReceiverId",
                table: "AppChatMessages",
                column: "ReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_AppChatMessages_SenderId_ReceiverId",
                table: "AppChatMessages",
                columns: new[] { "SenderId", "ReceiverId" });

            migrationBuilder.CreateIndex(
                name: "IX_AppFormDefinitions_IsPublished",
                table: "AppFormDefinitions",
                column: "IsPublished");

            migrationBuilder.CreateIndex(
                name: "IX_AppFormDefinitions_Name",
                table: "AppFormDefinitions",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_AppFormSubmissions_CreationTime",
                table: "AppFormSubmissions",
                column: "CreationTime");

            migrationBuilder.CreateIndex(
                name: "IX_AppFormSubmissions_FormId",
                table: "AppFormSubmissions",
                column: "FormId");

            migrationBuilder.CreateIndex(
                name: "IX_AppReportDefinitions_Category",
                table: "AppReportDefinitions",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_AppReportDefinitions_Name",
                table: "AppReportDefinitions",
                column: "Name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppChatMessages");

            migrationBuilder.DropTable(
                name: "AppFormDefinitions");

            migrationBuilder.DropTable(
                name: "AppFormSubmissions");

            migrationBuilder.DropTable(
                name: "AppReportDefinitions");
        }
    }
}
