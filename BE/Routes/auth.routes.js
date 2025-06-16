const express = require('express');
const router = express.Router();
const authController = require('../Controllers/auth.controller');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/verify-token', authController.verifyToken);

module.exports = router; 