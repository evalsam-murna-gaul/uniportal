import { z } from 'zod';
import { ROLES, GRADE_TYPE, ATTENDANCE_STATUS, ANNOUNCEMENT_TARGET } from '@/constants/roles';

// ─── Auth ───────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum([ROLES.STUDENT, ROLES.FACULTY, ROLES.ADMIN]),
  department: z.string().trim().optional().transform(v => v || undefined),
  studentId: z.string().trim().optional().transform(v => v || undefined),
  employeeId: z.string().trim().optional().transform(v => v || undefined),
  phone: z.string().trim().optional().transform(v => v || undefined),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// ─── User ───────────────────────────────────────────────
export const updateUserSchema = z.object({
  name: z.string().min(2).trim().optional(),
  department: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  avatar: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

// ─── Course ─────────────────────────────────────────────
export const createCourseSchema = z.object({
  code: z
    .string()
    .toUpperCase()
    .regex(/^[A-Z]{2,4}\d{3,4}$/, 'Course code format: CS101, MATH202'),
  title: z.string().min(3, 'Title must be at least 3 characters').trim(),
  description: z.string().trim().optional(),
  faculty: z.string().min(1, 'Faculty ID is required'),
  department: z.string().min(1, 'Department is required').trim(),
  credits: z.number().min(1).max(6),
  maxCapacity: z.number().min(1).default(50),
  semester: z.string().min(1, 'Semester is required').trim(),
});

export const updateCourseSchema = createCourseSchema.partial();

// ─── Grade ──────────────────────────────────────────────
export const createGradeSchema = z.object({
  student: z.string().min(1, 'Student ID is required'),
  course: z.string().min(1, 'Course ID is required'),
  assignment: z.string().min(1, 'Assignment name is required').trim(),
  score: z.number().min(0),
  maxScore: z.number().min(1),
  type: z.enum([
    GRADE_TYPE.ASSIGNMENT,
    GRADE_TYPE.QUIZ,
    GRADE_TYPE.MIDTERM,
    GRADE_TYPE.FINAL,
    GRADE_TYPE.PROJECT,
  ]),
  comment: z.string().trim().optional(),
});

export const updateGradeSchema = createGradeSchema.partial().omit({ student: true, course: true });

// ─── Attendance ─────────────────────────────────────────
export const markAttendanceSchema = z.object({
  course: z.string().min(1),
  date: z.string().datetime({ message: 'Invalid date format (ISO 8601 required)' }),
  records: z.array(
    z.object({
      student: z.string().min(1),
      status: z.enum([
        ATTENDANCE_STATUS.PRESENT,
        ATTENDANCE_STATUS.ABSENT,
        ATTENDANCE_STATUS.LATE,
      ]),
      note: z.string().optional(),
    })
  ).min(1, 'At least one attendance record required'),
});

// ─── Announcement ───────────────────────────────────────
export const createAnnouncementSchema = z.object({
  title: z.string().min(3).trim(),
  body: z.string().min(10, 'Announcement body must be at least 10 characters').trim(),
  targetRole: z.enum([
    ANNOUNCEMENT_TARGET.ALL,
    ANNOUNCEMENT_TARGET.STUDENT,
    ANNOUNCEMENT_TARGET.FACULTY,
  ]).default(ANNOUNCEMENT_TARGET.ALL),
  expiresAt: z.string().datetime().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type CreateGradeInput = z.infer<typeof createGradeSchema>;
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;