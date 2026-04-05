import { getNum, getString } from "@features/recruiter/actions/utils";
import {
  normalizeStringArray,
  richTextToPlainText,
} from "@shared/utils/richText";

// Splits comma-delimited form fields into the individual values expected by job payload builders.
const splitCsv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim());

// Removes empty strings from job skill arrays before a recruiter create or update request is sent.
export const normalizeJobStringArray = (values: Array<string | null | undefined>) =>
  normalizeStringArray(values);

// Maps recruiter job form data into the API payload shape used by create and update actions.
export const getJobPayload = (formData: FormData) => ({
  title: getString(formData, "title"),
  description: richTextToPlainText(getString(formData, "description")),
  responsibilities: richTextToPlainText(getString(formData, "responsibilities")),
  required_skills: normalizeJobStringArray(splitCsv(getString(formData, "required_skills"))),
  preferred_skills: normalizeJobStringArray(splitCsv(getString(formData, "preferred_skills"))),
  experience_level: getString(formData, "experience_level") || undefined,
  min_years: getNum(formData, "min_years"),
  education: getString(formData, "education") || undefined,
  min_education: getString(formData, "min_education") || undefined,
  department: getString(formData, "department") || undefined,
  benefits: richTextToPlainText(getString(formData, "benefits")) || undefined,
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
