const express = require('express');
const packageController = require('../controllers/packageController');

const router = express.Router();

/**
 * @route   GET /api/packages
 * @desc    Get all packages
 * @access  Public
 */
router.get('/packages', packageController.getAllPackages);

/**
 * @route   GET /api/package-version
 * @desc    Get version information for a specific package within a project
 * @access  Public
 */
router.get('/package-version', packageController.getPackageVersion);

/**
 * @route   GET /api/dependencies
 * @desc    Get all dependencies with version information
 * @access  Public
 */
router.get('/dependencies', packageController.getAllDependencies);

/**
 * @route   POST /api/upgrade
 * @desc    Upgrade a package
 * @access  Public
 */
router.post('/upgrade', packageController.upgradePackage);

module.exports = router; 