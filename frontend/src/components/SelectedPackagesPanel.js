import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Paper,
  Stack,
  Divider
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import { usePackageContext } from '../context/PackageContext';
import { usePackageOperations } from '../hooks/usePackageOperations';

const SelectedPackagesPanel = () => {
  const { 
    selectedPackages,
    packagesByProject,
    selectedProject
  } = usePackageContext();
  
  const { handleUpgradePackages } = usePackageOperations();
  
  // If no packages are selected, don't render the panel
  if (selectedPackages.length === 0) {
    return null;
  }
  
  // Get the selected package objects
  const selectedPackageObjects = selectedPackages.map(id => {
    // Find the package in the current project
    const allPackages = selectedProject ? packagesByProject[selectedProject] : [];
    return allPackages.find(pkg => pkg.id === id);
  }).filter(Boolean); // Filter out any undefined values
  
  return (
    <Paper
      elevation={1}
      sx={{
        mb: 3,
        p: 2,
        borderRadius: 2,
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Selected Packages ({selectedPackages.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<BuildIcon />}
          onClick={() => handleUpgradePackages(selectedPackages)}
          sx={{
            backgroundColor: '#0F172A',
            '&:hover': {
              backgroundColor: '#1E293B',
            },
            borderRadius: 1,
          }}
          size="small"
        >
          Apply Fix
        </Button>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box 
        sx={{ 
          maxHeight: '100px', 
          overflowY: 'auto',
          px: 1
        }}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {selectedPackageObjects.map(pkg => (
            <Chip
              key={pkg.id}
              label={`${pkg.name}@${pkg.currentVersion} → ${pkg.latestVersion || '?'}`}
              size="small"
              sx={{ 
                mb: 1,
                borderRadius: '4px',
                backgroundColor: '#e2e8f0',
                '& .MuiChip-label': {
                  fontSize: '0.75rem'
                }
              }}
            />
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default SelectedPackagesPanel;
