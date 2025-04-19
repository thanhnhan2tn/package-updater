import React from 'react';
import { IconButton, CircularProgress } from '@mui/material';

/**
 * Common icon button component with loading state
 * @param {Object} props - Component props
 * @param {string} props.color - Button color ('primary', 'secondary', 'error', etc)
 * @param {string} props.size - Button size ('small', 'medium', 'large')
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {boolean} props.loading - Whether to show a loading spinner
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.title - Tooltip text
 * @param {Function} props.onClick - Click handler
 */
const CommonIconButton = ({
  color = 'default',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  title,
  onClick,
  ...restProps
}) => (
  <IconButton
    color={color}
    size={size}
    disabled={disabled || loading}
    onClick={onClick}
    title={title}
    aria-label={title}
    {...restProps}
  >
    {loading ? <CircularProgress size={size === 'small' ? 16 : 24} color="inherit" /> : icon}
  </IconButton>
);

export default CommonIconButton;
