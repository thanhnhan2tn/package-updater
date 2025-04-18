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

const ProjectAccordion = ({ project, packages }) => {
  const { selectedPackages, checkAllInProject } = usePackageContext();
  
  // Check if all packages in this project are selected
  const allSelected = packages.every(pkg => selectedPackages.includes(pkg.id));
  
  // Check if some packages in this project are selected
  const someSelected = packages.some(pkg => selectedPackages.includes(pkg.id)) && !allSelected;

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={(e) => checkAllInProject(project, e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          />
          <Typography sx={{ ml: 1 }}>{project}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <PackageTable packages={packages} />
      </AccordionDetails>
    </Accordion>
  );
};

export default ProjectAccordion; 