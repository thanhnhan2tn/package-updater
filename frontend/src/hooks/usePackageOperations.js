import { useCallback } from 'react';
import { usePackageContext } from '../context/PackageContext';

/**
 * Custom hook for package operations
 * @returns {Object} Package operations
 */
export const usePackageOperations = () => {
  const { 
    upgradePackage, 
    refreshVersion, 
    loadPackageVersion,
    checkPackage,
    checkAllInProject,
    removeFromSelection
  } = usePackageContext();

  /**
   * Handle package upgrade
   * @param {Object} pkg - Package to upgrade
   * @returns {Promise<void>}
   */
  const handleUpgrade = useCallback(async (pkg) => {
    try {
      await upgradePackage(pkg);
    } catch (error) {
      console.error('Error upgrading package:', error);
      // Error handling could be improved with a toast notification
    }
  }, [upgradePackage]);

  /**
   * Handle package refresh
   * @param {string} id - Package ID
   */
  const handleRefresh = useCallback((id) => {
    refreshVersion(id);
  }, [refreshVersion]);

  /**
   * Handle package version check
   * @param {string} id - Package ID
   */
  const handleCheckVersion = useCallback((id) => {
    loadPackageVersion(id);
  }, [loadPackageVersion]);

  /**
   * Handle package selection
   * @param {string} id - Package ID
   */
  const handleSelect = useCallback((id) => {
    checkPackage(id);
  }, [checkPackage]);

  /**
   * Handle project selection
   * @param {string} projectName - Project name
   * @param {boolean} checked - Whether to select or deselect
   */
  const handleProjectSelect = useCallback((projectName, checked) => {
    checkAllInProject(projectName, checked);
  }, [checkAllInProject]);

  /**
   * Handle package removal from selection
   * @param {string} id - Package ID
   */
  const handleRemove = useCallback((id) => {
    removeFromSelection(id);
  }, [removeFromSelection]);

  return {
    handleUpgrade,
    handleRefresh,
    handleCheckVersion,
    handleSelect,
    handleProjectSelect,
    handleRemove
  };
}; 