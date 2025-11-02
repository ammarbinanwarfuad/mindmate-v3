'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import NotificationBell from './NotificationBell';
import ActiveStatusIndicator from '@/components/ui/ActiveStatusIndicator';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [showLoadingSkeleton, setShowLoadingSkeleton] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Determine authentication state
    const isAuthenticated = !!session;
    const isLoading = status === 'loading';

    // Only show loading skeleton for a brief moment to prevent flash
    useEffect(() => {
        if (status !== 'loading') {
            setShowLoadingSkeleton(false);
        } else {
            // Set a maximum loading time to prevent indefinite skeleton
            const timer = setTimeout(() => {
                setShowLoadingSkeleton(false);
            }, 500); // Only show skeleton for max 500ms
            return () => clearTimeout(timer);
        }
    }, [status]);

    // Debug logging
    useEffect(() => {
        console.log('🔍 Navbar Session State:', {
            status,
            hasSession: !!session,
            userEmail: session?.user?.email,
            isLoading,
            isAuthenticated,
            showLoadingSkeleton
        });
    }, [session, status, isLoading, isAuthenticated, showLoadingSkeleton]);

    // Load profile picture
    useEffect(() => {
        const loadProfilePicture = async () => {
            try {
                const response = await fetch('/api/user/profile', {
                    cache: 'no-store', // Prevent caching
                });
                const result = await response.json();
                if (result.success && result.data?.profile?.profilePicture) {
                    console.log('Navbar: Profile picture loaded');
                    setProfilePicture(result.data.profile.profilePicture);
                } else {
                    console.log('Navbar: No profile picture');
                    setProfilePicture(null);
                }
            } catch (error) {
                console.error('Failed to load profile picture:', error);
            }
        };

        if (session) {
            loadProfilePicture();
        }

        // Listen for profile picture updates
        const handleProfileUpdate = () => {
            loadProfilePicture();
        };

        window.addEventListener('profilePictureUpdated', handleProfileUpdate);

        return () => {
            window.removeEventListener('profilePictureUpdated', handleProfileUpdate);
        };
    }, [session]);

    // Load theme from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
        if (savedTheme) {
            setTheme(savedTheme);
            applyTheme(savedTheme);
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setProfileDropdownOpen(false);
            }
        }

        if (profileDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [profileDropdownOpen]);

    const applyTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
        const root = document.documentElement;

        if (selectedTheme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.toggle('dark', systemTheme === 'dark');
        } else {
            root.classList.toggle('dark', selectedTheme === 'dark');
        }
    };

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/chat', label: 'Chat', icon: '💬' },
        { href: '/mood', label: 'Mood', icon: '📈' },
        { href: '/matches', label: 'Matches', icon: '🤝' },
        { href: '/messages', label: 'Messages', icon: '✉️' },
        { href: '/community', label: 'Community', icon: '👥' },
    ];

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                // Smart navigation based on authentication status
                                if (session) {
                                    // Logged IN: Always go to dashboard
                                    router.push('/dashboard');
                                } else {
                                    // Logged OUT: Always go to main landing page
                                    window.location.href = '/';
                                }
                            }}
                            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
                            aria-label="MindMate Home"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-xl">
                                🧠
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                MindMate
                            </span>
                        </button>
                    </div>

                    {/* Navigation based on authentication status */}
                    {showLoadingSkeleton && isLoading ? (
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                                ))}
                            </div>
                            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                        </div>
                    ) : isAuthenticated ? (
                        <>
                            <div className="hidden md:flex items-center gap-1">
                                {navItems.map(item => {
                                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                        ${isActive
                                                    ? 'bg-purple-50 text-purple-700 font-semibold'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                }
                      `}
                                        >
                                            <span>{item.icon}</span>
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-4">
                                <NotificationBell />

                                {/* Profile Dropdown */}
                                <div className="hidden md:block relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                        className="p-1 rounded-full hover:bg-gray-50 transition-colors"
                                        aria-label="Profile menu"
                                        title="Profile menu"
                                    >
                                        <div className="relative">
                                            {profilePicture ? (
                                                <img
                                                    key={profilePicture}
                                                    src={profilePicture}
                                                    alt="Profile"
                                                    className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-purple-100"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold text-lg cursor-pointer">
                                                    {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 right-0">
                                                <ActiveStatusIndicator isOnline={true} size="sm" />
                                            </div>
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {profileDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                            {/* Profile */}
                                            <Link
                                                href="/profile"
                                                onClick={() => setProfileDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span className="text-gray-700">Profile</span>
                                            </Link>

                                            {/* Settings */}
                                            <Link
                                                href="/settings"
                                                onClick={() => setProfileDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-gray-700">Settings</span>
                                            </Link>

                                            <div className="border-t border-gray-200 my-2"></div>

                                            {/* Theme Selector */}
                                            <div className="px-4 py-2">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Theme</p>
                                                <div className="space-y-1">
                                                    <button
                                                        onClick={() => handleThemeChange('light')}
                                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${theme === 'light' ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-700'
                                                            }`}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                        <span>Light</span>
                                                        {theme === 'light' && <span className="ml-auto text-purple-600">✓</span>}
                                                    </button>
                                                    <button
                                                        onClick={() => handleThemeChange('dark')}
                                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-700'
                                                            }`}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                                        </svg>
                                                        <span>Dark</span>
                                                        {theme === 'dark' && <span className="ml-auto text-purple-600">✓</span>}
                                                    </button>
                                                    <button
                                                        onClick={() => handleThemeChange('system')}
                                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${theme === 'system' ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-700'
                                                            }`}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>System</span>
                                                        {theme === 'system' && <span className="ml-auto text-purple-600">✓</span>}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-200 my-2"></div>

                                            {/* Logout */}
                                            <button
                                                onClick={() => {
                                                    setProfileDropdownOpen(false);
                                                    signOut({ callbackUrl: '/login' });
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                                    aria-label="Toggle mobile menu"
                                    title="Toggle mobile menu"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {mobileMenuOpen ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-gray-700 hover:text-purple-600 font-medium">
                                Log In
                            </Link>
                            <Link
                                href="/register"
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>

                {mobileMenuOpen && isAuthenticated && (
                    <div className="md:hidden border-t border-gray-200 py-4">
                        <div className="space-y-1">
                            {navItems.map(item => {
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                      ${isActive
                                                ? 'bg-purple-50 text-purple-700 font-semibold'
                                                : 'text-gray-600'
                                            }
                    `}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                            <div className="border-t border-gray-200 my-2"></div>

                            <Link
                                href="/profile"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-gray-600"
                            >
                                <div className="relative">
                                    {profilePicture ? (
                                        <img
                                            key={profilePicture}
                                            src={profilePicture}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full object-cover border-2 border-purple-100"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0">
                                        <ActiveStatusIndicator isOnline={true} size="sm" />
                                    </div>
                                </div>
                                <span>Profile</span>
                            </Link>

                            <Link
                                href="/settings"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-gray-600"
                            >
                                <span className="text-xl">⚙️</span>
                                <span>Settings</span>
                            </Link>

                            {/* Theme Options */}
                            <div className="px-4 py-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Theme</p>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => {
                                            handleThemeChange('light');
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${theme === 'light' ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                                            }`}
                                    >
                                        <span className="text-lg">☀️</span>
                                        <span>Light</span>
                                        {theme === 'light' && <span className="ml-auto text-purple-600">✓</span>}
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleThemeChange('dark');
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                                            }`}
                                    >
                                        <span className="text-lg">🌙</span>
                                        <span>Dark</span>
                                        {theme === 'dark' && <span className="ml-auto text-purple-600">✓</span>}
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleThemeChange('system');
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${theme === 'system' ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                                            }`}
                                    >
                                        <span className="text-lg">💻</span>
                                        <span>System</span>
                                        {theme === 'system' && <span className="ml-auto text-purple-600">✓</span>}
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 my-2"></div>

                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-600"
                            >
                                <span className="text-xl">🚪</span>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

