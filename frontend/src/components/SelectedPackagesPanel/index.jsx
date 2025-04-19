import React, { useState, useEffect, useMemo } from 'react';
import { Paper } from '@mui/material';
import axios from 'axios';
import { checkDockerImageVersion, upgradeDockerImage } from '../../services/dockerService';
import { usePackageContext } from '../../context/PackageContext';
import { usePackageOperations } from '../../hooks/usePackageOperations';
import { isMajorVersionUpgrade } from '../../utils/versionUtils';
import HeaderActions from './HeaderActions';
import MajorUpgradeAlert from './MajorUpgradeAlert';
import UpgradeProgress from './UpgradeProgress';
import PackageChips from './PackageChips';

const SelectedPackagesPanel = () => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dockerImages, setDockerImages] = useState([]);

  const { selectedPackages, packagesByProject, selectedProject, upgrading } = usePackageContext();
  const { handleUpgradePackages } = usePackageOperations();

  useEffect(() => {
    const fetchDockerImages = async () => {
      try {
        const resp = await axios.get('http://localhost:3001/api/docker/images');
        setDockerImages(resp.data || []);
      } catch (e) {
        console.error('Error fetching Docker images:', e);
      }
    };
    fetchDockerImages();
  }, []);

  const selectedPackageObjects = useMemo(() => {
    const npm = selectedPackages.map(id => {
      if (id.startsWith('pkg-')) {
        const all = (selectedProject && packagesByProject[selectedProject]) || [];
        return all.find(p => p.id === id);
      }
      return null;
    }).filter(Boolean);
    const docker = selectedPackages.map(id => id.startsWith('docker-') ? dockerImages.find(img => img.id === id) : null).filter(Boolean);
    return [...npm, ...docker];
  }, [selectedPackages, selectedProject, packagesByProject, dockerImages]);

  useEffect(() => {
    selectedPackageObjects
      .filter(p => p.id.startsWith('docker-') && !p.latestVersion)
      .forEach(async pkg => {
        try {
          const updated = await checkDockerImageVersion(selectedProject, pkg.type);
          setDockerImages(imgs => imgs.map(img => img.id === pkg.id ? { ...img, latestVersion: updated.latestVersion } : img));
        } catch (e) {
          console.error('Error fetching Docker version for', pkg.id, e);
        }
      });
  }, [selectedPackageObjects, selectedProject]);

  const safeUpgrades = selectedPackageObjects.filter(p => p.latestVersion && p.currentVersion !== p.latestVersion && !isMajorVersionUpgrade(p.currentVersion, p.latestVersion));
  const majorUpgrades = selectedPackageObjects.filter(p => p.latestVersion && p.currentVersion !== p.latestVersion && isMajorVersionUpgrade(p.currentVersion, p.latestVersion));

  const handleApplyFix = async () => {
    setIsUpgrading(true);
    const npmIds = safeUpgrades.filter(p => p.id.startsWith('pkg-')).map(p => p.id);
    if (npmIds.length) {
      try { await handleUpgradePackages(npmIds); } catch (e) { console.error(e); }
    }
    const dockerPkgs = selectedPackageObjects.filter(p => p.id.startsWith('docker-'));
    for (let pkg of dockerPkgs) {
      if (!pkg.latestVersion) {
        const updated = await checkDockerImageVersion(selectedProject, pkg.type);
        pkg.latestVersion = updated.latestVersion;
        setDockerImages(imgs => imgs.map(img => img.id === pkg.id ? { ...img, latestVersion: updated.latestVersion } : img));
      }
    }
    const safeDocker = dockerPkgs.filter(p => p.latestVersion && p.currentVersion !== p.latestVersion && !isMajorVersionUpgrade(p.currentVersion, p.latestVersion));
    for (const pkg of safeDocker) {
      const rawId = pkg.id.replace(/^docker-/, '');
      try {
        await upgradeDockerImage(selectedProject, {
          imageName: rawId,
          latestVersion: pkg.latestVersion,
          type: pkg.type
        });
        const updated = await checkDockerImageVersion(selectedProject, pkg.type);
        setDockerImages(imgs => imgs.map(img => img.id === pkg.id ? { ...img, latestVersion: updated.latestVersion } : img));
      } catch (e) {
        console.error('Docker upgrade failed for', rawId, e);
      }
    }
    setIsUpgrading(false);
  };

  useEffect(() => {
    const total = safeUpgrades.length;
    if (!total) return;
    const done = selectedPackages.filter(id => upgrading[id] && !id.startsWith('docker-')).length;
    setProgress(Math.round((done / total) * 100));
    setIsUpgrading(done > 0 && done < total);
  }, [safeUpgrades, selectedPackages, upgrading]);

  return (
    <Paper sx={{ mb: 2, p: 2 }}>
      <HeaderActions
        isUpgrading={isUpgrading}
        progress={progress}
        packagesNeedingUpgrade={safeUpgrades.length}
        onUpgrade={handleApplyFix}
      />

      {majorUpgrades.length > 0 && <MajorUpgradeAlert packages={majorUpgrades} />}

      <UpgradeProgress progress={progress} active={isUpgrading} />

      <PackageChips packages={selectedPackageObjects} upgrading={upgrading} />
    </Paper>
  );
};

export default SelectedPackagesPanel;