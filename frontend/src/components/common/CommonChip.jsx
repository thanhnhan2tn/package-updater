import React from 'react';
import { Chip } from '@mui/material';

/**
 * Common chip component for tags, status indicators, etc.
 * @param {Object} props - Component props
 * @param {string} props.label - Chip label text
 * @param {string} props.color - Chip color ('primary', 'secondary', 'error', etc.)
 * @param {string} props.size - Chip size ('small', 'medium')
 * @param {string} props.variant - Chip variant ('filled', 'outlined')
 * @param {string} props.title - Tooltip text
 * @param {Object} props.customStyles - Additional custom styles
 */
const CommonChip = ({
  label,
  color = 'default',
  size = 'small',
  variant = 'filled',
  title,
  customStyles = {},
  ...restProps
}) => (
  <Chip
    label={label}
    color={color}
    size={size}
    variant={variant}
    title={title}
    sx={{
      ...customStyles
    }}
    {...restProps}
  />
);

export default CommonChip;
