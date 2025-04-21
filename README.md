
# 💄 Cosmetic Management System | Hệ Thống Quản Lý Mỹ Phẩm

A full-stack web application for managing cosmetics products, inventory, customer orders, and promotional campaigns.  
Một ứng dụng web full-stack giúp quản lý sản phẩm mỹ phẩm, kho hàng, đơn hàng khách hàng và các chương trình khuyến mãi.

---

## 🚀 Features | Tính Năng

### 🛍️ Product Management | Quản Lý Sản Phẩm

- Create, update, delete products  
  Tạo, sửa, xoá sản phẩm
- Manage product categories  
  Quản lý danh mục sản phẩm
- Search, filter (by price, brand, type), sort (price, popularity, rating)  
  Tìm kiếm, lọc (giá, thương hiệu, loại), sắp xếp (giá, phổ biến, đánh giá)
- Product detail view and comparison  
  Xem chi tiết & so sánh sản phẩm
- Upload product images  
  Tải lên hình ảnh sản phẩm
- Track views/purchases  
  Theo dõi lượt xem / mua hàng
- Add custom attributes (weight, volume, etc.)  
  Thêm thuộc tính sản phẩm (trọng lượng, dung tích,…)
- Inventory and price management  
  Quản lý giá và tồn kho

### 🛒 Cart Management | Quản Lý Giỏ Hàng

- View, update, and remove items  
  Xem, cập nhật, xoá sản phẩm
- Calculate total price  
  Tính tổng giá
- Apply discount codes  
  Áp dụng mã giảm giá
- Add notes to orders  
  Ghi chú đơn hàng

### 💳 Payment & Checkout | Thanh Toán & Giao Hàng

- Input shipping info  
  Nhập thông tin giao hàng
- Choose payment method  
  Chọn phương thức thanh toán
- Order confirmation and email notification  
  Xác nhận đơn hàng & gửi email xác nhận

### 👤 Account Management | Quản Lý Tài Khoản

- Register / login / logout  
  Đăng ký / đăng nhập / đăng xuất
- Logout from all devices  
  Đăng xuất trên nhiều thiết bị
- Manage profile and addresses  
  Quản lý thông tin cá nhân & địa chỉ giao hàng
- Order history and tracking  
  Xem lịch sử & trạng thái đơn hàng
- Change password, email verification  
  Thay đổi mật khẩu, xác minh email
- Rewards / wishlist  
  Điểm thưởng / danh sách yêu thích
- Role-based access control  
  Phân quyền người dùng (admin, staff, customer)

### 🎁 Promotions & Marketing | Quản Lý Khuyến Mãi

- Create and manage discount codes  
  Tạo & quản lý mã giảm giá
- Notify users about promotions (email, popup)  
  Thông báo khuyến mãi (qua email, popup)
- Manage campaigns  
  Quản lý chiến dịch marketing

### 🗣️ Customer Support | Hỗ Trợ Khách Hàng

- FAQ section  
  Câu hỏi thường gặp
- Live chat support  
  Chat trực tuyến
- Email & phone support  
  Hỗ trợ qua email & điện thoại
- Ticket tracking and email alerts  
  Theo dõi yêu cầu & thông báo email

### 📖 Content & Resources | Nội Dung & Tài Nguyên

- Beauty articles, tutorials, video guides  
  Bài viết làm đẹp, hướng dẫn sử dụng, video
- Manage policy, about pages  
  Quản lý trang chính sách, giới thiệu

### ⭐ Reviews & Ratings | Đánh Giá & Nhận Xét

- Submit and manage product reviews  
  Gửi và quản lý đánh giá sản phẩm
- Display average ratings  
  Hiển thị đánh giá trung bình

### 📊 Analytics & Reports | Thống Kê & Báo Cáo

- Revenue reports (daily/weekly/monthly)  
  Báo cáo doanh thu theo ngày/tuần/tháng
- Best-selling products  
  Thống kê sản phẩm bán chạy
- Customer behavior & demographics  
  Hành vi và nhân khẩu học khách hàng
- Marketing campaign performance  
  Hiệu quả chiến dịch marketing

---

## 🧱 Tech Stack | Công Nghệ Sử Dụng

- **Frontend:** ReactJS, React Router, Axios, TailwindCSS  
- **Backend:** NodeJS, Express, JWT, Mongoose  
- **Database:** MongoDB (Local / Atlas)

---

## 📁 Project Structure | Cấu Trúc Thư Mục

```
project_mypham/
├── client/              # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── App.jsx
├── server/              # NodeJS backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── .env
└── README.md
```

---

## ⚙️ Installation | Cài Đặt

### 1. Clone the Repository

```bash
git clone https://github.com/ngocminh11/Do-An-Tot-Nghiep-2025.git
cd project_mypham
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/project_mypham
JWT_SECRET=mysecretkey
```

Run backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../client
npm install
npm start
```

---

## 🗃️ Suggested MongoDB Collections

| Collection     | Description                          |
|----------------|--------------------------------------|
| `users`        | Tài khoản người dùng và phân quyền   |
| `products`     | Sản phẩm, thuộc tính, hình ảnh       |
| `categories`   | Danh mục sản phẩm                    |
| `orders`       | Đơn hàng, trạng thái, thanh toán     |
| `carts`        | Giỏ hàng theo từng người dùng        |
| `reviews`      | Đánh giá sản phẩm                    |
| `discounts`    | Mã giảm giá                          |
| `notifications`| Thông báo hệ thống/email             |
| `content`      | Trang tĩnh: chính sách, giới thiệu   |
| `stats`        | Báo cáo, log hành vi người dùng      |

---

## 📧 Contact | Liên Hệ

- 👤 Author: [Trần Ngọc Minh]  
- ✉️ Email: [ngocminh110804@gmail.com]  
- 🌐 GitHub: [https://github.com/ngocminh11/Do-An-Tot-Nghiep-2025.git]

---

## 📄 License | Giấy Phép

This project is licensed under the MIT License.

---
