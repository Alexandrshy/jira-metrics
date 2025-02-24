import { Suspense, lazy } from 'react';
import { Container, Typography, CircularProgress, Box, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ErrorBoundary } from 'react-error-boundary';

const JqlQueryForm = lazy(() => import('./components/JqlQueryForm'));
const BaselinePeriodSelector = lazy(() => import('./components/BaselinePeriodSelector'));
const ControlChart = lazy(() => import('./components/ControlChart'));
const MetricSelector = lazy(() => import('./components/MetricSelector'));

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" p={4}>
    <CircularProgress />
  </Box>
);

const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => (
  <Box p={4}>
    <Typography color="error" gutterBottom>
      Something went wrong:
    </Typography>
    <pre>{error.message}</pre>
    <Button onClick={resetErrorBoundary}>Try again</Button>
  </Box>
);

const App = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Jira Metrics Analysis
        </Typography>
        <Suspense fallback={<LoadingFallback />}>
          <JqlQueryForm />
          <BaselinePeriodSelector />
          <MetricSelector />
        </Suspense>
        <Suspense fallback={<LoadingFallback />}>
          <ControlChart />
        </Suspense>
      </Container>
    </LocalizationProvider>
  </ErrorBoundary>
);

export default App;
