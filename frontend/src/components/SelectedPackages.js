import React from 'react';
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
const PackageListItem = ({ pkg, onRemove, showRemove = true }) => (
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
        <Typography variant="body2" color="text.secondary">
          {pkg.currentVersion} → {pkg.latestVersion}
        </Typography>
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
const PackageListSection = ({ title, packages, onRemove, showRemove = true }) => {
  if (packages.length === 0) return null;
  
  return (
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
            showRemove={showRemove}
          />
        ))}
      </List>
    </>
  );
};

const SelectedPackages = () => {
  const { 
    refreshingSelected, 
    refreshSelectedVersions, 
    removeFromSelection,
    getSelectedPackagesInfo,
    getFollowedPackagesInfo
  } = usePackageContext();

  const followedPackages = getFollowedPackagesInfo();
  const selectedPackages = getSelectedPackagesInfo()
    .filter(pkg => !followedPackages.some(f => f.id === pkg.id));

  if (followedPackages.length === 0 && selectedPackages.length === 0) {
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

      <PackageListSection 
        title="Followed Packages" 
        packages={followedPackages} 
        showRemove={false}
      />

      {followedPackages.length > 0 && selectedPackages.length > 0 && (
        <Divider sx={{ my: 2 }} />
      )}

      <PackageListSection 
        title="Selected Packages" 
        packages={selectedPackages} 
        onRemove={removeFromSelection}
      />
    </Paper>
  );
};

export default SelectedPackages; 