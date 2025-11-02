'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MessageInterface from '@/components/messages/MessageInterface';
import Card from '@/components/ui/Card';

// Prevent auto-scroll on page load
if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'instant' });
}

interface Connection {
    _id: string;
    user: {
        userId: string;
        name: string;
        headline?: string;
        profilePicture?: string;
    };
    status: string;
}

function MessagesContent() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const [connections, setConnections] = useState<Connection[]>([]);
    const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Keep page at top on mount
        window.scrollTo({ top: 0, behavior: 'instant' });
        loadConnections();
    }, []);

    useEffect(() => {
        if (userId && connections.length > 0) {
            const connection = connections.find((c) => c.user.userId === userId);
            if (connection) {
                setSelectedConnection(connection);
            }
        }
    }, [userId, connections]);

    const loadConnections = async () => {
        try {
            const response = await fetch('/api/connections?status=accepted');
            const result = await response.json();

            if (result.success && result.data) {
                setConnections(result.data.accepted || []);
            }
        } catch (error) {
            console.error('Failed to load connections:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading messages...</p>
            </div>
        );
    }

    if (connections.length === 0) {
        return (
            <Card className="max-w-2xl mx-auto">
                <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">💬</div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Connections Yet</h2>
                    <p className="text-gray-600 mb-6">
                        You need to connect with someone before you can send messages.
                    </p>
                    <a
                        href="/matches"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                        Find Matches
                    </a>
                </div>
            </Card>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                    All messages are end-to-end encrypted
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Connections List */}
                <div className="lg:col-span-1">
                    <Card className="p-0 overflow-hidden">
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                            <h3 className="font-semibold text-gray-900">Your Connections</h3>
                            <p className="text-sm text-gray-600">{connections.length} connected</p>
                        </div>
                        <div className="divide-y max-h-[600px] overflow-y-auto">
                            {connections.map((connection) => (
                                <button
                                    key={connection._id}
                                    onClick={() => setSelectedConnection(connection)}
                                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${selectedConnection?._id === connection._id ? 'bg-purple-50' : ''
                                        }`}
                                >
                                    {connection.user.profilePicture ? (
                                        <img
                                            src={connection.user.profilePicture}
                                            alt={connection.user.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {connection.user.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {connection.user.name}
                                        </p>
                                        {connection.user.headline && (
                                            <p className="text-sm text-gray-600 truncate">
                                                {connection.user.headline}
                                            </p>
                                        )}
                                    </div>
                                    {selectedConnection?._id === connection._id && (
                                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Message Interface */}
                <div className="lg:col-span-2">
                    {selectedConnection ? (
                        <MessageInterface
                            otherUserId={selectedConnection.user.userId}
                            otherUserName={selectedConnection.user.name}
                        />
                    ) : (
                        <Card>
                            <div className="flex items-center justify-center h-[600px] text-gray-500">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">💬</div>
                                    <p className="text-lg font-medium">Select a connection to start messaging</p>
                                    <p className="text-sm">Your messages are end-to-end encrypted</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense
            fallback={
                <div className="text-center py-12">
                    <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
            }
        >
            <MessagesContent />
        </Suspense>
    );
}

