import type { ActionFunctionArgs } from "react-router-dom";
import type { BulkApplicantStageResponseDto } from "@features/recruiter/types";
import { recruiterService } from "@features/recruiter/service/recruiter.service";
import { getApiErrorMessage, getString } from "@features/recruiter/actions/utils";

/**
 * candidatesAction
 *
 * Handles bulk candidate stage transitions for the CandidatesPage.
 *
 * Why the logging?
 * Bulk actions were redirecting to the RouteErrorPage, which usually means
 * a thrown error or an unhandled response. These logs provide a full trail
 * from the route action entry point through validation, service call, and
 * response so we can isolate where failures occur.
 *
 * Debug flow to look for in logs:
 * UI click -> route action -> validation -> recruiter service call -> API response.
 */
export const candidatesAction = async ({ request }: ActionFunctionArgs) => {
  console.info("[CandidatesAction] entered action");
  console.info("[CandidatesAction] request.method:", request.method);
  console.info("[CandidatesAction] request.url:", request.url);

  try {
    const formData = await request.formData();
    const intent = getString(formData, "intent");
    const action = getString(formData, "action");
    const status = getString(formData, "status");

    console.info("[CandidatesAction] intent:", intent);
    console.info("[CandidatesAction] action:", action);
    console.info("[CandidatesAction] status:", status);

    if (intent !== "bulk-stage") {
      console.warn("[CandidatesAction] unsupported intent:", intent);
      return new Response(JSON.stringify({ error: "Unsupported recruiter action." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const allowedActions = new Set([
      "shortlist",
      "remove-shortlist",
      "set-interview",
      "offer",
      "reject",
    ]);

    if (!allowedActions.has(action)) {
      console.warn("[CandidatesAction] unknown action:", action);
      return new Response(JSON.stringify({ error: "Unsupported candidate stage action." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const selectedIds = getString(formData, "selectedIds")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    console.info("[CandidatesAction] selectedIds:", selectedIds);

    if (selectedIds.length === 0) {
      console.warn("[CandidatesAction] no selectedIds provided");
      return new Response(JSON.stringify({ error: "Please select at least one candidate." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.info("[CandidatesAction] validation passed, calling recruiterService.updateApplicantStatuses");
    const result: BulkApplicantStageResponseDto =
      await recruiterService.updateApplicantStatuses(selectedIds, {
        action,
        status: status || undefined,
      });

    console.info("[CandidatesAction] service result:", result);

    const responsePayload = {
      success_count: result.success_count,
      failure_count: result.failure_count,
      results: result.results,
    };

    console.info("[CandidatesAction] response payload:", responsePayload);

    return new Response(JSON.stringify(responsePayload), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[CandidatesAction] error:", error);
    return new Response(
      JSON.stringify({
        error: getApiErrorMessage(error, "Bulk candidate stage update failed"),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};


