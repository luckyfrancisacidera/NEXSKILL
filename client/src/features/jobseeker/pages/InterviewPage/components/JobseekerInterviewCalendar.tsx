import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import type { DateClickArg } from "@fullcalendar/interaction";
import type {
  CalendarApi,
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventInput,
} from "@fullcalendar/core";
import type {
  JobseekerInterview,
  JobseekerInterviewStatus,
} from "@features/jobseeker/types";
import { Card } from "@shared/components/Card";
import { SideDrawer } from "@shared/components/SideDrawer";
import { cn } from "@shared/utils/cn";
import { interviewStatusCalendarPillClassName } from "@shared/utils/interviewStatus";

interface JobseekerInterviewCalendarProps {
  interviews: JobseekerInterview[];
  emptyStateMessage?: string;
  onSelectInterview: (interview: JobseekerInterview) => void;
}

const DEFAULT_INTERVIEW_DURATION_MINUTES = 60;
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const VIEW_OPTIONS = [
  { key: "dayGridMonth", label: "Month" },
  { key: "timeGridWeek", label: "Week" },
  { key: "timeGridDay", label: "Day" },
  { key: "listMonth", label: "List" },
] as const;
const STATUS_FILTERS: Array<{ key: "all" | JobseekerInterviewStatus; label: string }> = [
  { key: "all", label: "All interviews" },
  { key: "Pending", label: "Pending" },
  { key: "Accepted", label: "Accepted" },
  { key: "RescheduleRequested", label: "Reschedule requested" },
  { key: "Rescheduled", label: "Rescheduled" },
  { key: "Declined", label: "Declined" },
  { key: "Cancelled", label: "Cancelled" },
  { key: "Completed", label: "Completed" },
] as const;
const EVENT_TONE_CLASS_BY_STATUS: Record<JobseekerInterviewStatus, string> = {
  Pending: "status-pending",
  Accepted: "status-accepted",
  Declined: "status-declined",
  RescheduleRequested: "status-reschedule-requested",
  Rescheduled: "status-rescheduled",
  Cancelled: "status-cancelled",
  Completed: "status-completed",
};

const toDateOnly = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const buildMiniCalendarDays = (currentMonth: Date) => {
  const firstOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  );
  const firstVisibleDay = new Date(firstOfMonth);
  firstVisibleDay.setDate(firstVisibleDay.getDate() - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstVisibleDay);
    day.setDate(firstVisibleDay.getDate() + index);
    return day;
  });
};

const mapInterviewToEvent = (interview: JobseekerInterview): EventInput => {
  const start = new Date(interview.scheduledDate);
  const end = new Date(
    start.getTime() + DEFAULT_INTERVIEW_DURATION_MINUTES * 60 * 1000,
  );

  return {
    id: interview.id,
    start: start.toISOString(),
    end: end.toISOString(),
    title: interview.companyName || interview.recruiterName || "Interview",
    classNames: ["recruiter-interview-event", EVENT_TONE_CLASS_BY_STATUS[interview.status]],
    extendedProps: {
      interview,
    },
  };
};

