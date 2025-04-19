import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  Tooltip, 
  CircularProgress, 
  Checkbox, 
  IconButton, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { usePackageContext } from '../context/PackageContext';
import { isMajorVersionUpgrade } from '../utils/versionUtils';
import axios from 'axios';

const DockerImageTable = () => {
  const [dockerImages, setDockerImages] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  
  const { selectedProject, setSelectedPackages } = usePackageContext();
  
  // Fetch Docker images when the component mounts or when the selected project changes
  useEffect(() => {
    const fetchDockerImages = async () => {
      try {
        setLoading(true);
        console.log('Fetching Docker images...');
        // Use the correct API URL with the backend port
        const response = await axios.get('http://localhost:3001/api/docker/images');
        console.log('Docker images response:', response.data);
        
        // Ensure all Docker images have IDs prefixed with 'docker-'
        const formattedImages = (response.data || []).map(image => {
          const id = image.id.startsWith('docker-') ? image.id : `docker-${image.id}`;
          return { ...image, id, latestVersion: null };
        });
        
        setDockerImages(formattedImages);
        setError(null);
      } catch (err) {
        console.error('Error fetching Docker images:', err);
        console.error('Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: err.message
        });
        setError(err.response?.data?.message || err.message || 'Failed to load Docker images. Please try again.');
        setDockerImages([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDockerImages();
  }, [selectedProject]);
  
  // trigger version check on demand
  const checkVersion = async (imageId) => {
    try {
      setLoadingVersions(prev => ({ ...prev, [imageId]: true }));
      const res = await axios.get(`http://localhost:3001/api/docker/images/${imageId}/version`);
      const updated = res.data;
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
    // Ensure the ID is prefixed with 'docker-' to distinguish from NPM packages
    const prefixedId = imageId.startsWith('docker-') ? imageId : `docker-${imageId}`;
    
    setSelectedImages(prev => {
      if (prev.includes(prefixedId)) {
        // Remove from selection
        const newSelected = prev.filter(id => id !== prefixedId);
        // Update the context
        setSelectedPackages(newSelected);
        return newSelected;
      } else {
        // Add to selection
        const newSelected = [...prev, prefixedId];
        // Update the context
        setSelectedPackages(newSelected);
        return newSelected;
      }
    });
  };
  
  // Status cell component for Docker images
  const StatusCell = ({ image }) => {
    const isSameVersion = image.currentVersion === image.latestVersion;
    const isMajorUpgrade = !isSameVersion && 
                          isMajorVersionUpgrade(image.currentVersion, image.latestVersion);
    
    if (isSameVersion) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2" color="success.main">
            Up to date
          </Typography>
        </Box>
      );
    }
    
    if (isMajorUpgrade) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Major version upgrade may contain breaking changes">
            <WarningIcon color="warning" fontSize="small" sx={{ mr: 1 }} />
          </Tooltip>
          <Typography variant="body2" color="warning.main">
            Major upgrade
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <ErrorIcon color="error" fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="body2" color="error">
          Update available
        </Typography>
      </Box>
    );
  };

  // Version cell component (only fetches latestVersion on click)
  const VersionCell = React.memo(({ image, loadingVersions, onCheckVersion }) => {
    if (loadingVersions[image.id]) return <CircularProgress size={20} />;
    if (image.latestVersion) return image.latestVersion;
    return (
      <IconButton size="small" onClick={() => onCheckVersion(image.id)} title="Check version">
        <RefreshIcon fontSize="small" />
      </IconButton>
    );
  });

  // Image row component
  const ImageRow = React.memo(({ image, selectedImages, onSelect, loadingVersions, checkVersion }) => (
    <TableRow key={image.id} hover>
      <TableCell padding="checkbox">
        {image.currentVersion !== image.latestVersion && (
          <Checkbox
            checked={selectedImages.includes(image.id.startsWith('docker-') ? image.id : `docker-${image.id}`)}
            onChange={() => onSelect(image.id)}
            inputProps={{ 'aria-labelledby': `image-${image.id}` }}
          />
        )}
      </TableCell>
      <TableCell>{image.project}</TableCell>
      <TableCell>
        <Chip 
          label={image.type} 
          size="small"
          sx={{ 
            backgroundColor: image.type === 'frontend' ? '#e0f2fe' : '#f0fdf4',
            color: image.type === 'frontend' ? '#0369a1' : '#166534',
            fontWeight: 500
          }}
        />
      </TableCell>
      <TableCell sx={{ fontFamily: 'monospace' }}>{image.imageName}</TableCell>
      <TableCell sx={{ fontFamily: 'monospace' }}>{image.currentVersion}</TableCell>
      <TableCell>
        <VersionCell
          image={image}
          loadingVersions={loadingVersions}
          onCheckVersion={checkVersion}
        />
      </TableCell>
      <TableCell>
        <StatusCell image={image} />
      </TableCell>
    </TableRow>
  ));

  // Section Header component (mirrors PackageTable)
  const SectionHeader = React.memo(({ title, count, color }) => (
    <TableCell
      colSpan={7}
      sx={{ backgroundColor: color, color: 'white', fontWeight: 'bold', py: 1 }}
    >
      {title} ({count})
    </TableCell>
  ));

  // Filter options
  const FILTER_ALL = 'all';
  const FILTER_OUTDATED = 'outdated';

  // Section filter component
  const DockerImageFilter = React.memo(({ filter, onFilterChange, label }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <FilterListIcon sx={{ color: 'text.secondary' }} />
      <FormControl size="small">
        <InputLabel id={`${label}-filter-label`}>{label} Filter</InputLabel>
        <Select
          labelId={`${label}-filter-label`}
          value={filter}
          label={`${label} Filter`}
          onChange={e => onFilterChange(e.target.value)}
        >
          <MenuItem value={FILTER_ALL}>All</MenuItem>
          <MenuItem value={FILTER_OUTDATED}>Outdated</MenuItem>
        </Select>
      </FormControl>
    </Box>
  ));

  // section filters
  const [frontendFilter, setFrontendFilter] = useState(FILTER_ALL);
  const [serverFilter, setServerFilter] = useState(FILTER_ALL);

  // group by type
  const imagesByType = useMemo(() => (
    filteredImages.reduce((acc, img) => { acc[img.type] = acc[img.type] || []; acc[img.type].push(img); return acc; }, {})
  ), [filteredImages]);

  // apply section filters
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ mt: 2, p: 2, border: '1px solid #f5c2c7', borderRadius: 2, backgroundColor: '#f8d7da' }}>
        <Typography color="error.main" fontWeight={500}>Error Loading Docker Images</Typography>
        <Typography color="error.main" variant="body2">{error}</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          This may happen if you have remote repositories that haven't been cloned yet or if Dockerfiles are missing.
          Try refreshing the page or check your project configuration.
        </Typography>
      </Box>
    );
  }
  
  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table size="small" sx={{ '& .MuiTableCell-root': { borderBottom: '1px solid #e0e0e0' } }}>
        {/* Frontend Filter */}
        <TableHead>
          <TableRow>
            <TableCell colSpan={7} sx={{ p: 0, border: 'none' }}>
              {imagesByType.frontend?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <DockerImageFilter filter={frontendFilter} onFilterChange={setFrontendFilter} label="Frontend" />
                </Box>
              )}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {imagesByType.frontend?.length > 0 ? (
            <>
              <TableRow><SectionHeader title="Frontend Images" count={filteredFrontendImages.length} color="primary.main" /></TableRow>
              {filteredFrontendImages.map(img => <ImageRow key={img.id} image={img} selectedImages={selectedImages} onSelect={handleSelectImage} loadingVersions={loadingVersions} checkVersion={checkVersion} />)}
            </>
          ) : (
            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 2 }}><Typography color="text.secondary">No frontend images.</Typography></TableCell></TableRow>
          )}
        </TableBody>

        {/* Server Filter */}
        <TableHead>
          <TableRow>
            <TableCell colSpan={7} sx={{ p: 0, border: 'none' }}>
              {imagesByType.server?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <DockerImageFilter filter={serverFilter} onFilterChange={setServerFilter} label="Server" />
                </Box>
              )}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {imagesByType.server?.length > 0 ? (
            <>
              <TableRow><SectionHeader title="Server Images" count={filteredServerImages.length} color="secondary.main" /></TableRow>
              {filteredServerImages.map(img => <ImageRow key={img.id} image={img} selectedImages={selectedImages} onSelect={handleSelectImage} loadingVersions={loadingVersions} checkVersion={checkVersion} />)}
            </>
          ) : (
            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 2 }}><Typography color="text.secondary">No server images.</Typography></TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DockerImageTable;
