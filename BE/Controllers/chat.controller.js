const Chat = require('../Models/chat.model');
const chatbotService = require('../Services/chatbot.service');
const { v4: uuidv4 } = require('uuid');
const logger = require('../Utils/logger');

const chatController = {
    // Start new chat session
    async startChat(req, res) {
        try {
            const chatId = uuidv4();
            logger.logToCSV('start', {
                chatId,
                message: 'Chat started',
                response: 'Welcome message',
                intent: 'greeting',
                score: 1
            });

            res.status(200).json({
                success: true,
                chatId,
                message: 'Xin chào! Tôi là trợ lý ảo của CoCoo 🌸. Tôi có thể giúp bạn về chăm sóc da, thành phần, quy trình và sản phẩm. Bạn quan tâm điều gì trước tiên?'
            });
        } catch (error) {
            console.error('Error in startChat:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể khởi tạo chat. Vui lòng thử lại sau.'
            });
        }
    },

    // Send message - completely public, no auth required
    async sendMessage(req, res) {
        try {
            const { chatId, message } = req.body;

            if (!message) {
                return res.status(400).json({
                    success: false,
                    error: 'Vui lòng nhập tin nhắn'
                });
            }

            const response = await chatbotService.processMessage(message);

            logger.logToCSV('message', {
                chatId,
                message,
                response: response.message,
                intent: response.intent,
                score: response.score
            });

            res.status(200).json({
                success: true,
                message: response.message,
                intent: response.intent,
                score: response.score
            });
        } catch (error) {
            console.error('Error in sendMessage:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể xử lý tin nhắn. Vui lòng thử lại sau.'
            });
        }
    },

    // Get chat history - public access
    async getChatHistory(req, res) {
        try {
            const { chatId } = req.params;
            // TODO: Implement chat history retrieval from database
            res.status(200).json({
                success: true,
                messages: []
            });
        } catch (error) {
            console.error('Error in getChatHistory:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể lấy lịch sử chat. Vui lòng thử lại sau.'
            });
        }
    },

    // Mark messages as read - public access
    async markAsRead(req, res) {
        try {
            const result = await Chat.updateMany(
                { isRead: false },
                { $set: { isRead: true } }
            );

            res.json({
                success: true,
                message: 'Đã đánh dấu tin nhắn đã đọc',
                updatedCount: result.modifiedCount
            });
        } catch (error) {
            console.error('Error in markAsRead:', error);
            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi đánh dấu tin nhắn đã đọc',
                error: error.message
            });
        }
    },

    // Add new intent - public access
    async addNewIntent(req, res) {
        try {
            const { question, answer, intent } = req.body;

            if (!question || !answer || !intent) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields'
                });
            }

            const success = await chatbotService.addNewIntent(question, answer, intent);

            if (success) {
                res.json({
                    success: true,
                    message: 'Added new intent successfully'
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'Failed to add new intent'
                });
            }
        } catch (error) {
            console.error('Error in addNewIntent:', error);
            res.status(500).json({
                success: false,
                error: 'Error adding new intent'
            });
        }
    },

    // Clear chat history
    async clearChatHistory(req, res) {
        try {
            const { chatId } = req.params;
            // TODO: Implement chat history clearing from database
            res.status(200).json({
                success: true,
                message: 'Đã xóa lịch sử chat'
            });
        } catch (error) {
            console.error('Error in clearChatHistory:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể xóa lịch sử chat. Vui lòng thử lại sau.'
            });
        }
    }
};

module.exports = chatController; 