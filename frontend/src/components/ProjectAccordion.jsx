import React, { useMemo } from 'react';
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
import { usePackageOperations } from '../hooks/usePackageOperations';
import PackageTable from './PackageTable';

// Project header component
const ProjectHeader = React.memo(({ project, packages, selectedPackages, onProjectSelect }) => {
  // Calculate if all packages are selected
  const allSelected = useMemo(() => {
    return packages.every(pkg => selectedPackages.includes(pkg.id));
  }, [packages, selectedPackages]);

  // Calculate if some packages are selected
  const someSelected = useMemo(() => {
    return packages.some(pkg => selectedPackages.includes(pkg.id)) && !allSelected;
  }, [packages, selectedPackages, allSelected]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Checkbox
        checked={allSelected}
        indeterminate={someSelected}
        onChange={(e) => onProjectSelect(project, e.target.checked)}
        onClick={(e) => e.stopPropagation()}
      />
      <Typography sx={{ ml: 1 }}>{project}</Typography>
    </Box>
  );
});

// Main component
const ProjectAccordion = React.memo(({ project, packages }) => {
  const { selectedPackages } = usePackageContext();
  const { handleProjectSelect } = usePackageOperations();

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <ProjectHeader 
          project={project}
          packages={packages}
          selectedPackages={selectedPackages}
          onProjectSelect={handleProjectSelect}
        />
      </AccordionSummary>
      <AccordionDetails>
        <PackageTable packages={packages} />
      </AccordionDetails>
    </Accordion>
  );
});

export default ProjectAccordion; 