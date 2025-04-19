import React from 'react';
import { Box } from '@mui/material';

/**
 * CommonContainer applies consistent padding and flex layout.
 * @param {Object} props - Component props
 * @param {Object} props.sx - Additional MUI style overrides
 */
const CommonContainer = ({ children, sx = {}, ...rest }) => (
  <Box
    sx={{ p: 2, flex: 1, ...sx }}
    {...rest}
  >
    {children}
  </Box>
);

export default CommonContainer;
