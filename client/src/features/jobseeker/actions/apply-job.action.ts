import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { jobseekerService } from "@features/jobseeker/services/jobseeker.service";
import type {
  ApplyJobActionData,
  JobseekerApplicationInput,
} from "@features/jobseeker/types";
import {
  getApiErrorMessage,
  getString,
} from "@features/jobseeker/actions/action.utils";

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

// Handles form submission for applying to a public job posting.
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
