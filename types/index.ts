import { Role } from '../constants/roles';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  department?: string;
  studentId?: string;     // for students
  employeeId?: string;    // for faculty/admin
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourse {
  _id: string;
  code: string;
  title: string;
  description: string;
  faculty: string | IUser;
  department: string;
  credits: number;
  maxCapacity: number;
  semester: string;       // e.g. "2024/2025 - First"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnrollment {
  _id: string;
  student: string | IUser;
  course: string | ICourse;
  status: 'pending' | 'approved' | 'dropped';
  enrolledAt: Date;
  updatedAt: Date;
}

export interface IGrade {
  _id: string;
  student: string | IUser;
  course: string | ICourse;
  assignment: string;
  score: number;
  maxScore: number;
  type: 'assignment' | 'quiz' | 'midterm' | 'final' | 'project';
  gradedBy: string | IUser;
  gradedAt: Date;
  comment?: string;
}

export interface IAttendance {
  _id: string;
  student: string | IUser;
  course: string | ICourse;
  date: Date;
  status: 'present' | 'absent' | 'late';
  markedBy: string | IUser;
  note?: string;
}

export interface IAnnouncement {
  _id: string;
  title: string;
  body: string;
  author: string | IUser;
  targetRole: 'all' | 'student' | 'faculty';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog {
  _id: string;
  actor: string | IUser;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

// API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
}

// NextAuth session extension
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      image?: string;
    };
  }

  interface User {
    id: string;
    role: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
  }
}