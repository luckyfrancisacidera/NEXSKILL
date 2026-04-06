/**
 * React hook for turning transient search params into one-time toast notifications.
 *
 * Exports:
 * - `useSearchParamToast`: Runs an optional handler for a matching search param value
 *   and then delegates cleanup back to the caller.
 *
 * Usage notes:
 * - Use this for route-level flash messages such as `?toast=created`.
 * - The caller owns navigation or search-param cleanup so the hook stays reusable
 *   across routes that need different cleanup behavior.
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

type ToastHandlerMap = Partial<Record<string, () => void>>;

interface UseSearchParamToastOptions {
  searchParams: URLSearchParams;
  handlers: ToastHandlerMap;
  onCleanup: (value: string) => void;
  paramName?: string;
}

/**
 * Executes a single-use side effect when a search param is present.
 *
 * @param options.searchParams Active route search params from `useSearchParams`.
 * @param options.handlers Callback map keyed by param value.
 * @param options.onCleanup Callback that removes the processed param from the URL.
 * @param options.paramName Search-param key to inspect. Defaults to `toast`.
 *
 * @example
 * ```tsx
 * useSearchParamToast({
 *   searchParams,
 *   handlers: { created: () => showToast(...) },
 *   onCleanup: () => setSearchParams({}, { replace: true }),
 * });
 * ```
 */
export const useSearchParamToast = ({
  searchParams,
  handlers,
  onCleanup,
  paramName = 'toast',
}: UseSearchParamToastOptions) => {
  const location = useLocation();
  const handlersRef = useRef(handlers);
  const cleanupRef = useRef(onCleanup);
  const processedKeyRef = useRef<string | null>(null);
  const value = searchParams.get(paramName);

  handlersRef.current = handlers;
  cleanupRef.current = onCleanup;

  useEffect(() => {
    if (!value) {
      processedKeyRef.current = null;
      return;
    }

    const effectKey = `${location.pathname}${location.search}|${paramName}=${value}`;

    if (processedKeyRef.current === effectKey) {
      return;
    }

    processedKeyRef.current = effectKey;
    handlersRef.current[value]?.();
    cleanupRef.current(value);
  }, [location.pathname, location.search, paramName, value]);
};
