// pages/api/mentor/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const data = req.body; // your submitted form data

    // TODO: Save data to your database here
    console.log('Received data:', data); // Check data in server logs

    // Respond back to the frontend
    res.status(200).json({ message: 'Mentor registered successfully!' });
  } else {
    // Handle unsupported request methods
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
