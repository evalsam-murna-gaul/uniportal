import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validations';
import { apiError, apiSuccess, zodMessage } from '@/lib/utils';
import { audit } from '@/lib/audit';

function isAuthorised(role: string, req: NextRequest): boolean {
  // Students — always open
  if (role === 'student') return true;

  // Admin dashboard creating any role — verified by a server-only admin secret
  // This secret is never exposed to the browser, only sent server-to-server
  const adminSecret = req.headers.get('x-admin-secret');
  const expectedSecret = process.env.ADMIN_API_SECRET;
  if (expectedSecret && adminSecret === expectedSecret) return true;

  // Self-registration via token-protected URL
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
      return apiError(zodMessage(parsed.error), 400);
    }

    const { name, email, password, role, department, studentId, employeeId, phone } = parsed.data;

    if (!isAuthorised(role, req)) {
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
      ...(department ? { department } : {}),
      ...(phone ? { phone } : {}),
      ...(studentId ? { studentId } : {}),
      ...(employeeId ? { employeeId } : {}),
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