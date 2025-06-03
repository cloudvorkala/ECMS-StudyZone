

import React from 'react';

interface MentorCardProps {
  name: string;
  expertise: string;
  institution: string;
  onBook: () => void;
}

export default function MentorCard({ name, expertise, institution, onBook }: MentorCardProps) {
  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-blue-800 mb-2">{name}</h3>
      <p className="text-sm text-gray-600 mb-1">Expertise: {expertise}</p>
      <p className="text-sm text-gray-600 mb-4">Institution: {institution}</p>
      <button onClick={onBook} className="btn w-full">
        Request Session
      </button>
    </div>
  );
}