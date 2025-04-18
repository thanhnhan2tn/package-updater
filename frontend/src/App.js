import React from 'react';
import { Container, Typography } from '@mui/material';
import { PackageProvider, usePackageContext } from './context/PackageContext';
import SelectedPackages from './components/SelectedPackages';
import ProjectAccordion from './components/ProjectAccordion';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

const PackageManager = () => {
  const { loading, error, getPackagesByProject } = usePackageContext();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const packagesByProject = getPackagesByProject();

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Package Dependencies
      </Typography>

      <SelectedPackages />

      {Object.entries(packagesByProject).map(([project, projectPackages]) => (
        <ProjectAccordion 
          key={project} 
          project={project} 
          packages={projectPackages} 
        />
      ))}
    </Container>
  );
};

function App() {
  return (
    <PackageProvider>
      <PackageManager />
    </PackageProvider>
  );
}

export default App; 