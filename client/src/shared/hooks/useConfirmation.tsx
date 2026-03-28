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

import { ConfirmationModal } from "@shared/components/ConfirmationModal";

type ConfirmationAccent = "red" | "green" | "violet";

export interface ConfirmationOptions {
  title: string;
  message: string;
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
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  accent: "violet",
};

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

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error("useConfirmation must be used within ConfirmationProvider");
  }

  return context.confirm;
};
