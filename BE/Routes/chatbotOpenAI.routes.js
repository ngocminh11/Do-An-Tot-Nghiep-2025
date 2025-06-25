const express = require('express');
const router = express.Router();
const chatbotController = require('../Controllers/chatbotOpenAI.controller');

// Chatbot OpenAI: Nhận message từ user, trả về reply từ AI (và gợi ý sản phẩm nếu có)
router.post('/ask', chatbotController.ask);

module.exports = router; 