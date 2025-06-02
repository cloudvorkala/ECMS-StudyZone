

import React, { useState } from 'react';

export default function BroadcastPage() {
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, target }),
      });
      if (!res.ok) throw new Error('Failed to send broadcast');
      setSubmitted(true);
      setMessage('');
    } catch (err) {
      alert('Failed to send broadcast');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-start">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Send Broadcast</h1>

        {submitted && (
          <p className="text-green-600 mb-4 font-medium">Broadcast sent successfully!</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full h-32 p-2 border border-gray-300 rounded"
            required
          />

          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="all">All Users</option>
            <option value="students">Students</option>
            <option value="mentors">Mentors</option>
            <option value="admins">Admins</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
          >
            Send Broadcast
          </button>
        </form>
      </div>
    </div>
  );
}
