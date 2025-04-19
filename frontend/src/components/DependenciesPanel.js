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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Dependencies
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={refreshSelectedVersions}
          disabled={refreshingSelected}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
          }}
        >
          Refresh All
        </Button>
      </Box>

      {selectedProject ? (
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
    </>
  );
};

export default DependenciesPanel; 