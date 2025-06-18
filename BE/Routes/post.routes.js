const express = require('express');
const router = express.Router();
const postController = require('../Controllers/post.controller');

// Public routes
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);

module.exports = router; 