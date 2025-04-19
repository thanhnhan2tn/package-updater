import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Section header component for page sections
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @param {React.ReactNode} props.action - Optional action component (button, etc)
 * @param {Object} props.sx - Additional styles
 */
const SectionHeader = ({
  title,
  action,
  sx = {},
  ...restProps
}) => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      mb: 2,
      ...sx
    }}
    {...restProps}
  >
    <Typography variant="h6" component="h2" fontWeight={600}>
      {title}
    </Typography>
    
    {action && (
      <Box>
        {action}
      </Box>
    )}
  </Box>
);

export default SectionHeader;
