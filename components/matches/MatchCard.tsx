'use client';

import { memo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AlertModal from '@/components/ui/AlertModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useAlert } from '@/hooks/useAlert';
import { useConfirm } from '@/hooks/useConfirm';

interface Match {
    userId: string;
    name: string;
    university?: string;
    year?: number;
    bio?: string;
    matchScore: number;
    commonInterests: string[];
}

interface MatchCardProps {
    match: Match;
    onAccept: (userId: string) => void;
}

const MatchCard = memo(function MatchCard({ match, onAccept }: MatchCardProps) {
    const router = useRouter();
    const { isOpen, message, options, showAlert, hideAlert } = useAlert();
    const { isOpen: isConfirmOpen, message: confirmMessage, options: confirmOptions, confirm, handleConfirm, handleCancel } = useConfirm();
    const [connectionStatus, setConnectionStatus] = useState<{
        connected: boolean;
        pending: boolean;
        isRequester: boolean;
        isReceiver: boolean;
        connectionId?: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        checkConnectionStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [match.userId]);

    const checkConnectionStatus = async () => {
        try {
            const response = await fetch(`/api/connections?userId=${match.userId}`);
            const result = await response.json();
            console.log('🔍 Connection status for', match.name, ':', result);

            if (result.success) {
                setConnectionStatus({
                    connected: result.connected || false,
                    pending: result.pending || false,
                    isRequester: result.isRequester || false,
                    isReceiver: result.isReceiver || false,
                    connectionId: result.data?._id
                });
            } else {
                // No connection exists yet
                setConnectionStatus(null);
            }
        } catch (error) {
            console.error('Error checking connection status:', error);
            setConnectionStatus(null);
        }
    };

    const handleSendRequest = async () => {
        console.log('📤 Sending connection request to:', match.name, match.userId);
        setIsLoading(true);

        try {
            const response = await fetch('/api/connections/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: match.userId,
                    matchScore: match.matchScore || 0,
                    commonInterests: match.commonInterests || []
                })
            });

            const result = await response.json();
            console.log('📤 Connection request result:', result);

            if (result.success) {
                // Immediately update to show "Request Sent"
                setConnectionStatus({
                    connected: false,
                    pending: true,
                    isRequester: true,
                    isReceiver: false,
                    connectionId: result.data?._id
                });
            } else {
                console.error('❌ Failed to send request:', result.error);
                showAlert(result.error || 'Failed to send connection request', { type: 'error' });
            }
        } catch (error) {
            console.error('❌ Error sending request:', error);
            showAlert('Failed to send connection request. Please try again.', { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptRequest = async () => {
        if (!connectionStatus?.connectionId) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/connections/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionId: connectionStatus.connectionId })
            });

            const result = await response.json();
            if (result.success) {
                console.log('✅ Connection accepted successfully!');
                // Update local state immediately
                setConnectionStatus({
                    connected: true,
                    pending: false,
                    isRequester: connectionStatus.isRequester,
                    isReceiver: connectionStatus.isReceiver,
                    connectionId: connectionStatus.connectionId
                });
                // Trigger parent refresh to update all sections
                onAccept(match.userId);
            } else {
                console.error('❌ Failed to accept connection:', result.error);
                showAlert(result.error || 'Failed to accept connection', { type: 'error' });
            }
        } catch (error) {
            console.error('❌ Error accepting request:', error);
            showAlert('Failed to accept connection. Please try again.', { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeclineRequest = async () => {
        if (!connectionStatus?.connectionId) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/connections/decline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionId: connectionStatus.connectionId })
            });

            const result = await response.json();
            if (result.success) {
                console.log('✅ Connection declined successfully!');
                // Update local state immediately - remove the card
                setConnectionStatus(null);
                // Trigger parent refresh to update all sections
                onAccept(match.userId);
            } else {
                console.error('❌ Failed to decline connection:', result.error);
                showAlert(result.error || 'Failed to decline connection', { type: 'error' });
            }
        } catch (error) {
            console.error('❌ Error declining request:', error);
            showAlert('Failed to decline connection. Please try again.', { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleMessage = () => {
        router.push(`/messages?userId=${match.userId}`);
    };

    const handleDisconnect = async () => {
        if (!connectionStatus?.connectionId) return;

        // Confirm before disconnecting with custom modal
        const confirmed = await confirm(
            `Are you sure you want to disconnect from ${match.name}?\n\nThis action cannot be undone.`,
            {
                title: 'Disconnect Connection',
                confirmText: 'Disconnect',
                cancelText: 'Cancel',
                type: 'danger'
            }
        );

        if (!confirmed) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/connections/disconnect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionId: connectionStatus.connectionId })
            });

            const result = await response.json();
            if (result.success) {
                console.log('✅ Connection disconnected successfully!');
                // Update local state immediately
                setConnectionStatus(null);
                // Trigger parent refresh to update all sections
                onAccept(match.userId);
            } else {
                console.error('❌ Failed to disconnect:', result.error);
                showAlert(result.error || 'Failed to disconnect', { type: 'error' });
            }
        } catch (error) {
            console.error('❌ Error disconnecting:', error);
            showAlert('Failed to disconnect. Please try again.', { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const renderActionButton = () => {
        if (!connectionStatus) {
            return (
                <Button onClick={handleSendRequest} className="w-full" disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Connect'}
                </Button>
            );
        }

        if (connectionStatus.connected) {
            return (
                <div className="flex gap-2">
                    <Button onClick={handleMessage} className="flex-1">
                        💬 Message
                    </Button>
                    <Button
                        onClick={handleDisconnect}
                        variant="outline"
                        className="flex-1 border-green-300 text-green-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Removing...' : '✓ Connected'}
                    </Button>
                </div>
            );
        }

        if (connectionStatus.pending) {
            if (connectionStatus.isRequester) {
                return (
                    <div className="w-full space-y-2">
                        <Button
                            disabled
                            className="w-full bg-gray-300 text-gray-600 cursor-not-allowed hover:bg-gray-300"
                        >
                            ✓ Sent
                        </Button>
                        <p className="text-xs text-center text-gray-500">Waiting for response...</p>
                    </div>
                );
            } else if (connectionStatus.isReceiver) {
                return (
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-1 text-sm text-purple-600 font-medium mb-2">
                            <span className="animate-pulse">⭐</span>
                            <span>New Connection Request!</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleAcceptRequest}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                disabled={isLoading}
                            >
                                ✓ Accept
                            </Button>
                            <Button
                                onClick={handleDeclineRequest}
                                variant="outline"
                                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                                disabled={isLoading}
                            >
                                ✗ Decline
                            </Button>
                        </div>
                    </div>
                );
            }
        }

        return (
            <Button onClick={handleSendRequest} className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Connect'}
            </Button>
        );
    };
    return (
        <Card>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {match.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{match.name}</h3>
                        {match.university && (
                            <p className="text-sm text-gray-600">{match.university}</p>
                        )}
                    </div>
                </div>
                <Badge variant="success">{match.matchScore}% Match</Badge>
            </div>

            {match.bio && (
                <p className="text-sm text-gray-700 mb-4">{match.bio}</p>
            )}

            {match.commonInterests.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Common Interests:</p>
                    <div className="flex flex-wrap gap-2">
                        {match.commonInterests.map((interest, index) => (
                            <Badge key={index} variant="primary">
                                {interest}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {renderActionButton()}

            <AlertModal
                isOpen={isOpen}
                onClose={hideAlert}
                message={message}
                type={options.type}
                title={options.title}
                confirmText={options.confirmText}
            />

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={handleCancel}
                onConfirm={handleConfirm}
                message={confirmMessage}
                title={confirmOptions.title}
                confirmText={confirmOptions.confirmText}
                cancelText={confirmOptions.cancelText}
                type={confirmOptions.type}
            />
        </Card>
    );
});

export default MatchCard;

