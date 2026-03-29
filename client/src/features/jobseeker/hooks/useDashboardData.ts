import { useState } from "react";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";
import type { DashboardLoaderData } from "@features/jobseeker/types";

export const useDashboardData = (initialData: DashboardLoaderData) => {
  const [data, setData] = useState(initialData);
  const [range, setRange] = useState(initialData.analytics.range ?? "this_week");
  const [isLoading, setIsLoading] = useState(false);

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
