import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import { usePackageContext } from '../context/PackageContext';

// Package list item component
const PackageListItem = ({ pkg, onRemove, onUpgrade, showRemove = true }) => (
  <ListItem>
    <ListItemText
      primary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {pkg.name}
          {pkg.metadata && (
            <Chip
              label="Followed"
              size="small"
              color="primary"
              variant="outlined"
              title={pkg.metadata}
            />
          )}
        </Box>
      }
      secondary={`${pkg.project} - ${pkg.type}`}
    />
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {pkg.latestVersion && (
        <>
          <Typography variant="body2" color="text.secondary">
            {pkg.currentVersion} → {pkg.latestVersion}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => onUpgrade(pkg)}
            disabled={pkg.currentVersion === pkg.latestVersion}
          >
            Apply Fix
          </Button>
        </>
      )}
      {showRemove && (
        <IconButton
          edge="end"
          aria-label="delete"
          onClick={() => onRemove(pkg.id)}
        >
          <DeleteIcon />
        </IconButton>
      )}
    </Box>
  </ListItem>
);

// Package list section component
const PackageListSection = ({ title, packages, onRemove, onUpgrade, showRemove }) => (
  <>
    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
      {title} ({packages.length})
    </Typography>
    <List>
      {packages.map((pkg) => (
        <PackageListItem 
          key={pkg.id} 
          pkg={pkg}
          onRemove={onRemove}
          onUpgrade={onUpgrade}
          showRemove={showRemove}
        />
      ))}
    </List>
  </>
);

// Main component
const SelectedPackages = () => {
  const { 
    refreshingSelected, 
    refreshSelectedVersions, 
    removeFromSelection,
    getSelectedPackagesInfo,
    getFollowedPackagesInfo,
    upgradePackage
  } = usePackageContext();

  const [upgrading, setUpgrading] = useState({});

  const handleUpgrade = async (pkg) => {
    try {
      setUpgrading(prev => ({ ...prev, [pkg.id]: true }));
      const result = await upgradePackage(pkg);
      console.log('Package upgraded:', result);
      // Optionally show a success message
    } catch (error) {
      console.error('Error upgrading package:', error);
      // Optionally show an error message
    } finally {
      setUpgrading(prev => ({ ...prev, [pkg.id]: false }));
    }
  };

  const followedPackagesInfo = getFollowedPackagesInfo();
  const selectedPackagesInfo = getSelectedPackagesInfo()
    .filter(pkg => !followedPackagesInfo.some(f => f.id === pkg.id));

  if (followedPackagesInfo.length === 0 && selectedPackagesInfo.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ mb: 4, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Package Versions
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={refreshSelectedVersions}
          disabled={refreshingSelected}
        >
          {refreshingSelected ? 'Refreshing...' : 'Refresh All Versions'}
        </Button>
      </Box>

      {followedPackagesInfo.length > 0 && (
        <PackageListSection 
          title="Followed Packages"
          packages={followedPackagesInfo}
          onUpgrade={handleUpgrade}
          showRemove={false}
        />
      )}

      {selectedPackagesInfo.length > 0 && (
        <>
          {followedPackagesInfo.length > 0 && <Divider sx={{ my: 2 }} />}
          <PackageListSection 
            title="Selected Packages"
            packages={selectedPackagesInfo}
            onRemove={removeFromSelection}
            onUpgrade={handleUpgrade}
            showRemove={true}
          />
        </>
      )}
    </Paper>
  );
};

export default SelectedPackages; 