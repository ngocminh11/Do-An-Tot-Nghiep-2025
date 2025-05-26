const fs = require('fs');
const path = require('path');
const os = require('os');

const logsDir = path.join(__dirname, '../Logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const getCurrentLogFile = () => {
  const files = fs.readdirSync(logsDir).filter(file => /^log_week_\d+\.csv$/.test(file));
  if (files.length === 0) return `log_week_1.csv`;

  const lastFile = files.sort((a, b) => {
    const aNum = parseInt(a.match(/\d+/)[0]);
    const bNum = parseInt(b.match(/\d+/)[0]);
    return bNum - aNum;
  })[0];

  const lastFilePath = path.join(logsDir, lastFile);
  const stats = fs.statSync(lastFilePath);
  const lastModified = new Date(stats.mtime);
  const now = new Date();

  const diffDays = Math.floor((now - lastModified) / (1000 * 60 * 60 * 24));
  if (diffDays >= 7) {
    const nextWeek = parseInt(lastFile.match(/\d+/)[0]) + 1;
    return `log_week_${nextWeek}.csv`;
  }

  return lastFile;
};

const logToCSV = (logData) => {
  const fileName = getCurrentLogFile();
  const filePath = path.join(logsDir, fileName);

  const isNewFile = !fs.existsSync(filePath);
  const headers = ['action_datetime', 'path_name', 'method', 'ip', 'status_response', 'request_query', 'duration'];

  const logRow = [
    new Date().toISOString(),
    logData.path_name || '',
    logData.method || '',
    logData.ip || '',
    logData.status_response || '',
    JSON.stringify(logData.request_query || ''),
    logData.duration || 0
  ].join(',');

  const logEntry = (isNewFile ? `${headers.join(',')}${os.EOL}` : '') + logRow + os.EOL;

  // Ghi file async, không block event loop
  fs.appendFile(filePath, logEntry, 'utf8', (err) => {
    if (err) console.error('Lỗi ghi log:', err);
  });
};

module.exports = logToCSV;
