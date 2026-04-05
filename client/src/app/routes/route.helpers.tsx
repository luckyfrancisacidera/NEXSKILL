/* =========================================
   ROUTE CONFIG
========================================= */

/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy, type ComponentType, type ReactElement } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import { AppShell } from "@app/layouts/AppShell";
import { ScrollToTop } from "@shared/components/navigation/ScrollToTop";
import { RouteNavigationFeedback } from "@shared/components/feedback/RouteNavigationFeedback";
import { RouteErrorPage } from "@shared/pages/RouteErrorPage";
import { PublicOnly, RequireAuth, RequireRole } from "@app/routes/routes.guard";
import { routeAccess, type AppRouteKey } from "@app/routes/route.config";

export type AppRoute = RouteObject;

type ProtectedRouteOptions = {
  access: AppRouteKey;
  element: ReactElement;
  action?: AppRoute["action"];
  caseSensitive?: AppRoute["caseSensitive"];
  children?: AppRoute["children"];
  errorElement?: AppRoute["errorElement"];
  handle?: AppRoute["handle"];
  hydrateFallbackElement?: AppRoute["hydrateFallbackElement"];
  id?: AppRoute["id"];
  index?: boolean;
  lazy?: AppRoute["lazy"];
  loader?: AppRoute["loader"];
  path?: string;
  shouldRevalidate?: AppRoute["shouldRevalidate"];
};

type ActionOnlyRouteOptions = Omit<ProtectedRouteOptions, "element"> & {
  redirectTo: string;
};

const withPageScroll = (element: ReactElement) => (
  <>
    <ScrollToTop />
    <RouteNavigationFeedback />
    {element}
  </>
);

export const AppShellRoute = () => (
  <>
    <ScrollToTop />
    <RequireAuth>
      <AppShell />
    </RequireAuth>
  </>
);

const ActionRouteFallback = ({ to }: { to: string }) => <Navigate to={to} replace />;

const protectElement = (access: AppRouteKey, element: ReactElement) => (
  <RequireRole allowedRoles={routeAccess[access]}>{element}</RequireRole>
);

export const protectedRoute = ({
  access,
  element,
  ...route
}: ProtectedRouteOptions): AppRoute =>
  ({
    ...route,
    element: protectElement(access, element),
  }) as AppRoute;

export const actionOnlyRoute = ({
  access,
  redirectTo,
  ...route
}: ActionOnlyRouteOptions): AppRoute =>
  protectedRoute({
    ...route,
    access,
    element: <ActionRouteFallback to={redirectTo} />,
  });

export const publicRoute = (path: string, element: ReactElement): AppRoute => ({
  path,
  errorElement: <RouteErrorPage />,
  element: withPageScroll(element),
});

export const publicOnlyElement = (element: ReactElement) => (
  <PublicOnly>{element}</PublicOnly>
);

export const lazyRouteElement = <
  TModule extends Record<string, unknown>,
  TProps extends object = Record<string, never>,
>(
  load: () => Promise<TModule>,
  exportName: keyof TModule,
  props?: TProps,
): ReactElement => {
  const LazyPage = lazy(async () => {
    const module = await load();
    return { default: module[exportName] as ComponentType<TProps> };
  });

  return (
    <Suspense fallback={null}>
      <LazyPage {...((props ?? {}) as TProps)} />
    </Suspense>
  );
};

