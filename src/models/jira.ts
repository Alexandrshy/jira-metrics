import { createStore, createEffect, createEvent, sample, combine } from 'effector';
import axios from 'axios';
import { startOfWeek, parseISO, format, startOfDay, endOfDay } from 'date-fns';
import { JiraIssue, WeeklyMetrics, ControlChartData, DateRange, MetricType } from '../types';

// Events
export const setJqlQuery = createEvent<string>();
export const setBaselinePeriod = createEvent<DateRange>();
export const fetchIssues = createEvent();
export const setSelectedMetric = createEvent<MetricType>();
export const setError = createEvent<string | null>();
export const clearError = createEvent();

// Constants for localStorage keys
const STORAGE_KEYS = {
  JQL: 'jira_metrics_jql',
  ISSUES: 'jira_metrics_issues',
  BASELINE: 'jira_metrics_baseline',
  METRIC: 'jira_metrics_selected_metric',
} as const;

const getStoredValue = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const setStoredValue = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Effects
export const fetchIssuesEffect = createEffect(async (jql: string) => {
  const pageSize = 100;
  let startAt = 0;
  let totalIssues: JiraIssue[] = [];
  let hasMore = true;

  while (hasMore) {
    const encodedJql = encodeURIComponent(jql);
    const response = await axios.get(
      `/rest/api/3/search?jql=${encodedJql}&fields=summary,description,status,resolutiondate,issuetype&startAt=${startAt}&maxResults=${pageSize}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const { issues, total } = response.data;
    totalIssues = totalIssues.concat(issues);

    startAt += pageSize;
    hasMore = startAt < total;

    // Adding a small delay to avoid API overload
    if (hasMore) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return totalIssues as JiraIssue[];
});

// Stores with initial values from localStorage
export const $jqlQuery = createStore<string>(getStoredValue(STORAGE_KEYS.JQL, '')).on(
  setJqlQuery,
  (_, query) => {
    setStoredValue(STORAGE_KEYS.JQL, query);
    return query;
  }
);

export const $baselinePeriod = createStore<DateRange | null>(
  getStoredValue(STORAGE_KEYS.BASELINE, null)
).on(setBaselinePeriod, (_, period) => {
  setStoredValue(STORAGE_KEYS.BASELINE, period);
  return period;
});

export const $issues = createStore<JiraIssue[]>(getStoredValue(STORAGE_KEYS.ISSUES, [])).on(
  fetchIssuesEffect.doneData,
  (_, issues) => {
    setStoredValue(STORAGE_KEYS.ISSUES, issues);
    return issues;
  }
);

export const $selectedMetric = createStore<MetricType>(
  getStoredValue(STORAGE_KEYS.METRIC, 'bugDensity')
).on(setSelectedMetric, (_, metric) => {
  setStoredValue(STORAGE_KEYS.METRIC, metric);
  return metric;
});

export const $error = createStore<string | null>(null)
  .on(setError, (_, error) => error)
  .on(clearError, () => null)
  .reset(fetchIssuesEffect.done);

// Processing errors when loading from localStorage
try {
  const storedBaseline = localStorage.getItem(STORAGE_KEYS.BASELINE);
  if (storedBaseline) {
    const baseline = JSON.parse(storedBaseline);
    baseline.start = new Date(baseline.start);
    baseline.end = new Date(baseline.end);
    setBaselinePeriod(baseline);
  }
} catch (error) {
  console.warn('Failed to load baseline period from localStorage:', error);
  localStorage.removeItem(STORAGE_KEYS.BASELINE);
}

// Connecting event to effect
sample({
  clock: fetchIssues,
  source: $jqlQuery,
  target: fetchIssuesEffect,
});

// Calculating metrics by weeks
export const $weeklyMetrics = $issues.map((issues): WeeklyMetrics[] => {
  const weeklyData = new Map<string, WeeklyMetrics>();

  const closedIssues = issues.filter(issue => issue.fields.resolutiondate !== null);

  closedIssues.forEach(issue => {
    const resolutionDate = parseISO(issue.fields.resolutiondate!);
    const weekStart = format(startOfWeek(resolutionDate), 'yyyy-MM-dd');

    if (!weeklyData.has(weekStart)) {
      weeklyData.set(weekStart, {
        weekStart,
        totalIssues: 0,
        bugs: 0,
        bugDensity: 0,
        velocity: 0,
      });
    }

    const data = weeklyData.get(weekStart)!;
    data.totalIssues++;

    if (issue.fields.issuetype.name.toLowerCase().includes('bug')) {
      data.bugs++;
    }
  });

  return Array.from(weeklyData.values())
    .map(week => ({
      ...week,
      bugDensity: week.totalIssues > 0 ? (week.bugs / week.totalIssues) * 100 : 0,
      velocity: week.totalIssues, // number of tasks per week
    }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
});

// Calculating data for the Shewhart control chart
export const $controlChartData = combine(
  $weeklyMetrics,
  $baselinePeriod,
  $selectedMetric,
  (metrics, baselinePeriod, selectedMetric): ControlChartData[] => {
    if (metrics.length === 0) return [];

    const baselineMetrics = baselinePeriod
      ? metrics.filter(m => {
          const weekDate = parseISO(m.weekStart);
          return (
            weekDate >= startOfDay(baselinePeriod.start) && weekDate <= endOfDay(baselinePeriod.end)
          );
        })
      : metrics;

    if (baselineMetrics.length === 0) {
      return metrics.map(metric => ({
        ...metric,
        value: selectedMetric === 'bugDensity' ? metric.bugDensity : metric.velocity,
        ucl: 0,
        lcl: 0,
        centerLine: 0,
        isBaseline: false,
      }));
    }

    // Calculating mean and standard deviation for the selected metric
    const values = baselineMetrics.map(m =>
      selectedMetric === 'bugDensity' ? m.bugDensity : m.velocity
    );

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const standardDeviation = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );

    const ucl = mean + 3 * standardDeviation;
    const lcl = Math.max(0, mean - 3 * standardDeviation);

    return metrics.map(metric => {
      const weekDate = parseISO(metric.weekStart);
      const isBaseline = baselinePeriod
        ? weekDate >= startOfDay(baselinePeriod.start) && weekDate <= endOfDay(baselinePeriod.end)
        : true;

      const value = selectedMetric === 'bugDensity' ? metric.bugDensity : metric.velocity;

      return {
        ...metric,
        ucl,
        lcl,
        centerLine: mean,
        value,
        isBaseline,
      };
    });
  }
);

fetchIssuesEffect.failData.watch(error => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 400) {
      setError('Invalid JQL query. Please check the syntax.');
    } else if (error.response?.status === 401) {
      setError('Authentication error. Please check access settings.');
    } else {
      setError(`Error fetching data: ${error.message}`);
    }
  } else {
    setError('An unknown error occurred');
  }
});
