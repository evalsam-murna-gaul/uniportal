import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from './auth';
import { Role } from '../constants/roles';
import { Session } from 'next-auth';

type RouteHandler = (
  req: NextRequest,
  session: Session,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>;

/**
 * Wraps an API route handler with role-based access control.
 *
 * @param allowedRoles - Array of roles permitted to access this route
 * @param handler - The actual route handler
 *
 * @example
 * export const GET = withRole(['admin'], async (req, session) => {
 *   // session.user.id and session.user.role are guaranteed here
 *   return NextResponse.json({ success: true, data: [...] });
 * });
 */
export function withRole(allowedRoles: Role[], handler: RouteHandler) {
  return async (req: NextRequest, context?: { params: Record<string, string> }) => {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized — please log in', code: 401 },
        { status: 401 }
      );
    }

    if (!allowedRoles.includes(session.user.role as Role)) {
      return NextResponse.json(
        {
          success: false,
          error: `Forbidden — requires one of: ${allowedRoles.join(', ')}`,
          code: 403,
        },
        { status: 403 }
      );
    }

    return handler(req, session, context);
  };
}

/**
 * Shorthand wrappers for common single-role guards
 */
export const withStudent = (handler: RouteHandler) => withRole(['student'], handler);
export const withFaculty = (handler: RouteHandler) => withRole(['faculty'], handler);
export const withAdmin = (handler: RouteHandler) => withRole(['admin'], handler);
export const withFacultyOrAdmin = (handler: RouteHandler) => withRole(['faculty', 'admin'], handler);