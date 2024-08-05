import NextAuth, { NextAuthOptions } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcrypt';

const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials || typeof credentials.email !== 'string' || typeof credentials.password !== 'string') {
          console.error("Invalid credentials provided");
          return null;
        }

        try {
          const user = await authenticateUser(credentials.email, credentials.password);
          if (user) {
            return user;
          } else {
            console.error("Invalid email or password");
            return null;
          }
        } catch (error) {
          console.error("Error in authorize function", error);
          return null;
        }
      }
    })
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id.toString();
      }
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

async function authenticateUser(email: string, password: string) {
  console.log("Authenticating user:", email);
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });

    if (user && user.password && await bcrypt.compare(password, user.password)) {
      return user;
    } else {
      console.error("Invalid email or password");
      return null;
    }
  } catch (error) {
    console.error("Error in authenticateUser:", error);
    return null;
  }
}