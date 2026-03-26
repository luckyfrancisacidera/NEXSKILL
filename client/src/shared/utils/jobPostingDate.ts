const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate());

export const getPostedDateValue = <T extends {
  posted_date_utc?: string | null;
  created_at_utc?: string | null;
  posted_at?: string | null;
  created_at?: string | null;
}>(job: T) =>
  job.posted_date_utc ?? job.created_at_utc ?? job.posted_at ?? job.created_at ?? null;

export const formatPostedDateLabel = (value?: string | null) => {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  const today = startOfDay(new Date());
  const postedDay = startOfDay(date);
  const dayDifference = Math.round((today.getTime() - postedDay.getTime()) / 86400000);

  if (dayDifference <= 0) {
    return 'Posted today';
  }

  if (dayDifference === 1) {
    return 'Posted 1 day ago';
  }

  if (dayDifference <= 7) {
    return `Posted ${dayDifference} days ago`;
  }

  return DATE_LABEL_FORMATTER.format(date);
};

