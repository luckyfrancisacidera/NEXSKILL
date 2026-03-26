import { useEffect, useState } from "react";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";
import type { ApplicationsLoaderData } from "@features/jobseeker/types";
import { ApiError } from "@shared/api/http";

type UseApplicationsArgs = {
  initialData: ApplicationsLoaderData;
  pageNumber: number;
  pageSize: number;
  search: string;
  status: string;
};

export const useApplications = ({
  initialData,
  pageNumber,
  pageSize,
  search,
  status,
}: UseApplicationsArgs) => {
  const [data, setData] = useState<ApplicationsLoaderData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    void jobseekerService
      .getMyApplications({ pageNumber, pageSize, search, status })
      .then((nextData) => {
        if (isMounted) {
          setData(nextData);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Unable to refresh applications right now.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pageNumber, pageSize, search, status]);

  const withdraw = async (applicationId: string) => {
    setWithdrawingId(applicationId);
    setError(null);

    try {
      await jobseekerService.withdrawApplication(applicationId);

      let refreshed = await jobseekerService.getMyApplications({
        pageNumber,
        pageSize,
        search,
        status,
      });

      if (
        refreshed.totalPages > 0 &&
        refreshed.pageNumber > refreshed.totalPages
      ) {
        refreshed = await jobseekerService.getMyApplications({
          pageNumber: refreshed.totalPages,
          pageSize,
          search,
          status,
        });
      }

      setData(refreshed);
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to withdraw this application right now.",
      );
    } finally {
      setWithdrawingId(null);
    }
  };

  const deleteHistory = async (applicationId: string) => {
    setDeletingHistoryId(applicationId);
    setError(null);

    try {
      await jobseekerService.deleteApplicationHistory(applicationId);

      let refreshed = await jobseekerService.getMyApplications({
        pageNumber,
        pageSize,
        search,
        status,
      });

      if (
        refreshed.totalPages > 0 &&
        refreshed.pageNumber > refreshed.totalPages
      ) {
        refreshed = await jobseekerService.getMyApplications({
          pageNumber: refreshed.totalPages,
          pageSize,
          search,
          status,
        });
      }

      setData(refreshed);
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to remove this item from your history right now.",
      );
    } finally {
      setDeletingHistoryId(null);
    }
  };

  const refresh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const refreshed = await jobseekerService.getMyApplications({
        pageNumber,
        pageSize,
        search,
        status,
      });
      setData(refreshed);
    } catch {
      setError("Unable to refresh applications right now.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    error,
    isLoading,
    withdrawingId,
    deletingHistoryId,
    withdraw,
    deleteHistory,
    refresh,
  };
};
