import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Chip,
  Box,
  Checkbox,
  Tooltip,
  Button
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import StarIcon from '@mui/icons-material/Star';
import { usePackageContext } from '../context/PackageContext';
import { UpOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { packagesToFollow } from '../config/packagesToFollow';

// Package status indicator component
const PackageStatus = ({ currentVersion, latestVersion }) => {
  if (!latestVersion) return null;
  
  const isUpToDate = currentVersion === latestVersion;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {isUpToDate ? (
        <Tooltip title="Up to date">
          <CheckCircleIcon color="success" />
        </Tooltip>
      ) : (
        <Tooltip title="Update available">
          <ErrorIcon color="error" />
        </Tooltip>
      )}
    </Box>
  );
};

// Package version cell component
const PackageVersionCell = ({ pkg, loadingVersions, loadPackageVersion, refreshVersion }) => {
  if (loadingVersions[pkg.id]) {
    return <CircularProgress size={20} />;
  }
  
  if (pkg.latestVersion) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {pkg.latestVersion}
        <IconButton 
          size="small" 
          onClick={() => refreshVersion(pkg.id)}
          title="Refresh version"
        >
          <RefreshIcon />
        </IconButton>
      </Box>
    );
  }
  
  return (
    <IconButton 
      size="small" 
      onClick={() => loadPackageVersion(pkg.id)}
      title="Check version"
    >
      <RefreshIcon />
    </IconButton>
  );
};

const PackageTable = () => {
  const { packages, loading, error, refreshPackages } = usePackageContext();
  const [followedPackages, setFollowedPackages] = useState([]);

  useEffect(() => {
    const loadFollowedPackages = async () => {
      const followed = await Promise.all(
        packagesToFollow.map(async (pkg) => {
          try {
            const response = await fetch(`/api/package-version/${pkg.id}`);
            if (!response.ok) throw new Error(`Failed to fetch ${pkg.id}`);
            const data = await response.json();
            return { ...pkg, ...data };
          } catch (err) {
            console.error(`Error loading ${pkg.id}:`, err);
            return null;
          }
        })
      );
      setFollowedPackages(followed.filter(Boolean));
    };

    if (packages.length > 0) {
      loadFollowedPackages();
    }
  }, [packages]);

  const handleUpgrade = async (packageName, projectPath, type) => {
    try {
      const response = await fetch('/api/upgrade-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageName, projectPath, type }),
      });

      if (!response.ok) {
        throw new Error('Failed to upgrade package');
      }

      message.success(`Successfully upgraded ${packageName}`);
      refreshPackages();
    } catch (err) {
      message.error(`Failed to upgrade ${packageName}: ${err.message}`);
    }
  };

  const columns = [
    {
      title: 'Package Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        const isFollowed = packagesToFollow.includes(record.id);
        return (
          <Tooltip title={isFollowed ? 'This package is being followed' : ''}>
            <span style={{ fontWeight: isFollowed ? 'bold' : 'normal' }}>
              {text}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Current Version',
      dataIndex: 'currentVersion',
      key: 'currentVersion',
    },
    {
      title: 'Latest Version',
      dataIndex: 'latestVersion',
      key: 'latestVersion',
      render: (text, record) => {
        const isOutdated = text && record.currentVersion !== text;
        return (
          <span style={{ color: isOutdated ? 'red' : 'green' }}>
            {text || 'Loading...'}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isOutdated = record.latestVersion && record.currentVersion !== record.latestVersion;
        return (
          <Button
            type="primary"
            disabled={!isOutdated}
            onClick={() => handleUpgrade(record.name, record.projectPath, record.type)}
          >
            Upgrade
          </Button>
        );
      },
    },
  ];

  if (error) {
    return <div>Error loading packages: {error}</div>;
  }

  return (
    <div>
      {followedPackages.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3>Followed Packages</h3>
          <Table
            dataSource={followedPackages}
            columns={columns}
            rowKey="id"
            pagination={false}
            loading={loading}
          />
        </div>
      )}
      <Table
        dataSource={packages}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default PackageTable; 