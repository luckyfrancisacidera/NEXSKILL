import { useEffect, useState } from "react";
import { jobseekerService } from "@features/jobseeker/services/jobseeker.service";
import type { ApplicationsLoaderData } from "@features/jobseeker/types";
import { ApiError } from "@shared/api/http";

type UseApplicationsArgs = {
  initialData: ApplicationsLoaderData;
  pageNumber: number;
  pageSize: number;
  search: string;
  status: string;
  archivedOnly?: boolean;
};

// Use to keep the applications table in sync with route filters and row-level mutations.
export const useApplications = ({
  initialData,
  pageNumber,
  pageSize,
  search,
  status,
  archivedOnly = false,
}: UseApplicationsArgs) => {
  const [data, setData] = useState<ApplicationsLoaderData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [unarchivingId, setUnarchivingId] = useState<string | null>(null);
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
      .getMyApplications({ pageNumber, pageSize, search, status, archivedOnly })
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
  }, [archivedOnly, pageNumber, pageSize, search, status]);

  // Use to reload the current page after a mutation and fall back when the last page becomes empty.
  const refreshApplications = async () => {
    let refreshed = await jobseekerService.getMyApplications({
      pageNumber,
      pageSize,
      search,
      status,
      archivedOnly,
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
        archivedOnly,
      });
    }

    setData(refreshed);
  };

  const withdraw = async (applicationId: string) => {
    setWithdrawingId(applicationId);
    setError(null);

    try {
      await jobseekerService.withdrawApplication(applicationId);

      await refreshApplications();
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

  const archiveHistory = async (applicationId: string) => {
    setArchivingId(applicationId);
    setError(null);

    try {
      await jobseekerService.archiveApplicationHistory(applicationId);
      await refreshApplications();
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to archive this history entry right now.",
      );
    } finally {
      setArchivingId(null);
    }
  };

  const unarchiveHistory = async (applicationId: string) => {
    setUnarchivingId(applicationId);
    setError(null);

    try {
      await jobseekerService.unarchiveApplicationHistory(applicationId);
      await refreshApplications();
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to restore this history entry right now.",
      );
    } finally {
      setUnarchivingId(null);
    }
  };

  const deleteHistory = async (applicationId: string) => {
    setDeletingHistoryId(applicationId);
    setError(null);

    try {
      await jobseekerService.deleteApplicationHistory(applicationId);

      await refreshApplications();
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

  // Use for manual refresh actions initiated from the applications screen.
  const refresh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const refreshed = await jobseekerService.getMyApplications({
        pageNumber,
        pageSize,
        search,
        status,
        archivedOnly,
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
    archivingId,
    unarchivingId,
    deletingHistoryId,
    withdraw,
    archiveHistory,
    unarchiveHistory,
    deleteHistory,
    refresh,
  };
};
