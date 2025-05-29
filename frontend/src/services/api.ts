import axios from 'axios';
import https from 'https';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://localhost:3000') + '/api';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  // 在开发环境中忽略 SSL 证书错误
  ...(process.env.NODE_ENV === 'development' ? {
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  } : {})
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    // only use sessionStorage in browser environment
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });

    // only use sessionStorage in browser environment
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// type definitions
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

// authentication related API
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

// booking related API
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

// notification related API
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