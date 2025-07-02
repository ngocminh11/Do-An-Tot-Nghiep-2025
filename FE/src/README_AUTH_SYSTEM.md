# Hệ Thống Xác Thực Hoàn Chỉnh

## Tổng Quan

Hệ thống xác thực đã được hoàn thiện với đầy đủ các chức năng:
- Đăng ký/Đăng nhập 2 bước với OTP
- Quản lý token (access token + refresh token)
- Xử lý session expiration
- Phân quyền theo role
- Quên mật khẩu
- Modal đăng nhập toàn cục

## Cấu Trúc Files

### 1. `userService.js` - API Service Layer
```javascript
// Interceptors tự động thêm token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor tự động refresh token khi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      // Tự động refresh token và retry request
    }
  }
);
```

**Chức năng chính:**
- `sendOTP()` - Gửi OTP cho đăng ký/quên mật khẩu
- `verifyOTP()` - Xác thực OTP
- `loginStep1()` - Đăng nhập bước 1 (email + password)
- `loginStep2()` - Đăng nhập bước 2 (OTP)
- `refreshToken()` - Làm mới access token
- `register()` - Đăng ký tài khoản
- `forgotPassword()` - Quên mật khẩu
- `resetPassword()` - Đặt lại mật khẩu

### 2. `AuthContext.js` - State Management
```javascript
export const AuthProvider = ({ children, navigate, onRequireLogin }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Tự động kiểm tra token khi load app
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    }
  }, []);
};
```

**Chức năng chính:**
- Quản lý state user và loading
- Tự động refresh token khi cần
- Xử lý session expiration
- Navigation theo role
- Error handling tập trung

### 3. `AuthModals.js` - UI Components
```javascript
export function LoginModal({ open, onClose }) {
  const [step, setStep] = useState(1); // 1: email/password, 2: OTP
  const { loginStep1, loginStep2 } = useAuth();
}

export function RegisterModal({ open, onClose }) {
  const [step, setStep] = useState(1); // 1: form, 2: OTP, 3: confirm
  const { sendRegisterOTP, verifyRegisterOTP, register } = useAuth();
}

export function ForgotPasswordModal({ open, onClose }) {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const { forgotPassword, resetPassword } = useAuth();
}
```

**Tính năng:**
- Form validation đầy đủ
- Auto-save draft khi đăng ký
- Error handling với message rõ ràng
- Responsive design

### 4. `ProductManagement.js` - Integration Example
```javascript
const { logout, handleSessionExpired } = useAuth();

// Xử lý lỗi authentication trong API calls
const fetchProducts = async () => {
  try {
    const response = await productService.getAllProducts();
    // Process data
  } catch (error) {
    if (error?.response?.status === 401) {
      handleSessionExpired(); // Tự động logout và mở modal login
      return;
    }
    message.error('Không thể tải danh sách sản phẩm');
  }
};
```

## Luồng Xác Thực

### 1. Đăng Nhập
```
1. User nhập email + password
2. Backend kiểm tra và gửi OTP
3. User nhập OTP
4. Backend trả về accessToken + refreshToken
5. Frontend lưu tokens và navigate theo role
```

### 2. Token Refresh
```
1. API call trả về 401
2. Interceptor tự động gọi /refresh-token
3. Nếu thành công: retry request với token mới
4. Nếu thất bại: logout và mở modal login
```

### 3. Session Expiration
```
1. Token hết hạn hoặc không hợp lệ
2. handleSessionExpired() được gọi
3. Clear localStorage
4. Set user = null
5. Hiển thị message và mở modal login
```

## Backend Integration

### Routes Structure
- `/auth/*` - Authentication routes (login, register, OTP)
- `/user/*` - User-specific routes (profile, orders)
- `/admin/*` - Admin routes (products, users, orders)

### Middleware
- `authenticateUser` - Kiểm tra token
- `authorizeRoles` - Kiểm tra quyền theo role
- `verifyOTPToken` - Xác thực OTP token
- `verifyRefreshToken` - Xác thực refresh token

