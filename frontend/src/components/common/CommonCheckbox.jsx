import React from 'react';
import { Checkbox, Box } from '@mui/material';

/**
 * Common checkbox component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.checked - Whether checkbox is checked
 * @param {Function} props.onChange - Change handler
 * @param {string} props.label - Optional label (aria-label if no visible label)
 * @param {string} props.color - Checkbox color ('primary', 'secondary', etc)
 * @param {string} props.size - Checkbox size ('small', 'medium')
 * @param {boolean} props.disabled - Whether checkbox is disabled
 */
const CommonCheckbox = ({
  checked,
  onChange,
  label,
  color = 'primary',
  size = 'medium',
  disabled = false,
  ...restProps
}) => (
  <Checkbox
    checked={checked}
    onChange={onChange}
    color={color}
    size={size}
    disabled={disabled}
    inputProps={{ 'aria-label': label }}
    {...restProps}
  />
);

/**
 * Common checkbox with a label
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.checked - Whether checkbox is checked
 * @param {Function} props.onChange - Change handler
 * @param {React.ReactNode} props.label - Label component
 * @param {string} props.color - Checkbox color ('primary', 'secondary', etc)
 * @param {string} props.size - Checkbox size ('small', 'medium')
 * @param {boolean} props.disabled - Whether checkbox is disabled
 */
export const LabeledCheckbox = ({
  checked,
  onChange,
  label,
  color = 'primary',
  size = 'medium',
  disabled = false,
  labelProps = {},
  ...restProps
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <CommonCheckbox
      checked={checked}
      onChange={onChange}
      color={color}
      size={size}
      disabled={disabled}
      {...restProps}
    />
    <Box 
      component="span" 
      onClick={() => !disabled && onChange({ target: { checked: !checked } })}
      sx={{ 
        cursor: disabled ? 'default' : 'pointer',
        userSelect: 'none', 
        ...labelProps 
      }}
    >
      {label}
    </Box>
  </Box>
);

export default CommonCheckbox;
