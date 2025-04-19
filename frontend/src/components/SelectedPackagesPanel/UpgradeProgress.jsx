import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

/**
 * Shows upgrade progress bar and percentage.
 */
const UpgradeProgress = ({ progress, active }) => {
  if (!active) return null;
  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: '#e2e8f0',
          '& .MuiLinearProgress-bar': { backgroundColor: '#0F172A' }
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
        {progress}% Complete
      </Typography>
    </Box>
  );
};

export default UpgradeProgress;
