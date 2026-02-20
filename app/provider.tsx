'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

// This is a client wrapper — the actual root layout imports this
export default function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}