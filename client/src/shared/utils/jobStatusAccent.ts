export type JobStatus = "draft" | "published" | "closed" | string;

export const getJobStatusAccent = (status?: JobStatus) => {
  switch ((status ?? "").toLowerCase()) {
    case "draft":
      return {
        label: "Draft",
        className:
          "border-yellow-300 bg-yellow-100 text-yellow-800 dark:border-yellow-900 dark:bg-yellow-500/10 dark:text-yellow-300",
      };

    case "published":
      return {
        label: "Published",
        className:
          "border-green-300 bg-green-100 text-green-800 dark:border-green-900 dark:bg-green-500/10 dark:text-green-300",
      };

    case "closed":
      return {
        label: "Closed",
        className:
          "border-red-300 bg-red-100 text-red-800 dark:border-red-900 dark:bg-red-500/10 dark:text-red-300",
      };

    default:
      return {
        label: status ?? "Unknown",
        className:
          "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300",
      };
  }
};