import React, { useMemo } from 'react';
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
import { usePackageOperations } from '../hooks/usePackageOperations';

// Table header component
const TableHeader = React.memo(() => (
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
));

// Version cell component
const VersionCell = React.memo(({ pkg, loadingVersions, onCheckVersion }) => {
  if (loadingVersions[pkg.id]) {
    return <CircularProgress size={20} />;
  }
  
  if (pkg.latestVersion) {
    return pkg.latestVersion;
  }
  
  return (
    <IconButton 
      size="small" 
      onClick={() => onCheckVersion(pkg.id)}
      title="Check version"
    >
      <RefreshIcon />
    </IconButton>
  );
});

// Status cell component
const StatusCell = React.memo(({ pkg, getVersionStatus }) => {
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
});

// Actions cell component
const ActionsCell = React.memo(({ pkg, onRefresh }) => {
  if (!pkg.latestVersion) return null;
  
  return (
    <IconButton 
      size="small" 
      onClick={() => onRefresh(pkg.id)}
      title="Refresh version"
    >
      <RefreshIcon />
    </IconButton>
  );
});

// Package row component
const PackageRow = React.memo(({ pkg, selectedPackages, onSelect, loadingVersions, onRefresh, getVersionStatus, onCheckVersion, isPackageFollowed }) => {
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
            onChange={() => onSelect(pkg.id)}
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
          onCheckVersion={onCheckVersion} 
        />
      </TableCell>
      <TableCell>
        <StatusCell pkg={pkg} getVersionStatus={getVersionStatus} />
      </TableCell>
      <TableCell>
        <ActionsCell pkg={pkg} onRefresh={onRefresh} />
      </TableCell>
    </TableRow>
  );
});

// Main component
const PackageTable = React.memo(({ packages }) => {
  const { 
    loadingVersions, 
    selectedPackages, 
    getVersionStatus,
    isPackageFollowed
  } = usePackageContext();
  
  const { 
    handleSelect, 
    handleRefresh, 
    handleCheckVersion 
  } = usePackageOperations();

  // Memoize the table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => {
    return packages.map((pkg) => (
      <PackageRow 
        key={pkg.id}
        pkg={pkg}
        selectedPackages={selectedPackages}
        onSelect={handleSelect}
        loadingVersions={loadingVersions}
        onRefresh={handleRefresh}
        getVersionStatus={getVersionStatus}
        onCheckVersion={handleCheckVersion}
        isPackageFollowed={isPackageFollowed}
      />
    ));
  }, [
    packages, 
    selectedPackages, 
    handleSelect, 
    loadingVersions, 
    handleRefresh, 
    getVersionStatus, 
    handleCheckVersion, 
    isPackageFollowed
  ]);

  return (
    <TableContainer>
      <Table size="small">
        <TableHeader />
        <TableBody>
          {tableRows}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

export default PackageTable; 