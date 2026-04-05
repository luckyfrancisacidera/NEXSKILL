import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@app/providers/AuthProvider";
import { getDefaultRouteByRole } from "@app/routes/routes.guard";
import { Card } from "@shared/components/data-display/Card";
import { useNotifications } from "@app/providers/NotificationsProvider";
import { useConfirmation } from "@shared/hooks/useConfirmation";
import { cn } from "@shared/utils/cn";
import { formatNotificationTimestamp } from "@shared/utils/notifications";

const cardClassName = (isRead: boolean) =>
  cn(
    "rounded-2xl border p-4 transition-colors",
    isRead
      ? "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
      : "border-violet-200 bg-violet-50/70 text-zinc-900 ring-1 ring-violet-100 dark:border-violet-900 dark:bg-violet-950/40 dark:text-zinc-100 dark:ring-violet-900/60",
  );

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { roles } = useAuth();
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    markNotificationAsRead,
    deleteNotifications,
    deleteAllNotifications,
    refreshNotifications,
  } = useNotifications();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const confirm = useConfirmation();

  const fallbackRoute = useMemo(() => getDefaultRouteByRole(roles), [roles]);
  const visibleNotificationIds = useMemo(
    () => notifications.map((notification) => notification.id),
    [notifications],
  );
  const allVisibleSelected =
    visibleNotificationIds.length > 0 &&
    visibleNotificationIds.every((id) => selectedIds.includes(id));

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    setSelectedIds((current) =>
      current.filter((id) => visibleNotificationIds.includes(id)),
    );
  }, [visibleNotificationIds]);

  const onBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackRoute, { replace: true });
  };

  const toggleSelection = (notificationId: string) => {
    setSelectedIds((current) =>
      current.includes(notificationId)
        ? current.filter((id) => id !== notificationId)
        : [...current, notificationId],
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds((current) =>
      allVisibleSelected ? current.filter((id) => !visibleNotificationIds.includes(id)) : visibleNotificationIds,
    );
  };

  const handleDeleteSelected = async () => {
    const confirmed = await confirm({
      title: "Delete selected notifications",
      message: `Delete ${selectedIds.length} selected notification${selectedIds.length === 1 ? "" : "s"}?`,
      confirmLabel: "Delete selected",
      accent: "red",
    });
    if (!confirmed) {
      return;
    }

    setIsDeletingSelected(true);
    try {
      await deleteNotifications(selectedIds);
      setSelectedIds([]);
    } finally {
      setIsDeletingSelected(false);
    }
  };

  const handleDeleteAll = async () => {
    const confirmed = await confirm({
      title: "Delete all notifications",
      message: "Delete all notifications for your account? This action cannot be undone.",
      confirmLabel: "Delete all",
      accent: "red",
    });
    if (!confirmed) {
      return;
    }

    setIsDeletingAll(true);
    try {
      await deleteAllNotifications();
      setSelectedIds([]);
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Notifications
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {notifications.length === 0
              ? "No notifications to review."
              : unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "All notifications are read."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {notifications.length > 0 ? (
            <>
              <button
                type="button"
                onClick={markAllAsRead}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Mark all as read
              </button>
              <button
                type="button"
                disabled={selectedIds.length === 0 || isDeletingSelected || isDeletingAll}
                onClick={() => void handleDeleteSelected()}
                className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
              >
                {isDeletingSelected ? "Deleting..." : "Delete Selected"}
              </button>
              <button
                type="button"
                disabled={notifications.length === 0 || isDeletingAll || isDeletingSelected}
                onClick={() => void handleDeleteAll()}
                className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
              >
                {isDeletingAll ? "Deleting..." : "Delete All Notifications"}
              </button>
            </>
          ) : null}
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <div className="rounded-full bg-zinc-100 p-4 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-300">
            <Bell className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              No notifications yet
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              New recruiter and jobseeker activity will appear here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white/70 px-4 py-3 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
            <label className="inline-flex items-center gap-3 font-medium text-zinc-700 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
              />
              Select all visible
            </label>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {selectedIds.length} selected
            </span>
          </div>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(cardClassName(notification.read), "block w-full text-left")}
            >
              <div className="flex gap-3">
                <label className="mt-1 inline-flex shrink-0 items-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(notification.id)}
                    onChange={() => toggleSelection(notification.id)}
                    className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void markNotificationAsRead(notification.id)}
                  className="block w-full text-left"
                >
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{notification.title}</span>
                    {!notification.read ? (
                      <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Unread
                      </span>
                    ) : null}
                  </div>
                  {notification.description ? (
                    <p className="text-sm">{notification.description}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-start gap-1 text-xs uppercase tracking-wide text-zinc-400 md:items-end">
                  <span>
                    {notification.actor === "recruiter"
                      ? "Recruiter"
                      : notification.actor === "jobseeker"
                        ? "Jobseeker"
                        : "System"}
                  </span>
                  <span className="normal-case tracking-normal text-zinc-500 dark:text-zinc-400">
                    {formatNotificationTimestamp(notification.createdAt)}
                  </span>
                </div>
              </div>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

