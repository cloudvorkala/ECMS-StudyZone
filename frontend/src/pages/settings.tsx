// ✅ src/pages/settings.tsx
import React, { useState } from 'react';

export default function SettingsPage() {
  const [phone, setPhone] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwords do not match");
    } else {
      setMessage("✅ Password updated successfully!");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-xl font-bold text-gray-800 mb-4">⚙️ Edit Profile</h1>

        {/* View-only Info */}
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-1">Full Name</label>
          <input disabled value="Alex Johnson" className="w-full border p-2 rounded bg-gray-100 text-gray-500" />

          <label className="block font-medium text-gray-700 mt-4 mb-1">Student ID</label>
          <input disabled value="aut1234" className="w-full border p-2 rounded bg-gray-100 text-gray-500" />

          <label className="block font-medium text-gray-700 mt-4 mb-1">AUT Email</label>
          <input disabled value="aut1234@autuni.ac.nz" className="w-full border p-2 rounded bg-gray-100 text-gray-500" />
        </div>

        {/* Editable Info */}
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-1">Phone Number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border p-2 rounded" />

          <label className="block font-medium text-gray-700 mt-4 mb-1">Major</label>
          <input value={major} onChange={(e) => setMajor(e.target.value)} className="w-full border p-2 rounded" />

          <label className="block font-medium text-gray-700 mt-4 mb-1">Year of Study</label>
          <input value={year} onChange={(e) => setYear(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        {/* Change Password */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">🔐 Change Password</h2>
          <label className="block font-medium text-gray-700 mb-1">Current Password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border p-2 rounded" />

          <label className="block font-medium text-gray-700 mt-4 mb-1">New Password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border p-2 rounded" />

          <label className="block font-medium text-gray-700 mt-4 mb-1">Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border p-2 rounded" />

          <button onClick={handlePasswordChange} className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Update Password
          </button>
          {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
        </div>
      </div>
    </div>
  );
}
