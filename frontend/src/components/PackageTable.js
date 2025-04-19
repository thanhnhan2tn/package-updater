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
const StatusCell = React.memo(({ pkg, getVersionStatus, upgrading }) => {
  if (!pkg.latestVersion) return null;
  
  const isUpgrading = upgrading[pkg.id];
  
  if (isUpgrading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
          Updating...
        </Typography>
        <CircularProgress size={16} thickness={4} />
      </Box>
    );
  }
  
  // Compare versions directly
  const isUpToDate = pkg.currentVersion === pkg.latestVersion;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {isUpToDate ? (
        <>
          <Tooltip title="Up to date">
            <CheckCircleIcon color="success" fontSize="small" />
          </Tooltip>
          <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
            Up to date
          </Typography>
        </>
      ) : (
        <>
          <Tooltip title="Update available">
            <ErrorIcon color="error" fontSize="small" />
          </Tooltip>
          <Typography variant="caption" color="error" sx={{ ml: 1 }}>
            Update available
          </Typography>
        </>
      )}
    </Box>
  );
});

// Actions cell component
const ActionsCell = React.memo(({ pkg, onRefresh, upgrading }) => {
  if (!pkg.latestVersion) return null;
  
  const isUpgrading = upgrading[pkg.id];
  
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {/* Refresh button */}
      <IconButton 
        size="small" 
        onClick={() => onRefresh(pkg.id)}
        title="Refresh version"
        disabled={isUpgrading}
      >
        <RefreshIcon fontSize="small" />
      </IconButton>
    </Box>
  );
});

