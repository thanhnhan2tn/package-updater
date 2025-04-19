import React, { useState, useEffect, useMemo } from 'react';
import { fetchDockerImages, checkDockerImageVersion } from '../services/dockerService';
import RefreshIcon from '@mui/icons-material/Refresh';
import { usePackageContext } from '../context/PackageContext';
import { isMajorVersionUpgrade } from '../utils/versionUtils';

// Removed obsolete stylesheet import

// Import common components
import {
  CommonChip,
  CommonTable,
  CommonTableContainer,
  CommonTableHead,
  CommonTableBody,
  CommonTableRow,
  CommonTableCell,
  CommonSectionHeader,
  CommonCheckbox,
  CommonIconButton,
  CommonFilter,
  LoadingContainer,
  VersionStatusIndicator,
  EmptyState
} from './common';

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
    const cleanId = imageId.startsWith('docker-') ? imageId.replace(/^docker-/, '') : imageId;
    try {
      setLoadingVersions(prev => ({ ...prev, [imageId]: true }));
      const updated = await checkDockerImageVersion(cleanId);
      setDockerImages(imgs => imgs.map(img => img.id === imageId ? { ...img, latestVersion: updated.latestVersion } : img));
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

  // Handle image selection
  const handleSelectImage = (imageId) => {
    // Add 'docker-' prefix if not already present
    const prefixedId = imageId.startsWith('docker-') ? imageId : `docker-${imageId}`;
    
    setSelectedImages(prev => {
      if (prev.includes(prefixedId)) {
        // Remove from selection
        const updated = prev.filter(id => id !== prefixedId);
        setSelectedPackages(updated);
        return updated;
      } else {
        // Add to selection
        const updated = [...prev, prefixedId];
        setSelectedPackages(updated);
        return updated;
      }
    });
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
                <CommonTableRow key={image.id} hover>
                  <CommonTableCell padding="checkbox">
                    {image.currentVersion !== image.latestVersion && (
                      <CommonCheckbox
                        checked={selectedImages.includes(image.id.startsWith('docker-') ? image.id : `docker-${image.id}`)}
                        onChange={() => handleSelectImage(image.id)}
                        aria-labelledby={`image-${image.id}`}
                      />
                    )}
                  </CommonTableCell>
                  <CommonTableCell>{image.project}</CommonTableCell>
                  <CommonTableCell>
                    <CommonChip 
                      label={image.type} 
                      size="small"
                      customStyles={{ 
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        fontWeight: 500
                      }}
                    />
                  </CommonTableCell>
                  <CommonTableCell className="monospace-text">{image.imageName}</CommonTableCell>
                  <CommonTableCell className="monospace-text">{image.currentVersion}</CommonTableCell>
                  <CommonTableCell>
                    {loadingVersions[image.id] ? (
                      <div className="loading-cell">Loading...</div>
                    ) : image.latestVersion ? (
                      <span className="monospace-text">{image.latestVersion}</span>
                    ) : (
                      <CommonIconButton
                        size="small"
                        icon={<RefreshIcon fontSize="small" />}
                        onClick={() => checkVersion(image.id)}
                        title="Check version"
                      />
                    )}
                  </CommonTableCell>
                  <CommonTableCell>
                    <VersionStatusIndicator
                      currentVersion={image.currentVersion}
                      latestVersion={image.latestVersion}
                      isMajorUpgrade={isMajorVersionUpgrade(image.currentVersion, image.latestVersion)}
                    />
                  </CommonTableCell>
                </CommonTableRow>
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
                <CommonTableRow key={image.id} hover>
                  <CommonTableCell padding="checkbox">
                    {image.currentVersion !== image.latestVersion && (
                      <CommonCheckbox
                        checked={selectedImages.includes(image.id.startsWith('docker-') ? image.id : `docker-${image.id}`)}
                        onChange={() => handleSelectImage(image.id)}
                        aria-labelledby={`image-${image.id}`}
                      />
                    )}
                  </CommonTableCell>
                  <CommonTableCell>{image.project}</CommonTableCell>
                  <CommonTableCell>
                    <CommonChip 
                      label={image.type} 
                      size="small"
                      customStyles={{ 
                        backgroundColor: '#f0fdf4',
                        color: '#166534',
                        fontWeight: 500
                      }}
                    />
                  </CommonTableCell>
                  <CommonTableCell className="monospace-text">{image.imageName}</CommonTableCell>
                  <CommonTableCell className="monospace-text">{image.currentVersion}</CommonTableCell>
                  <CommonTableCell>
                    {loadingVersions[image.id] ? (
                      <div className="loading-cell">Loading...</div>
                    ) : image.latestVersion ? (
                      <span className="monospace-text">{image.latestVersion}</span>
                    ) : (
                      <CommonIconButton
                        size="small"
                        icon={<RefreshIcon fontSize="small" />}
                        onClick={() => checkVersion(image.id)}
                        title="Check version"
                      />
                    )}
                  </CommonTableCell>
                  <CommonTableCell>
                    <VersionStatusIndicator
                      currentVersion={image.currentVersion}
                      latestVersion={image.latestVersion}
                      isMajorUpgrade={isMajorVersionUpgrade(image.currentVersion, image.latestVersion)}
                    />
                  </CommonTableCell>
                </CommonTableRow>
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
