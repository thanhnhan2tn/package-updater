import React from 'react';
import { Alert, Typography, Box, Stack } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CommonChip from '../common/CommonChip';

/**
 * Displays a warning for major version upgrades.
 */
const MajorUpgradeAlert = ({ packages }) => (
  <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2, '& .MuiAlert-message': { width: '100%' } }}>
    <Typography variant="body2" fontWeight={500}>
      Major version upgrades detected
    </Typography>
    <Typography variant="caption" component="div" sx={{ mb: 1 }}>
      The following packages have major version upgrades which may contain breaking changes. 
      These will be excluded from automatic updates.
    </Typography>
    <Box sx={{ mt: 1 }}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {packages.map(pkg => (
          <CommonChip
            key={pkg.id}
            label={`${pkg.name || pkg.imageName}: ${pkg.currentVersion} → ${pkg.latestVersion}`}
            size="small"
            color="warning"
            customStyles={{
              mb: 0.5,
              borderRadius: '4px',
              '& .MuiChip-label': { fontSize: '0.75rem' }
            }}
          />
        ))}
      </Stack>
    </Box>
  </Alert>
);

export default MajorUpgradeAlert;
