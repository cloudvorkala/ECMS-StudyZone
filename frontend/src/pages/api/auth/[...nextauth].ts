import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        try {
          const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
              role: credentials?.role
            }),
          });

          const user = await res.json();

          if (res.ok && user) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            };
          }
          return null;
        } catch {
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/',
    error: '/auth/error',
  }
});