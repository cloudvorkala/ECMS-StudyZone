
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, role } = req.body;

  // 模拟验证逻辑（实际应查询数据库）
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  // 伪造一个模拟登录结果
  const token = 'mock-jwt-token';
  const user = {
    id: 1,
    name: 'Mock User',
    role: role,
  };

  return res.status(200).json({ token, user });
}
