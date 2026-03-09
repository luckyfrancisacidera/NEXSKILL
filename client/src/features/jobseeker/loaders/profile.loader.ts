import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";
import type { ProfileLoaderData } from "@features/jobseeker/types";
import { rethrowAsRouteError } from "@features/jobseeker/loaders/loader.utils";

export const profileLoader = async (): Promise<ProfileLoaderData> => {
  try {
    return await jobseekerService.getProfile();
  } catch (error) {
    return rethrowAsRouteError(error, "Unable to load profile.");
  }
};
