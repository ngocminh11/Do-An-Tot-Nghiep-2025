module.exports = {
    // Success codes
    SUCCESS_OK: 200,                      // Thành công
    SUCCESS_CREATED: 201,                 // Tạo mới thành công
    SUCCESS_ACCEPTED: 202,                // Yêu cầu đã được chấp nhận nhưng chưa hoàn thành
    SUCCESS_NO_CONTENT: 204,              // Không có dữ liệu để trả về
  
    // Client error codes (4xx)
    ERROR_BAD_REQUEST: 400,               // Yêu cầu không hợp lệ
    ERROR_UNAUTHORIZED: 401,              // Không được xác thực
    ERROR_FORBIDDEN: 403,                 // Không có quyền truy cập tài nguyên này
    ERROR_NOT_FOUND: 404,                 // Không tìm thấy tài nguyên yêu cầu
    ERROR_METHOD_NOT_ALLOWED: 405,       // Phương thức HTTP không được phép
    ERROR_NOT_ACCEPTABLE: 406,            // Tài nguyên không thể chấp nhận
    ERROR_PROXY_AUTHENTICATION_REQUIRED: 407, // Cần xác thực proxy
    ERROR_REQUEST_TIMEOUT: 408,           // Hết thời gian yêu cầu
    ERROR_CONFLICT: 409,                  // Xung đột yêu cầu
    ERROR_GONE: 410,                      // Tài nguyên đã bị xóa
    ERROR_LENGTH_REQUIRED: 411,           // Dữ liệu yêu cầu bị thiếu
    ERROR_PRECONDITION_FAILED: 412,       // Tiền đề yêu cầu không thỏa mãn
    ERROR_PAYLOAD_TOO_LARGE: 413,         // Dữ liệu yêu cầu quá lớn
    ERROR_URI_TOO_LONG: 414,              // Địa chỉ URL quá dài
    ERROR_UNSUPPORTED_MEDIA_TYPE: 415,    // Loại phương tiện không được hỗ trợ
    ERROR_RANGE_NOT_SATISFIABLE: 416,     // Khoảng giá trị không hợp lệ
    ERROR_EXPECTATION_FAILED: 417,        // Kỳ vọng không hợp lệ
  
    // Server error codes (5xx)
    ERROR_INTERNAL_SERVER: 500,           // Lỗi máy chủ nội bộ
    ERROR_NOT_IMPLEMENTED: 501,           // Chức năng này chưa được triển khai
    ERROR_BAD_GATEWAY: 502,               // Lỗi từ máy chủ khác
    ERROR_SERVICE_UNAVAILABLE: 503,       // Dịch vụ không khả dụng
    ERROR_GATEWAY_TIMEOUT: 504,           // Hết thời gian yêu cầu từ máy chủ khác
    ERROR_HTTP_VERSION_NOT_SUPPORTED: 505, // Phiên bản HTTP không được hỗ trợ
  };
  