import type { ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

export type ToastTone = "success" | "error" | "warning" | "info";

interface AppToastProps {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
  durationMs: number;
  onClose: (id: number) => void;
}

const toastStyleByTone: Record<ToastTone, { icon: ReactNode; chip: string; ring: string; progress: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    chip: "bg-emerald-50 text-emerald-700",
    ring: "ring-emerald-200/60",
    progress: "bg-emerald-500",
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-rose-500" />,
    chip: "bg-rose-50 text-rose-700",
    ring: "ring-rose-200/70",
    progress: "bg-rose-500",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    chip: "bg-amber-50 text-amber-700",
    ring: "ring-amber-200/70",
    progress: "bg-amber-500",
  },
  info: {
    icon: <Info className="h-5 w-5 text-indigo-500" />,
    chip: "bg-indigo-50 text-indigo-700",
    ring: "ring-indigo-200/70",
    progress: "bg-indigo-500",
  },
};

export const AppToast = ({ id, title, description, tone, durationMs, onClose }: AppToastProps) => {
  const style = toastStyleByTone[tone];

  return (
    <article className={`pointer-events-auto overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ${style.ring}`} role="status" aria-live="polite">
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="mt-0.5">{style.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-zinc-900">{title}</p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.chip}`}>{tone}</span>
          </div>
          {description ? <p className="mt-0.5 text-xs text-zinc-500">{description}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => onClose(id)}
          aria-label="Dismiss notification"
          className="rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="h-1 w-full bg-zinc-100">
        <div className={`${style.progress} h-full animate-[toast-progress_linear_forwards]`} style={{ animationDuration: `${durationMs}ms` }} />
      </div>
    </article>
  );
};
