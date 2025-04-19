import React, { useMemo, useState } from 'react';
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
  Tooltip,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import StarIcon from '@mui/icons-material/Star';
import FilterListIcon from '@mui/icons-material/FilterList';
import { usePackageContext } from '../context/PackageContext';
import { usePackageOperations } from '../hooks/usePackageOperations';

// Filter options
const FILTER_ALL = 'all';
const FILTER_OUTDATED = 'outdated';
const FILTER_PRIORITIZED = 'prioritized';

// Table header component
const TableHeader = React.memo(() => (
  <TableHead>
    <TableRow>
      <TableCell padding="checkbox" sx={{ pl: 2 }}></TableCell>
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
const PackageRow = React.memo(({ pkg, selectedPackages, onSelect, loadingVersions, onRefresh, getVersionStatus, onCheckVersion, isPackageFollowed, isPrioritized }) => {
  const isFollowed = isPackageFollowed(pkg.id);
  
  return (
    <TableRow 
      key={pkg.id}
      sx={isFollowed ? { backgroundColor: 'action.hover' } : undefined}
    >
      <TableCell padding="checkbox" sx={{ pl: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isPrioritized && (
            <Tooltip title="Prioritized Package">
              <StarIcon 
                fontSize="small" 
                color="warning" 
                sx={{ mr: 1 }}
              />
            </Tooltip>
          )}
          {isFollowed && !isPrioritized && (
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
          sx={{ 
            borderRadius: '4px',
            height: '24px',
            fontSize: '0.75rem'
          }}
        />
      </TableCell>
      <TableCell>
        <Typography variant="body2">{pkg.name}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">{pkg.currentVersion}</Typography>
      </TableCell>
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

// Filter component
const PackageFilter = React.memo(({ filter, onFilterChange }) => {
  return (
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
      <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="package-filter-label">Filter Packages</InputLabel>
        <Select
          labelId="package-filter-label"
          id="package-filter"
          value={filter}
          label="Filter Packages"
          onChange={(e) => onFilterChange(e.target.value)}
        >
          <MenuItem value={FILTER_ALL}>All Packages</MenuItem>
          <MenuItem value={FILTER_OUTDATED}>Outdated Packages</MenuItem>
          <MenuItem value={FILTER_PRIORITIZED}>Prioritized Packages</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
});

// Main component
const PackageTable = React.memo(({ packages }) => {
  const [filter, setFilter] = useState(FILTER_ALL);
  
  const { 
    loadingVersions, 
    selectedPackages, 
    getVersionStatus,
    isPackageFollowed,
    prioritizedPackages
  } = usePackageContext();
  
  const { 
    handleSelect, 
    handleRefresh, 
    handleCheckVersion 
  } = usePackageOperations();

  // Filter and sort packages
  const filteredAndSortedPackages = useMemo(() => {
    // First, filter packages based on the selected filter
    let filteredPackages = [...packages];
    
    if (filter === FILTER_OUTDATED) {
      filteredPackages = filteredPackages.filter(pkg => {
        if (!pkg.latestVersion) return false;
        const status = getVersionStatus(pkg.currentVersion, pkg.latestVersion);
        return status !== 'up-to-date';
      });
    } else if (filter === FILTER_PRIORITIZED) {
      filteredPackages = filteredPackages.filter(pkg => 
        prioritizedPackages.includes(pkg.name)
      );
    }
    
    // Then, sort packages with prioritized ones at the top
    return filteredPackages.sort((a, b) => {
      const aIsPrioritized = prioritizedPackages.includes(a.name);
      const bIsPrioritized = prioritizedPackages.includes(b.name);
      
      if (aIsPrioritized && !bIsPrioritized) return -1;
      if (!aIsPrioritized && bIsPrioritized) return 1;
      
      // If both have the same priority status, sort by name
      return a.name.localeCompare(b.name);
    });
  }, [packages, filter, getVersionStatus, prioritizedPackages]);

  // Memoize the table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => {
    return filteredAndSortedPackages.map((pkg) => (
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
        isPrioritized={prioritizedPackages.includes(pkg.name)}
      />
    ));
  }, [
    filteredAndSortedPackages, 
    selectedPackages, 
    handleSelect, 
    loadingVersions, 
    handleRefresh, 
    getVersionStatus, 
    handleCheckVersion, 
    isPackageFollowed,
    prioritizedPackages
  ]);

  return (
    <>
      <PackageFilter filter={filter} onFilterChange={setFilter} />
      
      <TableContainer>
        <Table size="small" sx={{ 
          '& .MuiTableCell-root': { 
            borderBottom: '1px solid #e0e0e0',
            padding: '8px 16px',
            fontSize: '0.875rem'
          } 
        }}>
          <TableHeader />
          <TableBody>
            {tableRows.length > 0 ? (
              tableRows
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No packages match the current filter
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
});

export default PackageTable;