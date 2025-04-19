import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

/**
 * Status indicator component for showing various statuses with appropriate icon
 * 
 * @param {Object} props - Component props
 * @param {string} props.status - Status type ('success', 'warning', 'error')
 * @param {string} props.text - Text to display next to icon
 * @param {string} props.size - Icon size ('small', 'medium', 'large')
 * @param {string} props.tooltip - Optional tooltip text
 */
const StatusIndicator = ({
  status = 'success',
  text,
  size = 'small',
  tooltip,
  ...restProps
}) => {
  const iconMap = {
    success: <CheckCircleIcon color="success" fontSize={size} />,
    warning: <WarningIcon color="warning" fontSize={size} />,
    error: <ErrorIcon color="error" fontSize={size} />
  };

  const icon = iconMap[status] || iconMap.success;
  
  const content = (
    <Box sx={{ display: 'flex', alignItems: 'center' }} {...restProps}>
      {icon}
      {text && (
        <Typography 
          variant="body2" 
          sx={{ ml: 1 }} 
          color={`${status}.main`}
        >
          {text}
        </Typography>
      )}
    </Box>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {content}
      </Tooltip>
    );
  }

  return content;
};

/**
 * Version status indicator specifically for showing version comparison status
 * 
 * @param {Object} props - Component props
 * @param {string} props.currentVersion - Current version
 * @param {string} props.latestVersion - Latest version
 * @param {boolean} props.isMajorUpgrade - Whether upgrade is major
 */
export const VersionStatusIndicator = ({
  currentVersion,
  latestVersion,
  isMajorUpgrade = false,
  ...restProps
}) => {
  // If versions are the same, show success
  if (currentVersion === latestVersion) {
    return (
      <StatusIndicator 
        status="success" 
        text="Up to date"
        tooltip="Current version matches the latest version"
        {...restProps}
      />
    );
  }
  
  // If major upgrade, show warning
  if (isMajorUpgrade) {
    return (
      <StatusIndicator 
        status="warning" 
        text="Major upgrade"
        tooltip="This upgrade may include breaking changes"
        {...restProps}
      />
    );
  }
  
  // Otherwise show regular update
  return (
    <StatusIndicator 
      status="error" 
      text="Update available"
      tooltip={`Update from ${currentVersion} to ${latestVersion}`}
      {...restProps}
    />
  );
};

export default StatusIndicator;
