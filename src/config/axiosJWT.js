import axios from 'axios';
import jwtDecode from 'jwt-decode';
import store from '../redux/store';
import { loginSuccess } from '../redux/slices/authSlice';

// Tạo axios instance riêng cho các API cần JWT
const axiosJWT = axios.create({
  baseURL: 'https://trochung-deployment-backend.onrender.com',
  withCredentials: true
});

// Hàm refresh access token khi token hết hạn
const refreshAccessToken = async () => {
  try {
    // Gọi API refresh token với cookie chứa refresh token
    const res = await axios.post("/api/auth/refreshToken", {}, {
      withCredentials: true
    });
    console.debug('[axiosJWT] refreshAccessToken -> response received', res && res.status);
    return res.data;
  } catch (error) {
    // Debug: log details, then redirect as before
    console.error('[axiosJWT] refreshAccessToken error:', error?.response?.status, error?.response?.data || error.message || error);
    // Nếu refresh thất bại thì chuyển về trang login
    window.location.href = '/login';
    return null;
  }
};

// Request interceptor - Chặn và xử lý mọi request trước khi gửi
axiosJWT.interceptors.request.use(async (config) => {
  // Lấy state hiện tại từ Redux store
  const state = store.getState();
  const accessToken = state?.auth?.login?.accessToken || "";
  const currentUser = state?.auth?.login?.currentUser || null;
  // Debug: show which request and whether token exists (do not print token value)
  try {
    console.debug(`[axiosJWT] request -> ${config.method || 'GET'} ${config.url} | hasAccessToken=${Boolean(accessToken)} | user=${currentUser?.username || 'anonymous'}`);
  } catch (_) {}
  // Kiểm tra xem có access token không
  if (accessToken) {
    try {
      // Giải mã token để lấy thời gian hết hạn
      const token = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000;
      const isExpired = token.exp < currentTime;

      // Nếu token đã hết hạn thì refresh
      if (isExpired) {
        console.debug('[axiosJWT] accessToken expired -> calling refreshAccessToken for', config.url);
        const data = await refreshAccessToken();
        if (data) {
          // Cập nhật Redux store với token mới
          const refreshUser = {
            user: currentUser,
            accessToken: data.accessToken
          };
          store.dispatch(loginSuccess(refreshUser));

          // Sử dụng token mới cho request này
          console.debug('[axiosJWT] refresh succeeded, attaching new token for', config.url, 'tokenLen=', data.accessToken ? data.accessToken.length : 0);
          config.headers["token"] = `Bearer ${data.accessToken}`;
        } else {
          // Nếu refresh thất bại thì hủy request
          console.error('[axiosJWT] refresh returned falsy data for', config.url);
          return Promise.reject(new Error('AUTH_FAILED'));
        }
      } else {
        // Token còn hạn thì dùng token hiện tại
        console.debug('[axiosJWT] using existing accessToken for', config.url);
        config.headers["token"] = `Bearer ${accessToken}`;
      }
    } catch (error) {
      // Nếu có lỗi decode token thì vẫn dùng token cũ
      config.headers["token"] = `Bearer ${accessToken}`;
    }
  }
  // Không có token thì để trống, backend sẽ trả về 401
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosJWT;