import React from 'react';
import { Box, Stack, Tooltip, LinearProgress } from '@mui/material';
import CommonChip from '../common/CommonChip';
import { isMajorVersionUpgrade } from '../../utils/versionUtils';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * Renders chips for each selected package with status.
 */
const PackageChips = ({ packages, upgrading }) => (
  <Box sx={{ maxHeight: '100px', overflowY: 'auto', px: 1 }}>
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {packages.map(pkg => {
        const isPkgUpgrading = upgrading[pkg.id];
        const needsUpgrade = pkg.latestVersion && pkg.currentVersion !== pkg.latestVersion;
        const isMajor = needsUpgrade && isMajorVersionUpgrade(pkg.currentVersion, pkg.latestVersion);
        const isDocker = pkg.id.startsWith('docker-');
        const display = isDocker ? pkg.imageName : pkg.name;
        const label = `${display}@${pkg.currentVersion} → ${pkg.latestVersion || '?'}`;

        return (
          <Tooltip
            key={pkg.id}
            title={
              isPkgUpgrading ? 'Upgrading...' :
              isMajor ? 'Major version upgrade - manual update recommended' :
              needsUpgrade ? 'Update available' :
              'Up to date'
            }
          >
            <CommonChip
              label={label}
              size="small"
              icon={isPkgUpgrading ? <CircularProgress size={12} sx={{ ml: 1 }} /> : null}
              customStyles={{
                mb: 1,
                borderRadius: '4px',
                backgroundColor: isPkgUpgrading ? '#e0f2fe' : isMajor ? '#fef3c7' : needsUpgrade ? '#fee2e2' : '#dcfce7',
                '& .MuiChip-label': { fontSize: '0.75rem' }
              }}
            />
          </Tooltip>
        );
      })}
    </Stack>
  </Box>
);

export default PackageChips;
