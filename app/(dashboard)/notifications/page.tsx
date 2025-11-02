'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { NotificationSkeleton } from '@/components/ui/Skeleton';
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

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/notifications?limit=50');
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

    const handleMarkAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'markAllRead' }),
            });

            if (response.ok) {
                loadNotifications();
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleNotificationClick = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications/${notificationId}`, {
                method: 'PATCH',
            });
            loadNotifications();
        } catch (error) {
            console.error('Failed to mark as read:', error);
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

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-2">
                    Stay updated with all your activities
                </p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>All Notifications</CardTitle>
                        {unreadCount > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 rounded text-sm transition-colors ${filter === 'all'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-3 py-1 rounded text-sm transition-colors ${filter === 'unread'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Unread ({unreadCount})
                            </button>
                        </div>
                        {unreadCount > 0 && (
                            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                                Mark All Read
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div>
                            <NotificationSkeleton />
                            <NotificationSkeleton />
                            <NotificationSkeleton />
                            <NotificationSkeleton />
                            <NotificationSkeleton />
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-lg font-medium mb-2">No notifications</p>
                            <p className="text-sm">You&apos;re all caught up! 🎉</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredNotifications.map((notif) => (
                                <Link
                                    key={notif._id}
                                    href={notif.link || '#'}
                                    onClick={() => handleNotificationClick(notif._id)}
                                    className={`block p-5 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-purple-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <span className="text-3xl">
                                                {getNotificationIcon(notif.type)}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-base font-semibold text-gray-900">
                                                    {notif.title}
                                                </p>
                                                {!notif.read && (
                                                    <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-2"></div>
                                                )}
                                            </div>
                                            <p className="text-gray-700 mt-1">
                                                {notif.message}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {formatRelativeTime(notif.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

