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

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
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
      </AccordionSummary>
      <AccordionDetails>
        <PackageTable packages={packages} />
      </AccordionDetails>
    </Accordion>
  );
};

export default ProjectAccordion; 