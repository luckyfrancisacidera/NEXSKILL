/**
 * Recruiter Feature - Actions
 *
 * This folder contains recruiter route actions grouped by mutation workflow.
 * Separating actions into focused files keeps the feature easier to extend
 * without growing a single large handler module.
 */
export * from "@features/recruiter/actions/createJobAction";
export * from "@features/recruiter/actions/updateJobAction";
export * from "@features/recruiter/actions/deleteJobAction";
export * from "@features/recruiter/actions/updateJobStatusAction";
export * from "@features/recruiter/actions/updateCandidateAction";
export * from "@features/recruiter/actions/upsertInterviewAction";
export * from "@features/recruiter/actions/cancelInterviewAction";
export * from "@features/recruiter/actions/automationRuleAction";
export * from "@features/recruiter/actions/runOfferAutomationAction";
export * from "@features/recruiter/actions/updateRecruiterSettingsAction";
