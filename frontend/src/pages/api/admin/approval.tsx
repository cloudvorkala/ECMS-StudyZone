// ✅ src/pages/api/admin/approval.tsx
// Admin 审批页面：用于批准/拒绝导师与学校管理员注册申请

import React, { useState } from 'react';

// 示例数据结构，后续可从后端API获取
const mockMentorRequests = [
  { id: 1, name: 'Bonnin Wang', email: 'bonnin@example.com', role: 'mentor' },
  { id: 2, name: 'Yu Zhang', email: 'yuzhang@example.com', role: 'mentor' },
];

const mockSchoolAdminRequests = [
  { id: 3, name: 'Sofia Hewitt', email: 'sofia@example.com', role: 'school_admin' },
];

export default function AdminApprovalPage() {
  const [mentorRequests, setMentorRequests] = useState(mockMentorRequests);
  const [schoolRequests, setSchoolRequests] = useState(mockSchoolAdminRequests);

  const handleApprove = (id: number, role: string) => {
    console.log(`Approved ${role} with ID ${id}`);
    if (role === 'mentor') setMentorRequests(prev => prev.filter(req => req.id !== id));
    else setSchoolRequests(prev => prev.filter(req => req.id !== id));
  };

  const handleReject = (id: number, role: string) => {
    console.log(`Rejected ${role} with ID ${id}`);
    if (role === 'mentor') setMentorRequests(prev => prev.filter(req => req.id !== id));
    else setSchoolRequests(prev => prev.filter(req => req.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-purple-700">Admin Approval Center</h1>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Pending Mentor Applications</h2>
          {mentorRequests.length === 0 ? (
            <p className="text-sm text-gray-500">No pending mentor requests.</p>
          ) : (
            <ul className="space-y-3">
              {mentorRequests.map(req => (
                <li key={req.id} className="flex justify-between items-center p-4 border rounded">
                  <div>
                    <p className="font-medium">{req.name}</p>
                    <p className="text-sm text-gray-500">{req.email}</p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleApprove(req.id, req.role)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req.id, req.role)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Pending School Admin Applications</h2>
          {schoolRequests.length === 0 ? (
            <p className="text-sm text-gray-500">No pending school admin requests.</p>
          ) : (
            <ul className="space-y-3">
              {schoolRequests.map(req => (
                <li key={req.id} className="flex justify-between items-center p-4 border rounded">
                  <div>
                    <p className="font-medium">{req.name}</p>
                    <p className="text-sm text-gray-500">{req.email}</p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleApprove(req.id, req.role)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req.id, req.role)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