const renderInterviewEvent = (eventInfo: EventContentArg) => {
  const interview = eventInfo.event.extendedProps.interview as JobseekerInterview;
  const statusClassName = interviewStatusCalendarPillClassName[interview.status];
  const isListView = eventInfo.view.type.startsWith("list");

  if (isListView) {
    return (
      <div className="flex min-w-0 items-center gap-3 py-1.5">
        <span className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-current opacity-90" />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {interview.companyName || interview.recruiterName || "Interview"}
          </div>
          <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {interview.jobTitle || interview.recruiterName || "Interview schedule"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
        {eventInfo.event.title}
      </div>
      {interview.jobTitle ? (
        <div className="truncate text-[11px] text-zinc-600 dark:text-zinc-300">{interview.jobTitle}</div>
      ) : null}
      <span
        className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusClassName}`}
      >
        {interview.status}
      </span>
    </div>
  );
};

interface JobseekerCalendarSidebarProps {
  today: Date;
  focusedDate: Date;
  miniCalendarDays: Date[];
  activeFilter: "all" | JobseekerInterviewStatus;
  filterCounts: Array<{
    key: "all" | JobseekerInterviewStatus;
    label: string;
    count: number;
  }>;
  onGoToToday: () => void;
  onMoveCalendar: (direction: "prev" | "next") => void;
  onNavigateToDate: (date: Date) => void;
  onFilterChange: (filter: "all" | JobseekerInterviewStatus) => void;
}

const JobseekerCalendarSidebar = ({
  today,
  focusedDate,
  miniCalendarDays,
  activeFilter,
  filterCounts,
  onGoToToday,
  onMoveCalendar,
  onNavigateToDate,
  onFilterChange,
}: JobseekerCalendarSidebarProps) => (
  <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
    <div className="border-b border-zinc-200/70 px-6 py-6 dark:border-zinc-800">
      <button
        type="button"
        className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(24,24,27,0.16)] transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        onClick={onGoToToday}
      >
        Go To Today
      </button>
    </div>

    <div className="px-6 py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label="Previous"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
          onClick={() => onMoveCalendar("prev")}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-medium text-zinc-700 sm:text-base dark:text-zinc-200">
          {focusedDate.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </p>
        <button
          type="button"
          aria-label="Next"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
          onClick={() => onMoveCalendar("next")}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-3 text-center text-[0.95rem] font-medium text-zinc-500 dark:text-zinc-400">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-7 gap-y-3 text-center">
        {miniCalendarDays.map((day) => {
          const isCurrentMonth = day.getMonth() === focusedDate.getMonth();
          const isSelected = isSameDay(day, focusedDate);
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              type="button"
              className={cn(
                "mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition",
                isSelected
                  ? "bg-zinc-900 text-white shadow-[0_10px_18px_rgba(24,24,27,0.18)] dark:bg-zinc-100 dark:text-zinc-900"
                  : isCurrentMonth
                    ? "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                    : "text-zinc-300 hover:bg-zinc-100 dark:text-zinc-600 dark:hover:bg-zinc-900",
                !isSelected && isToday && "ring-1 ring-zinc-300 dark:ring-zinc-700",
              )}
              onClick={() => onNavigateToDate(day)}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>

    <div className="border-t border-zinc-200/70 px-6 py-6 dark:border-zinc-800">
      <div className="mb-4">
        <h3 className="text-[1.1rem] font-semibold text-zinc-800 dark:text-zinc-100">
          Interview Status
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Filter your interview timeline by response state.
        </p>
      </div>

      <div className="space-y-1.5">
        {filterCounts.map((filter) => {
          const isActive = activeFilter === filter.key;

          return (
            <button
              key={filter.key}
              type="button"
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition",
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900",
              )}
              onClick={() => onFilterChange(filter.key)}
            >
              <span>{filter.label}</span>
              <span
                className={cn(
                  "inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-white/16 text-white dark:bg-zinc-900/10 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400",
                )}
              >
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

export const JobseekerInterviewCalendar = ({
  interviews,
  emptyStateMessage = "No interviews match the current filter yet.",
  onSelectInterview,
}: JobseekerInterviewCalendarProps) => {
  const calendarRef = useRef<FullCalendar | null>(null);
  const today = useMemo(() => toDateOnly(new Date()), []);
  const [focusedDate, setFocusedDate] = useState(today);
  const [calendarTitle, setCalendarTitle] = useState(
    today.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    }),
  );
  const [currentView, setCurrentView] = useState<(typeof VIEW_OPTIONS)[number]["key"]>("dayGridMonth");
  const [activeFilter, setActiveFilter] = useState<"all" | JobseekerInterviewStatus>("all");
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false);
  const activeInterviews = useMemo(
    () => interviews.filter((interview) => !interview.isArchived),
    [interviews],
  );
  const visibleInterviews = activeFilter === "all"
    ? activeInterviews
    : activeInterviews.filter((interview) => interview.status === activeFilter);
  const events = useMemo(
    () => visibleInterviews.filter((interview) => !interview.isArchived).map(mapInterviewToEvent),
    [visibleInterviews],
  );
  const miniCalendarDays = useMemo(
    () => buildMiniCalendarDays(focusedDate),
    [focusedDate],
  );
  const filterCounts = useMemo(
    () =>
      STATUS_FILTERS.map((filter) => ({
        ...filter,
        count:
          filter.key === "all"
            ? activeInterviews.length
            : activeInterviews.filter((interview) => interview.status === filter.key).length,
      })),
    [activeInterviews],
  );

  const syncCalendarState = (api: CalendarApi) => {
    setFocusedDate(toDateOnly(api.getDate()));
    setCalendarTitle(api.view.title);
    setCurrentView(api.view.type as (typeof VIEW_OPTIONS)[number]["key"]);
  };

  const moveCalendar = (direction: "prev" | "next") => {
    const api = calendarRef.current?.getApi();
    if (!api) {
      return;
    }

    if (direction === "prev") {
      api.prev();
    } else {
      api.next();
    }

    syncCalendarState(api);
  };

  const navigateToDate = (date: Date) => {
    const api = calendarRef.current?.getApi();
    if (!api) {
      return;
    }

    api.gotoDate(date);
    syncCalendarState(api);
  };

  const changeView = (view: (typeof VIEW_OPTIONS)[number]["key"]) => {
    const api = calendarRef.current?.getApi();
    if (!api) {
      return;
    }

    api.changeView(view);
    syncCalendarState(api);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleMediaQueryChange = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        setIsSidebarDrawerOpen(false);
      }
    };

    handleMediaQueryChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleMediaQueryChange);
      return () => mediaQuery.removeEventListener("change", handleMediaQueryChange);
    }

    mediaQuery.addListener(handleMediaQueryChange);
    return () => mediaQuery.removeListener(handleMediaQueryChange);
  }, []);

  return (
    <Card className="interview-calendar overflow-hidden border-0 bg-white p-0 shadow-[0_18px_50px_rgba(24,24,27,0.06)] dark:bg-zinc-950">
      <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden border-r border-zinc-200/70 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:block">
          <JobseekerCalendarSidebar
            today={today}
            focusedDate={focusedDate}
            miniCalendarDays={miniCalendarDays}
            activeFilter={activeFilter}
            filterCounts={filterCounts}
            onGoToToday={() => navigateToDate(today)}
            onMoveCalendar={moveCalendar}
            onNavigateToDate={navigateToDate}
            onFilterChange={setActiveFilter}
          />
        </aside>

        <div className="min-w-0 bg-white dark:bg-zinc-950">
          <div className="flex flex-col gap-5 border-b border-zinc-200/70 px-4 py-5 dark:border-zinc-800 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                aria-label="Open interview controls"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white dark:focus-visible:ring-zinc-500 lg:hidden"
                onClick={() => setIsSidebarDrawerOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous range"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-transparent text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
                  onClick={() => moveCalendar("prev")}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next range"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-transparent text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
                  onClick={() => moveCalendar("next")}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <h2 className="min-w-0 text-lg font-semibold tracking-[-0.03em] text-zinc-800 sm:text-[1.45rem] md:text-[1.7rem] lg:text-[2rem] dark:text-zinc-100">
                {calendarTitle}
              </h2>
            </div>

            <div className="w-full overflow-x-auto md:w-auto">
              <div className="flex min-w-max rounded-xl bg-zinc-100 p-1 md:inline-flex dark:bg-zinc-900">
                {VIEW_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className={cn(
                      "min-w-18 flex-1 rounded-lg px-3 py-2 text-center text-xs font-medium transition sm:px-4 sm:py-2.5 sm:text-sm md:min-w-19.5 md:flex-none",
                      currentView === option.key
                        ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white",
                    )}
                    onClick={() => changeView(option.key)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeInterviews.length === 0 ? (
            <div className="border-b border-zinc-200/70 px-6 py-4 dark:border-zinc-800">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {emptyStateMessage}
              </p>
            </div>
          ) : null}

          <div className="min-w-0 px-0 py-0 pr-0 lg:pr-5">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView="dayGridMonth"
              headerToolbar={false}
              views={{
                dayGridMonth: { buttonText: "Month" },
                timeGridWeek: { buttonText: "Week" },
                timeGridDay: { buttonText: "Day" },
                listMonth: { buttonText: "List" },
              }}
              height="auto"
              events={events}
              editable={false}
              selectable={true}
              weekends={true}
              nowIndicator={true}
              dayMaxEvents={3}
              allDaySlot={false}
              slotMinTime="08:00:00"
              slotMaxTime="19:00:00"
              slotDuration="00:30:00"
              eventContent={renderInterviewEvent}
              datesSet={(arg: DatesSetArg) => {
                syncCalendarState(arg.view.calendar);
              }}
              dateClick={(arg: DateClickArg) => {
                const clicked = visibleInterviews.find(
                  (interview) => interview.scheduledDate.slice(0, 10) === arg.dateStr.slice(0, 10),
                );

                if (clicked) {
                  onSelectInterview(clicked);
                }
              }}
              eventClick={(arg: EventClickArg) => {
                const interview = arg.event.extendedProps.interview as JobseekerInterview;
                onSelectInterview(interview);
              }}
              noEventsContent={() => (
                <div className="px-6 py-8 text-sm text-zinc-500 dark:text-zinc-400">
                  {activeInterviews.length === 0
                    ? emptyStateMessage
                    : "No interviews match the current filter yet."}
                </div>
              )}
            />
          </div>
        </div>
      </div>

      <SideDrawer
        open={isSidebarDrawerOpen}
        side="left"
        title="Interview controls"
        description="Jump between dates and filter your interview calendar."
        onClose={() => setIsSidebarDrawerOpen(false)}
        widthClassName="max-w-[88vw] sm:max-w-[380px]"
        contentClassName="px-0 py-0"
      >
        <JobseekerCalendarSidebar
          today={today}
          focusedDate={focusedDate}
          miniCalendarDays={miniCalendarDays}
          activeFilter={activeFilter}
          filterCounts={filterCounts}
          onGoToToday={() => {
            navigateToDate(today);
            setIsSidebarDrawerOpen(false);
          }}
          onMoveCalendar={moveCalendar}
          onNavigateToDate={(date) => {
            navigateToDate(date);
            setIsSidebarDrawerOpen(false);
          }}
          onFilterChange={(filter) => {
            setActiveFilter(filter);
            setIsSidebarDrawerOpen(false);
          }}
        />
      </SideDrawer>
    </Card>
  );
};
