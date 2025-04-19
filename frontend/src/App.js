import React from 'react';
import { Container, Typography, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { PackageProvider, usePackageContext } from './context/PackageContext';
import SelectedPackages from './components/SelectedPackages';
import ProjectAccordion from './components/ProjectAccordion';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiAccordion: {
      styleOverrides: {
        root: {
          marginBottom: 8,
        },
      },
    },
  },
});

// Package manager component
const PackageManager = () => {
  const { loading, error, packagesByProject } = usePackageContext();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
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

// Main app component
const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <PackageProvider>
      <PackageManager />
    </PackageProvider>
  </ThemeProvider>
);

export default App; 