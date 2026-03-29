import { useEffect, useState, type CSSProperties } from "react";

import "./ATSOffline.css";

type OfflineNodeRole = "leaf" | "hub";

interface OfflineNode {
  id: string;
  cx: number;
  cy: number;
  role: OfflineNodeRole;
}

interface OfflineEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  duration: number;
  delay: number;
}

interface ATSOfflineProps {
  title?: string;
  message?: string;
  onRetry?: (() => void | Promise<void>) | null;
  retrying?: boolean;
  details?: string | null;
  onGoBack?: (() => void) | null;
}

const OFFLINE_NODES: OfflineNode[] = [
  { id: "a", cx: 60, cy: 30, role: "leaf" },
  { id: "b", cx: 150, cy: 18, role: "leaf" },
  { id: "c", cx: 240, cy: 35, role: "leaf" },
  { id: "d", cx: 100, cy: 75, role: "hub" },
  { id: "e", cx: 200, cy: 75, role: "hub" },
  { id: "f", cx: 60, cy: 118, role: "leaf" },
  { id: "g", cx: 240, cy: 118, role: "leaf" },
];

const LEFT_EDGES: OfflineEdge[] = [
  { x1: 60, y1: 30, x2: 100, y2: 75, duration: 2.2, delay: 0 },
  { x1: 150, y1: 18, x2: 100, y2: 75, duration: 2.55, delay: 0.3 },
  { x1: 100, y1: 75, x2: 60, y2: 118, duration: 2.9, delay: 0.6 },
];

const RIGHT_EDGES: OfflineEdge[] = [
  { x1: 150, y1: 18, x2: 200, y2: 75, duration: 2.2, delay: 0.6 },
  { x1: 240, y1: 35, x2: 200, y2: 75, duration: 2.55, delay: 0.9 },
  { x1: 200, y1: 75, x2: 240, y2: 118, duration: 2.9, delay: 1.2 },
];

