const logToCSV = require('../Utils/logger');

const requestLogger = (req, res, next) => {
  const start = process.hrtime();

  const logData = {
    path_name: req.originalUrl,
    method: req.method,
    ip: req.ip,
    request_body: req.body,
    request_query: req.query,
  };

  const originalSend = res.send;
  res.send = function (body) {
    const diff = process.hrtime(start);
    const duration = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2);

    logData.status_response = res.statusCode;

    try {
      logData.response =
        typeof body === 'object' ? JSON.stringify(body) : body;
    } catch (e) {
      logData.response = '[Unserializable response]';
    }

    logData.duration = duration;
    logData.description = `Request to ${logData.path_name}`;

    logToCSV(logData);
    return originalSend.call(this, body);
  };

  next();
};

module.exports = requestLogger;
