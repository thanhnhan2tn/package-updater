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

const SelectedPackages = () => {
  const { 
    selectedPackages, 
    refreshingSelected, 
    refreshSelectedVersions, 
    removeFromSelection,
    getSelectedPackagesInfo,
    getFollowedPackagesInfo
  } = usePackageContext();

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
        <>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Followed Packages ({followedPackagesInfo.length})
          </Typography>
          <List>
            {followedPackagesInfo.map((pkg) => (
              <PackageListItem 
                key={pkg.id} 
                pkg={pkg}
                showRemove={false}
              />
            ))}
          </List>
        </>
      )}

      {selectedPackagesInfo.length > 0 && (
        <>
          {followedPackagesInfo.length > 0 && <Divider sx={{ my: 2 }} />}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Selected Packages ({selectedPackagesInfo.length})
          </Typography>
          <List>
            {selectedPackagesInfo.map((pkg) => (
              <PackageListItem 
                key={pkg.id} 
                pkg={pkg} 
                onRemove={removeFromSelection}
              />
            ))}
          </List>
        </>
      )}
    </Paper>
  );
};

export default SelectedPackages; 