const formatCssVarStyle = (vars: Record<string, string | number>): CSSProperties =>
  vars as CSSProperties;

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      className={`ats-offline__icon ats-offline__icon--refresh${spinning ? " is-spinning" : ""}`}
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1.5 7.5C1.5 4.46243 3.96243 2 7 2C9.22504 2 11.1476 3.25765 12.0874 5.09413"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13.5 7.5C13.5 10.5376 11.0376 13 8 13C5.77496 13 3.85238 11.7424 2.91261 9.90587"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 4.5L12 6.5L10 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 10.5L3 8.5L5 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="ats-offline__icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M8.5 2.5L3.5 7L8.5 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NetworkIllustration() {
  return (
    <svg
      className="ats-offline__network"
      viewBox="0 0 300 150"
      width="300"
      height="150"
      aria-hidden="true"
    >
      <defs>
        <filter id="ats-offline-glow-sky" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="ats-offline-glow-rose" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="ats-offline-glow-amber" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {LEFT_EDGES.map((edge, index) => (
        <line
          key={`left-${index}`}
          className="ats-offline__edge"
          x1={edge.x1}
          y1={edge.y1}
          x2={edge.x2}
          y2={edge.y2}
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeDasharray="6 4"
          style={formatCssVarStyle({
            "--ats-offline-edge-duration": `${edge.duration}s`,
            "--ats-offline-edge-delay": `${edge.delay}s`,
          })}
          filter="url(#ats-offline-glow-sky)"
        />
      ))}

      {RIGHT_EDGES.map((edge, index) => (
        <line
          key={`right-${index}`}
          className="ats-offline__edge"
          x1={edge.x1}
          y1={edge.y1}
          x2={edge.x2}
          y2={edge.y2}
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeDasharray="6 4"
          style={formatCssVarStyle({
            "--ats-offline-edge-duration": `${edge.duration}s`,
            "--ats-offline-edge-delay": `${edge.delay}s`,
          })}
          filter="url(#ats-offline-glow-sky)"
        />
      ))}

      <line
        className="ats-offline__broken-edge"
        x1="100"
        y1="75"
        x2="130"
        y2="75"
        stroke="#f43f5e"
        strokeWidth="1.2"
        strokeDasharray="4 3"
        filter="url(#ats-offline-glow-rose)"
      />

      <line
        className="ats-offline__broken-edge"
        x1="170"
        y1="75"
        x2="200"
        y2="75"
        stroke="#f43f5e"
        strokeWidth="1.2"
        strokeDasharray="4 3"
        style={formatCssVarStyle({ "--ats-offline-broken-delay": "0.4s" })}
        filter="url(#ats-offline-glow-rose)"
      />

      <g transform="translate(150,75)">
        <circle
          className="ats-offline__signal-ring"
          cx="0"
          cy="0"
          r="0"
          fill="none"
          stroke="#f43f5e"
          strokeWidth="1"
        />
        <circle
          className="ats-offline__signal-ring"
          cx="0"
          cy="0"
          r="0"
          fill="none"
          stroke="#f43f5e"
          strokeWidth="0.8"
          style={formatCssVarStyle({ "--ats-offline-signal-delay": "0.8s" })}
        />
        <line
          x1="-5.5"
          y1="-5.5"
          x2="5.5"
          y2="5.5"
          stroke="#f43f5e"
          strokeWidth="1.8"
          strokeLinecap="round"
          filter="url(#ats-offline-glow-rose)"
        />
        <line
          x1="5.5"
          y1="-5.5"
          x2="-5.5"
          y2="5.5"
          stroke="#f43f5e"
          strokeWidth="1.8"
          strokeLinecap="round"
          filter="url(#ats-offline-glow-rose)"
        />
      </g>

      {OFFLINE_NODES.map((node, index) => {
        const isHub = node.role === "hub";
        const isRightHub = node.id === "e";

        return (
          <g key={node.id}>
            {isHub ? (
              <circle
                className="ats-offline__hub-ring"
                cx={node.cx}
                cy={node.cy}
                r="12"
                fill="none"
                stroke={isRightHub ? "#f43f5e" : "#38bdf8"}
                strokeWidth="0.8"
                style={formatCssVarStyle({
                  "--ats-offline-glow-delay": isRightHub ? "0.5s" : "0s",
                })}
              />
            ) : null}

            <circle
              className={isHub ? "ats-offline__node ats-offline__node--hub" : "ats-offline__node"}
              cx={node.cx}
              cy={node.cy}
              r={isHub ? 6 : 4}
              fill={isRightHub ? "#1c1c1e" : "#18181b"}
              stroke={isRightHub ? "#f43f5e" : isHub ? "#38bdf8" : "#60a5fa"}
              strokeWidth={isHub ? 1.5 : 1.2}
              style={formatCssVarStyle({
                "--ats-offline-node-duration": isHub
                  ? `${2.6 + (isRightHub ? 0.4 : 0)}s`
                  : `${2.2 + index * 0.2}s`,
                "--ats-offline-node-delay": `${index * 0.18}s`,
              })}
              filter={isHub ? "url(#ats-offline-glow-sky)" : undefined}
            />

            {isHub ? (
              <circle
                cx={node.cx}
                cy={node.cy}
                r="2.5"
                fill={isRightHub ? "#f43f5e" : "#38bdf8"}
                filter="url(#ats-offline-glow-sky)"
              />
            ) : null}
          </g>
        );
      })}

      <g transform="translate(200,75)">
        <circle
          cx="8"
          cy="-8"
          r="4.5"
          fill="#1c1c1e"
          stroke="#f59e0b"
          strokeWidth="1.2"
          filter="url(#ats-offline-glow-amber)"
        />
        <text x="8" y="-5" textAnchor="middle" fill="#fbbf24" fontSize="5.5" fontWeight="700">
          !
        </text>
      </g>

      <text
        x="80"
        y="142"
        textAnchor="middle"
        fill="#3f3f46"
        fontSize="8.5"
        fontFamily="IBM Plex Mono, monospace"
        letterSpacing="0.06em"
      >
        LOCAL CLUSTER
      </text>
      <text
        x="220"
        y="142"
        textAnchor="middle"
        fill="#3f3f46"
        fontSize="8.5"
        fontFamily="IBM Plex Mono, monospace"
        letterSpacing="0.06em"
      >
        ATS SERVERS
      </text>
      <text
        x="150"
        y="100"
        textAnchor="middle"
        fill="#52525b"
        fontSize="7.5"
        fontFamily="IBM Plex Mono, monospace"
        letterSpacing="0.04em"
      >
        ERR_UNREACHABLE
      </text>
    </svg>
  );
}

