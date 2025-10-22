import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
            req.nextUrl.pathname.startsWith('/register');
        const isRootPath = req.nextUrl.pathname === '/';

        // If user is authenticated and tries to access root, redirect to dashboard
        if (isAuth && isRootPath) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        // If user is NOT authenticated and tries to access root, allow it (show landing page)
        if (!isAuth && isRootPath) {
            return null;
        }

        // If user is authenticated and tries to access login/register, redirect to dashboard
        if (isAuthPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
            return null;
        }

        // If user is not authenticated and tries to access protected routes
        if (!isAuth) {
            let from = req.nextUrl.pathname;
            if (req.nextUrl.search) {
                from += req.nextUrl.search;
            }

            return NextResponse.redirect(
                new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
            );
        }
    },
    {
        callbacks: {
            authorized: () => true, // We handle auth logic in the middleware function
        },
    }
);

export const config = {
    matcher: [
        '/',
        '/dashboard/:path*',
        '/chat/:path*',
        '/mood/:path*',
        '/profile/:path*',
        '/matches/:path*',
        '/messages/:path*',
        '/community/:path*',
        '/resources/:path*',
        '/notifications/:path*',
        '/settings/:path*',
        '/login',
        '/register',
    ],
};

