import NextAuth, { NextAuthOptions } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '../../../lib/prisma';

const options: NextAuthOptions = {
  providers: [],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string || '';
      session.user.email = token.email as string || '';
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      else if (url.startsWith('/')) return new URL(url, baseUrl).toString();
      return baseUrl;
    },
  },
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: undefined,
  },
  debug: true, // Enable debug mode
};

const authHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("Auth request received:", req.method, req.url);
  try {
    await NextAuth(req, res, options);
  } catch (error) {
    console.error("Error in authHandler:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default authHandler;
