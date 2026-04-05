import { http } from "@shared/api/http";

export interface NotificationDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "Info" | "Warning" | "Success" | "Error";
  isRead: boolean;
  createdAtUtc: string;
  relatedEntityId?: string | null;
}

// Handles notification inbox reads and bulk notification mutations.
export const notificationService = {
  async getNotifications(): Promise<NotificationDto[]> {
    const response = await http.get<NotificationDto[]>("/api/notifications");
    return response.data;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await http.post(`/api/notifications/${notificationId}/read`, {});
  },

  async markAllAsRead(): Promise<void> {
    await http.post("/api/notifications/read-all", {});
  },

  async deleteNotifications(notificationIds: string[]): Promise<number> {
    const response = await http.delete<{ deletedCount: number }>("/api/notifications/bulk", {
      data: {
        notificationIds,
      },
    });
    return response.data.deletedCount;
  },

  async deleteAllNotifications(): Promise<number> {
    const response = await http.delete<{ deletedCount: number }>("/api/notifications/all");
    return response.data.deletedCount;
  },
};
