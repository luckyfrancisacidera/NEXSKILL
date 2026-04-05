import { useEffect, useSyncExternalStore, useState } from "react";

import { ensureBackendReadiness } from "@shared/api/backendReadiness";
import {
  getBackendWakeSnapshot,
  subscribeToBackendWake,
} from "@shared/api/backendWakeStore";

const DEFAULT_WAKE_DELAY_MS = 3500;

// Use to show a delayed wake indicator while the app waits for the backend to become responsive.
export const useBackendWakeIndicator = (
  enabled: boolean,
  delayMs = DEFAULT_WAKE_DELAY_MS,
) => {
  const snapshot = useSyncExternalStore(
    subscribeToBackendWake,
    getBackendWakeSnapshot,
    getBackendWakeSnapshot,
  );
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled || snapshot.isBackendWarm) {
      return;
    }

    void ensureBackendReadiness().catch(() => {
      // Normal page-level error handling should stay responsible for request failures.
    });
  }, [enabled, snapshot.isBackendWarm]);

  useEffect(() => {
    if (!enabled || !snapshot.isReadinessProbePending) {
      setIsVisible(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [delayMs, enabled, snapshot.isReadinessProbePending]);

  return {
    isVisible: enabled && isVisible,
    isWakeCandidateActive: enabled && snapshot.isReadinessProbePending,
    isBackendWarm: snapshot.isBackendWarm,
    lastBackendSuccessAt: snapshot.lastBackendSuccessAt,
  };
};