// Package row component
const PackageRow = React.memo(({ pkg, selectedPackages, onSelect, loadingVersions, onRefresh, getVersionStatus, onCheckVersion, isPackageFollowed, isPrioritized, upgrading }) => {
  const isFollowed = isPackageFollowed(pkg.id);
  
  return (
    <TableRow 
      key={pkg.id}
      sx={{
        ...isFollowed ? { backgroundColor: 'action.hover' } : undefined,
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
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
        <Typography variant="body2" color="text.secondary">
          <VersionCell 
            pkg={pkg} 
            loadingVersions={loadingVersions} 
            onCheckVersion={onCheckVersion} 
          />
        </Typography>
      </TableCell>
      <TableCell>
        <StatusCell 
          pkg={pkg} 
          getVersionStatus={getVersionStatus} 
          upgrading={upgrading} 
        />
      </TableCell>
      <TableCell>
        <ActionsCell 
          pkg={pkg} 
          onRefresh={onRefresh} 
          upgrading={upgrading} 
        />
      </TableCell>
    </TableRow>
  );
});

// Filter component
const PackageFilter = React.memo(({ filter, onFilterChange, label }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
      <FilterListIcon sx={{ color: 'text.secondary' }} />
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id={`${label.toLowerCase()}-filter-label`}>{label} Filter</InputLabel>
        <Select
          labelId={`${label.toLowerCase()}-filter-label`}
          id={`${label.toLowerCase()}-filter`}
          value={filter}
          label={`${label} Filter`}
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

// Section Header component
const SectionHeader = React.memo(({ title, count, color }) => {
  return (
    <TableCell 
      colSpan={7} 
      sx={{ 
        backgroundColor: color, 
        color: 'white',
        fontWeight: 'bold',
        py: 1
      }}
    >
      {title} ({count})
    </TableCell>
  );
});

// Main component
const PackageTable = React.memo(({ packages }) => {
  const [frontendFilter, setFrontendFilter] = useState(FILTER_ALL);
  const [serverFilter, setServerFilter] = useState(FILTER_ALL);
  
  const { 
    loadingVersions, 
    selectedPackages, 
    getVersionStatus,
    isPackageFollowed,
    prioritizedPackages,
    upgrading,
  } = usePackageContext();
  
  const { 
    handleSelect, 
    handleRefresh, 
    handleCheckVersion
  } = usePackageOperations();

  // Group packages by type
  const packagesByType = useMemo(() => {
    return packages.reduce((acc, pkg) => {
      const type = pkg.type || 'unknown';
      if (!acc[type]) acc[type] = [];
      acc[type].push(pkg);
      return acc;
    }, {});
  }, [packages]);

  // Filter and sort frontend packages
  const filteredFrontendPackages = useMemo(() => {
    if (!packagesByType.frontend) return [];
    
    let filteredPackages = [...packagesByType.frontend];
    
    // Apply frontend filter
    if (frontendFilter === FILTER_OUTDATED) {
      filteredPackages = filteredPackages.filter(pkg => {
        if (!pkg.latestVersion) return false;
        const status = pkg.currentVersion === pkg.latestVersion;
        return !status;
      });
    } else if (frontendFilter === FILTER_PRIORITIZED) {
      filteredPackages = filteredPackages.filter(pkg => 
        prioritizedPackages.includes(pkg.name)
      );
    }
    
    // Sort packages
    return filteredPackages.sort((a, b) => {
      const aIsPrioritized = prioritizedPackages.includes(a.name);
      const bIsPrioritized = prioritizedPackages.includes(b.name);
      
      if (aIsPrioritized && !bIsPrioritized) return -1;
      if (!aIsPrioritized && bIsPrioritized) return 1;
      
      return a.name.localeCompare(b.name);
    });
  }, [packagesByType.frontend, frontendFilter, prioritizedPackages]);

  // Filter and sort server packages
  const filteredServerPackages = useMemo(() => {
    if (!packagesByType.server) return [];
    
    let filteredPackages = [...packagesByType.server];
    
    // Apply server filter
    if (serverFilter === FILTER_OUTDATED) {
      filteredPackages = filteredPackages.filter(pkg => {
        if (!pkg.latestVersion) return false;
        const status = pkg.currentVersion === pkg.latestVersion;
        return !status;
      });
    } else if (serverFilter === FILTER_PRIORITIZED) {
      filteredPackages = filteredPackages.filter(pkg => 
        prioritizedPackages.includes(pkg.name)
      );
    }
    
    // Sort packages
    return filteredPackages.sort((a, b) => {
      const aIsPrioritized = prioritizedPackages.includes(a.name);
      const bIsPrioritized = prioritizedPackages.includes(b.name);
      
      if (aIsPrioritized && !bIsPrioritized) return -1;
      if (!aIsPrioritized && bIsPrioritized) return 1;
      
      return a.name.localeCompare(b.name);
    });
  }, [packagesByType.server, serverFilter, prioritizedPackages]);

  // Filter and sort other packages
  const otherPackages = useMemo(() => {
    const otherTypes = Object.keys(packagesByType).filter(type => 
      type !== 'frontend' && type !== 'server'
    );
    
    return otherTypes.reduce((acc, type) => {
      acc[type] = packagesByType[type];
      return acc;
    }, {});
  }, [packagesByType]);

  // Create frontend package rows
  const frontendRows = useMemo(() => {
    const rows = [];
    
    if (filteredFrontendPackages.length > 0) {
      filteredFrontendPackages.forEach(pkg => {
        rows.push(
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
            upgrading={upgrading}
          />
        );
      });
    }
    
    return rows;
  }, [
    filteredFrontendPackages,
    selectedPackages,
    handleSelect,
    loadingVersions,
    handleRefresh,
    getVersionStatus,
    handleCheckVersion,
    isPackageFollowed,
    prioritizedPackages,
    upgrading
  ]);

  // Create server package rows
  const serverRows = useMemo(() => {
    const rows = [];
    
    if (filteredServerPackages.length > 0) {
      filteredServerPackages.forEach(pkg => {
        rows.push(
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
            upgrading={upgrading}
          />
        );
      });
    }
    
    return rows;
  }, [
    filteredServerPackages,
    selectedPackages,
    handleSelect,
    loadingVersions,
    handleRefresh,
    getVersionStatus,
    handleCheckVersion,
    isPackageFollowed,
    prioritizedPackages,
    upgrading
  ]);

  // Create other package rows
  const otherRows = useMemo(() => {
    const rows = [];
    
    Object.keys(otherPackages).forEach(type => {
      if (otherPackages[type] && otherPackages[type].length > 0) {
        // Add section header
        rows.push(
          <TableRow key={`${type}-header`}>
            <TableCell 
              colSpan={7} 
              sx={{ 
                backgroundColor: 'grey.300', 
                color: 'text.primary',
                fontWeight: 'bold'
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} Dependencies ({otherPackages[type].length})
            </TableCell>
          </TableRow>
        );
        
        // Add package rows
        otherPackages[type].forEach(pkg => {
          rows.push(
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
              upgrading={upgrading}
            />
          );
        });
      }
    });
    
    return rows;
  }, [
    otherPackages,
    selectedPackages,
    handleSelect,
    loadingVersions,
    handleRefresh,
    getVersionStatus,
    handleCheckVersion,
    isPackageFollowed,
    prioritizedPackages,
    upgrading
  ]);

  return (
    <>
      <TableContainer>
        <Table size="small" sx={{ 
          '& .MuiTableCell-root': { 
            borderBottom: '1px solid #e0e0e0',
            padding: '8px 16px',
            fontSize: '0.875rem'
          } 
        }}>
          <TableHead>
            <TableRow>
              <TableCell colSpan={7} sx={{ p: 0, border: 'none' }}>
                {/* Frontend Section Filter */}
                {packagesByType.frontend && packagesByType.frontend.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <PackageFilter 
                      filter={frontendFilter} 
                      onFilterChange={setFrontendFilter} 
                      label="Frontend"
                    />
                  </Box>
                )}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Frontend Section */}
            {packagesByType.frontend && packagesByType.frontend.length > 0 && (
              <>
                <TableRow>
                  <SectionHeader 
                    title="Frontend Dependencies" 
                    count={filteredFrontendPackages.length} 
                    color="primary.main"
                  />
                </TableRow>
                {frontendRows.length > 0 ? (
                  frontendRows
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 2 }}>
                      <Typography color="text.secondary">
                        No frontend packages match the current filter
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
          
          <TableHead>
            <TableRow>
              <TableCell colSpan={7} sx={{ p: 0, border: 'none' }}>
                {/* Server Section Filter */}
                {packagesByType.server && packagesByType.server.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <PackageFilter 
                      filter={serverFilter} 
                      onFilterChange={setServerFilter} 
                      label="Server"
                    />
                  </Box>
                )}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Server Section */}
            {packagesByType.server && packagesByType.server.length > 0 && (
              <>
                <TableRow>
                  <SectionHeader 
                    title="Server Dependencies" 
                    count={filteredServerPackages.length} 
                    color="secondary.main"
                  />
                </TableRow>
                {serverRows.length > 0 ? (
                  serverRows
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 2 }}>
                      <Typography color="text.secondary">
                        No server packages match the current filter
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
            
            {/* Other Sections */}
            {otherRows.length > 0 && otherRows}
            
            {/* No packages message */}
            {!packagesByType.frontend && !packagesByType.server && Object.keys(otherPackages).length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No packages found
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