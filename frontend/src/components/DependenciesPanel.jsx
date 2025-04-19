import React, { useState } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import { usePackageContext } from '../context/PackageContext';
import PackageTable from './PackageTable';
import DockerImageTable from './DockerImageTable';
import SectionHeader from './common/SectionHeader';
import CommonButton from './common/CommonButton';
import EmptyState from './common/EmptyState';
import CommonContainer from './common/CommonContainer';
import { CommonTabs, CommonTab } from './common/CommonTabs';

const DependenciesPanel = () => {
  const { 
    selectedProject, 
    packagesByProject, 
    refreshSelectedVersions,
    refreshingSelected
  } = usePackageContext();
  
  const [activeTab, setActiveTab] = useState(0);

  // Safely handle the case when packagesByProject[selectedProject] might be undefined
  const packages = selectedProject && packagesByProject && packagesByProject[selectedProject] 
    ? packagesByProject[selectedProject] 
    : [];
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <CommonTabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="dependency tabs"
      >
        <CommonTab label="NPM Packages" />
        <CommonTab label="Docker Images" />
      </CommonTabs>

      <CommonContainer>
        {activeTab === 0 && (
          selectedProject && packages && packages.length > 0 ? (
            <PackageTable packages={packages} />
          ) : (
            <EmptyState
              message={
                selectedProject ? "No NPM packages found for this project" : "No project selected"
              }
            />
          )
        )}
        
        {activeTab === 1 && (
          <DockerImageTable />
        )}
      </CommonContainer>
    </>
  );
};

export default DependenciesPanel;