import { useRef } from 'react';
import { useUnit } from 'effector-react';
import { Paper, Typography, Box, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import html2canvas from 'html2canvas';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format, startOfWeek } from 'date-fns';
import { $controlChartData, $baselinePeriod, $selectedMetric } from '../models/jira';

interface DotProps {
  cx: number;
  cy: number;
  index: number;
}

const ControlChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const controlChartData = useUnit($controlChartData);
  const baselinePeriod = useUnit($baselinePeriod);
  const selectedMetric = useUnit($selectedMetric);

  if (!controlChartData.length) return null;

  const formatDateToWeekStart = (date: Date) => {
    return format(startOfWeek(date), 'yyyy-MM-dd');
  };

  const renderDot = (props: DotProps) => {
    const { cx, cy, index } = props;
    const point = controlChartData[index];
    const isOutOfLimits = point.value > point.ucl || point.value < point.lcl;

    return (
      <circle
        key={`dot-${index}`}
        cx={cx}
        cy={cy}
        r={5}
        fill={isOutOfLimits ? '#f44336' : '#1976d2'}
      />
    );
  };

  const handleDownload = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current);
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `control-chart-${selectedMetric}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error('Failed to download chart:', error);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Control Chart
        </Typography>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload}>
          Download Chart
        </Button>
      </Box>
      <Box ref={chartRef} sx={{ width: '100%', height: 400, bgcolor: 'background.paper' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={controlChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="weekStart" />
            <YAxis />
            <Tooltip />
            <Legend />

            {baselinePeriod && (
              <>
                <ReferenceLine
                  x={formatDateToWeekStart(baselinePeriod.start)}
                  stroke="#ac82f6"
                  strokeWidth={2}
                  label={{ value: 'Baseline Start', angle: 90, position: 'insideTopLeft' }}
                />
                <ReferenceLine
                  x={formatDateToWeekStart(baselinePeriod.end)}
                  stroke="#ac82f6"
                  strokeWidth={2}
                  label={{ value: 'Baseline End', angle: 90, position: 'insideTopLeft' }}
                />
              </>
            )}

            <Line
              type="monotone"
              dataKey="value"
              stroke="#1976d2"
              strokeWidth={2}
              name="Bug Density"
              dot={renderDot}
            />
            <Line
              type="monotone"
              dataKey="ucl"
              stroke="#d32f2f"
              strokeDasharray="5 5"
              name="Upper Control Limit"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="lcl"
              stroke="#2e7d32"
              strokeDasharray="5 5"
              name="Lower Control Limit"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="centerLine"
              stroke="#ed6c02"
              strokeDasharray="3 3"
              name="Center Line"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ControlChart;
