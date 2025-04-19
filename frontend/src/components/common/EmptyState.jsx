import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Empty state component to display when there's no content
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Primary message to display
 * @param {React.ReactNode} props.icon - Optional icon to display above message
 * @param {Array} props.details - Optional array of detail messages
 * @param {Object} props.sx - Additional styles
 */
const EmptyState = ({
  message,
  icon,
  details = [],
  sx = {},
  ...restProps
}) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      p: 3,
      ...sx
    }}
    {...restProps}
  >
    {icon && (
      <Box sx={{ mb: 2, color: 'text.secondary' }}>
        {icon}
      </Box>
    )}
    
    <Typography variant="body1" color="text.secondary">
      {message}
    </Typography>
    
    {details.length > 0 && (
      <Box component="ul" sx={{ textAlign: 'left', display: 'inline-block', mt: 1 }}>
        {details.map((detail, index) => (
          <Typography key={index} component="li" variant="body2" color="text.secondary">
            {detail}
          </Typography>
        ))}
      </Box>
    )}
  </Box>
);

export default EmptyState;
