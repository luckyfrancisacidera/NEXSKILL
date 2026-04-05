import type { ActionFunctionArgs } from "react-router-dom";
import { jobseekerService } from "@features/jobseeker/services/jobseeker.service";
import type {
  JobseekerProfileDto,
  JobseekerProfileUpdatePayload,
} from "@features/jobseeker/types";
import {
  getApiErrorMessage,
  getString,
} from "@features/jobseeker/actions/action.utils";
import { sanitizeRichText } from "@shared/utils/richText";

// Handles profile form submission and sanitizes rich-text fields before sending them to the API.
export const updateProfileAction = async ({
  request,
}: ActionFunctionArgs): Promise<{
  error?: string;
  profile?: JobseekerProfileDto;
}> => {
  try {
    const formData = await request.formData();
    const payload: JobseekerProfileUpdatePayload = {
      full_name: getString(formData, "full_name") || undefined,
      email: getString(formData, "email") || undefined,
      phone: getString(formData, "phone") || undefined,
      location: getString(formData, "location") || undefined,
      professional_title:
        getString(formData, "professional_title") || undefined,
      skills: getString(formData, "skills") || undefined,
      bio: sanitizeRichText(getString(formData, "bio")) || undefined,
      experience_summary:
        sanitizeRichText(getString(formData, "experience_summary")) || undefined,
      resume_url: getString(formData, "resume_url") || undefined,
      avatar_url: getString(formData, "avatar_url") || undefined,
    };

    const profile = await jobseekerService.updateProfile(payload);
    return { profile };
  } catch (error) {
    return {
      error: getApiErrorMessage(error, "Unable to update profile right now."),
    };
  }
};
