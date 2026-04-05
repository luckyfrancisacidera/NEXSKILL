import { useState } from "react";
import { jobseekerService } from "@features/jobseeker/services/jobseeker.service";
import type { DashboardLoaderData } from "@features/jobseeker/types";

// Use to hydrate the jobseeker dashboard from loader data and swap analytics ranges on demand.
export const useDashboardData = (initialData: DashboardLoaderData) => {
  const [data, setData] = useState(initialData);
  const [range, setRange] = useState(initialData.analytics.range ?? "this_week");
  const [isLoading, setIsLoading] = useState(false);

  // Handles range changes from the dashboard filters and reloads matching analytics.
  const updateRange = async (value: string) => {
    setRange(value);
    setIsLoading(true);

    try {
      setData(await jobseekerService.getDashboard(value));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    range,
    updateRange,
  };
};
