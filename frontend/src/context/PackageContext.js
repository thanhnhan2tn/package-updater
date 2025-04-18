import React, { createContext, useContext, useState, useEffect } from 'react';
import { packagesToFollow } from '../config/packagesToFollow';

const PackageContext = createContext();

export const PackageProvider = ({ children }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/packages');
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }
      const data = await response.json();
      setPackages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFollowedPackagesInfo = async () => {
    try {
      const followedPackages = await Promise.all(
        packagesToFollow.map(async (pkg) => {
          const response = await fetch(`/api/package-version/${pkg.id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch version for ${pkg.id}`);
          }
          const versionInfo = await response.json();
          return {
            ...pkg,
            ...versionInfo,
          };
        })
      );
      return followedPackages;
    } catch (err) {
      console.error('Error fetching followed packages:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const value = {
    packages,
    loading,
    error,
    refreshPackages: fetchPackages,
    getFollowedPackagesInfo,
  };

  return (
    <PackageContext.Provider value={value}>
      {children}
    </PackageContext.Provider>
  );
};

export const usePackageContext = () => {
  const context = useContext(PackageContext);
  if (!context) {
    throw new Error('usePackageContext must be used within a PackageProvider');
  }
  return context;
}; 