const express = require('express');
const dockerController = require('../controllers/dockerController');

const router = express.Router();

/**
 * @route   GET /api/docker/images
 * @desc    Get all Docker images
 * @access  Public
 */
router.get('/images', dockerController.getAllImages);

/**
 * @route   GET /api/docker/image/:projectName/:type
 * @desc    Get Docker image info for a specific project and type
 * @access  Public
 */
router.get('/image/:projectName/:type', dockerController.getImageInfo);

/**
 * @route   POST /api/docker/upgrade/:projectName
 * @desc    Upgrade a Docker image
 * @access  Public
 */
router.post('/upgrade/:projectName', dockerController.upgradeImage);

module.exports = router;
