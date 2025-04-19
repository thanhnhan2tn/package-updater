import React from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { usePackageContext } from '../context/PackageContext';
import PackageTable from './PackageTable';

const DependenciesPanel = () => {
  const { 
    selectedProject, 
    packagesByProject, 
    refreshSelectedVersions,
    refreshingSelected
  } = usePackageContext();

  const packages = selectedProject ? packagesByProject[selectedProject] : [];

  return (
    <>
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6">Dependencies</Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={refreshSelectedVersions}
          disabled={refreshingSelected}
          sx={{
            backgroundColor: '#0F172A',
            '&:hover': {
              backgroundColor: '#1E293B',
            },
            borderRadius: 1,
            textTransform: 'none',
          }}
          size="small"
        >
          Refresh All
        </Button>
      </Box>

      <Box sx={{ p: 2, flex: 1 }}>
        {selectedProject && packages.length > 0 ? (
          <PackageTable packages={packages} />
        ) : (
          <Box
            sx={{
              height: '50vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography color="text.secondary">
              No dependencies found
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
};

export default DependenciesPanel;