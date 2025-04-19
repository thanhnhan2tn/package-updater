import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { usePackageContext } from '../context/PackageContext';

const ProjectList = () => {
  const { packagesByProject, selectedProject, setSelectedProject } = usePackageContext();

  return (
    <List sx={{ p: 0 }}>
      {Object.keys(packagesByProject).map((project) => (
        <ListItem key={project} disablePadding>
          <ListItemButton
            selected={selectedProject === project}
            onClick={() => setSelectedProject(project)}
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
            <ListItemText 
              primary={project}
              primaryTypographyProps={{
                fontWeight: selectedProject === project ? 600 : 400,
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default ProjectList;