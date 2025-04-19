import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { usePackageContext } from '../context/PackageContext';
import PackageTable from './PackageTable';
import DockerImageTable from './DockerImageTable';

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
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6">Dependencies</Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={refreshSelectedVersions}
          disabled={refreshingSelected}
          sx={{
            backgroundColor: '#0F172A',
            '&:hover': {
              backgroundColor: '#1E293B',
            },
            borderRadius: 1,
            textTransform: 'none',
          }}
          size="small"
        >
          Refresh All
        </Button>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="dependency tabs"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#0F172A',
            },
            '& .Mui-selected': {
              color: '#0F172A !important',
              fontWeight: 600,
            },
          }}
        >
          <Tab label="NPM Packages" />
          <Tab label="Docker Images" />
        </Tabs>
      </Box>

      <Box sx={{ p: 2, flex: 1 }}>
        {activeTab === 0 && (
          selectedProject && packages && packages.length > 0 ? (
            <PackageTable packages={packages} />
          ) : (
            <Box
              sx={{
                height: '50vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography color="text.secondary">
                {selectedProject ? "No NPM packages found for this project" : "No project selected"}
              </Typography>
            </Box>
          )
        )}
        
        {activeTab === 1 && (
          <DockerImageTable />
        )}
      </Box>
    </>
  );
};

export default DependenciesPanel;