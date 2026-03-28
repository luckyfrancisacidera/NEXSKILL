export interface BackendWakeSnapshot {
  isReadinessProbePending: boolean;
  isBackendWarm: boolean;
  lastBackendSuccessAt: number | null;
}

type Listener = () => void;

let isReadinessProbePending = false;
let isBackendWarm = false;
let lastBackendSuccessAt: number | null = null;
const listeners = new Set<Listener>();
let snapshot: BackendWakeSnapshot = {
  isReadinessProbePending,
  isBackendWarm,
  lastBackendSuccessAt,
};

const syncSnapshot = () => {
  snapshot = {
    isReadinessProbePending,
    isBackendWarm,
    lastBackendSuccessAt,
  };
};

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

// The ATS wake UI is driven only by an explicit backend readiness probe.
export const beginBackendReadinessProbe = () => {
  if (isBackendWarm || isReadinessProbePending) {
    return false;
  }

  isReadinessProbePending = true;
  syncSnapshot();
  notifyListeners();
  return true;
};

export const completeBackendReadinessProbe = ({
  wasSuccessful,
}: {
  wasSuccessful: boolean;
}) => {
  let didChange = false;

  if (wasSuccessful) {
    isBackendWarm = true;
    lastBackendSuccessAt = Date.now();
    didChange = true;
  }

  if (isReadinessProbePending) {
    isReadinessProbePending = false;
    didChange = true;
  }

  if (didChange) {
    syncSnapshot();
    notifyListeners();
  }
};

export const getBackendWakeSnapshot = (): BackendWakeSnapshot => snapshot;

export const subscribeToBackendWake = (listener: Listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
