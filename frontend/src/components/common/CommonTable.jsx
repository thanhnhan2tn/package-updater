import React from 'react';
import { 
  Table, 
  TableContainer, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  Paper
} from '@mui/material';

/**
 * Common table container component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Table content
 * @param {Object} props.sx - MUI sx prop for custom styling
 */
export const CommonTableContainer = ({ children, sx = {}, ...restProps }) => (
  <TableContainer 
    component={Paper} 
    sx={{ 
      borderRadius: 2, 
      boxShadow: 1,
      ...sx 
    }} 
    {...restProps}
  >
    {children}
  </TableContainer>
);

/**
 * Common table component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Table content
 * @param {string} props.size - Table size ('small', 'medium')
 * @param {Object} props.sx - MUI sx prop for custom styling
 */
export const CommonTable = ({ children, size = 'medium', sx = {}, ...restProps }) => (
  <Table size={size} sx={sx} {...restProps}>
    {children}
  </Table>
);

/**
 * Common table header component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Table header content
 */
export const CommonTableHead = ({ children, ...restProps }) => (
  <TableHead {...restProps}>{children}</TableHead>
);

/**
 * Common table body component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Table body content
 */
export const CommonTableBody = ({ children, ...restProps }) => (
  <TableBody {...restProps}>{children}</TableBody>
);

/**
 * Common table row component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Table row content
 * @param {boolean} props.hover - Whether to show hover effect
 */
export const CommonTableRow = ({ children, hover = true, ...restProps }) => (
  <TableRow hover={hover} {...restProps}>{children}</TableRow>
);

/**
 * Common table cell component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Table cell content
 * @param {string} props.align - Text alignment ('left', 'center', 'right')
 * @param {number} props.colSpan - Number of columns to span
 */
export const CommonTableCell = ({ 
  children, 
  align = 'left', 
  colSpan = 1,
  ...restProps 
}) => (
  <TableCell align={align} colSpan={colSpan} {...restProps}>
    {children}
  </TableCell>
);

/**
 * Common section header component for tables
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @param {number} props.count - Item count
 * @param {string} props.color - Background color
 * @param {number} props.colSpan - Number of columns to span
 */
export const CommonSectionHeader = ({ 
  title, 
  count, 
  color = 'primary.main', 
  colSpan = 7,
  ...restProps 
}) => (
  <TableCell
    colSpan={colSpan}
    sx={{
      backgroundColor: color,
      color: 'white',
      fontWeight: 'bold',
      py: 1,
    }}
    {...restProps}
  >
    {title} ({count})
  </TableCell>
);
