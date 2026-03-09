import { useEffect, useState } from "react";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";

export const useSavedJobs = (search: string) => {
  const [saved, setSaved] = useState<Array<Record<string, unknown>>>([]);

  const load = async () => {
    setSaved(await jobseekerService.getSavedJobs(search));
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  }, [search]);

  return {
    load,
    saved,
  };
};
