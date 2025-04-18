import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Chip,
  Box,
  Checkbox,
  Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import StarIcon from '@mui/icons-material/Star';
import { usePackageContext } from '../context/PackageContext';

// Table header component
const TableHeader = () => (
  <TableHead>
    <TableRow>
      <TableCell padding="checkbox" />
      <TableCell>Type</TableCell>
      <TableCell>Package</TableCell>
      <TableCell>Current Version</TableCell>
      <TableCell>Latest Version</TableCell>
      <TableCell>Status</TableCell>
      <TableCell>Actions</TableCell>
    </TableRow>
  </TableHead>
);

// Version cell component
const VersionCell = ({ pkg, loadingVersions, loadPackageVersion }) => {
  if (loadingVersions[pkg.id]) {
    return <CircularProgress size={20} />;
  }
  
  if (pkg.latestVersion) {
    return pkg.latestVersion;
  }
  
  return (
    <IconButton 
      size="small" 
      onClick={() => loadPackageVersion(pkg.id)}
      title="Check version"
    >
      <RefreshIcon />
    </IconButton>
  );
};

// Status cell component
const StatusCell = ({ pkg, getVersionStatus }) => {
  if (!pkg.latestVersion) return null;
  
  const status = getVersionStatus(pkg.currentVersion, pkg.latestVersion);
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {status === 'up-to-date' ? (
        <Tooltip title="Up to date">
          <CheckCircleIcon color="success" />
        </Tooltip>
      ) : (
        <Tooltip title="Update available">
          <ErrorIcon color="error" />
        </Tooltip>
      )}
    </Box>
  );
};

// Actions cell component
const ActionsCell = ({ pkg, refreshVersion }) => {
  if (!pkg.latestVersion) return null;
  
  return (
    <IconButton 
      size="small" 
      onClick={() => refreshVersion(pkg.id)}
      title="Refresh version"
    >
      <RefreshIcon />
    </IconButton>
  );
};

// Package row component
const PackageRow = ({ pkg, selectedPackages, checkPackage, loadingVersions, refreshVersion, getVersionStatus, loadPackageVersion, isPackageFollowed }) => {
  const isFollowed = isPackageFollowed(pkg.id);
  
  return (
    <TableRow 
      key={pkg.id}
      sx={isFollowed ? { backgroundColor: 'action.hover' } : undefined}
    >
      <TableCell padding="checkbox">
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isFollowed && (
            <Tooltip title="Followed Package">
              <StarIcon 
                fontSize="small" 
                color="primary" 
                sx={{ mr: 1 }}
              />
            </Tooltip>
          )}
          <Checkbox
            checked={selectedPackages.includes(pkg.id)}
            onChange={() => checkPackage(pkg.id)}
            disabled={isFollowed}
          />
        </Box>
      </TableCell>
      <TableCell>
        <Chip 
          label={pkg.type} 
          color={pkg.type === 'frontend' ? 'primary' : 'secondary'}
          size="small"
        />
      </TableCell>
      <TableCell>{pkg.name}</TableCell>
      <TableCell>{pkg.currentVersion}</TableCell>
      <TableCell>
        <VersionCell 
          pkg={pkg} 
          loadingVersions={loadingVersions} 
          loadPackageVersion={loadPackageVersion} 
        />
      </TableCell>
      <TableCell>
        <StatusCell pkg={pkg} getVersionStatus={getVersionStatus} />
      </TableCell>
      <TableCell>
        <ActionsCell pkg={pkg} refreshVersion={refreshVersion} />
      </TableCell>
    </TableRow>
  );
};

// Main component
const PackageTable = ({ packages }) => {
  const { 
    loadingVersions, 
    selectedPackages, 
    checkPackage, 
    refreshVersion, 
    getVersionStatus,
    loadPackageVersion,
    isPackageFollowed
  } = usePackageContext();

  return (
    <TableContainer>
      <Table size="small">
        <TableHeader />
        <TableBody>
          {packages.map((pkg) => (
            <PackageRow 
              key={pkg.id}
              pkg={pkg}
              selectedPackages={selectedPackages}
              checkPackage={checkPackage}
              loadingVersions={loadingVersions}
              refreshVersion={refreshVersion}
              getVersionStatus={getVersionStatus}
              loadPackageVersion={loadPackageVersion}
              isPackageFollowed={isPackageFollowed}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PackageTable; 