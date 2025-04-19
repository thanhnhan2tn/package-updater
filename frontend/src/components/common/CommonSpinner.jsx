import React from 'react';
import { CircularProgress, Box } from '@mui/material';

/**
 * Common spinner component for loading states
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Spinner size ('small', 'medium', 'large', or pixel value number)
 * @param {string} props.color - Spinner color ('primary', 'secondary', etc)
 * @param {string} props.thickness - Spinner thickness
 * @param {Object} props.sx - Additional styles
 */
export const CommonSpinner = ({
  size = 'medium',
  color = 'primary',
  thickness = 3.6,
  sx = {},
  ...restProps
}) => {
  // Map size names to pixel values
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 40
  };
  
  const pixelSize = sizeMap[size] || size;

  return (
    <CircularProgress
      size={pixelSize}
      color={color}
      thickness={thickness}
      sx={sx}
      {...restProps}
    />
  );
};

/**
 * Loading container that shows a centered spinner with optional text
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Optional text or content to display below spinner
 * @param {string} props.size - Spinner size
 * @param {string} props.color - Spinner color
 * @param {Object} props.sx - Additional styles for container
 */
export const LoadingContainer = ({
  children,
  size = 'large',
  color = 'primary',
  sx = {},
  ...restProps
}) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        p: 3,
        ...sx
      }}
      {...restProps}
    >
      <CommonSpinner size={size} color={color} sx={{ mb: children ? 2 : 0 }} />
      {children}
    </Box>
  );
};

export default CommonSpinner;
