import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date to a readable string */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

/** Calculate letter grade from percentage */
export function getLetterGrade(percentage: number): string {
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 45) return 'D';
  return 'F';
}

/** Calculate GPA from an array of grade entries */
export function calculateGPA(
  grades: { score: number; maxScore: number; credits: number }[]
): number {
  if (grades.length === 0) return 0;
  let totalPoints = 0;
  let totalCredits = 0;
  for (const g of grades) {
    const pct = (g.score / g.maxScore) * 100;
    const gradePoint = getGradePoint(pct);
    totalPoints += gradePoint * g.credits;
    totalCredits += g.credits;
  }
  return totalCredits === 0 ? 0 : parseFloat((totalPoints / totalCredits).toFixed(2));
}

function getGradePoint(percentage: number): number {
  if (percentage >= 70) return 5.0;
  if (percentage >= 60) return 4.0;
  if (percentage >= 50) return 3.0;
  if (percentage >= 45) return 2.0;
  return 0.0;
}

/** Extract first Zod validation error message safely */
export function zodMessage(error: unknown, fallback = 'Invalid request data'): string {
  if (error && typeof error === 'object' && 'errors' in error) {
    const errors = (error as { errors: { message: string }[] }).errors;
    return errors[0]?.message ?? fallback;
  }
  return fallback;
}

/** Standardize API success response */
export function apiSuccess<T>(data: T, message?: string, status = 200) {
  return Response.json({ success: true, data, message }, { status });
}

/** Standardize API error response */
export function apiError(error: string, status = 400) {
  return Response.json({ success: false, error, code: status }, { status });
}

/** Generate a random alphanumeric token */
export function generateToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/** Paginate a Mongoose query */
export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}