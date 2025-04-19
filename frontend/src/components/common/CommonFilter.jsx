import React from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

/**
 * Common filter component with select and filter icon
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Filter label
 * @param {string} props.value - Selected filter value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Filter options array of { value, label } objects
 * @param {Object} props.sx - Additional styles
 * @param {string} props.size - Select size ('small', 'medium')
 * @param {React.ReactNode} props.icon - Custom icon (defaults to FilterListIcon)
 */
const CommonFilter = ({
  label,
  value,
  onChange,
  options = [],
  sx = {},
  size = 'small',
  icon = <FilterListIcon />,
  ...restProps
}) => {
  const id = `${label.toLowerCase().replace(/\s+/g, '-')}-filter`;
  const labelId = `${id}-label`;

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2, 
      mb: 1,
      ...sx 
    }} {...restProps}>
      {icon && React.cloneElement(icon, { sx: { color: 'text.secondary' } })}
      
      <FormControl size={size} sx={{ minWidth: 180 }}>
        <InputLabel id={labelId}>{label}</InputLabel>
        <Select
          labelId={labelId}
          id={id}
          value={value}
          label={label}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default CommonFilter;
