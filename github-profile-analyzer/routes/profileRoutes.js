const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const {
  validateUsername,
  validateId,
  validatePagination
} = require('../middleware/validation');

// Endpoint to analyze, fetch, and save/update GitHub profile statistics
router.get('/analyze/:username', validateUsername, profileController.analyzeProfile);

// Endpoint to get all analyzed profiles (supporting search and pagination)
router.get('/profiles', validatePagination, profileController.getProfiles);

// Endpoint to fetch a single profile by username
router.get('/profiles/username/:username', validateUsername, profileController.getProfileByUsername);

// Endpoint to fetch a single profile by database ID
router.get('/profiles/:id', validateId, profileController.getProfileById);

// Endpoint to delete a stored profile by database ID
router.delete('/profiles/:id', validateId, profileController.deleteProfile);

module.exports = router;
