import React from 'react';
import { Divider } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SectionHeader from '../common/SectionHeader';
import CommonButton from '../common/CommonButton';
import { usePackageContext } from '../../context/PackageContext';
import { usePackageOperations } from '../../hooks/usePackageOperations';
import PackageListSection from './PackageListSection';

const SelectedPackages = () => {
  const { refreshingSelected, refreshSelectedVersions, selectedPackagesInfo, followedPackagesInfo, upgrading } = usePackageContext();
  const { handleUpgrade, handleRemove } = usePackageOperations();

  const filteredSelected = selectedPackagesInfo.filter(pkg => !followedPackagesInfo.some(f => f.id === pkg.id));

  if (followedPackagesInfo.length === 0 && filteredSelected.length === 0) {
    return null;
  }

  return (
    <>
      <SectionHeader
        title="Package Versions"
        action={
          <CommonButton
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={refreshSelectedVersions}
            loading={refreshingSelected}
          >
            {refreshingSelected ? 'Refreshing...' : 'Refresh All Versions'}
          </CommonButton>
        }
      />

      {followedPackagesInfo.length > 0 && (
        <PackageListSection
          title="Followed Packages"
          packages={followedPackagesInfo}
          onUpgrade={handleUpgrade}
          showRemove={false}
          upgrading={upgrading}
        />
      )}

      {filteredSelected.length > 0 && (
        <>
          {followedPackagesInfo.length > 0 && <Divider sx={{ my: 2 }} />}
          <PackageListSection
            title="Selected Packages"
            packages={filteredSelected}
            onRemove={handleRemove}
            onUpgrade={handleUpgrade}
            showRemove={true}
            upgrading={upgrading}
          />
        </>
      )}
    </>
  );
};

export default SelectedPackages;
