import React from 'react';
import { useUnit } from 'effector-react';
import { Paper, TextField, Button, Box, CircularProgress, Alert, Collapse } from '@mui/material';
import {
  $jqlQuery,
  setJqlQuery,
  fetchIssues,
  fetchIssuesEffect,
  $error,
  clearError,
  setError,
} from '../models/jira';

const JqlQueryForm = () => {
  const jqlQuery = useUnit($jqlQuery);
  const isLoading = useUnit(fetchIssuesEffect.pending);
  const error = useUnit($error);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jqlQuery.trim()) {
      setError('JQL query cannot be empty');
      return;
    }
    clearError();
    fetchIssues();
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField
          label="JQL Query"
          aria-label="Enter Jira Query Language (JQL) to filter issues for metrics analysis"
          aria-description="Use JQL syntax to define which issues to include in the analysis, for example: project = 'DEMO' AND type = Bug"
          multiline
          rows={4}
          variant="outlined"
          fullWidth
          value={jqlQuery}
          onChange={e => setJqlQuery(e.target.value)}
          disabled={isLoading}
          error={!!error}
          helperText="Example: project = 'GUSA' AND issuetype = Bug AND status = Done"
        />

        <Collapse in={!!error}>
          <Alert severity="error" onClose={() => clearError()} sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Collapse>

        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{ alignSelf: 'flex-start' }}
        >
          {isLoading ? (
            <>
              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
              Loading Issues...
            </>
          ) : (
            'Analyze'
          )}
        </Button>
      </Box>
    </Paper>
  );
};

export default JqlQueryForm;
