export const ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
export type GradeType = (typeof GRADE_TYPE)[keyof typeof GRADE_TYPE];

export const ENROLLMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DROPPED: 'dropped',
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
} as const;

export const GRADE_TYPE = {
  ASSIGNMENT: 'assignment',
  QUIZ: 'quiz',
  MIDTERM: 'midterm',
  FINAL: 'final',
  PROJECT: 'project',
} as const;

export const ANNOUNCEMENT_TARGET = {
  ALL: 'all',
  STUDENT: 'student',
  FACULTY: 'faculty',
} as const;