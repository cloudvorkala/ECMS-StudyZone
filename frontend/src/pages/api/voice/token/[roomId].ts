import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const { roomId } = req.query;
    console.log('Fetching token for room:', roomId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voice/token/${roomId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Backend response error:', response.status, await response.text());
      return res.status(response.status).json({ message: 'Failed to get token from backend' });
    }

    const data = await response.json();
    console.log('Token response:', data);

    if (!data.token) {
      return res.status(500).json({ message: 'No token in response' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error getting token:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}