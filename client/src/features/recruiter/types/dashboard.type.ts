export type DashboardGroupBy = 'week' | 'month' | 'year' | 'department' | 'job';

export type DashboardQuickRange = '' | 'last7' | 'last28' | 'lastMonth';

export interface DashboardMetric {
  value: number;
  previous_value: number;
  comparison_percent: number;
}

export interface DashboardTrendDataset {
  key: string;
  label: string;
  data: number[];
  border_color: string;
  background_color: string;
}

export interface DashboardDto {
  filters: {
    departments: string[];
    job_roles: string[];
    job_roles_by_department: Record<string, string[]>;
  };
  summary: {
    total_applicants: DashboardMetric;
    total_shortlisted: DashboardMetric;
    total_interview: DashboardMetric;
    total_offer: DashboardMetric;
    total_hired: DashboardMetric;
  };
  trends: {
    labels: string[];
    datasets: DashboardTrendDataset[];
  };
}
