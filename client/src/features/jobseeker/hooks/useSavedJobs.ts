/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";

export const useSavedJobs = (search: string) => {
  const [saved, setSaved] = useState<Array<Record<string, unknown>>>([]);

  const load = async () => {
    setSaved(await jobseekerService.getSavedJobs(search));
  };

  useEffect(() => {
    void load();
  }, [search]);

  return {
    load,
    saved,
  };
};
