import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { PropsWithChildren } from 'react';
import type { ApplicationRecord, Role, User } from '@shared/types';
import { readStorage, writeStorage } from '@shared/utils/storage';

const SESSION_KEY = 'nexskill.session';

interface SessionState {
  role: Role;
  user: User;
  appliedJobs: ApplicationRecord[];
  savedJobs: string[];
}

type SessionAction =
  | { type: 'setRole'; payload: Role }
  | { type: 'apply'; payload: ApplicationRecord }
  | { type: 'toggleSaved'; payload: string };

const initialState: SessionState = {
  role: 'jobseeker',
  user: { name: 'Taylor Smith', location: 'Bacarra, IN' },
  appliedJobs: [],
  savedJobs: [],
};

const SessionContext = createContext<{
  state: SessionState;
  setRole: (role: Role) => void;
  applyToJob: (jobId: string) => void;
  toggleSaved: (jobId: string) => void;
} | null>(null);

const reducer = (state: SessionState, action: SessionAction): SessionState => {
  switch (action.type) {
    case 'setRole':
      return { ...state, role: action.payload };
    case 'apply': {
      if (state.appliedJobs.some((entry) => entry.jobId === action.payload.jobId)) return state;
      return { ...state, appliedJobs: [action.payload, ...state.appliedJobs] };
    }
    case 'toggleSaved': {
      const exists = state.savedJobs.includes(action.payload);
      return {
        ...state,
        savedJobs: exists ? state.savedJobs.filter((id) => id !== action.payload) : [action.payload, ...state.savedJobs],
      };
    }
    default:
      return state;
  }
};

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(reducer, initialState, (defaultState) =>
    readStorage<SessionState>(SESSION_KEY, defaultState),
  );

  useEffect(() => {
    writeStorage(SESSION_KEY, state);
  }, [state]);

  const value = useMemo(
    () => ({
      state,
      setRole: (role: Role) => dispatch({ type: 'setRole', payload: role }),
      applyToJob: (jobId: string) =>
        dispatch({ type: 'apply', payload: { jobId, appliedAt: new Date().toISOString(), status: 'Applied' } }),
      toggleSaved: (jobId: string) => dispatch({ type: 'toggleSaved', payload: jobId }),
    }),
    [state],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used inside SessionProvider');
  }
  return context;
};
