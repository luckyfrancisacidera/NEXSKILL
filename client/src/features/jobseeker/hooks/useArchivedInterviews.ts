import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@shared/api/http";
import { jobseekerInterviewService } from "@features/jobseeker/services/interview.service";
import type {
  JobseekerArchivedInterviewsLoaderData,
  JobseekerArchivedInterviewsQueryParams,
} from "@features/jobseeker/types";
import {
  publishJobseekerInterviewMutation,
  subscribeJobseekerInterviewMutations,
} from "@features/jobseeker/utils/interviewMutationSync";

type UseArchivedInterviewsArgs = JobseekerArchivedInterviewsQueryParams & {
  initialData: JobseekerArchivedInterviewsLoaderData;
};

// Use to manage the archived interviews screen after route preload and archive-state updates.
export const useArchivedInterviews = ({
  initialData,
  pageNumber,
  pageSize,
  search,
  status,
}: UseArchivedInterviewsArgs) => {
  const [data, setData] = useState<JobseekerArchivedInterviewsLoaderData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unarchivingId, setUnarchivingId] = useState<string | null>(null);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    void jobseekerInterviewService
      .getArchivedJobseekerInterviewsPage({
        pageNumber,
        pageSize,
        search,
        status,
      })
      .then((nextData) => {
        if (isMounted) {
          setData(nextData);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Unable to refresh archived interviews right now.");
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

  // Use to reload the archived interview page and step back when the current page becomes empty.
  const refresh = useCallback(async (preferredPageNumber = pageNumber) => {
    let refreshed = await jobseekerInterviewService.getArchivedJobseekerInterviewsPage({
      pageNumber: preferredPageNumber,
      pageSize,
      search,
      status,
    });

    if (refreshed.totalPages > 0 && refreshed.pageNumber > refreshed.totalPages) {
      refreshed = await jobseekerInterviewService.getArchivedJobseekerInterviewsPage({
        pageNumber: refreshed.totalPages,
        pageSize,
        search,
        status,
      });
    }

    setData(refreshed);
    return refreshed;
  }, [pageNumber, pageSize, search, status]);

  useEffect(() => {
    // Use to keep the archived list updated when another part of the feature archives or restores an interview.
    const unsubscribe = subscribeJobseekerInterviewMutations(() => {
      void refresh();
    });

    return unsubscribe;
  }, [refresh]);

  // Handles restoring an archived interview and broadcasting the change to other screens.
  const unarchive = async (interviewId: string) => {
    setUnarchivingId(interviewId);
    setError(null);

    try {
      const updated = await jobseekerInterviewService.unarchiveInterview(interviewId);
      const refreshed = await refresh();
      publishJobseekerInterviewMutation({
        type: "unarchived",
        interview: updated,
      });

      if (refreshed.items.length === 0 && refreshed.pageNumber > 1) {
        await refresh(refreshed.pageNumber - 1);
      }
      return true;
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to restore this interview right now.",
      );
      return false;
    } finally {
      setUnarchivingId(null);
    }
  };

  return {
    data,
    error,
    isLoading,
    unarchivingId,
    refresh,
    unarchive,
  };
};
