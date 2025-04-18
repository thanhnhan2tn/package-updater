import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Checkbox,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { usePackageContext } from '../context/PackageContext';
import PackageTable from './PackageTable';

// Project header component
const ProjectHeader = ({ project, packages, selectedPackages, checkAllInProject }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
    <Checkbox
      checked={packages.every(pkg => selectedPackages.includes(pkg.id))}
      indeterminate={
        packages.some(pkg => selectedPackages.includes(pkg.id)) &&
        !packages.every(pkg => selectedPackages.includes(pkg.id))
      }
      onChange={(e) => checkAllInProject(project, e.target.checked)}
      onClick={(e) => e.stopPropagation()}
    />
    <Typography sx={{ ml: 1 }}>{project}</Typography>
  </Box>
);

// Main component
const ProjectAccordion = ({ project, packages }) => {
  const { selectedPackages, checkAllInProject } = usePackageContext();

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <ProjectHeader 
          project={project}
          packages={packages}
          selectedPackages={selectedPackages}
          checkAllInProject={checkAllInProject}
        />
      </AccordionSummary>
      <AccordionDetails>
        <PackageTable packages={packages} />
      </AccordionDetails>
    </Accordion>
  );
};

export default ProjectAccordion; 