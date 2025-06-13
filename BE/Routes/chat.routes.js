const express = require('express');
const router = express.Router();
const chatController = require('../Controllers/chat.controller');

// Public routes - no authentication required
router.post('/send', chatController.sendMessage);
router.get('/history', chatController.getChatHistory);
router.post('/intent', chatController.addNewIntent);
router.get('/start', chatController.startChat);

// Xóa lịch sử chat
router.delete('/clear', chatController.clearChatHistory);

module.exports = router; 