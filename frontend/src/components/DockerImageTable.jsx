import React, { useState, useEffect, useMemo } from 'react';
import { fetchDockerImages, checkDockerImageVersion } from '../services/dockerService';
import { usePackageContext } from '../context/PackageContext';

// Import common components
import {
  CommonTable,
  CommonTableContainer,
  CommonTableHead,
  CommonTableBody,
  CommonTableRow,
  CommonTableCell,
  CommonSectionHeader,
  LoadingContainer,
  EmptyState
} from './common';
import PackageRow from './PackageRow';

// Filter constants
const FILTER_ALL = 'all';
const FILTER_OUTDATED = 'outdated';

const DockerImageTable = () => {
  const [dockerImages, setDockerImages] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  
  const { selectedProject, setSelectedPackages } = usePackageContext();
  
  // Fetch Docker images when the component mounts or when the selected project changes
  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        const data = await fetchDockerImages();
        const formatted = data.map(img => ({ id: img.id.startsWith('docker-') ? img.id : `docker-${img.id}`, ...img, latestVersion: null }));
        setDockerImages(formatted);
        setError(null);
      } catch (err) {
        console.error('Error loading Docker images:', err);
        setError(err.message || 'Failed to load Docker images.');
        setDockerImages([]);
      } finally {
        setLoading(false);
      }
    };
    loadImages();
  }, [selectedProject]);
  
  // trigger version check on demand
  const checkVersion = async (imageId) => {
    const img = dockerImages.find(i => i.id === imageId);
    if (!img) return;
    const { project: projectName, type } = img;
    try {
      setLoadingVersions(prev => ({ ...prev, [imageId]: true }));
      const updated = await checkDockerImageVersion(projectName, type);
      setDockerImages(imgs => imgs.map(i => i.id === imageId ? { ...i, latestVersion: updated.latestVersion } : i));
    } catch (e) {
      console.error(`Version check failed for ${imageId}:`, e);
    } finally {
      setLoadingVersions(prev => ({ ...prev, [imageId]: false }));
    }
  };

  // Filter images by selected project only
  const filteredImages = useMemo(() => 
    dockerImages.filter(img => !selectedProject || img.project === selectedProject)
  , [dockerImages, selectedProject]);

  // Handle image selection, trigger version fetch when adding
  const handleSelectImage = (imageId) => {
    const prefixedId = imageId.startsWith('docker-') ? imageId : `docker-${imageId}`;
    let updated;
    if (selectedImages.includes(prefixedId)) {
      updated = selectedImages.filter(id => id !== prefixedId);
    } else {
      updated = [...selectedImages, prefixedId];
    }
    setSelectedImages(updated);
    setSelectedPackages(updated);
    // if added, fetch latestVersion on demand
    if (!selectedImages.includes(prefixedId)) {
      const img = dockerImages.find(i => i.id === imageId);
      if (img && !img.latestVersion) checkVersion(imageId);
    }
  };
  
  // Section filters
  const [frontendFilter, setFrontendFilter] = useState(FILTER_ALL);
  const [serverFilter, setServerFilter] = useState(FILTER_ALL);

  // Group by type
  const imagesByType = useMemo(() => (
    filteredImages.reduce((acc, img) => { 
      acc[img.type] = acc[img.type] || []; 
      acc[img.type].push(img); 
      return acc; 
    }, {})
  ), [filteredImages]);

  // Apply section filters
  const filteredFrontendImages = useMemo(() => {
    const arr = imagesByType.frontend || [];
    return arr.filter(img => (frontendFilter === FILTER_ALL || img.currentVersion !== img.latestVersion));
  }, [imagesByType.frontend, frontendFilter]);
  
  const filteredServerImages = useMemo(() => {
    const arr = imagesByType.server || [];
    return arr.filter(img => (serverFilter === FILTER_ALL || img.currentVersion !== img.latestVersion));
  }, [imagesByType.server, serverFilter]);

  // Render loading state
  if (loading) {
    return (
      <LoadingContainer>
        Loading Docker images...
      </LoadingContainer>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <EmptyState 
        message={`Error loading Docker images: ${error}`}
        icon={<div className="error-icon" />}
      />
    );
  }

  return (
    <CommonTableContainer sx={{ mb: 2 }}>
      <CommonTable size="small" sx={{ '& .MuiTableCell-root': { borderBottom: '1px solid #e0e0e0' } }}>
        
        <CommonTableBody>
          {imagesByType.frontend?.length > 0 ? (
            <>
              <CommonTableRow>
                <CommonSectionHeader 
                  title="Frontend Images" 
                  count={filteredFrontendImages.length} 
                  color="primary.main" 
                />
              </CommonTableRow>
              
              {filteredFrontendImages.map(image => (
                <PackageRow
                  key={image.id}
                  pkg={{ ...image, name: image.imageName }}
                  selectedPackages={selectedImages}
                  onSelect={handleSelectImage}
                  loadingVersions={loadingVersions}
                  onRefresh={checkVersion}
                  getVersionStatus={() => {}}
                  onCheckVersion={checkVersion}
                  isPackageFollowed={() => false}
                  isPrioritized={false}
                  upgrading={{}}
                />
              ))}
            </>
          ) : (
            <CommonTableRow>
              <CommonTableCell colSpan={7} align="center" sx={{ py: 2 }}>
                <EmptyState message="No frontend images." />
              </CommonTableCell>
            </CommonTableRow>
          )}
        </CommonTableBody>
        <CommonTableBody>
          {imagesByType.server?.length > 0 ? (
            <>
              <CommonTableRow>
                <CommonSectionHeader 
                  title="Server Images" 
                  count={filteredServerImages.length} 
                  color="secondary.main" 
                />
              </CommonTableRow>
              
              {filteredServerImages.map(image => (
                <PackageRow
                  key={image.id}
                  pkg={{ ...image, name: image.imageName }}
                  selectedPackages={selectedImages}
                  onSelect={handleSelectImage}
                  loadingVersions={loadingVersions}
                  onRefresh={checkVersion}
                  getVersionStatus={() => {}}
                  onCheckVersion={checkVersion}
                  isPackageFollowed={() => false}
                  isPrioritized={false}
                  upgrading={{}}
                />
              ))}
            </>
          ) : (
            <CommonTableRow>
              <CommonTableCell colSpan={7} align="center" sx={{ py: 2 }}>
                <EmptyState message="No server images." />
              </CommonTableCell>
            </CommonTableRow>
          )}
        </CommonTableBody>
      </CommonTable>
    </CommonTableContainer>
  );
};

export default DockerImageTable;
