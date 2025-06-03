

import { useState } from 'react';

export default function StudentSettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [major, setMajor] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('✔ Profile saved (demo only)');
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">Edit Profile</h1>
        <form onSubmit={handleSave} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Major / Course"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              type="button"
              className="border border-gray-400 text-gray-600 px-4 py-2 rounded hover:bg-gray-100"
              onClick={() => {
                setName('');
                setEmail('');
                setMajor('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
