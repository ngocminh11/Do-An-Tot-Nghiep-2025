const express = require('express');
const app = express();
const logToCSV = require('./Utils/logger');

app.use(express.json());

// Middleware ghi log không block
app.use((req, res, next) => {
    const startTime = Date.now();

    // Tiếp tục xử lý request ngay lập tức
    next();

    // Khi response kết thúc thì ghi log
    res.on('finish', () => {
        const duration = Date.now() - startTime;

        logToCSV({
            path_name: req.originalUrl,
            method: req.method,
            ip: req.ip,
            status_response: res.statusCode,
            request_query: req.query,
            duration
        });
    });
});

// Các route khác ở đây...

app.listen(5000, () => {
    console.log('Server chạy trên cổng 5000');
});