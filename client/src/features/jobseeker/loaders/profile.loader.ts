import { jobseekerService } from "@features/jobseeker/services/jobseeker.service";
import type { ProfileLoaderData } from "@features/jobseeker/types";
import { rethrowAsRouteError } from "@features/jobseeker/loaders/loader.utils";

// Use to preload the jobseeker profile page before the form is displayed.
export const profileLoader = async (): Promise<ProfileLoaderData> => {
  try {
    return await jobseekerService.getProfile();
  } catch (error) {
    return rethrowAsRouteError(error, "Unable to load profile.");
  }
};
