import React from 'react';
import { Box } from '@mui/material';
import SectionHeader from '../common/SectionHeader';
import CommonButton from '../common/CommonButton';

/**
 * Renders the SectionHeader with Refresh/Upgrade button.
 */
const HeaderActions = ({ isUpgrading, progress, packagesNeedingUpgrade, onUpgrade }) => (
  <SectionHeader
    title="Package Panel"
    action={
      <CommonButton
        variant="contained"
        startIcon={isUpgrading ? null : <></>}
        onClick={onUpgrade}
        loading={isUpgrading}
      >
        {isUpgrading ? `Upgrading (${progress}%)` : `Apply Fix (${packagesNeedingUpgrade})`}
      </CommonButton>
    }
  />
);

export default HeaderActions;
