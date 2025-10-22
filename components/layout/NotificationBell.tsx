'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils/helpers';

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    fromUserName?: string;
    createdAt: string;
}

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadUnreadCount();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (showDropdown) {
            loadNotifications();
        }
    }, [showDropdown]);

    const loadUnreadCount = async () => {
        try {
            const response = await fetch('/api/notifications?action=count');
            const result = await response.json();
            if (result.success) {
                setUnreadCount(result.data.count);
            }
        } catch (error) {
            console.error('Failed to load notification count:', error);
        }
    };

    const loadNotifications = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/notifications?limit=10');
            const result = await response.json();
            if (result.success) {
                setNotifications(result.data);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getNotificationIcon = (type: string) => {
        const icons: Record<string, string> = {
            match: '🤝',
            match_accepted: '🎉',
            message: '💬',
            post: '📝',
            comment: '💬',
            reaction: '❤️',
            repost: '🔄',
            mood: '😊',
            chat: '🤖',
            system: '⚙️',
            profile_view: '👁️',
        };
        return icons[type] || '🔔';
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
                title="Notifications"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="text-xs text-purple-600">{unreadCount} new</span>
                                )}
                            </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {isLoading ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    <p className="text-sm">No new notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {notifications.map((notif) => (
                                        <Link
                                            key={notif._id}
                                            href={notif.link || '#'}
                                            onClick={() => setShowDropdown(false)}
                                            className={`block p-4 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-purple-50' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl flex-shrink-0">
                                                    {getNotificationIcon(notif.type)}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatRelativeTime(notif.createdAt)}
                                                    </p>
                                                </div>
                                                {!notif.read && (
                                                    <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-2"></div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-2 border-t">
                            <Link
                                href="/notifications"
                                className="block text-center text-sm text-purple-600 hover:text-purple-700 py-2"
                                onClick={() => setShowDropdown(false)}
                            >
                                View all notifications
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

