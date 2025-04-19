import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { usePackageContext } from '../context/PackageContext';
import FolderIcon from '@mui/icons-material/Folder';
import GitHubIcon from '@mui/icons-material/GitHub';
import { fetchProjects } from '../services/api';

const ProjectList = () => {
  const { selectedProject, setSelectedProject } = usePackageContext();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const projectsData = await fetchProjects();
        setProjects(projectsData || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <List sx={{ p: 0 }}>
      {projects.map(project => {
        const isRemote = !!project.remote;
        // Display only last two segments of remote URL
        const displayPath = isRemote
          ? project.remote.split('/').slice(-2).join('/')
          : project.path;
        return (
          <ListItem key={project.name} disablePadding>
            <ListItemButton
              selected={selectedProject === project.name}
              onClick={() => setSelectedProject(project.name)}
              sx={{
                py: 1.5,
                px: 2,
                '&.Mui-selected': {
                  backgroundColor: '#0F172A',
                  color: 'white',
                  '&:hover': { backgroundColor: '#1E293B' }
                },
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isRemote ? (
                    <GitHubIcon fontSize="small" sx={{ mr: 1, color: selectedProject === project.name ? 'white' : 'primary.main' }} />
                  ) : (
                    <FolderIcon fontSize="small" sx={{ mr: 1, color: selectedProject === project.name ? 'white' : 'primary.main' }} />
                  )}
                  <Typography variant="body1" sx={{ fontWeight: selectedProject === project.name ? 600 : 400, lineHeight: 1.2 }}>
                    {project.name}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: selectedProject === project.name ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                    fontSize: '0.7rem',
                    mt: 0.5,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '200px'
                  }}
                >
                  {displayPath}
                </Typography>
              </Box>
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};

export default ProjectList;