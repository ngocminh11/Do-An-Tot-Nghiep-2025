#  Đồ Án Tốt Nghiệp - Hệ Thống Quản Lý Mỹ Phẩm

---

##  Công nghệ sử dụng

- **Node.js** + **Express.js**
- **React.js**
- **MongoDB** + **Mongoose**
- **MVC pattern**
- **dotenv** cho cấu hình môi trường


---

## 🗂️ Cấu trúc thư mục

├── app.js # Entry point chính 

├── Config/ 
    │ └── db.js # Kết nối MongoDB 

├── Constants/ 
    │ └── ResponseCode.js # Mã phản hồi chuẩn hóa 
    ├──ResponseMessage.js # Thông điệp phản hồi 

├── Controllers/ # Xử lý logic route 

├── Middlewares/ 
    │ └── requestLogger.js # Middleware log 

├── Models/ # Schema mongoose 

├── Routes/ # Định tuyến API 

├── Services/ # Logic nghiệp vụ 

├── Logs/ # Tự tạo log theo tuần 

├── .env 

├── .env.example 

├── .gitignore 

├── package.json 

│── README.md