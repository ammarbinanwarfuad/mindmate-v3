'use client';

import { useEffect } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
    useEffect(() => {
        // Keep page at top - prevent any auto-scroll
        const keepAtTop = () => {
            window.scrollTo({ top: 0, behavior: 'instant' });
        };

        // Initial scroll to top
        keepAtTop();

        // Ensure it stays at top even after renders
        const timer = setTimeout(keepAtTop, 100);
        const timer2 = setTimeout(keepAtTop, 300);

        return () => {
            clearTimeout(timer);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col p-6">
            {/* Header */}
            <div className="mb-4 flex-shrink-0">
                <h1 className="text-3xl font-bold text-gray-900">AI Chat Support</h1>
                <p className="text-gray-600 mt-2">
                    Chat with MindMate AI - your empathetic wellness companion
                </p>
            </div>

            {/* Chat Interface - Takes remaining space */}
            <div className="flex-1 min-h-0">
                <ChatInterface />
            </div>

            {/* Remember Message - Fixed at bottom */}
            <div className="mt-4 flex-shrink-0 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>Remember:</strong> MindMate AI is here to support you, but it&apos;s not a replacement
                    for professional mental health care. If you&apos;re in crisis, please reach out to a crisis
                    helpline or emergency services.
                </p>
            </div>
        </div>
    );
}

