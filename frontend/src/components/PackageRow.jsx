import React from 'react';
import { CommonTableRow, CommonTableCell, CommonCheckbox, CommonIconButton } from './common';
import { Box, IconButton, CircularProgress, Typography, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import StarIcon from '@mui/icons-material/Star';
import { SectionHeader } from './common';
import { isMajorVersionUpgrade } from '../utils/versionUtils';

/**
 * Reusable row for packages and Docker images.
 * Props align with PackageRow:
 * pkg, selectedPackages, onSelect, loadingVersions, onRefresh,
 * getVersionStatus, onCheckVersion, isPackageFollowed,
 * isPrioritized, upgrading
 */
const PackageRow = React.memo(({
  pkg,
  selectedPackages,
  onSelect,
  loadingVersions,
  onRefresh,
  getVersionStatus,
  onCheckVersion,
  isPackageFollowed,
  isPrioritized,
  upgrading
}) => {
  const isFollowed = isPackageFollowed(pkg.id);

  return (
    <CommonTableRow
      key={pkg.id}
      sx={{
        ...(isFollowed ? { backgroundColor: 'action.hover' } : undefined),
      }}
    >
      <CommonTableCell padding="checkbox" sx={{ pl: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isPrioritized && (
            <Tooltip title="Prioritized">
              <StarIcon fontSize="small" />
            </Tooltip>
          )}
          <CommonCheckbox
            checked={selectedPackages.includes(pkg.id)}
            onChange={() => onSelect(pkg.id)}
          />
        </Box>
      </CommonTableCell>
      <CommonTableCell>{pkg.name || pkg.project}</CommonTableCell>
      <CommonTableCell>{pkg.currentVersion}</CommonTableCell>
      <CommonTableCell>
        {loadingVersions[pkg.id]
          ? <CircularProgress size={20} />
          : pkg.latestVersion
            ? <Typography className="monospace-text">{pkg.latestVersion}</Typography>
            : <IconButton size="small" onClick={() => onCheckVersion(pkg.id)}>
                <RefreshIcon fontSize="small" />
              </IconButton>
        }
      </CommonTableCell>
      <CommonTableCell>
        {pkg.latestVersion && (
          isMajorVersionUpgrade(pkg.currentVersion, pkg.latestVersion) ? (
            <Typography color="warning.main">Major upgrade</Typography>
          ) : pkg.currentVersion === pkg.latestVersion ? (
            <Typography color="success.main">Up to date</Typography>
          ) : (
            <Typography color="error.main">Update available</Typography>
          )
        )}
      </CommonTableCell>
      <CommonTableCell>
        <CommonIconButton
          size="small"
          icon={<RefreshIcon fontSize="small" />}
          onClick={() => onRefresh(pkg.id)}
          disabled={upgrading[pkg.id]}
        />
      </CommonTableCell>
    </CommonTableRow>
  );
});

export default PackageRow;
