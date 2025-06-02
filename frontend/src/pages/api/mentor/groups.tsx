// ✅ src/pages/api/mentor/groups.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'GET') {
    res.status(200).json([
      {
        id: 1,
        name: 'Group A',
        students: [
          { id: 101, name: 'Alice Johnson' },
          { id: 102, name: 'Michael Lee' },
        ],
      },
    ]);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
