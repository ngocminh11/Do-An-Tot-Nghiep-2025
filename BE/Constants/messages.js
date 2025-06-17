const Messages = {
    // Auth messages
    UNAUTHORIZED: 'Bạn chưa đăng nhập',
    FORBIDDEN: 'Bạn không có quyền truy cập',
    INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
    EMAIL_EXISTS: 'Email đã tồn tại',
    USER_NOT_FOUND: 'Không tìm thấy người dùng',

    // Product messages
    PRODUCT_NOT_FOUND: 'Không tìm thấy sản phẩm',
    PRODUCT_CREATED: 'Tạo sản phẩm thành công',
    PRODUCT_UPDATED: 'Cập nhật sản phẩm thành công',
    PRODUCT_DELETED: 'Xóa sản phẩm thành công',
    REQUIRED_IMAGE: 'Vui lòng tải lên ít nhất một hình ảnh',
    INVALID_IMAGE: 'File không phải là hình ảnh',
    IMAGE_TOO_LARGE: 'Kích thước file quá lớn',
    TOO_MANY_IMAGES: 'Số lượng ảnh vượt quá giới hạn',

    // Validation messages
    REQUIRED_FIELD: 'Vui lòng điền đầy đủ thông tin',
    INVALID_FORMAT: 'Định dạng không hợp lệ',

    // Server messages
    INTERNAL_SERVER_ERROR: 'Đã xảy ra lỗi, vui lòng thử lại sau',
    DATABASE_ERROR: 'Lỗi kết nối cơ sở dữ liệu',

    // Success messages
    SUCCESS: 'Thao tác thành công',
    UPDATED: 'Cập nhật thành công',
    DELETED: 'Xóa thành công'
};

module.exports = Messages; 