### Role-Based Access
```javascript
const ALL_STAFF = [
  'Nhân Viên',
  'Quản Lý Kho', 
  'Quản Lý Nhân Sự',
  'Quản Lý Đơn Hàng',
  'Quản Lý Chính'
];

// Ví dụ: Chỉ Quản Lý Kho và Quản Lý Chính mới được nhập kho
router.patch('/products/:id/inventory',
  authenticateUser, 
  authorizeRoles(['Quản Lý Kho', 'Quản Lý Chính']),
  productCtrl.updateInventory
);
```

## Error Handling

### Frontend Error Types
1. **Network Errors** - Hiển thị message chung
2. **401 Unauthorized** - Tự động refresh token hoặc logout
3. **403 Forbidden** - Hiển thị message về quyền truy cập
4. **Validation Errors** - Hiển thị message cụ thể từ backend
5. **PIN Errors** - Focus vào field PIN

### Backend Error Responses
```javascript
// Success
{
  success: true,
  data: { ... },
  message: "Thành công"
}

// Error
{
  success: false,
  message: "Lỗi cụ thể",
  statusCode: 400
}
```

## Security Features

### 1. Token Management
- Access token: 15 phút
- Refresh token: 7 ngày
- Tự động refresh khi cần
- Secure storage trong localStorage

### 2. OTP System
- 6 chữ số, 10 phút hiệu lực
- Rate limiting: 3 lần/phút/email
- Email verification cho đăng ký

### 3. PIN Protection
- 6 chữ số cho thao tác nhạy cảm
- Hash storage trong database
- Required cho inventory operations

### 4. Role-Based Authorization
- 6 roles khác nhau
- Route-level protection
- Controller-level validation

## Usage Examples

### 1. Sử dụng AuthContext
```javascript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, logout, handleSessionExpired } = useAuth();
  
  if (!user) {
    return <div>Vui lòng đăng nhập</div>;
  }
  
  return <div>Xin chào {user.fullName}</div>;
};
```

### 2. Sử dụng AuthModals
```javascript
import { useAuthModal } from '../contexts/AuthModalContext';
import { LoginModal, RegisterModal } from '../components/common/AuthModals';

const App = () => {
  const { showLogin, setShowLogin } = useAuthModal();
  
  return (
    <>
      <button onClick={() => setShowLogin(true)}>Đăng nhập</button>
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
};
```

### 3. API Call với Error Handling
```javascript
const fetchData = async () => {
  try {
    const response = await api.get('/protected-route');
    return response.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      handleSessionExpired();
      return;
    }
    message.error('Có lỗi xảy ra');
  }
};
```

## Best Practices

### 1. Token Management
- Luôn sử dụng interceptor để tự động thêm token
- Xử lý refresh token trong interceptor
- Clear tokens khi logout hoặc session expired

### 2. Error Handling
- Luôn kiểm tra status code 401
- Sử dụng handleSessionExpired() thay vì logout() trực tiếp
- Hiển thị message rõ ràng cho user

### 3. Security
- Không lưu sensitive data trong localStorage
- Validate input ở cả frontend và backend
- Sử dụng HTTPS trong production

### 4. UX
- Loading states cho tất cả async operations
- Auto-save form data khi cần
- Responsive design cho mobile
- Clear error messages

## Troubleshooting

### Common Issues
1. **Token không được gửi** - Kiểm tra interceptor
2. **Refresh token loop** - Kiểm tra logic trong interceptor
3. **Modal không hiển thị** - Kiểm tra AuthModalContext
4. **Role không đúng** - Kiểm tra backend middleware

### Debug Tips
- Console.log trong interceptor để debug token flow
- Network tab để kiểm tra API calls
- React DevTools để kiểm tra context state
- Backend logs để kiểm tra authentication

## Future Enhancements

1. **Remember Me** - Lưu refresh token lâu hơn
2. **Multi-factor Auth** - SMS OTP thêm
3. **Social Login** - Google, Facebook
4. **Session Management** - Quản lý nhiều device
5. **Audit Logs** - Ghi lại tất cả login attempts 