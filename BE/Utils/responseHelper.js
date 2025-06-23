const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');

// Định nghĩa rõ ràng status trả về
const STATUS_SUCCESS = 'Success';
const STATUS_FAIL = 'Fail';

const sendSuccess = (res, code = StatusCodes.SUCCESS_OK, data = null, message = Messages.SUCCESS) => {
  return res.status(code).json({ status: STATUS_SUCCESS, message, data });
};

const sendError = (res, code = StatusCodes.ERROR_INTERNAL_SERVER, message = Messages.SERVER_ERROR, data = null) => {
  const response = {
    status: STATUS_FAIL,
    message,
  };

  if (data) {
    response.data = data;
  }

  return res.status(code).json(response);
};

module.exports = { sendSuccess, sendError };
