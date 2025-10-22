'use client';

import { useState, useEffect } from 'react';
import MatchCard from '@/components/matches/MatchCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { MatchCardSkeleton } from '@/components/ui/Skeleton';

interface Match {
    userId: string;
    name: string;
    university?: string;
    year?: number;
    bio?: string;
    matchScore: number;
    commonInterests: string[];
}

interface ConnectionRequest {
    _id: string;
    user: {
        userId: string;
        name: string;
        headline?: string;
        university?: string;
        year?: number;
        bio?: string;
        profilePicture?: string;
    };
    matchScore: number;
    commonInterests: string[];
}

export default function MatchesPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]); // NEW
    const [connections, setConnections] = useState<ConnectionRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        loadMatches();
        loadPendingRequests();
        loadSentRequests(); // NEW
        loadConnections();
    }, [refreshKey]);

    const loadMatches = async () => {
        try {
            const response = await fetch('/api/matching/find');
            const result = await response.json();

            if (result.success) {
                setMatches(result.data);
            }
        } catch (error) {
            console.error('Failed to load matches:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadPendingRequests = async () => {
        try {
            const response = await fetch('/api/connections?type=received&status=pending');
            const result = await response.json();

            if (result.success && result.data) {
                const requests = result.data.pendingReceived || [];
                console.log('📬 Loaded pending requests:', requests.length);
                setPendingRequests(requests);
            }
        } catch (error) {
            console.error('Failed to load pending requests:', error);
        }
    };

    const loadSentRequests = async () => { // NEW FUNCTION
        try {
            const response = await fetch('/api/connections?type=sent&status=pending');
            const result = await response.json();

            if (result.success && result.data) {
                const requests = result.data.pendingSent || [];
                console.log('📤 Loaded sent requests:', requests.length);
                setSentRequests(requests);
            }
        } catch (error) {
            console.error('Failed to load sent requests:', error);
        }
    };

    const loadConnections = async () => {
        try {
            const response = await fetch('/api/connections?status=accepted');
            const result = await response.json();

            if (result.success && result.data) {
                const accepted = result.data.accepted || [];
                console.log('🤝 Loaded connections:', accepted.length);
                setConnections(accepted);
            }
        } catch (error) {
            console.error('Failed to load connections:', error);
        }
    };

    const handleRefresh = () => {
        console.log('🔄 Refreshing matches page...');
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Peer Matches</h1>
                <p className="text-gray-600 mt-2">
                    Connect with peers who share similar experiences
                </p>
            </div>

            {/* SECTION 1: Pending Connection Requests - ALWAYS SHOW */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-2xl">👥</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Connection Requests</h2>
                            <p className="text-sm text-gray-600 font-medium">
                                {pendingRequests.length === 0
                                    ? 'No pending requests'
                                    : `${pendingRequests.length} ${pendingRequests.length === 1 ? 'person wants' : 'people want'} to connect with you`
                                }
                            </p>
                        </div>
                    </div>
                    {pendingRequests.length > 0 && (
                        <Badge variant="warning" className="text-base px-3 py-1.5 font-bold">{pendingRequests.length}</Badge>
                    )}
                </div>

                {pendingRequests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingRequests.map((request) => (
                            <MatchCard
                                key={request.user.userId}
                                match={{
                                    userId: request.user.userId,
                                    name: request.user.name,
                                    university: request.user.university,
                                    year: request.user.year,
                                    bio: request.user.bio,
                                    matchScore: request.matchScore,
                                    commonInterests: request.commonInterests
                                }}
                                onAccept={handleRefresh}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-5xl mb-3">📭</div>
                        <p className="text-gray-600 font-medium">No connection requests yet</p>
                        <p className="text-gray-500 text-sm mt-1">When someone wants to connect, you&apos;ll see them here!</p>
                    </div>
                )}
            </div>

            {/* SECTION 2: Sent Connections - Requests YOU Sent - ALWAYS SHOW */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-orange-200">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-2xl">📤</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Sent Connections</h2>
                            <p className="text-sm text-gray-600 font-medium">
                                {sentRequests.length === 0
                                    ? 'No pending sent requests'
                                    : `${sentRequests.length} pending ${sentRequests.length === 1 ? 'request' : 'requests'}`
                                }
                            </p>
                        </div>
                    </div>
                    {sentRequests.length > 0 && (
                        <Badge variant="warning" className="text-base px-3 py-1.5 font-bold">{sentRequests.length}</Badge>
                    )}
                </div>

                {sentRequests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sentRequests.map((request) => (
                            <MatchCard
                                key={request.user.userId}
                                match={{
                                    userId: request.user.userId,
                                    name: request.user.name,
                                    university: request.user.university,
                                    year: request.user.year,
                                    bio: request.user.bio,
                                    matchScore: request.matchScore,
                                    commonInterests: request.commonInterests
                                }}
                                onAccept={handleRefresh}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-5xl mb-3">📤</div>
                        <p className="text-gray-600 font-medium">No pending sent requests</p>
                        <p className="text-gray-500 text-sm mt-1">When you send connection requests, you&apos;ll see them here!</p>
                    </div>
                )}
            </div>

            {/* SECTION 3: Suggested Matches - Facebook Style */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xl">✨</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">People You May Know</h2>
                            <p className="text-sm text-gray-600">Suggested connections based on your interests</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleRefresh} size="sm" className="gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <MatchCardSkeleton />
                        <MatchCardSkeleton />
                        <MatchCardSkeleton />
                        <MatchCardSkeleton />
                        <MatchCardSkeleton />
                        <MatchCardSkeleton />
                    </div>
                ) : (
                    <>
                        {matches.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {matches.map((match) => (
                                    <MatchCard
                                        key={match.userId}
                                        match={match}
                                        onAccept={handleRefresh}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🔍</div>
                                <p className="text-gray-600 mb-4 text-lg font-medium">No suggestions right now</p>
                                <p className="text-gray-500 text-sm mb-4">Check back later for new connection suggestions!</p>
                                <Button onClick={handleRefresh} className="gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Find New Matches
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* SECTION 4: My Connections - Facebook Style Friends List - ALWAYS SHOW */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-2xl">🤝</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">My Connections</h2>
                            <p className="text-sm text-gray-600">
                                {connections.length === 0
                                    ? 'No connections yet'
                                    : `${connections.length} ${connections.length === 1 ? 'connection' : 'connections'}`
                                }
                            </p>
                        </div>
                    </div>
                    {connections.length > 0 && (
                        <Badge variant="success" className="text-base px-3 py-1.5 font-bold">{connections.length}</Badge>
                    )}
                </div>

                {connections.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {connections.map((connection) => (
                            <MatchCard
                                key={connection.user.userId}
                                match={{
                                    userId: connection.user.userId,
                                    name: connection.user.name,
                                    university: connection.user.university,
                                    year: connection.user.year,
                                    bio: connection.user.bio,
                                    matchScore: connection.matchScore,
                                    commonInterests: connection.commonInterests
                                }}
                                onAccept={handleRefresh}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-5xl mb-3">🤝</div>
                        <p className="text-gray-600 font-medium">No connections yet</p>
                        <p className="text-gray-500 text-sm mt-1">Start connecting with people to see them here!</p>
                    </div>
                )}
            </div>
        </div>
    );
}


