import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { fetchPackages, fetchPackageVersion, upgradePackage as upgradePackageApi } from '../services/api';
import { packagesToFollow, packagesMetadata } from '../config/packagesToFollow';

// Prioritized packages - these are considered important
const prioritizedPackages = [
  'react',
  'react-dom',
  'axios',
  'express',
  'lodash',
  '@mui/material',
  '@mui/icons-material',
  'typescript'
];

// Create context
const PackageContext = createContext();

// Custom hook for using the context
export const usePackageContext = () => {
  const context = useContext(PackageContext);
  if (!context) {
    throw new Error('usePackageContext must be used within a PackageProvider');
  }
  return context;
};

export const PackageProvider = ({ children }) => {
  // State
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingVersions, setLoadingVersions] = useState({});
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [refreshingSelected, setRefreshingSelected] = useState(false);
  const [upgrading, setUpgrading] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);

  // Load a single package version
  const loadPackageVersion = useCallback(async (id) => {
    try {
      setLoadingVersions(prev => ({ ...prev, [id]: true }));
      const data = await fetchPackageVersion(id);
      
      setPackages(prev => prev.map(pkg => 
        pkg.id === id ? { ...pkg, latestVersion: data.latestVersion } : pkg
      ));
    } catch (err) {
      console.error(`Error fetching version for package ${id}:`, err);
    } finally {
      setLoadingVersions(prev => ({ ...prev, [id]: false }));
    }
  }, []);

  // Load all packages and select followed packages
  const loadPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPackages();
      setPackages(data);
      
      // Select followed packages
      const validFollowedPackages = data
        .filter(pkg => packagesToFollow.includes(pkg.id))
        .map(pkg => pkg.id);
      
      setSelectedPackages(validFollowedPackages);

      // Select first project by default
      const projects = [...new Set(data.map(pkg => pkg.project))];
      if (projects.length > 0) {
        setSelectedProject(projects[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load packages');
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load packages on mount
  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  // Load versions for followed packages
  useEffect(() => {
    const loadFollowedVersions = async () => {
      if (packages.length === 0) return;
      
      const validFollowedPackages = packages
        .filter(pkg => packagesToFollow.includes(pkg.id))
        .map(pkg => pkg.id);
      
      if (validFollowedPackages.length > 0) {
        try {
          await Promise.all(validFollowedPackages.map(id => loadPackageVersion(id)));
        } catch (err) {
          console.error('Error loading followed packages versions:', err);
        }
      }
    };

    loadFollowedVersions();
  }, [packages, loadPackageVersion]);

  // Refresh a single package version
  const refreshVersion = useCallback((id) => {
    loadPackageVersion(id);
  }, [loadPackageVersion]);

  // Refresh all selected package versions
  const refreshSelectedVersions = useCallback(async () => {
    setRefreshingSelected(true);
    try {
      await Promise.all(selectedPackages.map(id => loadPackageVersion(id)));
    } catch (err) {
      console.error('Error refreshing selected versions:', err);
    } finally {
      setRefreshingSelected(false);
    }
  }, [selectedPackages, loadPackageVersion]);

  // Toggle package selection
  const checkPackage = useCallback((id) => {
    // Skip if package is followed
    if (packagesToFollow.includes(id)) return;

    setSelectedPackages(prev => 
      prev.includes(id) 
        ? prev.filter(pkgId => pkgId !== id)
        : [...prev, id]
    );
  }, []);

  // Toggle all packages in a project
  const checkAllInProject = useCallback((projectName, checked) => {
    const projectPackages = packages
      .filter(pkg => pkg.project === projectName)
      .map(pkg => pkg.id)
      .filter(id => !packagesToFollow.includes(id));
    
    setSelectedPackages(prev => 
      checked
        ? [...new Set([...prev, ...projectPackages])]
        : prev.filter(id => !projectPackages.includes(id))
    );
  }, [packages]);

  // Remove package from selection
  const removeFromSelection = useCallback((id) => {
    if (!packagesToFollow.includes(id)) {
      setSelectedPackages(prev => prev.filter(pkgId => pkgId !== id));
    }
  }, []);

  // Get version status
  const getVersionStatus = useCallback((currentVersion, latestVersion) => {
    if (!latestVersion) return null;
    return currentVersion === latestVersion ? 'up-to-date' : 'outdated';
  }, []);

  // Group packages by project - memoized for performance
  const packagesByProject = useMemo(() => {
    return packages.reduce((acc, pkg) => {
      if (!acc[pkg.project]) acc[pkg.project] = [];
      acc[pkg.project].push(pkg);
      return acc;
    }, {});
  }, [packages]);

  // Get info for selected packages - memoized for performance
  const selectedPackagesInfo = useMemo(() => {
    return selectedPackages
      .map(id => packages.find(p => p.id === id))
      .filter(Boolean);
  }, [selectedPackages, packages]);

  // Get info for followed packages - memoized for performance
  const followedPackagesInfo = useMemo(() => {
    return packagesToFollow
      .map(id => {
        const pkg = packages.find(p => p.id === id);
        return pkg ? { ...pkg, metadata: packagesMetadata[id] || null } : null;
      })
      .filter(Boolean);
  }, [packages]);

  // Check if a package is followed
  const isPackageFollowed = useCallback((id) => {
    return packagesToFollow.includes(id);
  }, []);

  // Upgrade a package
  const upgradePackage = useCallback(async (pkg) => {
    try {
      setUpgrading(prev => ({ ...prev, [pkg.id]: true }));
      const result = await upgradePackageApi(pkg.project, {
        name: pkg.name,
        latestVersion: pkg.latestVersion,
        type: pkg.type
      });
      
      // Refresh the package version after upgrade
      await loadPackageVersion(pkg.id);
      
      return result;
    } catch (error) {
      console.error('Error upgrading package:', error);
      throw error;
    } finally {
      setUpgrading(prev => ({ ...prev, [pkg.id]: false }));
    }
  }, [loadPackageVersion]);

  // Upgrade multiple packages
  const upgradePackages = useCallback(async (packageIds) => {
    const packagesToUpgrade = packages
      .filter(pkg => packageIds.includes(pkg.id) && pkg.latestVersion && pkg.latestVersion !== pkg.currentVersion);
    
    if (packagesToUpgrade.length === 0) {
      return { success: true, message: 'No packages need upgrading' };
    }
    
    const results = [];
    for (const pkg of packagesToUpgrade) {
      try {
        setUpgrading(prev => ({ ...prev, [pkg.id]: true }));
        const result = await upgradePackageApi(pkg.project, {
          name: pkg.name,
          latestVersion: pkg.latestVersion,
          type: pkg.type
        });
        results.push({ id: pkg.id, success: true, result });
      } catch (error) {
        console.error(`Error upgrading package ${pkg.id}:`, error);
        results.push({ id: pkg.id, success: false, error: error.message });
      } finally {
        setUpgrading(prev => ({ ...prev, [pkg.id]: false }));
      }
    }
    
    // Refresh all package versions after upgrade
    await Promise.all(packageIds.map(id => loadPackageVersion(id)));
    
    return {
      success: results.every(r => r.success),
      results
    };
  }, [packages, loadPackageVersion]);

  // Context value
  const value = {
    // State
    packages,
    loading,
    error,
    loadingVersions,
    selectedPackages,
    refreshingSelected,
    upgrading,
    selectedProject,
    prioritizedPackages,
    
    // Actions
    setSelectedProject,
    setSelectedPackages,
    loadPackages,
    loadPackageVersion,
    refreshVersion,
    refreshSelectedVersions,
    checkPackage,
    checkAllInProject,
    removeFromSelection,
    getVersionStatus,
    isPackageFollowed,
    upgradePackage,
    upgradePackages,
    
    // Computed values
    packagesByProject,
    selectedPackagesInfo,
    followedPackagesInfo,
  };

  return (
    <PackageContext.Provider value={value}>
      {children}
    </PackageContext.Provider>
  );
};