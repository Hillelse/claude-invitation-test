import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const USERS = [
  { id: '1', username: 'hillel',       password: '12345',             name: 'Hillel' },
  { id: '2', username: 'shirel',       password: '12345',             name: 'Shirel' },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = USERS.find(
          u => u.username === credentials?.username && u.password === credentials?.password
        );
        return user ? { id: user.id, name: user.name, email: user.username } : null;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
};
