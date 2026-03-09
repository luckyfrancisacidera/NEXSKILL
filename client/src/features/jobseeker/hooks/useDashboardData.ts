import { useState } from "react";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";
import type { DashboardLoaderData } from "@features/jobseeker/types";

export const useDashboardData = (initialData: DashboardLoaderData) => {
  const [data, setData] = useState(initialData);
  const [range, setRange] = useState("this_week");

  const updateRange = async (value: string) => {
    setRange(value);
    setData(await jobseekerService.getDashboard(value));
  };

  return {
    data,
    range,
    updateRange,
  };
};
