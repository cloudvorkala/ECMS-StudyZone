// ✅ frontend/src/pages/mentor-recommendation.tsx
import React, { useState } from 'react';

interface Mentor {
  id: number;
  name: string;
  institution: string;
  expertise: string;
  rating: number;
  availableTime: string; // e.g., 'Morning', 'Afternoon', 'Evening'
}

const mockMentors: Mentor[] = [
  { id: 1, name: 'mentor1', institution: 'AUT', expertise: 'software', rating: 4.5, availableTime: 'Morning' },
  { id: 2, name: 'mentor2', institution: 'Engineering Uni', expertise: 'engineering', rating: 4.9, availableTime: 'Afternoon' },
  { id: 3, name: 'mentor3', institution: 'AUT', expertise: 'business', rating: 3.8, availableTime: 'Evening' },
];

export default function MentorRecommendation() {
  const [sortBy, setSortBy] = useState('rating');
  const [filterExpertise, setFilterExpertise] = useState('All');
  const [filterTime, setFilterTime] = useState('All');

  const filteredMentors = mockMentors
    .filter(m => filterExpertise === 'All' || m.expertise === filterExpertise)
    .filter(m => filterTime === 'All' || m.availableTime === filterTime)
    .sort((a, b) => b.rating - a.rating);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-xl font-bold mb-4 text-blue-600">🌟 Recommended Mentors</h1>

        <div className="flex gap-4 mb-4">
          <select onChange={(e) => setSortBy(e.target.value)} className="border p-2 rounded">
            <option value="rating">Sort by Rating</option>
          </select>
          <select onChange={(e) => setFilterExpertise(e.target.value)} className="border p-2 rounded">
            <option value="All">All Majors</option>
            <option value="software">Software</option>
            <option value="engineering">Engineering</option>
            <option value="business">Business</option>
          </select>
          <select onChange={(e) => setFilterTime(e.target.value)} className="border p-2 rounded">
            <option value="All">All Times</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMentors.map(m => (
            <div key={m.id} className="p-4 border rounded shadow-sm">
              <h3 className="font-bold text-blue-700 text-lg">{m.name}</h3>
              <p>Institution: {m.institution}</p>
              <p>Expertise: {m.expertise}</p>
              <p>Available: {m.availableTime}</p>
              <p>⭐ {m.rating.toFixed(1)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
