import React from 'react';
import { TableRow } from '@mui/material';

/**
 * CommonTableRow wraps MUI TableRow to include hover and consistent styling
 */
const CommonTableRow = ({ children, sx, ...props }) => (
  <TableRow hover sx={{ '&:hover': { backgroundColor: 'action.hover' }, ...sx }} {...props}>
    {children}
  </TableRow>
);

export default CommonTableRow;
