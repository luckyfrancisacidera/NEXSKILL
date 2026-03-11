export type NotificationActor = "recruiter" | "jobseeker";

export interface AppNotificationPayload {
  title: string;
  description?: string;
  actor?: NotificationActor;
}

const EVENT_NAME = "app:notify";

export const emitNotification = (payload: AppNotificationPayload) => {
  if (typeof window === "undefined") return;

  const event = new CustomEvent<AppNotificationPayload>(EVENT_NAME, {
    detail: payload,
  });

  window.dispatchEvent(event);
};

export const notificationEventName = EVENT_NAME;

