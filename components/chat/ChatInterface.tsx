'use client';

import { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CrisisModal from './CrisisModal';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCrisisModal, setShowCrisisModal] = useState(false);
    const [crisisMessage, setCrisisMessage] = useState('');
    const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Only scroll when explicitly requested (e.g., after sending a message)
        if (shouldAutoScroll && messages.length > 0) {
            scrollToBottom();
            setShouldAutoScroll(false); // Reset flag after scrolling
        }
    }, [messages, shouldAutoScroll]);

    useEffect(() => {
        // Load conversation history
        loadConversation();
    }, []);

    const loadConversation = async () => {
        try {
            const response = await fetch('/api/chat');
            const result = await response.json();

            if (result.success && result.data.messages) {
                setMessages(result.data.messages);
            }
        } catch (error) {
            console.error('Failed to load conversation:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setIsLoading(true);

        // Add user message immediately and enable auto-scroll
        setShouldAutoScroll(true);
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });

            const result = await response.json();

            if (result.success) {
                setShouldAutoScroll(true); // Auto-scroll for assistant response
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: result.data.message }
                ]);

                if (result.data.crisisDetected) {
                    setCrisisMessage(result.data.crisisMessage);
                    setShowCrisisModal(true);
                }
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            setShouldAutoScroll(true); // Auto-scroll for error message
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'I\'m having trouble connecting right now. Please try again in a moment.'
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Card className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-8">
                            <p className="text-lg mb-2">👋 Hi! I&apos;m MindMate</p>
                            <p>How are you feeling today? I&apos;m here to listen and support you.</p>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg px-4 py-2">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="border-t p-4">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            disabled={isLoading}
                        />
                        <Button type="submit" isLoading={isLoading}>
                            Send
                        </Button>
                    </div>
                </form>
            </Card>

            <CrisisModal
                isOpen={showCrisisModal}
                onClose={() => setShowCrisisModal(false)}
                message={crisisMessage}
            />
        </>
    );
}

