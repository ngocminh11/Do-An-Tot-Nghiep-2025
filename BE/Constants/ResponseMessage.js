module.exports = {
    // === General Success ===
    SUCCESS_OK: 'Thành công',
    SUCCESS_CREATED: 'Tạo mới thành công',
    SUCCESS_ACCEPTED: 'Yêu cầu đã được chấp nhận nhưng chưa hoàn thành',
    SUCCESS_NO_CONTENT: 'Không có dữ liệu để trả về',

    // === Order/Payment Messages ===
    SUCCESS_ORDER_PLACED: 'Đặt hàng thành công',
    SUCCESS_PAYMENT_SUCCESS: 'Thanh toán thành công',
    SUCCESS_ORDER_CANCELLED: 'Hủy đơn hàng thành công',
    ERROR_ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng',
    ERROR_PAYMENT_FAILED: 'Thanh toán thất bại',
    ERROR_ORDER_CANCEL_FAILED: 'Hủy đơn hàng thất bại',

    // === User / Auth Messages ===
    ERROR_USER_NOT_FOUND: 'Không tìm thấy người dùng',
    ERROR_INVALID_CREDENTIALS: 'Tài khoản hoặc mật khẩu không đúng',
    ERROR_UNAUTHORIZED: 'Không được xác thực, vui lòng đăng nhập',
    ERROR_FORBIDDEN: 'Không có quyền truy cập tài nguyên này',
    ERROR_USER_EXISTED: 'Tài khoản đã tồn tại',
    AUTH_NO_TOKEN: 'Không có token.',
    AUTH_INVALID_TOKEN: 'Token không hợp lệ.',
    AUTH_FAILED: 'Xác thực thất bại.',
    USER_REGISTERED: 'Đăng ký người dùng thành công.',
    LOGIN_SUCCESS: 'Đăng nhập thành công.',
    INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
    EMAIL_ALREADY_EXISTS: 'Email đã tồn tại trong hệ thống.',
    EMAIL_NOT_FOUND: 'Không tìm thấy email trong hệ thống.',
    RESET_TOKEN_SENT: 'Mã đặt lại mật khẩu đã được gửi.',
    INVALID_OR_EXPIRED_TOKEN: 'Token không hợp lệ hoặc đã hết hạn.',
    PASSWORD_RESET_SUCCESS: 'Đặt lại mật khẩu thành công.',
    OTP_SENT: 'Mã OTP đã được gửi thành công.',
    OTP_VERIFIED: 'Mã OTP đã được xác minh.',
    INVALID_OR_EXPIRED_OTP: 'Mã OTP không hợp lệ hoặc đã hết hạn.',

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
    INVALID_INPUT: 'Dữ liệu đầu vào không hợp lệ.',
    FORBIDDEN: 'Không có quyền thực hiện hành động này',


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
    PRODUCT_NAME_REQUIRED: 'Tên sản phẩm là bắt buộc.',
    PRODUCT_NAME_EXISTS: 'Tên sản phẩm đã tồn tại.',
    SKU_EXISTS: 'Mã SKU đã tồn tại.',
    URLSLUG_EXISTS: 'Slug URL đã tồn tại.',
    PRODUCT_CREATED: 'Sản phẩm đã được tạo thành công.',
    IMAGE_REQUIRED: 'Vui lòng tải lên ít nhất một hình ảnh.',
    MAX_IMAGE_COUNT_EXCEEDED: 'Chỉ được tải lên tối đa 6 hình ảnh.',
    MAX_TOTAL_SIZE_EXCEEDED: 'Tổng dung lượng hình ảnh không được vượt quá 30MB.',
    INVALID_ID: 'ID không hợp lệ.',
    PRODUCT_NOT_FOUND: 'Không tìm thấy sản phẩm.',
    PRODUCT_UPDATED: 'Cập nhật sản phẩm thành công.',
    PRODUCT_DELETED: 'Xóa sản phẩm thành công.',
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
    //Cart
    CART_UPDATED: 'Giỏ hàng đã được cập nhật.',
    CART_NOT_FOUND: 'Không tìm thấy giỏ hàng.',
    PRODUCT_NOT_IN_CART: 'Sản phẩm không có trong giỏ hàng.',
    CART_EMPTY: 'Giỏ hàng hiện đang trống.',
    CART_CLEARED: 'Đã xoá toàn bộ sản phẩm trong giỏ hàng.',
    //Promotion
    PROMOTION_CREATED: 'Tạo khuyến mãi thành công.',
    PROMOTION_UPDATED: 'Cập nhật khuyến mãi thành công.',
    PROMOTION_DELETED: 'Xóa khuyến mãi thành công.',
    PROMOTION_FETCH_SUCCESS: 'Lấy thông tin khuyến mãi thành công.',
    PROMOTION_NOT_FOUND: 'Không tìm thấy khuyến mãi.',
    // Post
    POST_FETCH_SUCCESS: 'Lấy danh sách bài viết thành công.',
    POST_CREATED: 'Tạo bài viết thành công.',
    POST_UPDATED: 'Cập nhật bài viết thành công.',
    POST_DELETED: 'Xóa bài viết thành công.',
    POST_NOT_FOUND: 'Không tìm thấy bài viết.',
    // Order
    ORDER_CREATED: 'Tạo đơn hàng thành công.',
    ORDER_UPDATED: 'Cập nhật đơn hàng thành công.',
    ORDER_DELETED: 'Xoá đơn hàng thành công.',
    ORDER_FETCH_SUCCESS: 'Lấy thông tin đơn hàng thành công.',
    ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng.',
    ORDER_STATUS_UPDATED: 'Cập nhật trạng thái đơn hàng thành công.',
    ORDER_CANCEL_REQUEST_SENT: 'Yêu cầu huỷ đơn hàng đã được gửi.',
    ORDER_CANCELED: 'Đơn hàng đã bị huỷ.',
    ORDER_CANCEL_REQUEST_DECLINED: 'Từ chối yêu cầu huỷ đơn hàng.',

};