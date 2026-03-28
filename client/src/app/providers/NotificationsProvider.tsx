/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useAuth } from "@app/providers/AuthProvider";
import {
  notificationEventName,
  type AppNotification,
  type AppNotificationPayload,
} from "@shared/utils/notifications";
import { notificationService } from "@shared/services/notification.service";

const MAX_NOTIFICATIONS = 100;

interface NotificationsContextValue {
  notifications: AppNotification[];
  latestNotifications: AppNotification[];
  unreadCount: number;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotifications: (notificationIds: string[]) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  addNotification: (payload: AppNotificationPayload) => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const sortNotifications = (items: AppNotification[]) =>
  [...items].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

const persistNotifications = (storageKey: string | null, items: AppNotification[]) => {
  if (!storageKey || typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {
    // ignore storage failures
  }
};

const isServerNotificationId = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

export const NotificationsProvider = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const [localNotifications, setLocalNotifications] = useState<AppNotification[]>([]);
  const [serverNotifications, setServerNotifications] = useState<AppNotification[]>([]);
  const storageKey = user ? `app.notifications.${user.userId}` : null;

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") {
      setLocalNotifications([]);
      return;
    }

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setLocalNotifications([]);
        return;
      }

      const parsed = JSON.parse(raw) as AppNotification[];
      setLocalNotifications(sortNotifications(parsed).slice(0, MAX_NOTIFICATIONS));
    } catch {
      setLocalNotifications([]);
    }
  }, [storageKey]);

  const updateLocalNotifications = useCallback(
    (updater: (current: AppNotification[]) => AppNotification[]) => {
      setLocalNotifications((current) => {
        const next = sortNotifications(updater(current)).slice(0, MAX_NOTIFICATIONS);
        persistNotifications(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const addNotification = useCallback(
    (payload: AppNotificationPayload) => {
      const createdAt = new Date().toISOString();
      const next: AppNotification = {
        id: `${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
        title: payload.title,
        description: payload.description,
        actor: payload.actor,
        createdAt,
        read: false,
        source: "local",
      };

      updateLocalNotifications((current) => [next, ...current]);
    },
    [updateLocalNotifications],
  );

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setServerNotifications([]);
      return;
    }

    const items = await notificationService.getNotifications();
    setServerNotifications(
      sortNotifications(
        items.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.message,
          createdAt: item.createdAtUtc,
          read: item.isRead,
          source: "server" as const,
        })),
      ).slice(0, MAX_NOTIFICATIONS),
    );
  }, [user]);

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      const serverItem = serverNotifications.find((item) => item.id === notificationId);
      if (serverItem) {
        await notificationService.markAsRead(notificationId);
        setServerNotifications((current) =>
          current.map((item) =>
            item.id === notificationId ? { ...item, read: true } : item,
          ),
        );
        return;
      }

      updateLocalNotifications((current) =>
        current.map((item) =>
          item.id === notificationId ? { ...item, read: true } : item,
        ),
      );
    },
    [serverNotifications, updateLocalNotifications],
  );

  const markAllAsRead = useCallback(async () => {
    setServerNotifications((current) =>
      current.map((item) => ({ ...item, read: true })),
    );
    await notificationService.markAllAsRead();

    updateLocalNotifications((current) =>
      current.map((item) => ({ ...item, read: true })),
    );
  }, [updateLocalNotifications]);

  const deleteNotifications = useCallback(
    async (notificationIds: string[]) => {
      const uniqueIds = Array.from(new Set(notificationIds.filter(Boolean)));
      if (uniqueIds.length === 0) {
        return;
      }

      const serverIds = uniqueIds.filter((id) => isServerNotificationId(id));
      const localIds = uniqueIds.filter((id) => !isServerNotificationId(id));

      if (serverIds.length > 0) {
        await notificationService.deleteNotifications(serverIds);
        setServerNotifications((current) =>
          current.filter((item) => !serverIds.includes(item.id)),
        );
      }

      if (localIds.length > 0) {
        updateLocalNotifications((current) =>
          current.filter((item) => !localIds.includes(item.id)),
        );
      }
    },
    [updateLocalNotifications],
  );

  const deleteAllNotifications = useCallback(async () => {
    await notificationService.deleteAllNotifications();
    setServerNotifications([]);
    updateLocalNotifications(() => []);
  }, [updateLocalNotifications]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleNotify = (event: Event) => {
      const customEvent = event as CustomEvent<AppNotificationPayload>;
      addNotification(customEvent.detail);
    };

    const handleStorage = (event: StorageEvent) => {
      if (!storageKey || event.key !== storageKey) {
        return;
      }

      try {
        const parsed = event.newValue ? (JSON.parse(event.newValue) as AppNotification[]) : [];
        setLocalNotifications(sortNotifications(parsed).slice(0, MAX_NOTIFICATIONS));
      } catch {
        setLocalNotifications([]);
      }
    };

    window.addEventListener(notificationEventName, handleNotify as EventListener);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(notificationEventName, handleNotify as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, [addNotification, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleWindowFocus = () => {
      void refreshNotifications();
    };

    window.addEventListener("focus", handleWindowFocus);
    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [refreshNotifications]);

  const notifications = useMemo(() => {
    const merged = new Map<string, AppNotification>();
    for (const item of localNotifications) {
      merged.set(item.id, item);
    }
    for (const item of serverNotifications) {
      merged.set(item.id, item);
    }

    return sortNotifications(Array.from(merged.values())).slice(0, MAX_NOTIFICATIONS);
  }, [localNotifications, serverNotifications]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      latestNotifications: notifications.slice(0, 5),
      unreadCount: notifications.filter((item) => !item.read).length,
      markNotificationAsRead,
      markAllAsRead,
      deleteNotifications,
      deleteAllNotifications,
      addNotification,
      refreshNotifications,
    }),
    [
      addNotification,
      deleteAllNotifications,
      deleteNotifications,
      markAllAsRead,
      markNotificationAsRead,
      notifications,
      refreshNotifications,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }

  return context;
};
