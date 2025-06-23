const Test = require('../Models/Test');
const mongoose = require('mongoose');
const StatusCodes = require('../Constants/ResponseCode');
const { sendSuccess, sendError } = require('../Utils/responseHelper');

exports.createTest = async (req, res) => {
    try {
        const { id, content } = req.body;
        
        const test = new Test({id, content });
        const savedTest = await test.save();
    return sendSuccess(res, StatusCodes.SUCCESS_CREATED, savedTest, Messages.TAG_CREATED);

    } catch (error) {
        return res.json({ error: error.message });
    }
};