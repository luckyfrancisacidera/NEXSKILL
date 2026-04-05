using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSense.Api.Security;
using SkillSense.Application.Contracts.Notifications;
using SkillSense.Application.Interfaces;

namespace SkillSense.Api.Controllers;

/* =========================================
   NOTIFICATIONS CONTROLLER
   Exposes notification inbox reads, read-state updates, and bulk deletion for the current user.
========================================= */

[Route("api/notifications")]
[ApiController]
[Authorize]
public sealed class NotificationsController(INotificationService notificationService) : ControllerBase
{
    public sealed record BulkDeleteNotificationsRequest(IReadOnlyList<Guid> NotificationIds);

    /* =========================================
       INBOX OPERATIONS
    ========================================= */

    // Loads notifications.
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<NotificationDto>>> GetNotifications(CancellationToken ct = default)
        => Ok(await notificationService.GetNotificationsByUserAsync(CurrentUserContext.GetUserId(User), ct));

    // Marks as read.
    [HttpPost("{notificationId:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid notificationId, CancellationToken ct = default)
    {
        await notificationService.MarkAsReadAsync(CurrentUserContext.GetUserId(User), notificationId, ct);
        return Ok(new { message = "Notification marked as read." });
    }

    // Marks all as read.
    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct = default)
    {
        await notificationService.MarkAllAsReadAsync(CurrentUserContext.GetUserId(User), ct);
        return Ok(new { message = "Notifications marked as read." });
    }

    /* =========================================
       DELETION OPERATIONS
    ========================================= */

    // Deletes bulk.
    [HttpDelete("bulk")]
    public async Task<IActionResult> DeleteBulk([FromBody] BulkDeleteNotificationsRequest request, CancellationToken ct = default)
    {
        var deletedCount = await notificationService.DeleteNotificationsAsync(
            CurrentUserContext.GetUserId(User),
            request.NotificationIds ?? [],
            ct);

        return Ok(new { deletedCount });
    }

    // Deletes all.
    [HttpDelete("all")]
    public async Task<IActionResult> DeleteAll(CancellationToken ct = default)
    {
        var deletedCount = await notificationService.DeleteAllNotificationsAsync(CurrentUserContext.GetUserId(User), ct);
        return Ok(new { deletedCount });
    }
}
