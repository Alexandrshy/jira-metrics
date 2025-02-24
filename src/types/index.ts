export interface JiraIssue {
  key: string;
  fields: {
    created: string;
    resolutiondate: string | null;
    issuetype: {
      name: string;
    };
    status: {
      name: string;
      statusCategory: {
        name: string;
      };
    };
  };
}

export type MetricType = 'bugDensity' | 'velocity';

export interface WeeklyMetrics {
  weekStart: string;
  totalIssues: number;
  bugs: number;
  bugDensity: number;
  velocity: number;
}

export interface ControlChartData extends WeeklyMetrics {
  ucl: number;
  lcl: number;
  centerLine: number;
  value: number;
  isBaseline?: boolean;
}

export interface DateRange {
  start: Date;
  end: Date;
}
