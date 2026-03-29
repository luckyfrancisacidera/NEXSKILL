/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";

export const useSavedJobs = (search: string) => {
  const [saved, setSaved] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);

    try {
      setSaved(await jobseekerService.getSavedJobs(search));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [search]);

  return {
    isLoading,
    load,
    saved,
  };
};
