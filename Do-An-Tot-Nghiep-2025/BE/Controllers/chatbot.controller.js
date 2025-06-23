const { v4: uuidv4 } = require('uuid');
const ChatHistory = require('../Models/chat.model');
const { generateResponse } = require('../Services/openaiService');

exports.handleMessage = async (req, res) => {
    let { sessionId, message } = req.body;
    if (!sessionId) sessionId = uuidv4();
    if (!message) return res.status(400).json({ error: 'Thiếu nội dung tin nhắn' });
    try {
        // Lấy hoặc tạo lịch sử chat
        let chatHistory = await ChatHistory.findOne({ sessionId });
        if (!chatHistory) {
            chatHistory = new ChatHistory({ sessionId, messages: [] });
        }

        // Thêm tin nhắn người dùng
        chatHistory.messages.push({ role: 'user', content: message });

        // Tạo prompt cho AI (chỉ gửi 5 tin nhắn gần nhất)
        const recentMessages = chatHistory.messages.slice(-5);

        // Gọi OpenAI
        const aiResponse = await generateResponse(recentMessages);

        // Thêm phản hồi của AI
        chatHistory.messages.push({ role: 'assistant', content: aiResponse });

        // Lưu vào DB
        await chatHistory.save();

        res.json({ sessionId, response: aiResponse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi hệ thống' });
    }
};

exports.getChatHistory = async (req, res) => {
    const { sessionId } = req.params;

    try {
        const chatHistory = await ChatHistory.findOne({ sessionId });
        res.json(chatHistory || { messages: [] });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi hệ thống' });
    }
};

// Xóa toàn bộ lịch sử trò chuyện
exports.deleteChatHistory = async (req, res) => {
    try {
        const result = await ChatHistory.deleteMany({});
        res.json({ message: 'Đã xóa toàn bộ lịch sử trò chuyện', deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi hệ thống' });
    }
};