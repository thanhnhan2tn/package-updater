import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const Layout = ({ projectsPanel, dependenciesPanel, selectedPackagesPanel }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        p: 3,
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
        Dependency Manager
      </Typography>
      
      {/* Selected Packages Panel - only shown when packages are selected */}
      {selectedPackagesPanel}
      
      <Box sx={{ display: 'flex', gap: 3, flex: 1 }}>
        {/* Projects Panel */}
        <Paper
          elevation={1}
          sx={{
            width: 240,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            backgroundColor: '#ffffff',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6">Projects</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            {projectsPanel}
          </Box>
        </Paper>

        {/* Dependencies Panel */}
        <Paper
          elevation={1}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            backgroundColor: '#ffffff',
            overflow: 'hidden'
          }}
        >
          {dependenciesPanel}
        </Paper>
      </Box>
    </Box>
  );
};

export default Layout;