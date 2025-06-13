const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../Logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log')
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Function to log chat interactions to CSV
const logToCSV = (type, data) => {
  try {
    const timestamp = new Date().toISOString();
    const csvLine = [
      timestamp,
      type,
      data.chatId || '',
      data.message || '',
      data.response || '',
      data.intent || '',
      data.score || ''
    ].join(',') + '\n';

    const csvPath = path.join(logsDir, 'chat_logs.csv');

    // Create file with headers if it doesn't exist
    if (!fs.existsSync(csvPath)) {
      const headers = 'timestamp,type,chatId,message,response,intent,score\n';
      fs.writeFileSync(csvPath, headers);
    }

    // Append the new log entry
    fs.appendFileSync(csvPath, csvLine);
  } catch (error) {
    console.error('Error logging to CSV:', error);
    logger.error('Error logging to CSV', { error: error.message });
  }
};

module.exports = {
  logger,
  logToCSV
};
