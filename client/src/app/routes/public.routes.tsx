/* =========================================
   PUBLIC ROUTES
========================================= */

import { lazyRouteElement, publicOnlyElement, publicRoute, type AppRoute } from "@app/routes/route.helpers";

export const publicRoutes: AppRoute[] = [
  publicRoute(
    "/",
    lazyRouteElement(() => import("@features/home/pages/LandingPage"), "default"),
  ),
  publicRoute(
    "/not-authorized",
    lazyRouteElement(() => import("@shared/pages/NotAuthorized"), "NotAuthorized"),
  ),
  publicRoute(
    "/register",
    publicOnlyElement(
      lazyRouteElement(() => import("@features/auth/pages/RegisterPage"), "default"),
    ),
  ),
  publicRoute(
    "/signup",
    publicOnlyElement(
      lazyRouteElement(() => import("@features/auth/pages/RegisterPage"), "default"),
    ),
  ),
  publicRoute(
    "/login",
    publicOnlyElement(
      lazyRouteElement(() => import("@features/auth/pages/LoginPage"), "default"),
    ),
  ),
  publicRoute(
    "/company-account-request",
    lazyRouteElement(
      () => import("@features/account-request/pages/CompanyAccountRequest"),
      "default",
    ),
  ),
  publicRoute(
    "/company-invitation",
    lazyRouteElement(
      () => import("@features/admin/pages/CompanyInvitationPage"),
      "CompanyInvitationPage",
    ),
  ),
  publicRoute(
    "/company-invitation/success",
    lazyRouteElement(
      () => import("@features/admin/pages/CompanyInvitationSuccessPage"),
      "CompanyInvitationSuccessPage",
    ),
  ),
  publicRoute(
    "/terms",
    lazyRouteElement(() => import("@features/auth/pages/TermsOfServicePage"), "default"),
  ),
  publicRoute(
    "/privacy",
    lazyRouteElement(() => import("@features/auth/pages/PrivacyPolicyPage"), "default"),
  ),
  publicRoute(
    "/forgot-password",
    lazyRouteElement(() => import("@features/auth/pages/ForgotPasswordPage"), "ForgotPasswordPage"),
  ),
  publicRoute(
    "/reset-password",
    lazyRouteElement(() => import("@features/auth/pages/ResetPasswordPage"), "ResetPasswordPage"),
  ),
];
