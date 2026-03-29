/**
 * NotAuthorized.tsx
 *
 * Premium 403 / role-unauthorized state for a resume-screening ATS platform.
 * Uses Framer Motion for entrance + scanning animations, supports light/dark mode.
 * Preserves: useAuth(), getDefaultRouteByRole(roles), Link routing.
 */

import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@app/providers/AuthProvider";
import { getDefaultRouteByRole } from "@app/routes/routes.guard";
import { ArrowRight } from "lucide-react";
const EASE_STANDARD = [0.16, 1, 0.3, 1] as const;
const EASE_BOUNCE = [0.34, 1.56, 0.64, 1] as const;

// ─── Design tokens ────────────────────────────────────────────────────────────

const BEAM      = "#ef4444";
const GLOW      = "rgba(239,68,68,0.18)";
const SYSTEM_LN = "ATS_CORE · AUTH_SCAN · ROLE_UNAUTHORIZED";

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease: EASE_STANDARD },
});

// ─── DocumentPreviewLines ────────────────────────────────────────────────────

const DocumentPreviewLines = () => (
  <div className="space-y-3">
    {/* Header row */}
    <div className="flex items-center gap-2.5">
      <div className="h-8 w-8 shrink-0 rounded-full border border-zinc-600/50 bg-zinc-700" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2 w-22 rounded-full bg-zinc-600" />
        <div className="h-1.5 w-14 rounded-full bg-zinc-700" />
      </div>
      <div className="flex h-5 w-8 items-center justify-center rounded border border-zinc-600/30 bg-zinc-700/60 font-mono text-[7px] text-zinc-500">
        PDF
      </div>
    </div>

    <div className="h-px bg-zinc-700/60" />

    {/* Experience section */}
    <div className="space-y-1.5">
      <div className="h-1.5 w-16 rounded-full bg-zinc-600/70" />
      <div className="h-1.5 w-full rounded-full bg-zinc-700/70" />
      <div className="h-1.5 w-4/5 rounded-full bg-zinc-700/60" />
      <div className="h-1.5 w-3/4 rounded-full bg-zinc-700/50" />
    </div>

    <div className="h-px bg-zinc-700/40" />

    {/* Skills chips */}
    <div className="space-y-1.5">
      <div className="h-1.5 w-12 rounded-full bg-zinc-600/70" />
      <div className="flex flex-wrap gap-1">
        {[32, 22, 28, 18, 26].map((w, i) => (
          <div
            key={i}
            className="h-3.5 rounded border border-zinc-600/30 bg-zinc-700/60"
            style={{ width: w }}
          />
        ))}
      </div>
    </div>

    <div className="h-px bg-zinc-700/40" />

    {/* Education section */}
    <div className="space-y-1.5">
      <div className="h-1.5 w-14 rounded-full bg-zinc-600/70" />
      <div className="h-1.5 w-full rounded-full bg-zinc-700/70" />
      <div className="h-1.5 w-2/3 rounded-full bg-zinc-700/50" />
    </div>
  </div>
);

// ─── ResumeScanIllustration ───────────────────────────────────────────────────

interface ScanIllustrationProps {
  beamColor: string;
  glowColor: string;
  statusCode: string;
}

