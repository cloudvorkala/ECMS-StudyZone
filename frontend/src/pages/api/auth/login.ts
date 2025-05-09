import type { NextApiRequest, NextApiResponse } from 'next';
import api from '@/services/api';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

interface ErrorResponse {
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, role } = req.body;
    console.log('Received data:', req.body);

    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
      role,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Login error:', error);
    const errorResponse = error as { response?: { data: ErrorResponse } };
    return res.status(500).json({
      message: errorResponse.response?.data?.message || 'Login failed',
    });
  }
}