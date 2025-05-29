export interface User {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  role: 'student' | 'mentor';
  phone?: string;
  studentId?: string;
  degree?: string;
  major?: string;
  year?: string;
  specialty?: string;
  expertise: string[];
  interests: string[];
  institution?: string;
  bio?: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}