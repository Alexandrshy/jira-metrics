import { useEffect } from 'react';
import { useUnit } from 'effector-react';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Typography, Alert } from '@mui/material';
import {
  $baselinePeriod,
  setBaselinePeriod,
  $weeklyMetrics,
  $jqlQuery,
  $issues,
} from '../models/jira';
import { parseISO, startOfDay, endOfDay } from 'date-fns';

const BaselinePeriodSelector = () => {
  const baselinePeriod = useUnit($baselinePeriod);
  const metrics = useUnit($weeklyMetrics);
  const jqlQuery = useUnit($jqlQuery);
  const issues = useUnit($issues);

  // Set default baseline period when metrics are loaded
  useEffect(() => {
    const setDefaultPeriod = () => {
      if (metrics.length > 0) {
        const firstDate = parseISO(metrics[0].weekStart);
        const lastDate = new Date();
        setBaselinePeriod({ start: firstDate, end: lastDate });
      }
    };

    if (metrics.length > 0 && !baselinePeriod) {
      setDefaultPeriod();
    }
  }, [metrics, baselinePeriod]);

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setBaselinePeriod({
        start: date,
        end: baselinePeriod?.end || new Date(),
      });
    } else {
      // Reset to initial date if cleared
      setBaselinePeriod({
        start: parseISO(metrics[0].weekStart),
        end: baselinePeriod?.end || new Date(),
      });
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setBaselinePeriod({
        start: baselinePeriod?.start || parseISO(metrics[0].weekStart),
        end: date,
      });
    } else {
      // Reset to current date if cleared
      setBaselinePeriod({
        start: baselinePeriod?.start || parseISO(metrics[0].weekStart),
        end: new Date(),
      });
    }
  };

  // Check if there is data in the selected period
  const hasDataInPeriod =
    baselinePeriod &&
    metrics.some(metric => {
      const metricDate = parseISO(metric.weekStart);
      return (
        metricDate >= startOfDay(baselinePeriod.start) && metricDate <= endOfDay(baselinePeriod.end)
      );
    });

  // Show warning only if there is data but no metrics in selected period
  const showWarning = baselinePeriod && issues.length > 0 && !hasDataInPeriod;

  // Don't show date selector if no JQL query
  if (!jqlQuery.trim()) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Baseline Period for Control Limits Calculation
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <DatePicker
          label="Start Date"
          value={baselinePeriod?.start || null}
          onChange={handleStartDateChange}
        />
        <DatePicker
          label="End Date"
          value={baselinePeriod?.end || null}
          onChange={handleEndDateChange}
          minDate={baselinePeriod?.start || undefined}
        />
      </Box>
      {showWarning && <Alert severity="warning">No data available in selected period</Alert>}
    </Box>
  );
};

export default BaselinePeriodSelector;
