const ATS_ROUTE_MATCHERS = [
  "/dashboard",
  "/jobs",
  "/applications",
  "/offers",
  "/profile",
  "/saved",
  "/jobseeker/interviews",
  "/recruiter",
  "/admin",
];

export const isAtsWakeRoute = (pathname: string) =>
  ATS_ROUTE_MATCHERS.some((route) => pathname === route || pathname.startsWith(`${route}/`));
