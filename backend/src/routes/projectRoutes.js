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

/**
 * @route   GET /api/project/:projectName/check-updates
 * @desc    Pull latest changes from main branch
 * @access  Public
 */
router.get('/project/:projectName/check-updates', projectController.checkForUpdates);

/**
 * @route   POST /api/project/:projectName/commit-fix
 * @desc    Commit package fixes to a new branch
 * @access  Public
 */
router.post('/project/:projectName/commit-fix', projectController.commitPackageFix);

module.exports = router;
