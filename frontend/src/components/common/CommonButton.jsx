import React from 'react';
import { Button, CircularProgress } from '@mui/material';

/**
 * Common button component with loading state
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant ('contained', 'outlined', 'text')
 * @param {string} props.color - Button color ('primary', 'secondary', 'error', etc)
 * @param {string} props.size - Button size ('small', 'medium', 'large')
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {boolean} props.loading - Whether to show a loading spinner
 * @param {React.ReactNode} props.startIcon - Icon to show at the start of the button
 * @param {React.ReactNode} props.children - Button text or content
 * @param {Function} props.onClick - Click handler
 */
const CommonButton = ({
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  startIcon,
  children,
  onClick,
  ...restProps
}) => (
  <Button
    variant={variant}
    color={color}
    size={size}
    disabled={disabled || loading}
    startIcon={loading ? null : startIcon}
    onClick={onClick}
    {...restProps}
  >
    {loading ? (
      <>
        <CircularProgress 
          size={size === 'small' ? 16 : 20} 
          color="inherit" 
          sx={{ mr: children ? 1 : 0 }} 
        />
        {children}
      </>
    ) : (
      children
    )}
  </Button>
);

export default CommonButton;
