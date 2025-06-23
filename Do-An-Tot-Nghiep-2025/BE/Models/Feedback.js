const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    userSessionId: {
        type: String,
        required: false
    },
    answer: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'answered'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feedback', FeedbackSchema); 