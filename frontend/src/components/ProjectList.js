import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  Typography,
  Box
} from '@mui/material';
import { usePackageContext } from '../context/PackageContext';
import FolderIcon from '@mui/icons-material/Folder';

const ProjectList = () => {
  const { packagesByProject, selectedProject, setSelectedProject } = usePackageContext();

  // Get project details from the first package in each project
  const projectDetails = Object.keys(packagesByProject).map(projectKey => {
    const packages = packagesByProject[projectKey];
    const frontendPackage = packages.find(pkg => pkg.type === 'frontend');
    const serverPackage = packages.find(pkg => pkg.type === 'server');
    
    return {
      id: projectKey,
      name: projectKey,
      frontendPath: frontendPackage ? './project1/frontend/package.json' : null,
      serverPath: serverPackage ? './project1/server/package.json' : null
    };
  });

  return (
    <List sx={{ p: 0 }}>
      {projectDetails.map((project) => (
        <ListItem key={project.id} disablePadding>
          <ListItemButton
            selected={selectedProject === project.id}
            onClick={() => setSelectedProject(project.id)}
            sx={{
              py: 1.5,
              px: 2,
              '&.Mui-selected': {
                backgroundColor: '#0F172A',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#1E293B',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FolderIcon 
                  fontSize="small" 
                  sx={{ 
                    mr: 1, 
                    color: selectedProject === project.id ? 'white' : 'primary.main'
                  }} 
                />
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: selectedProject === project.id ? 600 : 400,
                    lineHeight: 1.2
                  }}
                >
                  {project.name}
                </Typography>
              </Box>
              
              {project.frontendPath && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: selectedProject === project.id ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                    fontSize: '0.7rem',
                    mt: 0.5,
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '200px'
                  }}
                >
                  Frontend: {project.frontendPath}
                </Typography>
              )}
              
              {project.serverPath && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: selectedProject === project.id ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                    fontSize: '0.7rem',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '200px'
                  }}
                >
                  Server: {project.serverPath}
                </Typography>
              )}
            </Box>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default ProjectList;