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
  TextField,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Checkbox
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { usePackageContext } from '../context/PackageContext';
import { isMajorVersionUpgrade } from '../utils/versionUtils';
import axios from 'axios';

const DockerImageTable = () => {
  const [dockerImages, setDockerImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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
          if (!image.id.startsWith('docker-')) {
            return { ...image, id: `docker-${image.id}` };
          }
          return image;
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
  
  // Filter images by search term and selected project
  const filteredImages = useMemo(() => {
    return dockerImages.filter(image => {
      const matchesSearch = 
        image.imageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.currentVersion.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProject = !selectedProject || image.project === selectedProject;
      
      return matchesSearch && matchesProject;
    });
  }, [dockerImages, searchTerm, selectedProject]);
  
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
  
  // Handle select all images
  const handleSelectAllImages = (event) => {
    if (event.target.checked) {
      const newSelectedIds = filteredImages
        .filter(image => image.currentVersion !== image.latestVersion)
        .map(image => {
          // Ensure the ID is prefixed with 'docker-'
          return image.id.startsWith('docker-') ? image.id : `docker-${image.id}`;
        });
      setSelectedImages(newSelectedIds);
      setSelectedPackages(newSelectedIds);
    } else {
      setSelectedImages([]);
      setSelectedPackages([]);
    }
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
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2" fontWeight={600}>
          Docker Images
        </Typography>
        
        <TextField
          placeholder="Search images..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: '250px' }}
        />
      </Box>
      
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedImages.length > 0 && 
                    selectedImages.length < filteredImages.filter(img => img.currentVersion !== img.latestVersion).length
                  }
                  checked={
                    filteredImages.length > 0 && 
                    selectedImages.length === filteredImages.filter(img => img.currentVersion !== img.latestVersion).length
                  }
                  onChange={handleSelectAllImages}
                  inputProps={{ 'aria-label': 'select all images' }}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Image Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Current Version</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Latest Version</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredImages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No Docker images found. This could be because:
                  </Typography>
                  <Box component="ul" sx={{ textAlign: 'left', display: 'inline-block', mt: 1 }}>
                    <Typography component="li" variant="body2" color="text.secondary">
                      No Dockerfiles are defined in your projects
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                      Dockerfiles don't have valid FROM instructions
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                      Remote repositories haven't been cloned yet
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredImages.map((image) => {
                const needsUpgrade = image.currentVersion !== image.latestVersion;
                
                return (
                  <TableRow key={image.id} hover>
                    <TableCell padding="checkbox">
                      {needsUpgrade && (
                        <Checkbox
                          checked={selectedImages.includes(image.id.startsWith('docker-') ? image.id : `docker-${image.id}`)}
                          onChange={() => handleSelectImage(image.id)}
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
                    <TableCell sx={{ fontFamily: 'monospace' }}>{image.latestVersion}</TableCell>
                    <TableCell>
                      <StatusCell image={image} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DockerImageTable;
