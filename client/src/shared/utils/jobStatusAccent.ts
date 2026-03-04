export type JobStatus = "draft" | "published" | "closed" | string;

export const getJobStatusAccent = (status?: JobStatus) => {
  switch ((status ?? "").toLowerCase()) {
    case "draft":
      return {
        label: "Draft",
        className:
          "border-yellow-300 bg-yellow-100 text-yellow-800",
      };

    case "published":
      return {
        label: "Published",
        className:
          "border-green-300 bg-green-100 text-green-800",
      };

    case "closed":
      return {
        label: "Closed",
        className:
          "border-red-300 bg-red-100 text-red-800",
      };

    default:
      return {
        label: status ?? "Unknown",
        className:
          "border-zinc-300 bg-zinc-100 text-zinc-700",
      };
  }
};