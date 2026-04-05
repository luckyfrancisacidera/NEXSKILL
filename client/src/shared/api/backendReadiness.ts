/* =========================================
   BACKEND READINESS
   Runs the explicit health probe used by the ATS wake experience before sensitive routes render.
========================================= */

import {
  beginBackendReadinessProbe,
  completeBackendReadinessProbe,
  getBackendWakeSnapshot,
} from "@shared/api/backendWakeStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const BACKEND_READINESS_PATH = "/health/ready";

let readinessPromise: Promise<void> | null = null;

const getBackendReadinessUrl = () => {
  const normalizedBaseUrl = API_BASE_URL.replace(/\/$/, "");
  return normalizedBaseUrl
    ? `${normalizedBaseUrl}${BACKEND_READINESS_PATH}`
    : BACKEND_READINESS_PATH;
};

export const ensureBackendReadiness = () => {
  // Short-circuit once warm so the wake experience stays a first-load concern,
  // not a recurring tax on normal route transitions.
  const snapshot = getBackendWakeSnapshot();

  if (snapshot.isBackendWarm) {
    return Promise.resolve();
  }

  if (readinessPromise) {
    return readinessPromise;
  }

  const shouldStartProbe = beginBackendReadinessProbe();
  if (!shouldStartProbe) {
    return Promise.resolve();
  }

  // Probe readiness explicitly so the ATS wake UI is not tied to normal request traffic.
  readinessPromise = fetch(getBackendReadinessUrl(), {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Backend readiness probe failed with status ${response.status}`);
      }

      const payload = (await response.json()) as { status?: string };
      if (payload.status !== "Healthy") {
        throw new Error(`Backend readiness probe returned status ${payload.status ?? "unknown"}`);
      }
    })
    .then(() => {
      completeBackendReadinessProbe({ wasSuccessful: true });
    })
    .catch((error) => {
      completeBackendReadinessProbe({ wasSuccessful: false });
      throw error;
    })
    .finally(() => {
      readinessPromise = null;
    });

  return readinessPromise;
};
