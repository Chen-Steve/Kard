import NextAuth, { NextAuthOptions, User, Session } from 'next-auth'; // Updated import
import { NextApiRequest, NextApiResponse } from 'next';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt'; // Add this import
import { AdapterUser } from 'next-auth/adapters'; // Add this import

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
    async jwt({ token, user }: { token: JWT; user?: User | AdapterUser }) { // Updated signature
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) { // Updated signature
      session.user.id = Number(token.id); // Cast token.id to number
      return session;
    }
  }
};

const authHandler = (req: NextApiRequest, res: NextApiResponse) => {
  return NextAuth(req, res, options);
};

export default authHandler;

async function authenticateUser(email: string, password: string) {
  // Replace with your own user authentication logic
  return { id: 1, name: 'User', email: email };
}