export type NotificationActor = "recruiter" | "jobseeker";

export interface AppNotificationPayload {
  title: string;
  description?: string;
  actor?: NotificationActor;
}

export interface AppNotification extends AppNotificationPayload {
  id: string;
  createdAt: string;
  read: boolean;
  source?: "local" | "server";
}

const EVENT_NAME = "app:notify";

// Emits a local notification event so providers can show toast feedback immediately.
export const emitNotification = (payload: AppNotificationPayload) => {
  if (typeof window === "undefined") return;

  const event = new CustomEvent<AppNotificationPayload>(EVENT_NAME, {
    detail: payload,
  });

  window.dispatchEvent(event);
};

export const notificationEventName = EVENT_NAME;

// Formats notification timestamps for the compact labels shown in the topbar and inbox.
export const formatNotificationTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleString();
};
