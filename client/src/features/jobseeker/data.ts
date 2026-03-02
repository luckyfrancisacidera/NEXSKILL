import type { DashboardAnalyticsPoint, Job } from '@shared/types';

export const jobs: Job[] = [
  { id: '1', title: 'Senior Frontend Engineer', company: 'Northstar Labs', salaryMin: 120000, salaryMax: 160000, location: 'New York, NY', type: 'Full-time', snippet: 'Build accessible React products with strong UI quality standards.', currency: "PHP"},
  { id: '2', title: 'Product Designer', company: 'Granite Studio', salaryMin: 90000, salaryMax: 125000, location: 'Austin, TX', type: 'Remote', snippet: 'Design polished SaaS experiences from wireframe to production handoff.',currency: "PHP"},
  { id: '3', title: 'Data Analyst', company: 'Signal Metrics', salaryMin: 78000, salaryMax: 105000, location: 'Chicago, IL', type: 'Full-time', snippet: 'Translate business data into decision-ready dashboards and insights.',currency: "PHP" },
  { id: '4', title: 'Platform Engineer', company: 'Cloud Forge', salaryMin: 130000, salaryMax: 175000, location: 'Seattle, WA', type: 'Contract', snippet: 'Improve deployment velocity and observability across distributed systems.',currency: "PHP" },
  { id: '5', title: 'Technical Writer', company: 'Draftly', salaryMin: 65000, salaryMax: 90000, location: 'Remote', type: 'Part-time', snippet: 'Craft developer documentation and onboarding guides for API customers.',currency: "PHP"},
  { id: '6', title: 'Growth Marketing Manager', company: 'Peak Funnel', salaryMin: 85000, salaryMax: 115000, location: 'Boston, MA', type: 'Full-time', snippet: 'Own campaign analytics and cross-channel growth experiments.',currency: "PHP" },
  { id: '7', title: 'QA Automation Engineer', company: 'Test Harbor', salaryMin: 100000, salaryMax: 135000, location: 'Denver, CO', type: 'Remote', snippet: 'Develop reliable E2E automation suites and quality gates in CI.',currency: "PHP" },
  { id: '8', title: 'Customer Success Specialist', company: 'RelayWorks', salaryMin: 70000, salaryMax: 92000, location: 'San Diego, CA', type: 'Full-time', snippet: 'Support enterprise customers with strategic onboarding and retention plans.',currency: "PHP" },
];

export const weeklyAnalytics: DashboardAnalyticsPoint[] = [
  { day: 'Mon', applications: 2 },
  { day: 'Tue', applications: 4 },
  { day: 'Wed', applications: 3 },
  { day: 'Thu', applications: 5 },
  { day: 'Fri', applications: 7 },
  { day: 'Sat', applications: 4 },
  { day: 'Sun', applications: 2 },
];

export const profileChecklist = [
  'Upload resume',
  'Add portfolio links',
  'Complete work history',
  'Verify contact details',
];
