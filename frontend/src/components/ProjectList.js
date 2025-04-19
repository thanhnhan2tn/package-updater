import React from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { usePackageContext } from '../context/PackageContext';

const ProjectList = () => {
  const { packagesByProject, selectedProject, setSelectedProject } = usePackageContext();

  return (
    <>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Projects
      </Typography>
      <List sx={{ mt: 2 }}>
        {Object.keys(packagesByProject).map((project) => (
          <ListItem key={project} disablePadding>
            <ListItemButton
              selected={selectedProject === project}
              onClick={() => setSelectedProject(project)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
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
    </>
  );
};

export default ProjectList; 