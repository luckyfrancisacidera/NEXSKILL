import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AppToast, type ToastTone } from "@shared/components/Toast";

interface ToastRecord {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
  durationMs: number;
}

interface ShowToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
}

interface ToastContextType {
  showToast: (input: ShowToastInput) => void;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const idRef = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(({ title, description, tone = "info", durationMs = 3500 }: ShowToastInput) => {
    const id = ++idRef.current;
    const nextToast: ToastRecord = { id, title, description, tone, durationMs };
    setToasts([nextToast]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, durationMs);
  }, []);

  const value = useMemo(() => ({ showToast, dismissToast }), [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-90 flex w-[min(92vw,360px)] flex-col gap-2 sm:right-6 sm:top-6">
        {toasts.map((toast) => (
          <AppToast
            key={toast.id}
            id={toast.id}
            title={toast.title}
            description={toast.description}
            tone={toast.tone}
            durationMs={toast.durationMs}
            onClose={dismissToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
};




