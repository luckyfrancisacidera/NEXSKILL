import { useEffect, useState } from "react";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";
import type { ApplicationsLoaderData } from "@features/jobseeker/types";

type UseApplicationsArgs = {
  initialData: ApplicationsLoaderData;
  search: string;
  status: string;
};

export const useApplications = ({
  initialData,
  search,
  status,
}: UseApplicationsArgs) => {
  const [data, setData] = useState<ApplicationsLoaderData>(initialData);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void jobseekerService
      .getMyApplications({ pageNumber: 1, pageSize: 10, search, status })
      .then((nextData) => {
        if (isMounted) {
          setData(nextData);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [search, status]);

  const withdraw = async (applicationId: string) => {
    setWithdrawingId(applicationId);

    try {
      await jobseekerService.withdrawApplication(applicationId);
      const refreshed = await jobseekerService.getMyApplications({
        pageNumber: 1,
        pageSize: 10,
        search,
        status,
      });
      setData(refreshed);
    } finally {
      setWithdrawingId(null);
    }
  };

  return {
    data,
    withdrawingId,
    withdraw,
  };
};
