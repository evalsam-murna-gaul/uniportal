import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from './db';
import User from '@/models/User';
import { loginSchema } from './validations';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate input shape
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error('Invalid email or password format');
        }

        const { email, password } = parsed.data;

        await connectDB();

        // Fetch user with passwordHash (select: false means we must explicitly include it)
        const user = await User.findOne({ email }).select('+passwordHash');

        if (!user) throw new Error('No account found with that email');
        if (!user.isActive) throw new Error('Your account has been deactivated. Contact admin.');

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) throw new Error('Incorrect password');

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.avatar || null,
        };
      },
    }),
  ],

  callbacks: {
    // Add role and id to the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Expose role and id on the client session
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
};