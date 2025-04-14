const fs = require('fs');
const path = require('path');
const os = require('os');

const logsDir = path.join(__dirname, '../Logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Hàm tính tuần log dựa theo thời gian khởi đầu của tuần đầu tiên
const getLogWeek = () => {
  const files = fs.readdirSync(logsDir).filter(file => /^log_week_\d+\.csv$/.test(file));
  return files.length + 1; // nếu đã có 1 file => file mới là week_2
};

// Hàm xác định file log hiện tại
const getCurrentLogFile = () => {
  const files = fs.readdirSync(logsDir).filter(file => /^log_week_\d+\.csv$/.test(file));
  if (files.length === 0) return `log_week_1.csv`;

  // Lấy file cuối cùng
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

// Ghi log vào file CSV
const logToCSV = (logData) => {
  const fileName = getCurrentLogFile();
  const filePath = path.join(logsDir, fileName);

  const isNewFile = !fs.existsSync(filePath);
  const headers = ['action_datetime', 'path_name', 'method', 'ip', 'status_response', 'response', 'description', 'request_body', 'request_query', 'duration'];

  const logRow = [
    new Date().toISOString(),
    logData.path_name || '',
    logData.method || '',
    logData.ip || '',
    logData.status_response || '',
    JSON.stringify(logData.response || ''),
    logData.description || '',
    JSON.stringify(logData.request_body || ''),
    JSON.stringify(logData.request_query || ''),
    logData.duration || 0
  ].join(',');

  const logEntry = (isNewFile ? `${headers.join(',')}${os.EOL}` : '') + logRow + os.EOL;

  fs.appendFileSync(filePath, logEntry, 'utf8');
};

module.exports = logToCSV;
