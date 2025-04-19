import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { PackageProvider, usePackageContext } from './context/PackageContext';
import Layout from './components/common/Layout';
import ProjectList from './components/ProjectList';
import DependenciesPanel from './components/DependenciesPanel';
import SelectedPackagesPanel from './components/SelectedPackagesPanel';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
    warning: {
      main: '#f59e0b',
    }
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

// Package manager component
const PackageManager = () => {
  const { loading, error, selectedPackages } = usePackageContext();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Layout
      selectedPackagesPanel={selectedPackages.length > 0 ? <SelectedPackagesPanel /> : null}
      projectsPanel={<ProjectList />}
      dependenciesPanel={<DependenciesPanel />}
    />
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