

import { NextApiRequest, NextApiResponse } from 'next';


const mentorApplications = [
  { id: 1, name: 'Alice Johnson', status: 'pending' },
  { id: 2, name: 'Zane Clark', status: 'approved' },
  { id: 3, name: 'Emily Brown', status: 'pending' },
  { id: 4, name: 'Michael Lee', status: 'approved' },
  { id: 5, name: 'David Chen', status: 'pending' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const sorted = mentorApplications.sort((a, b) => a.name.localeCompare(b.name));
    res.status(200).json(sorted);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
