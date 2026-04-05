/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PropsWithChildren } from "react";

import { ConfirmationModal } from "@shared/components/overlay/ConfirmationModal";

type ConfirmationAccent = "red" | "green" | "violet";

export interface ConfirmationOptions {
  title: string;
  message: string;
  supportingNote?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  accent?: ConfirmationAccent;
}

interface ConfirmationState extends ConfirmationOptions {
  open: boolean;
}

interface ConfirmationContextValue {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextValue | null>(null);

const initialState: ConfirmationState = {
  open: false,
  title: "",
  message: "",
  supportingNote: undefined,
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  accent: "violet",
};

// Manages confirmation modal state globally so features can await a simple boolean result.
export const ConfirmationProvider = ({ children }: PropsWithChildren) => {
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationState>(initialState);

  const closeConfirmation = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setConfirmation(initialState);
  }, []);

  const confirm = useCallback((options: ConfirmationOptions) => {
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }

    setConfirmation({
      open: true,
      title: options.title,
      message: options.message,
      supportingNote: options.supportingNote,
      confirmLabel: options.confirmLabel ?? "Confirm",
      cancelLabel: options.cancelLabel ?? "Cancel",
      accent: options.accent ?? "violet",
    });

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const value = useMemo<ConfirmationContextValue>(() => ({ confirm }), [confirm]);

  return (
    <ConfirmationContext.Provider value={value}>
      {children}
      <ConfirmationModal
        open={confirmation.open}
        title={confirmation.title}
        message={confirmation.message}
        supportingNote={confirmation.supportingNote}
        confirmLabel={confirmation.confirmLabel}
        cancelLabel={confirmation.cancelLabel}
        accent={confirmation.accent}
        onClose={() => closeConfirmation(false)}
        onCancel={() => closeConfirmation(false)}
        onConfirm={() => closeConfirmation(true)}
      />
    </ConfirmationContext.Provider>
  );
};

// Use to trigger the shared confirmation modal from feature code.
export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error("useConfirmation must be used within ConfirmationProvider");
  }

  return context.confirm;
};

