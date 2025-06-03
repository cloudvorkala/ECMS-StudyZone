

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface MentorApplication {
  id: number;
  name: string;
  status: 'pending' | 'approved';
}

export default function ApplicationsStatusPage() {
  const [applications, setApplications] = useState<MentorApplication[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/admin/applications');
        const data = await res.json();
        setApplications(
          data.sort((a: MentorApplication, b: MentorApplication) =>
            a.name.localeCompare(b.name)
          )
        );
      } catch (err) {
        console.error('Failed to fetch applications', err);
      }
    };

    fetchApplications();
  }, []);

  const pending = applications.filter((a) => a.status === 'pending');
  const approved = applications.filter((a) => a.status === 'approved');

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">
          Mentor Applications Status
        </h1>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-yellow-600 mb-2">
            🕐 Applications Received (Pending)
          </h2>
          {pending.length === 0 ? (
            <p className="text-gray-500">No pending applications.</p>
          ) : (
            <ul className="list-disc pl-6">
              {pending.map((app) => (
                <li key={app.id} className="mb-1">
                  {app.name}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-green-600 mb-2">
            ✅ Approved Mentors
          </h2>
          {approved.length === 0 ? (
            <p className="text-gray-500">No approved mentors.</p>
          ) : (
            <ul className="list-disc pl-6">
              {approved.map((app) => (
                <li key={app.id} className="mb-1">
                  {app.name}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-6">
        <div className="mt-6">
        <Link
            href="/admin/approval"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition"
  >
    Back to Admin Dashboard
  </Link>
</div>

        </div>
      </div>
    </div>
  );
}