export function ATSOffline({
  title = "Connection Lost",
  message = "We're unable to reach the recruitment platform. This may be a temporary network issue or a server interruption. No candidate data has been affected.",
  onRetry = null,
  retrying = false,
  details = null,
  onGoBack = null,
}: ATSOfflineProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    const now = new Date();
    setTimestamp(
      `${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${now.toLocaleTimeString(
        "en-US",
        { hour: "2-digit", minute: "2-digit" },
      )}`,
    );
  }, []);

  const effectivelyRetrying = retrying || isRetrying;

  const handleRetry = async () => {
    if (effectivelyRetrying) {
      return;
    }

    setIsRetrying(true);

    if (onRetry) {
      try {
        await Promise.resolve(onRetry());
      } finally {
        window.setTimeout(() => setIsRetrying(false), 2000);
      }
      return;
    }

    window.setTimeout(() => {
      setIsRetrying(false);
      window.location.reload();
    }, 1800);
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
      return;
    }

    window.history.back();
  };

  return (
    <main className="ats-offline" role="main" aria-label="Offline state - unable to reach server">
      <div className="ats-offline__grid" aria-hidden="true" />
      <div className="ats-offline__gradient" aria-hidden="true" />

      <article className="ats-offline__card ats-offline__fade-in" role="region" aria-label="Connection error details">
        <div className="ats-offline__card-border" aria-hidden="true" />

        <div
          className="ats-offline__status ats-offline__fade-in ats-offline__fade-in--1"
          role="status"
          aria-live="assertive"
        >
          <span className="ats-offline__status-dot" />
          No Connection
        </div>

        <div className="ats-offline__illustration ats-offline__fade-in ats-offline__fade-in--2" aria-hidden="true">
          <NetworkIllustration />
        </div>

        <h1 className="ats-offline__headline ats-offline__fade-in ats-offline__fade-in--3">{title}</h1>
        <p className="ats-offline__message ats-offline__fade-in ats-offline__fade-in--3">{message}</p>

        <div className="ats-offline__divider ats-offline__fade-in ats-offline__fade-in--4" aria-hidden="true" />

        <div className="ats-offline__actions ats-offline__fade-in ats-offline__fade-in--4">
          <button
            className="ats-offline__button ats-offline__button--primary"
            onClick={handleRetry}
            disabled={effectivelyRetrying}
            aria-busy={effectivelyRetrying}
            aria-label={effectivelyRetrying ? "Retrying connection..." : "Retry connection"}
          >
            {effectivelyRetrying ? <span className="ats-offline__button-shimmer" aria-hidden="true" /> : null}
            <RefreshIcon spinning={effectivelyRetrying} />
            <span className="ats-offline__button-label">
              {effectivelyRetrying ? "Reconnecting..." : "Retry Connection"}
            </span>
          </button>

          <button
            className="ats-offline__button ats-offline__button--secondary"
            onClick={handleGoBack}
            aria-label="Go back to previous page"
          >
            <ArrowLeftIcon />
            <span className="ats-offline__button-label">Return to Dashboard</span>
          </button>
        </div>

        {details || timestamp ? (
          <div
            className="ats-offline__details ats-offline__fade-in ats-offline__fade-in--5"
            role="complementary"
            aria-label="Technical diagnostics"
          >
            {timestamp ? <div>DETECTED &nbsp;{timestamp}</div> : null}
            {details ? (
              <div
                className={`ats-offline__details-text${timestamp ? " ats-offline__details-text--with-timestamp" : ""}`}
              >
                {details}
              </div>
            ) : null}
          </div>
        ) : null}
      </article>

      <footer className="ats-offline__watermark" aria-label="Platform identifier">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="12" height="12" rx="3" stroke="#3f3f46" strokeWidth="1.2" />
          <path d="M4 7h6M7 4v6" stroke="#3f3f46" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        ATS PLATFORM &nbsp;·&nbsp; TALENT INTELLIGENCE SUITE
      </footer>
    </main>
  );
}

export default ATSOffline;
