import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { ApiError } from "@shared/api/http";
import { jobseekerService } from "./service/jobseeker.service";
import type {
  ApiMessageResponse,
  ApplyJobActionData,
  JobseekerApplicationInput,
  JobseekerProfileDto,
  JobseekerProfileUpdatePayload,
} from "./types/jobseeker.types";

const getString = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof ApiError) {
    const payload = error.data as ApiMessageResponse | null;
    return (
      payload?.errors?.[0] ??
      payload?.message ??
      error.message ??
      fallbackMessage
    );
  }

  return fallbackMessage;
};

const isApplyJobActionData = (
  payload: JobseekerApplicationInput | ApplyJobActionData,
): payload is ApplyJobActionData => "error" in payload;

const getApplicationPayload = (
  formData: FormData,
): JobseekerApplicationInput | ApplyJobActionData => {
  const resume = formData.get("resume_file");
  if (!(resume instanceof File) || resume.size === 0) {
    return { error: "Resume is required." };
  }

  return {
    full_name: getString(formData, "full_name"),
    email: getString(formData, "email"),
    postal_code: getString(formData, "postal_code"),
    location: getString(formData, "location"),
    resume_file: resume,
  };
};

export const applyJobAction = async ({
  request,
  params,
}: ActionFunctionArgs): Promise<Response | ApplyJobActionData | null> => {
  if (!params.jobId) {
    return null;
  }

  const formData = await request.formData();
  const payload = getApplicationPayload(formData);
  if (isApplyJobActionData(payload)) {
    return payload;
  }

  try {
    await jobseekerService.applyToJob(params.jobId, payload);
    return redirect("/jobs");
  } catch (error) {
    return {
      error: getApiErrorMessage(
        error,
        "Unable to submit application right now.",
      ),
    };
  }
};

export const withdrawApplicationAction = async ({
  params,
}: ActionFunctionArgs): Promise<{ error?: string; ok?: boolean } | null> => {
  if (!params.applicationId) {
    return null;
  }

  try {
    await jobseekerService.withdrawApplication(params.applicationId);
    return { ok: true };
  } catch (error) {
    return {
      error: getApiErrorMessage(
        error,
        "Unable to withdraw application right now.",
      ),
    };
  }
};

export const saveJobAction = async ({
  request,
  params,
}: ActionFunctionArgs): Promise<{ error?: string; ok?: boolean } | null> => {
  if (!params.jobId) {
    return null;
  }

  try {
    const formData = await request.formData();
    const intent = getString(formData, "intent");

    if (intent === "remove-saved-job") {
      await jobseekerService.removeSavedJob(params.jobId);
    } else {
      await jobseekerService.saveJob(params.jobId);
    }

    return { ok: true };
  } catch (error) {
    return {
      error: getApiErrorMessage(
        error,
        "Unable to update saved jobs right now.",
      ),
    };
  }
};

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
      bio: getString(formData, "bio") || undefined,
      experience_summary:
        getString(formData, "experience_summary") || undefined,
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
