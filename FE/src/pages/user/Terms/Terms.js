import React from 'react';
import { Card } from 'antd';
import './Term.scss';

const Term = () => {
    return (
        <div className="term-page">
            <Card>
                <h1>Điều khoản và điều kiện</h1>

                <section>
                    <h2>1. Chấp nhận điều khoản</h2>
                    <p>Bằng việc truy cập và sử dụng website này, bạn đồng ý tuân thủ và chịu ràng buộc bởi các điều khoản và điều kiện sau đây.</p>
                </section>

                <section>
                    <h2>2. Tài khoản người dùng</h2>
                    <p>Khi đăng ký tài khoản, bạn cần:</p>
                    <ul>
                        <li>Cung cấp thông tin chính xác và đầy đủ</li>
                        <li>Bảo mật thông tin đăng nhập</li>
                        <li>Thông báo ngay lập tức nếu phát hiện vi phạm bảo mật</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Đặt hàng và thanh toán</h2>
                    <p>Khi đặt hàng, bạn cần:</p>
                    <ul>
                        <li>Cung cấp thông tin giao hàng chính xác</li>
                        <li>Thanh toán đầy đủ theo giá niêm yết</li>
                        <li>Tuân thủ các quy định về thanh toán</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Vận chuyển và giao hàng</h2>
                    <p>Chúng tôi cam kết:</p>
                    <ul>
                        <li>Giao hàng đúng thời gian đã hẹn</li>
                        <li>Đóng gói sản phẩm an toàn</li>
                        <li>Bồi thường nếu sản phẩm bị hư hỏng trong quá trình vận chuyển</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Đổi trả và hoàn tiền</h2>
                    <p>Chính sách đổi trả:</p>
                    <ul>
                        <li>Đổi trả trong vòng 30 ngày</li>
                        <li>Sản phẩm phải còn nguyên vẹn</li>
                        <li>Hoàn tiền trong vòng 7 ngày làm việc</li>
                    </ul>
                </section>

                <section>
                    <h2>6. Bản quyền</h2>
                    <p>Tất cả nội dung trên website đều thuộc bản quyền của chúng tôi. Không được phép:</p>
                    <ul>
                        <li>Sao chép nội dung</li>
                        <li>Phân phối lại</li>
                        <li>Sử dụng cho mục đích thương mại</li>
                    </ul>
                </section>

                <section>
                    <h2>7. Giới hạn trách nhiệm</h2>
                    <p>Chúng tôi không chịu trách nhiệm về:</p>
                    <ul>
                        <li>Thiệt hại gián tiếp</li>
                        <li>Mất lợi nhuận</li>
                        <li>Mất dữ liệu</li>
                    </ul>
                </section>

                <section>
                    <h2>8. Thay đổi điều khoản</h2>
                    <p>Chúng tôi có quyền thay đổi điều khoản này vào bất kỳ lúc nào. Những thay đổi sẽ có hiệu lực ngay khi được đăng tải.</p>
                </section>

                <section>
                    <h2>9. Liên hệ</h2>
                    <p>Nếu bạn có bất kỳ câu hỏi nào về điều khoản và điều kiện, vui lòng liên hệ với chúng tôi qua:</p>
                    <ul>
                        <li>Email: terms@example.com</li>
                        <li>Điện thoại: (84) 123-456-789</li>
                        <li>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. HCM</li>
                    </ul>
                </section>
            </Card>
        </div>
    );
};

export default Term; 