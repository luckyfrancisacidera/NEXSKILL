import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { recruiterService } from "@features/recruiter/service/recruiter.service";
import { ApiError } from "@shared/api/http";
import {
  getApiErrorMessage,
  getNum,
  getString,
} from "@features/recruiter/actions/utils";

/**
 * createJobAction
 *
 * Handles recruiter job creation submissions.
 * The action maps form data into the existing job payload shape
 * and redirects to the newly created job on success.
 */
const getJobPayload = (formData: FormData) => ({
  title: getString(formData, "title"),
  description: getString(formData, "description"),
  responsibilities: getString(formData, "responsibilities"),
  required_skills: getString(formData, "required_skills")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
  preferred_skills: getString(formData, "preferred_skills")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
  experience_level: getString(formData, "experience_level") || undefined,
  min_years: getNum(formData, "min_years"),
  education: getString(formData, "education") || undefined,
  min_education: getString(formData, "min_education") || undefined,
  department: getString(formData, "department") || undefined,
  benefits: getString(formData, "benefits") || undefined,
  salary_min_per_annum: getNum(formData, "salary_min_per_annum"),
  salary_max_per_annum: getNum(formData, "salary_max_per_annum"),
  currency: getString(formData, "currency") || "PHP",
  location: getString(formData, "location"),
  schedule: getString(formData, "schedule") || undefined,
  work_setup: getNum(formData, "work_setup") ?? 0,
  employment_type: getNum(formData, "employment_type") ?? 0,
  status: getString(formData, "status") || "Draft",
  number_of_vacancies: Math.max(
    0,
    getNum(formData, "number_of_vacancies") ?? 1,
  ),
});

export const createJobAction = async ({
  request,
}: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const payload = getJobPayload(formData);

    console.info("[Recruiter] Save clicked", {
      mode: "create",
      payload,
    });

    const job = await recruiterService.createJob(payload);

    return redirect(`/recruiter/job-posts/${job.id}?toast=created`);
  } catch (error) {
    console.error("[Recruiter] Save failed", error);

    if (error instanceof ApiError && error.status === 401) {
      return redirect("/login");
    }

    return {
      error: getApiErrorMessage(
        error,
        "Unable to save job right now. Please try again.",
      ),
    };
  }
};