const ResumeScanIllustration = ({ beamColor, glowColor, statusCode }: ScanIllustrationProps) => {
  const reduce = useReducedMotion();

  return (
    <div className="relative flex items-center justify-center" style={{ minHeight: 340 }}>

      {/* Ambient glow blob */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 300,
          height: 300,
          background: `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 68%)`,
          borderRadius: "50%",
          filter: "blur(24px)",
        }}
      />

      {/* Scanning status chip – floats top-left of card */}
      <motion.div
        {...fadeUp(0.9)}
        className="absolute left-1 top-0 z-20 flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900/95 px-2 py-1 font-mono text-[10px] shadow-xl"
        style={{ color: beamColor }}
      >
        <motion.span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: beamColor }}
          animate={reduce ? {} : { opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
        SCANNING PROFILE
      </motion.div>

      {/* Main document card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE_STANDARD }}
        className="relative z-10 w-56 overflow-hidden rounded-2xl border border-zinc-700/70 bg-zinc-900"
        style={{
          boxShadow: `0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04), 0 0 20px ${beamColor}10`,
        }}
      >
        {/* Faint dot grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(161,161,170,0.9) 1px, transparent 1px)`,
            backgroundSize: "14px 14px",
          }}
        />

        {/* Wide gradient scan beam */}
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute left-0 right-0 z-10"
            style={{
              height: 44,
              background: `linear-gradient(to bottom, transparent 0%, ${beamColor}12 35%, ${beamColor}28 50%, ${beamColor}12 65%, transparent 100%)`,
            }}
            initial={{ y: -20 }}
            animate={{ y: [-20, 310] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              repeatDelay: 1.6,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Bright scan line */}
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute left-0 right-0 z-10 h-px"
            style={{
              background: beamColor,
              boxShadow: `0 0 6px 1px ${beamColor}90`,
              opacity: 0.65,
            }}
            initial={{ y: -2 }}
            animate={{ y: [-2, 310] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              repeatDelay: 1.6,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Document content */}
        <div className="relative z-1 p-5">
          <DocumentPreviewLines />
        </div>

        {/* Status badge bottom-right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.4, ease: EASE_BOUNCE }}
          className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-lg px-2 py-1 font-mono text-[10px]"
          style={{
            background: `${beamColor}14`,
            border: `1px solid ${beamColor}45`,
            color: beamColor,
            boxShadow: `0 0 14px ${beamColor}20`,
          }}
        >
          <motion.span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: beamColor }}
            animate={reduce ? {} : { opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.7, repeat: Infinity }}
          />
          {statusCode}
        </motion.div>

        {/* Subtle color tint overlay (appears after scan) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1.2 }}
          className="pointer-events-none absolute inset-0 z-2 rounded-2xl"
          style={{
            background: `linear-gradient(145deg, ${beamColor}08 0%, transparent 55%)`,
            boxShadow: `inset 0 0 0 1px ${beamColor}18`,
          }}
        />
      </motion.div>

      {/* Version chip – floats bottom-right */}
      <motion.div
        {...fadeUp(2.0)}
        className="absolute -bottom-2 right-1 flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/90 px-2 py-0.5 font-mono text-[9px] text-zinc-600"
      >
        ATS CORE · v4.2.1
      </motion.div>
    </div>
  );
};

// ─── NotAuthorized ────────────────────────────────────────────────────────────

export const NotAuthorized = () => {
  const { roles } = useAuth();
  const backRoute = getDefaultRouteByRole(roles);
  const reduce = useReducedMotion();

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-zinc-50 px-6 py-20 font-inter dark:bg-zinc-950">

      {/* ── Background: dot grid ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.045]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(113,113,122,0.9) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Background: radial vignette ── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_50%,transparent_30%,rgba(250,250,250,0.9)_100%)] dark:bg-[radial-gradient(ellipse_75%_55%_at_50%_50%,transparent_30%,rgba(9,9,11,0.85)_100%)]" />

      {/* ── Layout ── */}
      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-20">

        {/* Left: illustration */}
        <motion.div
          initial={{ opacity: 0, x: reduce ? 0 : -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: EASE_STANDARD }}
          className="flex w-full justify-center lg:w-5/12 lg:justify-end"
        >
          <ResumeScanIllustration
            beamColor={BEAM}
            glowColor={GLOW}
            statusCode="403"
          />
        </motion.div>

        {/* Right: content */}
        <motion.div
          initial={{ opacity: 0, x: reduce ? 0 : 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: EASE_STANDARD, delay: 0.06 }}
          className="flex w-full flex-col items-center text-center lg:w-7/12 lg:items-start lg:text-left"
        >
          {/* System status line */}
          <motion.div
            {...fadeUp(0.28)}
            className="mb-4 flex items-center gap-2 font-mono text-[11px] text-zinc-400 dark:text-zinc-500"
          >
            <motion.span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: BEAM }}
              animate={reduce ? {} : { opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.35, repeat: Infinity }}
            />
            {SYSTEM_LN}
          </motion.div>

          {/* Status code */}
          <motion.div
            {...fadeUp(0.4)}
            className="mb-3 font-mono text-7xl font-bold leading-none tracking-tight lg:text-[88px]"
            style={{ color: BEAM, opacity: 0.82 }}
            aria-hidden="true"
          >
            403
          </motion.div>

          {/* Heading */}
          <motion.h1
            {...fadeUp(0.5)}
            className="mb-3 text-2xl font-semibold leading-tight text-zinc-900 dark:text-zinc-100 lg:text-3xl"
          >
            Not authorized
          </motion.h1>

          {/* Primary description */}
          <motion.p
            {...fadeUp(0.6)}
            className="mb-1.5 text-zinc-600 dark:text-zinc-400"
          >
            Your current role cannot access this page.
          </motion.p>

          {/* Secondary helper */}
          <motion.p
            {...fadeUp(0.66)}
            className="mb-8 text-sm text-zinc-400 dark:text-zinc-500"
          >
            If you believe this is a mistake, contact your administrator to review role permissions.
          </motion.p>

          {/* Accent divider */}
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.72, duration: 0.55, ease: EASE_STANDARD }}
            className="mb-8 h-px w-14 bg-zinc-200 dark:bg-zinc-800"
          />

          {/* CTA */}
          <motion.div
            {...fadeUp(0.8)}
            className="flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <Link
              to={backRoute}
              className="group inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-50 shadow-sm ring-1 ring-zinc-900/10 transition-all duration-200 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-zinc-100/10 dark:hover:bg-white"
            >
              Back to dashboard
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
