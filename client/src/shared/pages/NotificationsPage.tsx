import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bell, CheckCheck, Trash2, Trash } from "lucide-react";
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

  const handleNotificationSelection = async (notificationId: string, isRead: boolean) => {
    toggleSelection(notificationId);

    if (!isRead) {
      await markNotificationAsRead(notificationId);
    }
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
      <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white/90 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 sm:p-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            Notifications
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
            {notifications.length === 0
              ? "No notifications to review."
              : unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "All notifications are read."}
          </p>
        </div>
        <div className="w-full md:w-auto">
          {notifications.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center md:justify-end">
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900 sm:px-4 sm:text-sm md:w-auto"
              >
                <CheckCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Mark all as read
              </button>
              <button
                type="button"
                disabled={selectedIds.length === 0 || isDeletingSelected || isDeletingAll}
                onClick={() => void handleDeleteSelected()}
                className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40 sm:px-4 sm:text-sm md:w-auto"
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {isDeletingSelected ? "Deleting..." : "Delete Selected"}
              </button>
              <button
                type="button"
                disabled={notifications.length === 0 || isDeletingAll || isDeletingSelected}
                onClick={() => void handleDeleteAll()}
                className="col-span-2 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40 sm:px-4 sm:text-sm md:col-auto md:w-auto"
              >
                <Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {isDeletingAll ? "Deleting..." : "Delete All Notifications"}
              </button>
            </div>
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
          <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white/70 px-4 py-3 text-[11px] shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
            <label className="inline-flex items-center gap-3 font-medium text-zinc-700 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-700 focus:ring-zinc-300 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:focus:ring-white/20"
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
              <div
                role="button"
                tabIndex={0}
                onClick={() => void handleNotificationSelection(notification.id, notification.read)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    void handleNotificationSelection(notification.id, notification.read);
                  }
                }}
                aria-pressed={selectedIds.includes(notification.id)}
                className="flex cursor-pointer gap-3"
              >
                <label
                  className="mt-1 inline-flex shrink-0 items-center"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleNotificationSelection(notification.id, notification.read);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(notification.id)}
                    onChange={() => undefined}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-700 focus:ring-zinc-300 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:focus:ring-white/20"
                  />
                </label>
                <div className="w-full min-w-0">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "mt-1 h-2 w-2 shrink-0 rounded-full",
                            notification.read
                              ? "bg-zinc-400 dark:bg-zinc-500"
                              : "bg-green-500 dark:bg-green-400",
                          )}
                          aria-label={notification.read ? "Read notification" : "Unread notification"}
                        />
                        <span className="min-w-0 text-xs font-semibold sm:text-sm">{notification.title}</span>
                      </div>
                      {notification.description ? (
                        <p className="text-xs sm:text-sm">{notification.description}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-1 text-[10px] uppercase tracking-wide text-zinc-400 sm:text-[11px] md:items-end">
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
