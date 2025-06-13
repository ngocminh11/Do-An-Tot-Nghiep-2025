const express = require('express');
const router = express.Router();
const tagController = require('../Controllers/tag.controller');

// Public routes
router.get('/', tagController.getAllTags);
router.get('/:id', tagController.getTagById);

module.exports = router; 