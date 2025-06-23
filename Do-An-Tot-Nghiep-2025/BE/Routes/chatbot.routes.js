const express = require('express');
const router = express.Router();
const chatbotController = require('../Controllers/chatbot.controller');

router.post('/send', chatbotController.handleMessage);
router.get('/history/:sessionId', chatbotController.getChatHistory);
router.delete('/history', chatbotController.deleteChatHistory);

module.exports = router;