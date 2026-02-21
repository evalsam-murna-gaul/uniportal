import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { forgotPasswordSchema } from '@/lib/validations';
import { apiError, apiSuccess, zodMessage, generateToken } from '@/lib/utils';

// In production, store tokens in DB or Redis with expiry
// and send via an email provider (Resend, Nodemailer, etc.)
// This implementation logs the token to console for local dev.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(zodMessage(parsed.error), 400);
    }

    const { email } = parsed.data;

    await connectDB();

    const user = await User.findOne({ email, isActive: true });

    // Always return 200 to prevent email enumeration attacks
    if (!user) {
      return apiSuccess(
        null,
        'If an account exists for that email, a reset link has been sent.'
      );
    }

    const token = generateToken(48);
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // TODO: Replace with actual email service (Resend, Nodemailer, etc.)
    // Example: await sendPasswordResetEmail(email, resetUrl);
    console.log(`[DEV] Password reset link for ${email}: ${resetUrl}`);

    // TODO: Store token hash in DB with expiry (30 minutes)
    // await PasswordResetToken.create({ userId: user._id, tokenHash: hash(token), expiresAt: ... })

    return apiSuccess(
      null,
      'If an account exists for that email, a reset link has been sent.'
    );
  } catch (err) {
    console.error('[POST /api/auth/forgot-password]', err);
    return apiError('Something went wrong. Please try again.', 500);
  }
}