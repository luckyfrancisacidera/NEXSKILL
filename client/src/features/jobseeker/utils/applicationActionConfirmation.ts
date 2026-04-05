import type { JobseekerApplicationDto } from "@features/jobseeker/types";

export type ApplicationActionType = "withdraw" | "archive" | "delete";

type ApplicationActionConfirmationConfig = {
  title: string;
  message: string;
  supportingNote?: string;
  confirmLabel: string;
  accent: "red" | "violet";
};

export const hasExistingActiveOffer = (application: JobseekerApplicationDto) => {
  const currentStage = application.current_stage ?? application.status;

  if (application.offer?.status === "Pending") {
    return true;
  }

  return currentStage === "Offer";
};

export const getApplicationActionConfirmation = (
  type: ApplicationActionType,
  hasOffer: boolean,
): ApplicationActionConfirmationConfig => {
  if (type === "withdraw") {
    return hasOffer
      ? {
          title: "Withdraw application with existing offer?",
          message:
            "An active offer already exists for this application. If you withdraw now, you may no longer continue with this offer or hiring process.",
          supportingNote:
            "This action cannot be undone. Please make sure you really want to give up this offer before proceeding.",
          confirmLabel: "Withdraw Anyway",
          accent: "red",
        }
      : {
          title: "Withdraw application?",
          message:
            "Once withdrawn, you can no longer continue with this application process. This action cannot be undone.",
          confirmLabel: "Withdraw Application",
          accent: "red",
        };
  }

  if (type === "archive") {
    return hasOffer
      ? {
          title: "Archive application with existing offer?",
          message:
            "An active offer already exists for this application. Archiving it may hide an application that still has an active offer.",
          supportingNote:
            "Please make sure you want to move this record out of your active list.",
          confirmLabel: "Archive Anyway",
          accent: "violet",
        }
      : {
          title: "Archive application history?",
          message:
            "This application will be moved to your archived history. It will no longer appear in your active application list, but you can still keep it for reference.",
          confirmLabel: "Archive",
          accent: "violet",
        };
  }

  return hasOffer
    ? {
        title: "Delete application history with existing offer?",
        message:
          "An active offer already exists for this application. If you delete this record, you may lose access to important offer context and this history will not come back.",
        supportingNote: "This action is permanent.",
        confirmLabel: "Delete Anyway",
        accent: "red",
      }
    : {
        title: "Delete application history?",
        message:
          "Once deleted, this application history cannot be recovered. This action permanently removes it from your records.",
        confirmLabel: "Delete Permanently",
        accent: "red",
      };
};
