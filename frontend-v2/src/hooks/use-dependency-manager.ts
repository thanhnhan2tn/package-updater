import { useState, useCallback, useEffect } from "react";
import { Dependency } from "../types/dependency";
import { fetchPackages, fetchPackageVersion, upgradePackage } from "../services/api";
import { useToast } from "./use-toast";

export function useDependencyManager(initialProjectName: string | null = null) {
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<Dependency[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [checkingPackages, setCheckingPackages] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const loadDependencies = useCallback(async (projectName: string | null) => {
    if (!projectName) return;
    
    setLoading(true);
    try {
      console.log(`📦 Loading dependencies for ${projectName}`);
      const data = await fetchPackages(projectName);
      // Initialize majorUpgrade flag
      const initializedData = data.map((pkg: any) => ({ ...pkg, majorUpgrade: false }));
      setDependencies(initializedData);
      return initializedData;
    } catch (error: any) {
      console.error("Error fetching dependencies:", error);
      toast({
        title: "Error fetching dependencies",
        description: error.message || "Failed to load dependencies",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // We remove the automatic loading effect based on initialProjectName
  // This will be explicitly called by the parent component when needed
  
  const checkPackageVersion = useCallback(async (pkg: Dependency) => {
    const idKey = `${pkg.project}-${pkg.name}`;
    setCheckingPackages(prev => ({ ...prev, [idKey]: true }));
    
    try {
      console.log(`🔍 Checking version for ${pkg.name}`);
      const result = await fetchPackageVersion(pkg.project, pkg.name);
      const latest = result.latestVersion ?? pkg.currentVersion;
      
      // Detect major version upgrade
      const currMajor = Number(pkg.currentVersion.split('.')[0]);
      const newMajor = Number(latest.split('.')[0]);
      const majorUpgrade = newMajor > currMajor;
      
      const updatedPkg = { 
        ...pkg, 
        latestVersion: latest, 
        outdated: latest !== pkg.currentVersion,
        majorUpgrade 
      };
      
      // Update the package in both dependencies and selectedPackages
      setDependencies(prev => 
        prev.map(item => item.id === pkg.id ? updatedPkg : item)
      );
      
      setSelectedPackages(prev => 
        prev.map(item => item.id === pkg.id ? updatedPkg : item)
      );
      
      toast({ 
        title: "Package checked", 
        description: `Latest version for ${pkg.name} is ${latest}` 
      });
      
      return updatedPkg;
    } catch (error: any) {
      console.error("Check package error", error);
      toast({ 
        title: "Failed to check package", 
        description: error.message, 
        variant: "destructive" 
      });
      return null;
    } finally {
      setCheckingPackages(prev => {
        const clone = { ...prev };
        delete clone[idKey];
        return clone;
      });
    }
  }, [toast]);

  const checkAllSelectedPackages = useCallback(async () => {
    console.log(`🔍 Checking all selected packages (${selectedPackages.length})`);
    return Promise.all(selectedPackages.map(pkg => checkPackageVersion(pkg)));
  }, [selectedPackages, checkPackageVersion]);

  const upgradeDependencies = useCallback(async () => {
    if (selectedPackages.length === 0) return;
    
    setUpgrading(true);
    try {
      console.log(`🚀 Upgrading ${selectedPackages.length} packages`);
      await Promise.all(
        selectedPackages.map(pkg => upgradePackage(pkg.project, pkg))
      );
      
      toast({
        title: "Packages upgraded",
        description: `Upgraded ${selectedPackages.length} packages`,
      });
      
      // Clear selected packages after successful upgrade
      setSelectedPackages([]);
      
      return true;
    } catch (error: any) {
      console.error("Upgrade error", error);
      toast({ 
        title: "Upgrade failed", 
        description: error.message, 
        variant: "destructive" 
      });
      return false;
    } finally {
      setUpgrading(false);
    }
  }, [selectedPackages, toast]);

  const togglePackageSelection = useCallback((pkg: Dependency) => {
    setSelectedPackages(prev => {
      const isSelected = prev.some(
        p => p.id === pkg.id
      );
      
      if (isSelected) {
        return prev.filter(p => p.id !== pkg.id);
      } else {
        return [...prev, pkg];
      }
    });
  }, []);

  const clearSelectedPackages = useCallback(() => {
    setSelectedPackages([]);
  }, []);

  return {
    dependencies,
    selectedPackages,
    loading,
    refreshing,
    upgrading,
    checkingPackages,
    loadDependencies,
    checkPackageVersion,
    checkAllSelectedPackages,
    upgradeDependencies,
    togglePackageSelection,
    clearSelectedPackages,
    setRefreshing
  };
} 