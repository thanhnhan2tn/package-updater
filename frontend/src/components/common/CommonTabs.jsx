import React from 'react';
import { Tabs, Tab } from '@mui/material';

/**
 * CommonTabs wraps MUI Tabs with default styling.
 * @param props - Tabs props
 */
export const CommonTabs = ({ sx = {}, ...props }) => (
  <Tabs
    {...props}
    sx={{
      '& .MuiTabs-indicator': { backgroundColor: '#0F172A' },
      '& .Mui-selected': { color: '#0F172A !important', fontWeight: 600 },
      ...sx,
    }}
  />
);

/**
 * CommonTab wraps MUI Tab for consistency.
 * @param props - Tab props
 */
export const CommonTab = (props) => <Tab {...props} />;
