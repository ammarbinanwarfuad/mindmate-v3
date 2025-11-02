import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    swcMinify: true, // Faster minification
    compress: true, // Enable gzip compression
    poweredByHeader: false, // Remove X-Powered-By header
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
        formats: ['image/avif', 'image/webp'], // Modern image formats
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    env: {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
    compiler: {
        removeConsole:
            process.env.NODE_ENV === 'production'
                ? {
                    exclude: ['error', 'warn'],
                }
                : false,
    },
    experimental: {
        optimizePackageImports: ['lucide-react', 'date-fns'], // Optimize imports
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                ],
            },
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;

