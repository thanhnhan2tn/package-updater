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
        <TableBody>
          {packages.map((pkg) => {
            const isFollowed = isPackageFollowed(pkg.id);
            return (
              <TableRow 
                key={pkg.id}
                sx={isFollowed ? { 
                  backgroundColor: 'action.hover',
                } : undefined}
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
                  {loadingVersions[pkg.id] ? (
                    <CircularProgress size={20} />
                  ) : pkg.latestVersion ? (
                    pkg.latestVersion
                  ) : (
                    <IconButton 
                      size="small" 
                      onClick={() => loadPackageVersion(pkg.id)}
                      title="Check version"
                    >
                      <RefreshIcon />
                    </IconButton>
                  )}
                </TableCell>
                <TableCell>
                  {pkg.latestVersion && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getVersionStatus(pkg.currentVersion, pkg.latestVersion) === 'up-to-date' ? (
                        <Tooltip title="Up to date">
                          <CheckCircleIcon color="success" />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Update available">
                          <ErrorIcon color="error" />
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  {pkg.latestVersion && (
                    <IconButton 
                      size="small" 
                      onClick={() => refreshVersion(pkg.id)}
                      title="Refresh version"
                    >
                      <RefreshIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PackageTable; 