import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Paper,
  Stack,
  Divider,
  CircularProgress,
  Tooltip,
  LinearProgress
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import DoneIcon from '@mui/icons-material/Done';
import { usePackageContext } from '../context/PackageContext';
import { usePackageOperations } from '../hooks/usePackageOperations';

const SelectedPackagesPanel = () => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeComplete, setUpgradeComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { 
    selectedPackages,
    packagesByProject,
    selectedProject,
    upgrading
  } = usePackageContext();
  
  const { handleUpgradePackages } = usePackageOperations();
  
  // Get the selected package objects
  const selectedPackageObjects = selectedPackages.map(id => {
    // Find the package in the current project
    const allPackages = selectedProject ? packagesByProject[selectedProject] : [];
    return allPackages.find(pkg => pkg.id === id);
  }).filter(Boolean); // Filter out any undefined values

  // Calculate the number of packages that need upgrading
  const packagesNeedingUpgrade = selectedPackageObjects.filter(pkg => 
    pkg.latestVersion && pkg.currentVersion !== pkg.latestVersion
  ).length;

  // Calculate the number of packages currently being upgraded
  const packagesBeingUpgraded = selectedPackages.filter(id => upgrading[id]).length;
  
  // Calculate progress percentage
  useEffect(() => {
    if (packagesNeedingUpgrade === 0) {
      setProgress(0);
      return;
    }
    
    const completedUpgrades = packagesBeingUpgraded;
    const progressPercentage = Math.round((completedUpgrades / packagesNeedingUpgrade) * 100);
    
    setProgress(progressPercentage);
    
    // If all packages are upgraded, show completion message
    if (completedUpgrades === packagesNeedingUpgrade && completedUpgrades > 0) {
      setUpgradeComplete(true);
      // Reset the success message after 3 seconds
      const timer = setTimeout(() => {
        setUpgradeComplete(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [packagesBeingUpgraded, packagesNeedingUpgrade]);
  
  // Handle the upgrade of all selected packages
  const handleUpgradeAll = async () => {
    setIsUpgrading(true);
    setUpgradeComplete(false);
    setProgress(0);
    
    try {
      const result = await handleUpgradePackages(selectedPackages);
      
      if (result.success) {
        // Progress will be updated by the effect
      }
    } catch (error) {
      console.error('Error upgrading packages:', error);
    } finally {
      setIsUpgrading(false);
    }
  };
  
  // Check if any selected packages are currently being upgraded
  const anyUpgrading = selectedPackages.some(id => upgrading[id]);
  
  // If no packages are selected, don't render the panel
  if (selectedPackages.length === 0) {
    return null;
  }
  
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
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {upgradeComplete && (
            <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DoneIcon fontSize="small" />
              Upgrade complete
            </Typography>
          )}
          
          <Button
            variant="contained"
            startIcon={isUpgrading || anyUpgrading ? <CircularProgress size={16} color="inherit" /> : <BuildIcon />}
            onClick={handleUpgradeAll}
            disabled={isUpgrading || anyUpgrading || packagesNeedingUpgrade === 0}
            sx={{
              backgroundColor: '#0F172A',
              '&:hover': {
                backgroundColor: '#1E293B',
              },
              borderRadius: 1,
            }}
            size="small"
          >
            {isUpgrading || anyUpgrading ? `Upgrading (${progress}%)` : 'Apply Fix'}
          </Button>
        </Box>
      </Box>
      
      {(isUpgrading || anyUpgrading) && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: '#e2e8f0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#0F172A'
              }
            }} 
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
            {progress}% Complete
          </Typography>
        </Box>
      )}
      
      <Divider sx={{ mb: 2 }} />
      
      <Box 
        sx={{ 
          maxHeight: '100px', 
          overflowY: 'auto',
          px: 1
        }}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {selectedPackageObjects.map(pkg => {
            const isPackageUpgrading = upgrading[pkg.id];
            const needsUpgrade = pkg.latestVersion && pkg.currentVersion !== pkg.latestVersion;
            
            return (
              <Tooltip 
                key={pkg.id} 
                title={isPackageUpgrading ? "Upgrading..." : 
                       needsUpgrade ? "Update available" : 
                       "Up to date"}
              >
                <Chip
                  label={`${pkg.name}@${pkg.currentVersion} → ${pkg.latestVersion || '?'}`}
                  size="small"
                  sx={{ 
                    mb: 1,
                    borderRadius: '4px',
                    backgroundColor: isPackageUpgrading ? '#e0f2fe' :
                                    needsUpgrade ? '#fee2e2' : 
                                    '#dcfce7',
                    '& .MuiChip-label': {
                      fontSize: '0.75rem'
                    }
                  }}
                  icon={isPackageUpgrading ? 
                        <CircularProgress size={12} sx={{ ml: 1 }} /> : 
                        null}
                />
              </Tooltip>
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
};

export default SelectedPackagesPanel;
