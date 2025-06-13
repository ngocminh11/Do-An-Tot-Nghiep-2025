const natural = require('natural');
const trainingData = require('../data/chatbot-training-data.json');
const logger = require('../Utils/logger');

class ChatbotService {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
        this.tfidf = new natural.TfIdf();
        this.trainModel();
    }

    trainModel() {
        try {
            // Add all patterns to TF-IDF model
            trainingData.intents.forEach(intent => {
                intent.patterns.forEach(pattern => {
                    this.tfidf.addDocument(pattern);
                });
            });
            console.log('Chatbot model trained successfully');
        } catch (error) {
            console.error('Error training chatbot model:', error);
            throw error;
        }
    }

    findBestMatch(message) {
        try {
            const tokens = this.tokenizer.tokenize(message.toLowerCase());
            let bestMatch = {
                intent: null,
                score: 0
            };

            // Calculate TF-IDF scores for each intent
            trainingData.intents.forEach(intent => {
                let intentScore = 0;
                intent.patterns.forEach(pattern => {
                    const patternTokens = this.tokenizer.tokenize(pattern.toLowerCase());
                    const commonTokens = tokens.filter(token => patternTokens.includes(token));
                    intentScore += commonTokens.length;
                });
                intentScore = intentScore / intent.patterns.length;

                if (intentScore > bestMatch.score) {
                    bestMatch = {
                        intent: intent.tag,
                        score: intentScore
                    };
                }
            });

            return bestMatch;
        } catch (error) {
            console.error('Error finding best match:', error);
            return {
                intent: 'unknown',
                score: 0
            };
        }
    }

    getRandomResponse(intent) {
        try {
            const intentData = trainingData.intents.find(i => i.tag === intent);
            if (!intentData || !intentData.responses || intentData.responses.length === 0) {
                return 'Xin lỗi, tôi không hiểu câu hỏi của bạn. Bạn có thể hỏi lại theo cách khác không?';
            }
            const randomIndex = Math.floor(Math.random() * intentData.responses.length);
            return intentData.responses[randomIndex];
        } catch (error) {
            console.error('Error getting random response:', error);
            return 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.';
        }
    }

    async processMessage(message) {
        try {
            const bestMatch = this.findBestMatch(message);
            const response = this.getRandomResponse(bestMatch.intent);

            return {
                message: response,
                intent: bestMatch.intent,
                score: bestMatch.score
            };
        } catch (error) {
            console.error('Error processing message:', error);
            return {
                message: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
                intent: 'error',
                score: 0
            };
        }
    }
}

// Create a singleton instance
const chatbotService = new ChatbotService();

module.exports = chatbotService; 