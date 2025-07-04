const { askOpenAI } = require('../Services/chatbotOpenAIService');

exports.ask = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });
        const { reply, products } = await askOpenAI(message);
        res.json({ reply, products });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Chatbot error' });
    }
}; 