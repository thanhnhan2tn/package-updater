import React from 'react';
import { Box, Paper } from '@mui/material';

const Layout = ({ projectsPanel, dependenciesPanel }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        p: 3,
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}
    >
      {/* Projects Panel */}
      <Paper
        elevation={1}
        sx={{
          width: 300,
          p: 3,
          borderRadius: 2,
          backgroundColor: '#ffffff'
        }}
      >
        {projectsPanel}
      </Paper>

      {/* Dependencies Panel */}
      <Paper
        elevation={1}
        sx={{
          flex: 1,
          p: 3,
          borderRadius: 2,
          backgroundColor: '#ffffff'
        }}
      >
        {dependenciesPanel}
      </Paper>
    </Box>
  );
};

export default Layout; 