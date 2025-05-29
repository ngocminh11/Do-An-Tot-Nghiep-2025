import React from 'react';
import { Card } from 'antd';
import './Privacy.scss';

const Privacy = () => {
    return (
        <div className="privacy-page">
            <Card>
                <h1>Chính sách bảo mật</h1>

                <section>
                    <h2>1. Thông tin chúng tôi thu thập</h2>
                    <p>Chúng tôi thu thập các thông tin sau đây:</p>
                    <ul>
                        <li>Thông tin cá nhân (tên, email, số điện thoại)</li>
                        <li>Thông tin địa chỉ giao hàng</li>
                        <li>Thông tin thanh toán</li>
                        <li>Lịch sử mua hàng</li>
                    </ul>
                </section>

                <section>
                    <h2>2. Cách chúng tôi sử dụng thông tin</h2>
                    <p>Chúng tôi sử dụng thông tin của bạn để:</p>
                    <ul>
                        <li>Xử lý đơn hàng và giao hàng</li>
                        <li>Gửi thông báo về đơn hàng</li>
                        <li>Cải thiện trải nghiệm mua sắm</li>
                        <li>Gửi thông tin về sản phẩm mới và khuyến mãi</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Bảo mật thông tin</h2>
                    <p>Chúng tôi cam kết bảo vệ thông tin của bạn bằng cách:</p>
                    <ul>
                        <li>Sử dụng mã hóa SSL cho tất cả các giao dịch</li>
                        <li>Không chia sẻ thông tin với bên thứ ba</li>
                        <li>Tuân thủ các quy định về bảo mật dữ liệu</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Quyền của người dùng</h2>
                    <p>Bạn có quyền:</p>
                    <ul>
                        <li>Truy cập và chỉnh sửa thông tin cá nhân</li>
                        <li>Yêu cầu xóa thông tin</li>
                        <li>Từ chối nhận thông tin tiếp thị</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Cookie</h2>
                    <p>Chúng tôi sử dụng cookie để:</p>
                    <ul>
                        <li>Ghi nhớ thông tin đăng nhập</li>
                        <li>Phân tích hành vi người dùng</li>
                        <li>Cải thiện trải nghiệm mua sắm</li>
                    </ul>
                </section>

                <section>
                    <h2>6. Liên hệ</h2>
                    <p>Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật, vui lòng liên hệ với chúng tôi qua:</p>
                    <ul>
                        <li>Email: privacy@example.com</li>
                        <li>Điện thoại: (84) 123-456-789</li>
                        <li>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. HCM</li>
                    </ul>
                </section>
            </Card>
        </div>
    );
};

export default Privacy; 