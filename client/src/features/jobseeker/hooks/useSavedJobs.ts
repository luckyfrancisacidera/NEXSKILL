/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { jobseekerService } from "@features/jobseeker/services/jobseeker.service";

// Use to refresh the saved-jobs list whenever the current search term changes.
export const useSavedJobs = (search: string) => {
  const [saved, setSaved] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use to reload the current saved-jobs result set after a save or unsave action.
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
