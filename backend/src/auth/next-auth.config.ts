import { UsersService } from '../users/users.service';
import { compare } from 'bcrypt';
import { User } from '../users/schemas/user.schema';

export const nextAuthConfig = (usersService: UsersService) => ({
  providers: [
    {
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: any) {
        const user = await usersService.findByEmail(credentials.email);
        if (!user) {
          return null;
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: (user as any)._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    }
  ],
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    }
  }
});