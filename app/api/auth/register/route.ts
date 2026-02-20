import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validations';
import { apiError, apiSuccess, zodMessage } from '@/lib/utils';
import { audit } from '@/lib/audit';

// Validates that the caller has the right to register a given role:
// - 'student'  → always allowed (open registration)
// - 'faculty'  → valid FACULTY_REGISTER_TOKEN header, OR admin session, OR x-admin-create header with admin session
// - 'admin'    → valid ADMIN_REGISTER_TOKEN header, OR admin session
async function canRegisterRole(
  role: string,
  req: NextRequest
): Promise<boolean> {
  if (role === 'student') return true;

  // Check if an active admin session is making this request (from UserFormModal)
  const isAdminCreate = req.headers.get('x-admin-create') === 'true';
  if (isAdminCreate) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role === 'admin') return true;
  }

  // Check role-specific registration token (from self-registration pages)
  const token = req.headers.get('x-register-token');
  if (role === 'faculty') {
    const expected = process.env.FACULTY_REGISTER_TOKEN;
    return !!expected && token === expected;
  }
  if (role === 'admin') {
    const expected = process.env.ADMIN_REGISTER_TOKEN;
    return !!expected && token === expected;
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const message = zodMessage(parsed.error);
      return apiError(message, 400);
    }

    const { name, email, password, role, department, studentId, employeeId, phone } = parsed.data;

    // Enforce role authorisation — cannot be bypassed
    const allowed = await canRegisterRole(role, req);
    if (!allowed) {
      return apiError('You are not authorised to register with this role', 403);
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      ...(department && { department }),
      ...(phone && { phone }),
      ...(studentId && { studentId }),
      ...(employeeId && { employeeId }),
    });

    audit({
      actorId: user._id.toString(),
      action: 'REGISTER',
      resource: 'User',
      resourceId: user._id.toString(),
      metadata: { role, email },
    });

    return apiSuccess(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      'Account created successfully',
      201
    );
  } catch (err) {
    console.error('[POST /api/auth/register]', err);
    return apiError('Registration failed. Please try again.', 500);
  }
}