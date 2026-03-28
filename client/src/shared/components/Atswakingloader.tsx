import { useEffect, useState, useRef } from "react";

const STATUS_STEPS = [
  "Waking up server...",
  "Preparing ATS services...",
  "Checking candidate data...",
  "Loading analysis workspace...",
];

const RESUME_SECTIONS = [
  { label: "Personal Info" },
  { label: "Experience" },
  { label: "Education" },
  { label: "Skills" },
];

const TOTAL_DURATION_MS = 12000;
const STEP_INTERVAL_MS = 2800;

// Checkmark cycle timings (ms)
const CHECK_STEP_MS  = 900;  // gap between each check popping in
const CHECK_HOLD_MS  = 600;  // hold once all 4 are checked
const CHECK_FADE_MS  = 280;  // must match CSS checkFadeOut duration
const CHECK_PAUSE_MS = 400;  // blank pause before repeating

type CheckState = "idle" | "popping" | "held" | "fading";

interface CheckItem {
  label: string;
  state: CheckState;
}

export default function ATSWakingLoader() {
  const [statusIndex, setStatusIndex] = useState(0);
  const [fadeStatus, setFadeStatus]   = useState(true);
  const [progress, setProgress]       = useState(0);
  const [checks, setChecks]           = useState<CheckItem[]>(
    RESUME_SECTIONS.map((s) => ({ label: s.label, state: "idle" }))
  );

  const startRef  = useRef<number>(Date.now());
  const rafRef    = useRef<number | null>(null);
  const aliveRef  = useRef(true);

  // ── Status rotation ─────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeStatus(false);
      setTimeout(() => {
        setStatusIndex((i) => (i + 1) % STATUS_STEPS.length);
        setFadeStatus(true);
      }, 250);
    }, STEP_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // ── Repeating checkmark cycle ────────────────────────────────
  useEffect(() => {
    aliveRef.current = true;

    const delay = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    const setOne = (idx: number, state: CheckState) =>
      setChecks((prev) =>
        prev.map((c, i) => (i === idx ? { ...c, state } : c))
      );
    const setAll = (state: CheckState) =>
      setChecks((prev) => prev.map((c) => ({ ...c, state })));

    async function runCycle(): Promise<void> {
      if (!aliveRef.current) return;

      // Pop in each check one by one
      for (let i = 0; i < RESUME_SECTIONS.length; i++) {
        if (!aliveRef.current) return;
        if (i > 0) await delay(CHECK_STEP_MS);
        setOne(i, "popping");
        await delay(400); // let pop animation settle
        setOne(i, "held");
      }

      // Hold all checked
      await delay(CHECK_HOLD_MS);
      if (!aliveRef.current) return;

      // Fade all out simultaneously
      setAll("fading");
      await delay(CHECK_FADE_MS + 60);
      if (!aliveRef.current) return;

      // Reset to idle, pause, then loop
      setAll("idle");
      await delay(CHECK_PAUSE_MS);
      runCycle();
    }

    const initTimer = setTimeout(() => runCycle(), 1200);
    return () => {
      aliveRef.current = false;
      clearTimeout(initTimer);
    };
  }, []);

  // ── Smooth progress bar ──────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const raw   = Math.min(elapsed / TOTAL_DURATION_MS, 1);
      const eased = Math.min(0.9, 1 - Math.pow(1 - raw, 2.5));
      setProgress(Math.round(eased * 100));
      if (eased < 0.9) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isChecked = (s: CheckState) =>
    s === "popping" || s === "held" || s === "fading";

  const markClass = (s: CheckState) => {
    if (s === "popping") return "check-mark-popping";
    if (s === "held")    return "check-mark-held";
    if (s === "fading")  return "check-mark-fading";
    return "check-mark-idle";
  };

  return (
    <>
      <style>{`
        @keyframes scanLine {
          0%   { top: 3%; opacity: 0; }
          6%   { opacity: 1; }
          88%  { opacity: 1; }
          100% { top: 94%; opacity: 0; }
        }
        @keyframes shimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        @keyframes pulseRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(161,161,170,0.12); }
          50%       { box-shadow: 0 0 0 8px rgba(161,161,170,0.04); }
        }
        @keyframes checkPop {
          0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
          65%  { transform: scale(1.18) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes checkFadeOut {
          0%   { transform: scale(1) rotate(0deg); opacity: 1; }
          100% { transform: scale(0) rotate(8deg); opacity: 0; }
        }
        @keyframes dotBlink {
          0%, 80%, 100% { opacity: 0.2; }
          40%            { opacity: 1; }
        }

        .scan-line {
          position: absolute; left: 0; right: 0; height: 1.5px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(212,212,216,0.4) 25%,
            rgba(228,228,231,0.8) 50%,
            rgba(212,212,216,0.4) 75%,
            transparent 100%
          );
          animation: scanLine 3s cubic-bezier(0.45,0,0.55,1) infinite;
          pointer-events: none;
          z-index: 2;
        }
        .shimmer-bar {
          background: linear-gradient(90deg, #3f3f46 0%, #52525b 50%, #3f3f46 100%);
          background-size: 300% 100%;
          animation: shimmer 2.2s linear infinite;
        }
        .check-mark-idle    { opacity: 0; transform: scale(0) rotate(-10deg); }
        .check-mark-popping { animation: checkPop 0.38s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .check-mark-held    { opacity: 1; transform: scale(1) rotate(0deg); }
        .check-mark-fading  { animation: checkFadeOut 0.28s ease-in forwards; }

        .dot1 { animation: dotBlink 1.4s 0.0s infinite; }
        .dot2 { animation: dotBlink 1.4s 0.2s infinite; }
        .dot3 { animation: dotBlink 1.4s 0.4s infinite; }
        .pulse-card { animation: pulseRing 3s ease-in-out infinite; }
      `}</style>

      <div className="flex items-center justify-center w-full px-4 py-6">
        <div
          className="pulse-card relative w-full max-w-sm rounded-2xl border border-zinc-700/60 bg-zinc-900 px-5 pt-5 pb-5 shadow-xl shadow-black/30"
          role="status"
          aria-live="polite"
          aria-label="Server waking up"
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <div className="mb-4 flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="#d4d4d8" strokeWidth="1.2">
                <rect x="2" y="1" width="9" height="13" rx="1.5" />
                <line x1="4" y1="4.5"  x2="9"   y2="4.5"  strokeLinecap="round" />
                <line x1="4" y1="6.5"  x2="9"   y2="6.5"  strokeLinecap="round" />
                <line x1="4" y1="8.5"  x2="7.5" y2="8.5"  strokeLinecap="round" />
                <line x1="4" y1="10.5" x2="6.5" y2="10.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-zinc-100 leading-tight tracking-tight">
                Waking up server
              </h2>
              <p className="mt-0.5 text-xs text-zinc-400 leading-snug">
                Preparing ATS services for your next request.
              </p>
            </div>
            <div className="flex items-center gap-1 mt-1 shrink-0">
              <span className="dot1 block h-1.5 w-1.5 rounded-full bg-zinc-500" />
              <span className="dot2 block h-1.5 w-1.5 rounded-full bg-zinc-500" />
              <span className="dot3 block h-1.5 w-1.5 rounded-full bg-zinc-500" />
            </div>
          </div>

          {/* ── Resume doc + checklist ──────────────────────────── */}
          <div className="mb-4 flex gap-3">
            {/* Animated resume document */}
            <div
              className="relative shrink-0 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800"
              style={{ width: 84, minHeight: 114 }}
            >
              <div className="scan-line" />
              <div className="p-2.5 flex flex-col gap-1.5">
                <div className="flex flex-col gap-1 mb-0.5">
                  <div className="shimmer-bar h-2 w-4/5 rounded-full" />
                  <div className="shimmer-bar h-1.5 w-3/5 rounded-full" />
                </div>
                <div className="h-px bg-zinc-700" />
                {(["85%","65%","75%","55%"] as const).map((w, i) => (
                  <div
                    key={i}
                    className="shimmer-bar h-1.5 rounded-full"
                    style={{ width: w, animationDelay: `${i * 0.15}s` }}
                  />
                ))}
                <div className="h-px bg-zinc-700/60 mt-0.5" />
                {(["80%","60%","70%"] as const).map((w, i) => (
                  <div
                    key={i}
                    className="shimmer-bar h-1.5 rounded-full"
                    style={{ width: w, animationDelay: `${(i + 4) * 0.15}s` }}
                  />
                ))}
              </div>
            </div>

            {/* Repeating checklist */}
            <div className="flex flex-col justify-center gap-2 flex-1">
              {checks.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-300 ${
                      isChecked(item.state)
                        ? "border-zinc-500 bg-zinc-700"
                        : "border-zinc-700 bg-zinc-800"
                    }`}
                  >
                    <svg
                      className={markClass(item.state)}
                      width="9" height="9" viewBox="0 0 9 9"
                      fill="none" stroke="#d4d4d8"
                      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <path d="M1.5 4.5L3.5 6.5L7.5 2.5" />
                    </svg>
                  </div>
                  <span
                    className={`text-xs leading-none transition-colors duration-300 ${
                      isChecked(item.state) ? "text-zinc-300" : "text-zinc-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Status text ─────────────────────────────────────── */}
          <div className="mb-3 flex items-center gap-2 min-h-4.5">
            <div className="h-1 w-1 shrink-0 rounded-full bg-zinc-500 dot1" />
            <p
              className="text-xs text-zinc-400 truncate transition-all duration-200"
              style={{
                opacity:   fadeStatus ? 1 : 0,
                transform: fadeStatus ? "translateY(0)" : "translateY(-3px)",
              }}
              aria-live="polite"
            >
              {STATUS_STEPS[statusIndex]}
            </p>
          </div>

          {/* ── Progress bar ─────────────────────────────────────── */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                Initializing
              </span>
              <span className="text-[10px] text-zinc-500 tabular-nums">
                {progress}%
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800 border border-zinc-700/50">
              <div
                className="h-full rounded-full bg-zinc-400 transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* ── Helper note ──────────────────────────────────────── */}
          <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2">
            <p className="text-[11px] leading-snug text-zinc-500">
              This may take a little longer when the server is inactive.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
