import NextAuth, { NextAuthOptions } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcrypt';
import supabase from '../../../lib/supabaseClient';

const options: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
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
    maxAge: 30 * 60,
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
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const { data, error } = await supabase.auth.signUp({
          email: user.email!,
          password: '', // Generate a random password or handle this case
        });

        if (error) {
          console.error('Error creating Supabase user:', error);
          return false;
        }

        // Update the user in your database with Supabase ID
        await prisma.user.update({
          where: { email: user.email! },
          data: { id: data.user!.id },
        });
      }
      return true;
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
  logger: {
    error: (code, metadata) => {
      console.error(code, metadata);
    },
    warn: (code) => {
      console.warn(code);
    },
    debug: (code, metadata) => {
      console.debug(code, metadata);
    },
  },
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
    // Ensure to include the password in the select statement
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