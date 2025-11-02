import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongodb';
import UserModel from '@/lib/db/models/User';

interface AuthUser {
    id: string;
    email: string;
    name: string;
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials): Promise<AuthUser | null> {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials');
                }

                await connectDB();

                const user = await UserModel.findOne({
                    email: String(credentials.email).toLowerCase(),
                });

                if (!user || !user.passwordHash) {
                    throw new Error('Invalid credentials');
                }

                const isValid = await bcrypt.compare(
                    String(credentials.password),
                    user.passwordHash
                );

                if (!isValid) {
                    throw new Error('Invalid credentials');
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.profile.name,
                };
            },
        }),
    ],

    session: {
        strategy: 'jwt',
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },

    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
        newUser: '/dashboard',
    },

    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.email = user.email ?? null;
                token.name = user.name ?? null;
            }

            if (trigger === 'update' && session?.user?.name) {
                token.name = session.user.name;
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            session.user.email = token.email as string;
            session.user.name = token.name as string;
            return session;
        },

        async redirect({ url, baseUrl }) {
            if (url.startsWith('/')) return `${baseUrl}${url}`;
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
};

