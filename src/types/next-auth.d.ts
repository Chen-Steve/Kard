import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
    } & DefaultSession['user'];
    rememberMe?: boolean;
    maxAge?: number;
  }

  interface User {
    id: string;
    email: string;
    rememberMe?: boolean;
  }
}