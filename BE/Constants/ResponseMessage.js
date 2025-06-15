module.exports = {
    // === General Success ===
    SUCCESS_OK: 'Thành công',
    SUCCESS_CREATED: 'Tạo mới thành công',
    SUCCESS_ACCEPTED: 'Yêu cầu đã được chấp nhận nhưng chưa hoàn thành',
    SUCCESS_NO_CONTENT: 'Không có dữ liệu để trả về',

    // === Product Messages ===
    SUCCESS_PRODUCT_FOUND: 'Tìm thấy sản phẩm',
    SUCCESS_PRODUCT_CREATED: 'Tạo sản phẩm thành công',
    SUCCESS_PRODUCT_UPDATED: 'Cập nhật sản phẩm thành công',
    SUCCESS_PRODUCT_DELETED: 'Xóa sản phẩm thành công',
    ERROR_PRODUCT_NOT_FOUND: 'Không tìm thấy sản phẩm',
    ERROR_PRODUCT_CREATE: 'Lỗi tạo sản phẩm',
    ERROR_PRODUCT_UPDATE: 'Lỗi cập nhật sản phẩm',
    ERROR_PRODUCT_DELETE: 'Lỗi xóa sản phẩm',
    ERROR_SEARCH_PRODUCT: 'Lỗi tìm kiếm sản phẩm',

    // === Cart Messages ===
    SUCCESS_CART_UPDATED: 'Cập nhật giỏ hàng thành công',
    SUCCESS_CART_CLEARED: 'Xóa giỏ hàng thành công',
    ERROR_CART_EMPTY: 'Giỏ hàng đang trống',
    ERROR_CART_UPDATE: 'Lỗi cập nhật giỏ hàng',
    ERROR_CART_NOT_FOUND: 'Không tìm thấy giỏ hàng',

    // === Order/Payment Messages ===
    SUCCESS_ORDER_PLACED: 'Đặt hàng thành công',
    SUCCESS_PAYMENT_SUCCESS: 'Thanh toán thành công',
    SUCCESS_ORDER_CANCELLED: 'Hủy đơn hàng thành công',
    ERROR_ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng',
    ERROR_PAYMENT_FAILED: 'Thanh toán thất bại',
    ERROR_ORDER_CANCEL_FAILED: 'Hủy đơn hàng thất bại',

    // === User / Auth Messages ===
    SUCCESS_LOGIN: 'Đăng nhập thành công',
    SUCCESS_LOGOUT: 'Đăng xuất thành công',
    SUCCESS_REGISTER: 'Đăng ký thành công',
    ERROR_USER_NOT_FOUND: 'Không tìm thấy người dùng',
    ERROR_INVALID_CREDENTIALS: 'Tài khoản hoặc mật khẩu không đúng',
    ERROR_UNAUTHORIZED: 'Không được xác thực, vui lòng đăng nhập',
    ERROR_FORBIDDEN: 'Không có quyền truy cập tài nguyên này',
    ERROR_USER_EXISTED: 'Tài khoản đã tồn tại',

    // === Promotion Messages ===
    SUCCESS_PROMOTION_APPLIED: 'Áp dụng khuyến mãi thành công',
    ERROR_PROMOTION_INVALID: 'Mã khuyến mãi không hợp lệ',
    ERROR_PROMOTION_EXPIRED: 'Khuyến mãi đã hết hạn',
    ERROR_PROMOTION_NOT_FOUND: 'Không tìm thấy khuyến mãi',

    // === Review Messages ===
    SUCCESS_REVIEW_ADDED: 'Thêm đánh giá thành công',
    SUCCESS_REVIEW_DELETED: 'Xóa đánh giá thành công',
    ERROR_REVIEW_NOT_FOUND: 'Không tìm thấy đánh giá',
    ERROR_REVIEW_CREATE: 'Lỗi tạo đánh giá',

    // === Support / Help Messages ===
    SUCCESS_SUPPORT_REQUESTED: 'Yêu cầu hỗ trợ đã được gửi',
    ERROR_SUPPORT_FAILED: 'Gửi yêu cầu hỗ trợ thất bại',

    // === Content Messages ===
    SUCCESS_CONTENT_FOUND: 'Tìm thấy nội dung',
    ERROR_CONTENT_NOT_FOUND: 'Không tìm thấy nội dung',

    // === Report / Statistic Messages ===
    SUCCESS_REPORT_GENERATED: 'Tạo báo cáo thành công',
    ERROR_REPORT_FAILED: 'Lỗi tạo báo cáo',
    ERROR_DATA_ANALYTICS: 'Lỗi phân tích dữ liệu',

    // === Client Error (4xx) ===
    ERROR_BAD_REQUEST: 'Yêu cầu không hợp lệ',
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
    ERROR_INVALID_REQUEST: 'Yêu cầu không hợp lệ',

    // === Server Error (5xx) ===
    ERROR_SERVER_ERROR: 'Lỗi máy chủ',
    ERROR_INTERNAL_SERVER: 'Lỗi máy chủ nội bộ',
    ERROR_NOT_IMPLEMENTED: 'Chức năng này chưa được triển khai',
    ERROR_BAD_GATEWAY: 'Lỗi từ máy chủ khác',
    ERROR_SERVICE_UNAVAILABLE: 'Dịch vụ không khả dụng',
    ERROR_GATEWAY_TIMEOUT: 'Hết thời gian yêu cầu từ máy chủ khác',
    ERROR_HTTP_VERSION_NOT_SUPPORTED: 'Phiên bản HTTP không được hỗ trợ',

     //  === Custom entity-related messages === 
    INVALID_PRODUCT_REFERENCES: 'Danh sách sản phẩm chứa ID không hợp lệ.',
    INVALID_ID: 'ID không hợp lệ.',

    //Category
    CATEGORY_FETCH_SUCCESS: 'Lấy danh sách danh mục thành công.',
    CATEGORY_NAME_REQUIRED: 'Tên danh mục là bắt buộc.',
    CATEGORY_NAME_EXISTS: 'Tên danh mục đã tồn tại.',
    CATEGORY_SLUG_EXISTS: 'Slug danh mục đã tồn tại.',
    CATEGORY_CREATED: 'Tạo danh mục thành công.',
    CATEGORY_UPDATED: 'Cập nhật danh mục thành công.',
    CATEGORY_DELETED: 'Xóa danh mục thành công.',
    CATEGORY_NOT_FOUND: 'Không tìm thấy danh mục.',
    //Account
    USER_FETCH_SUCCESS: 'Lấy danh sách người dùng thành công.',
    USER_CREATED: 'Tạo người dùng thành công.',
    USER_UPDATED: 'Cập nhật người dùng thành công.',
    USER_DELETED: 'Xóa người dùng thành công.',
    USER_NOT_FOUND: 'Không tìm thấy người dùng.',
    //Product
    PRODUCT_NAME_REQUIRED: 'Tên sản phẩm là bắt buộc',
    PRODUCT_NAME_EXISTS: 'Tên sản phẩm đã được sử dụng',
    SKU_EXISTS: 'SKU đã được sử dụng',
    URLSLUG_EXISTS: 'urlSlug đã tồn tại',
    PRODUCT_CREATED: 'Thêm sản phẩm thành công',
    PRODUCT_NOT_FOUND: 'Không tìm thấy sản phẩm',
    PRODUCT_DELETED: 'Đã xóa sản phẩm thành công',
    //Comment
    COMMENT_FETCH_SUCCESS: 'Lấy bình luận thành công.',
    COMMENT_UPDATED: 'Cập nhật bình luận thành công.',
    COMMENT_CREATED: 'Tạo bình luận thành công.',
    COMMENT_EXISTS: 'Bạn đã bình luận sản phẩm này rồi.',
    COMMENT_DELETED: 'Bình luận đã được xóa.',
    COMMENT_NOT_FOUND: 'Không tìm thấy bình luận.',
    //Tag
    TAG_NAME_REQUIRED: 'Tên thẻ là bắt buộc.',
    TAG_NAME_EXISTS: 'Tên thẻ đã tồn tại.',
    TAG_NOT_FOUND: 'Không tìm thấy thẻ.',
    TAG_CREATED: 'Tạo thẻ thành công.',
    TAG_UPDATED: 'Cập nhật thẻ thành công.',
    TAG_DELETED: 'Xóa thẻ thành công.',

};