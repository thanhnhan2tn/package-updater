import React, { useState, useEffect, useMemo } from 'react';
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
  LinearProgress,
  Alert
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import DoneIcon from '@mui/icons-material/Done';
import WarningIcon from '@mui/icons-material/Warning';
import { usePackageContext } from '../context/PackageContext';
import { usePackageOperations } from '../hooks/usePackageOperations';
import { isMajorVersionUpgrade } from '../utils/versionUtils';
import axios from 'axios';

const SelectedPackagesPanel = () => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeComplete, setUpgradeComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dockerImages, setDockerImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  
  const { 
    selectedPackages,
    packagesByProject,
    selectedProject,
    upgrading
  } = usePackageContext();
  
  const { handleUpgradePackages } = usePackageOperations();
  
  // Fetch Docker images when the component mounts
  useEffect(() => {
    const fetchDockerImages = async () => {
      try {
        setLoadingImages(true);
        const response = await axios.get('http://localhost:3001/api/docker/images');
        setDockerImages(response.data || []);
      } catch (err) {
        console.error('Error fetching Docker images:', err);
      } finally {
        setLoadingImages(false);
      }
    };
    
    fetchDockerImages();
  }, []);
  
  // Get the selected package objects
  const selectedPackageObjects = useMemo(() => {
    // First, get NPM packages from packagesByProject
    const npmPackages = selectedPackages
      .map(id => {
        if (id.startsWith('pkg-')) {
          // This is an NPM package
          const allPackages = selectedProject && packagesByProject && packagesByProject[selectedProject] 
            ? packagesByProject[selectedProject] 
            : [];
          return allPackages?.find(pkg => pkg.id === id);
        }
        return null;
      })
      .filter(Boolean); // Filter out any undefined values
    
    // Then, get Docker images
    const dockerPackages = selectedPackages
      .map(id => {
        if (id.startsWith('docker-')) {
          // This is a Docker image
          return dockerImages.find(img => img.id === id);
        }
        return null;
      })
      .filter(Boolean);
    
    // Combine both types
    return [...npmPackages, ...dockerPackages];
  }, [selectedPackages, selectedProject, packagesByProject, dockerImages]);

  // Separate packages into those with major upgrades and those with minor/patch upgrades
  const packagesWithMajorUpgrades = useMemo(() => 
    selectedPackageObjects.filter(pkg => 
      pkg.latestVersion && 
      pkg.currentVersion !== pkg.latestVersion && 
      isMajorVersionUpgrade(pkg.currentVersion, pkg.latestVersion)
    ), [selectedPackageObjects]);
  
  const packagesWithSafeUpgrades = useMemo(() => 
    selectedPackageObjects.filter(pkg => 
      pkg.latestVersion && 
      pkg.currentVersion !== pkg.latestVersion && 
      !isMajorVersionUpgrade(pkg.currentVersion, pkg.latestVersion)
    ), [selectedPackageObjects]);

  // Calculate the number of packages that need upgrading (excluding major version upgrades)
  const packagesNeedingUpgrade = packagesWithSafeUpgrades.length;

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
  
  // Handle the upgrade of all selected packages (excluding major version upgrades)
  const handleUpgradeAll = async () => {
    if (packagesWithSafeUpgrades.length === 0) return;
    
    setIsUpgrading(true);
    setUpgradeComplete(false);
    setProgress(0);
    
    try {
      // Only upgrade packages that don't have major version changes
      const safePackageIds = packagesWithSafeUpgrades.map(pkg => pkg.id);
      
      // Separate NPM packages and Docker images
      const npmPackageIds = safePackageIds.filter(id => id.startsWith('pkg-'));
      const dockerImageIds = safePackageIds.filter(id => id.startsWith('docker-'));
      
      // Upgrade NPM packages
      if (npmPackageIds.length > 0) {
        const npmResult = await handleUpgradePackages(npmPackageIds);
        console.log('NPM package upgrade result:', npmResult);
      }
      
      // Upgrade Docker images
      for (const dockerId of dockerImageIds) {
        const dockerImage = dockerImages.find(img => img.id === dockerId);
        if (dockerImage) {
          try {
            console.log(`Upgrading Docker image: ${dockerImage.imageName}`);
            const response = await axios.post(`http://localhost:3001/api/docker/upgrade/${dockerImage.project}`, {
              imageName: dockerImage.imageName,
              latestVersion: dockerImage.latestVersion,
              type: dockerImage.type
            });
            console.log('Docker image upgrade result:', response.data);
          } catch (error) {
            console.error(`Error upgrading Docker image ${dockerImage.id}:`, error);
          }
        }
      }
      
      // Refresh Docker images after upgrade
      if (dockerImageIds.length > 0) {
        const response = await axios.get('http://localhost:3001/api/docker/images');
        setDockerImages(response.data || []);
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
  
  // If still loading Docker images, show loading state
  if (loadingImages) {
    return (
      <Paper
        elevation={1}
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress size={24} sx={{ mr: 2 }} />
        <Typography variant="body2">Loading selected packages...</Typography>
      </Paper>
    );
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
      
      {packagesWithMajorUpgrades.length > 0 && (
        <Alert 
          severity="warning" 
          icon={<WarningIcon />}
          sx={{ mb: 2, '& .MuiAlert-message': { width: '100%' } }}
        >
          <Typography variant="body2" fontWeight={500}>
            Major version upgrades detected
          </Typography>
          <Typography variant="caption" component="div" sx={{ mb: 1 }}>
            The following packages have major version upgrades which may contain breaking changes. 
            These will be excluded from automatic updates.
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {packagesWithMajorUpgrades.map(pkg => (
                <Chip
                  key={pkg.id}
                  label={`${pkg.name || pkg.imageName}: ${pkg.currentVersion} → ${pkg.latestVersion}`}
                  size="small"
                  color="warning"
                  sx={{ 
                    mb: 0.5,
                    borderRadius: '4px',
                    '& .MuiChip-label': {
                      fontSize: '0.75rem'
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Alert>
      )}
      
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
            const isMajorUpgrade = needsUpgrade && isMajorVersionUpgrade(pkg.currentVersion, pkg.latestVersion);
            const isDockerImage = pkg.id.startsWith('docker-');
            const displayName = isDockerImage ? pkg.imageName : pkg.name;
            
            return (
              <Tooltip 
                key={pkg.id} 
                title={isPackageUpgrading ? "Upgrading..." : 
                       isMajorUpgrade ? "Major version upgrade - manual update recommended" :
                       needsUpgrade ? "Update available" : 
                       "Up to date"}
              >
                <Chip
                  label={`${displayName}@${pkg.currentVersion} → ${pkg.latestVersion || '?'}`}
                  size="small"
                  sx={{ 
                    mb: 1,
                    borderRadius: '4px',
                    backgroundColor: isPackageUpgrading ? '#e0f2fe' :
                                    isMajorUpgrade ? '#fef3c7' :
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
