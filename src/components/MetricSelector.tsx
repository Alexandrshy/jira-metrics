import { useUnit } from 'effector-react';
import { FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';
import { $selectedMetric, setSelectedMetric } from '../models/jira';
import type { MetricType } from '../types';
import { SelectChangeEvent } from '@mui/material/Select';

const metrics: { value: MetricType; label: string }[] = [
  { value: 'bugDensity', label: 'Bug Density (%)' },
  { value: 'velocity', label: 'Velocity (issues/week)' },
];

const MetricSelector = () => {
  const selectedMetric = useUnit($selectedMetric);
  const handleChange = (event: SelectChangeEvent<MetricType>) => {
    setSelectedMetric(event.target.value as MetricType);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Analysis Metric
      </Typography>
      <FormControl fullWidth>
        <InputLabel>Metric</InputLabel>
        <Select value={selectedMetric} onChange={handleChange} label="Metric">
          {metrics.map(metric => (
            <MenuItem key={metric.value} value={metric.value}>
              {metric.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default MetricSelector;
