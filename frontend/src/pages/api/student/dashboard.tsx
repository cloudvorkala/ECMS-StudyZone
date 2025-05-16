// ✅ src/pages/api/student/dashboard.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // mock student data
    return res.status(200).json({
      name: 'Bonnin Wang',
      role: 'student',
      dashboardStatus: 'loaded',
    });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
