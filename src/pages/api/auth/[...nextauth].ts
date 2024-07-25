import NextAuth, { NextAuthOptions, User as NextAuthUser, Session as NextAuthSession } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import { AdapterUser } from 'next-auth/adapters';

const options: NextAuthOptions = {
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials) {
          return null;
        }
        const user = await authenticateUser(credentials.email, credentials.password);
        if (user) {
          return user;
        } else {
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser | AdapterUser }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: NextAuthSession; token: JWT }) {
      if (token.id) {
        session.user.id = token.id as number;
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
};

const authHandler = (req: NextApiRequest, res: NextApiResponse) => {
  return NextAuth(req, res, options);
};

export default authHandler;

async function authenticateUser(email: string, password: string) {
  // Replace with your own user authentication logic
  return { id: 1, name: 'User', email: email };
}
