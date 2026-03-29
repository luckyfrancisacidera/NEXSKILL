import { useEffect, useRef, useState, type CSSProperties } from "react";

import "./ATSWakingLoader.css";

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

const RESUME_LINE_GROUPS = [
  ["85%", "65%", "75%", "55%"],
  ["80%", "60%", "70%"],
];

const TOTAL_DURATION_MS = 12000;
const STEP_INTERVAL_MS = 2800;
const CHECK_STEP_MS = 900;
const CHECK_HOLD_MS = 600;
const CHECK_FADE_MS = 280;
const CHECK_PAUSE_MS = 400;

type CheckState = "idle" | "popping" | "held" | "fading";

interface CheckItem {
  label: string;
  state: CheckState;
}

const styleVars = (vars: Record<string, string | number>): CSSProperties => vars as CSSProperties;

export function ATSWakingLoader() {
  const [statusIndex, setStatusIndex] = useState(0);
  const [fadeStatus, setFadeStatus] = useState(true);
  const [progress, setProgress] = useState(0);
  const [checks, setChecks] = useState<CheckItem[]>(
    RESUME_SECTIONS.map((section) => ({ label: section.label, state: "idle" })),
  );

  const startRef = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);
  const aliveRef = useRef(true);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFadeStatus(false);
      window.setTimeout(() => {
        setStatusIndex((index) => (index + 1) % STATUS_STEPS.length);
        setFadeStatus(true);
      }, 250);
    }, STEP_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    aliveRef.current = true;

    const delay = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

    const setOne = (index: number, state: CheckState) => {
      setChecks((previous) => previous.map((check, itemIndex) => (itemIndex === index ? { ...check, state } : check)));
    };

    const setAll = (state: CheckState) => {
      setChecks((previous) => previous.map((check) => ({ ...check, state })));
    };

    async function runCycle(): Promise<void> {
      if (!aliveRef.current) {
        return;
      }

      for (let index = 0; index < RESUME_SECTIONS.length; index += 1) {
        if (!aliveRef.current) {
          return;
        }

        if (index > 0) {
          await delay(CHECK_STEP_MS);
        }

        setOne(index, "popping");
        await delay(400);
        setOne(index, "held");
      }

      await delay(CHECK_HOLD_MS);

      if (!aliveRef.current) {
        return;
      }

      setAll("fading");
      await delay(CHECK_FADE_MS + 60);

      if (!aliveRef.current) {
        return;
      }

      setAll("idle");
      await delay(CHECK_PAUSE_MS);
      void runCycle();
    }

    const initTimer = window.setTimeout(() => {
      void runCycle();
    }, 1200);

    return () => {
      aliveRef.current = false;
      window.clearTimeout(initTimer);
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const rawProgress = Math.min(elapsed / TOTAL_DURATION_MS, 1);
      const easedProgress = Math.min(0.9, 1 - Math.pow(1 - rawProgress, 2.5));

      setProgress(Math.round(easedProgress * 100));

      if (easedProgress < 0.9) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const isChecked = (state: CheckState) => state === "popping" || state === "held" || state === "fading";

  const markClassName = (state: CheckState) => {
    switch (state) {
      case "popping":
        return "ats-waking-loader__check-mark is-popping";
      case "held":
        return "ats-waking-loader__check-mark is-held";
      case "fading":
        return "ats-waking-loader__check-mark is-fading";
      default:
        return "ats-waking-loader__check-mark is-idle";
    }
  };

  return (
    <div className="ats-waking-loader-shell">
      <div
        className="ats-waking-loader"
        role="status"
        aria-live="polite"
        aria-label="Server waking up"
      >
        <div className="ats-waking-loader__header">
          <div className="ats-waking-loader__header-icon">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="#d4d4d8" strokeWidth="1.2" aria-hidden="true">
              <rect x="2" y="1" width="9" height="13" rx="1.5" />
              <line x1="4" y1="4.5" x2="9" y2="4.5" strokeLinecap="round" />
              <line x1="4" y1="6.5" x2="9" y2="6.5" strokeLinecap="round" />
              <line x1="4" y1="8.5" x2="7.5" y2="8.5" strokeLinecap="round" />
              <line x1="4" y1="10.5" x2="6.5" y2="10.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="ats-waking-loader__header-copy">
            <h2 className="ats-waking-loader__title">Waking up server</h2>
            <p className="ats-waking-loader__subtitle">Preparing ATS services for your next request.</p>
          </div>

          <div className="ats-waking-loader__dots" aria-hidden="true">
            <span className="ats-waking-loader__dot ats-waking-loader__dot--1" />
            <span className="ats-waking-loader__dot ats-waking-loader__dot--2" />
            <span className="ats-waking-loader__dot ats-waking-loader__dot--3" />
          </div>
        </div>

        <div className="ats-waking-loader__body">
          <div className="ats-waking-loader__resume">
            <div className="ats-waking-loader__scan-line" aria-hidden="true" />

            <div className="ats-waking-loader__resume-content">
              <div className="ats-waking-loader__resume-section ats-waking-loader__resume-section--intro">
                <div className="ats-waking-loader__shimmer ats-waking-loader__resume-line ats-waking-loader__resume-line--name" />
                <div className="ats-waking-loader__shimmer ats-waking-loader__resume-line ats-waking-loader__resume-line--role" />
              </div>

              <div className="ats-waking-loader__resume-divider" />

              {RESUME_LINE_GROUPS[0].map((width, index) => (
                <div
                  key={`resume-primary-${index}`}
                  className="ats-waking-loader__shimmer ats-waking-loader__resume-line"
                  style={styleVars({
                    "--ats-waking-loader-line-width": width,
                    "--ats-waking-loader-line-delay": `${index * 0.15}s`,
                  })}
                />
              ))}

              <div className="ats-waking-loader__resume-divider ats-waking-loader__resume-divider--soft" />

              {RESUME_LINE_GROUPS[1].map((width, index) => (
                <div
                  key={`resume-secondary-${index}`}
                  className="ats-waking-loader__shimmer ats-waking-loader__resume-line"
                  style={styleVars({
                    "--ats-waking-loader-line-width": width,
                    "--ats-waking-loader-line-delay": `${(index + 4) * 0.15}s`,
                  })}
                />
              ))}
            </div>
          </div>

          <div className="ats-waking-loader__checklist">
            {checks.map((item) => {
              const checked = isChecked(item.state);

              return (
                <div key={item.label} className="ats-waking-loader__check-row">
                  <div className={`ats-waking-loader__checkbox${checked ? " is-checked" : ""}`}>
                    <svg
                      className={markClassName(item.state)}
                      width="9"
                      height="9"
                      viewBox="0 0 9 9"
                      fill="none"
                      stroke="#d4d4d8"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M1.5 4.5L3.5 6.5L7.5 2.5" />
                    </svg>
                  </div>

                  <span className={`ats-waking-loader__check-label${checked ? " is-checked" : ""}`}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="ats-waking-loader__status-row">
          <div className="ats-waking-loader__status-indicator" aria-hidden="true" />
          <p className={`ats-waking-loader__status-text${fadeStatus ? " is-visible" : ""}`} aria-live="polite">
            {STATUS_STEPS[statusIndex]}
          </p>
        </div>

        <div className="ats-waking-loader__progress">
          <div className="ats-waking-loader__progress-header">
            <span className="ats-waking-loader__progress-label">Initializing</span>
            <span className="ats-waking-loader__progress-value">{progress}%</span>
          </div>

          <div className="ats-waking-loader__progress-track">
            <div
              className="ats-waking-loader__progress-fill"
              style={styleVars({ "--ats-waking-loader-progress": `${progress}%` })}
            />
          </div>
        </div>

        <div className="ats-waking-loader__note">
          <p className="ats-waking-loader__note-text">
            This may take a little longer when the server is inactive.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ATSWakingLoader;
