import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 请求拦截器：添加 token
api.interceptors.request.use((config) => {
  // 只在浏览器环境中使用 sessionStorage
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    // 只在浏览器环境中使用 sessionStorage
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// 类型定义
interface UserData {
  fullName: string;
  email: string;
  phone: string;
  degree: string;
  specialty: string;
  password: string;
}

interface BookingData {
  mentorId: number;
  startTime: string;
  endTime: string;
  subject: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

// 认证相关 API
export const authAPI = {
  login: async (email: string, password: string, role: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password, role });
    return response.data;
  },
  register: async (userData: UserData) => {
    const response = await api.post('/users/register/mentor', userData);
    return response.data;
  },
};

// 预约相关 API
export const bookingAPI = {
  getBookings: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },
  createBooking: async (bookingData: BookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  cancelBooking: async (bookingId: number) => {
    const response = await api.delete(`/bookings/${bookingId}`);
    return response.data;
  },
};

// 通知相关 API
export const notificationAPI = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  markAsRead: async (notificationId: number) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },
};

export default api;