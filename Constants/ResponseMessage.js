module.exports = {
    // Success messages
    SUCCESS_OK: 'Thành công',
    SUCCESS_CREATED: 'Tạo mới thành công',
    SUCCESS_ACCEPTED: 'Yêu cầu đã được chấp nhận nhưng chưa hoàn thành',
    SUCCESS_NO_CONTENT: 'Không có dữ liệu để trả về',
  
    // Client error messages (4xx)
    ERROR_BAD_REQUEST: 'Yêu cầu không hợp lệ',
    ERROR_UNAUTHORIZED: 'Không được xác thực, vui lòng đăng nhập',
    ERROR_FORBIDDEN: 'Không có quyền truy cập tài nguyên này',
    ERROR_NOT_FOUND: 'Không tìm thấy tài nguyên yêu cầu',
    ERROR_METHOD_NOT_ALLOWED: 'Phương thức HTTP không được phép',
    ERROR_NOT_ACCEPTABLE: 'Tài nguyên không thể chấp nhận',
    ERROR_PROXY_AUTHENTICATION_REQUIRED: 'Cần xác thực proxy',
    ERROR_REQUEST_TIMEOUT: 'Hết thời gian yêu cầu',
    ERROR_CONFLICT: 'Xung đột yêu cầu',
    ERROR_GONE: 'Tài nguyên đã bị xóa',
    ERROR_LENGTH_REQUIRED: 'Dữ liệu yêu cầu bị thiếu',
    ERROR_PRECONDITION_FAILED: 'Tiền đề yêu cầu không thỏa mãn',
    ERROR_PAYLOAD_TOO_LARGE: 'Dữ liệu yêu cầu quá lớn',
    ERROR_URI_TOO_LONG: 'Địa chỉ URL quá dài',
    ERROR_UNSUPPORTED_MEDIA_TYPE: 'Loại phương tiện không được hỗ trợ',
    ERROR_RANGE_NOT_SATISFIABLE: 'Khoảng giá trị không hợp lệ',
    ERROR_EXPECTATION_FAILED: 'Kỳ vọng không hợp lệ',
  
    // Server error messages (5xx)
    ERROR_INTERNAL_SERVER: 'Lỗi máy chủ nội bộ',
    ERROR_NOT_IMPLEMENTED: 'Chức năng này chưa được triển khai',
    ERROR_BAD_GATEWAY: 'Lỗi từ máy chủ khác',
    ERROR_SERVICE_UNAVAILABLE: 'Dịch vụ không khả dụng',
    ERROR_GATEWAY_TIMEOUT: 'Hết thời gian yêu cầu từ máy chủ khác',
    ERROR_HTTP_VERSION_NOT_SUPPORTED: 'Phiên bản HTTP không được hỗ trợ',
  };
  