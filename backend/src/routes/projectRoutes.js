const express = require('express');
const projectController = require('../controllers/projectController');

const router = express.Router();

/**
 * @route   GET /api/projects
 * @desc    Get all projects
 * @access  Public
 */
router.get('/projects', projectController.getAllProjects);

/**
 * @route   GET /api/project/:projectName
 * @desc    Get a project by name
 * @access  Public
 */
router.get('/project/:projectName', projectController.getProjectByName);

module.exports = router;
