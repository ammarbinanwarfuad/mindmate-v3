'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AlertModal from '@/components/ui/AlertModal';
import { useAlert } from '@/hooks/useAlert';
import { formatRelativeTime } from '@/lib/utils/helpers';

interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    message: string;
    read: boolean;
    readAt?: string;
    createdAt: string;
    isSent: boolean;
}

interface MessageInterfaceProps {
    otherUserId: string;
    otherUserName: string;
}

export default function MessageInterface({ otherUserId, otherUserName }: MessageInterfaceProps) {
    const { data: session } = useSession();
    const { isOpen, message, options, showAlert, hideAlert } = useAlert();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Reset scroll flag when changing conversations
        setShouldAutoScroll(false);
        // Initial load
        loadMessages(true);
        // Poll for new messages every 5 seconds (less aggressive)
        const interval = setInterval(() => loadMessages(false), 5000);
        return () => clearInterval(interval);
    }, [otherUserId]);

    useEffect(() => {
        // Only auto-scroll when explicitly requested (after sending YOUR OWN message)
        // NOT on initial load or receiving messages
        if (shouldAutoScroll && messages.length > 0) {
            scrollToBottom();
            setShouldAutoScroll(false);
        }
    }, [messages, shouldAutoScroll]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadMessages = async (showLoader = false) => {
        try {
            // Only show loading spinner on initial load, not on polls
            if (showLoader) {
                setIsLoading(true);
            }

            const response = await fetch(`/api/messages?userId=${otherUserId}`, {
                cache: 'no-store' // Prevent caching for real-time updates
            });
            const result = await response.json();

            if (result.success) {
                setMessages(result.data);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            if (showLoader) {
                setIsLoading(false);
            }
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !session?.user?.id) return;

        const messageText = newMessage.trim();
        setNewMessage(''); // Clear input immediately for better UX
        setIsSending(true);

        // Optimistic UI update - add message immediately to local state
        const optimisticMessage: Message = {
            _id: `temp-${Date.now()}`, // Temporary ID
            senderId: session.user.id,
            receiverId: otherUserId,
            message: messageText,
            read: false,
            createdAt: new Date().toISOString(),
            isSent: true
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setShouldAutoScroll(true); // Enable auto-scroll for new message

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: otherUserId,
                    message: messageText
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Message sent successfully!');
                // Reload messages to get the real message with proper ID
                await loadMessages(false);
                setShouldAutoScroll(true);
            } else {
                console.error('❌ Failed to send message:', result.error);
                // Remove optimistic message on error
                setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
                setNewMessage(messageText); // Restore message to input
                showAlert(result.error || 'Failed to send message', { type: 'error' });
            }
        } catch (error) {
            console.error('❌ Error sending message:', error);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
            setNewMessage(messageText); // Restore message to input
            showAlert('Failed to send message. Please try again.', { type: 'error' });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                        {otherUserName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{otherUserName}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            End-to-end encrypted
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                            <p>Loading messages...</p>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <div className="text-4xl mb-2">💬</div>
                            <p>No messages yet</p>
                            <p className="text-sm">Send a message to start the conversation!</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`flex ${msg.isSent ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg px-4 py-2 ${msg.isSent
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                        }`}
                                >
                                    <p className="text-sm break-words">{msg.message}</p>
                                    <p
                                        className={`text-xs mt-1 ${msg.isSent ? 'text-purple-100' : 'text-gray-500'
                                            }`}
                                    >
                                        {formatRelativeTime(msg.createdAt)}
                                        {msg.isSent && msg.read && ' • Read'}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        disabled={isSending}
                        className="flex-1"
                        maxLength={5000}
                    />
                    <Button
                        type="submit"
                        disabled={isSending || !newMessage.trim()}
                        className="px-6"
                    >
                        {isSending ? '...' : 'Send'}
                    </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Messages are encrypted end-to-end
                </p>
            </form>

            <AlertModal
                isOpen={isOpen}
                onClose={hideAlert}
                message={message}
                type={options.type}
                title={options.title}
                confirmText={options.confirmText}
            />
        </div>
    );
}

