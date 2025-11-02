'use client';

import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export function useActiveStatus() {
    const { status } = useSession();

    const updateStatus = useCallback(async (isOnline: boolean) => {
        try {
            await fetch('/api/user/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isOnline }),
            });
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    }, []);

    useEffect(() => {
        if (status !== 'authenticated') return;

        // Set user as online when component mounts
        updateStatus(true);

        // Update status every 2 minutes to keep it fresh
        const interval = setInterval(() => {
            updateStatus(true);
        }, 2 * 60 * 1000);

        // Set user as offline when page is about to unload
        const handleBeforeUnload = () => {
            // Use sendBeacon for reliability during page unload
            navigator.sendBeacon(
                '/api/user/status',
                JSON.stringify({ isOnline: false })
            );
        };

        // Set user as offline when page loses focus for extended period
        let visibilityTimer: NodeJS.Timeout;
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Set offline after 5 minutes of inactivity
                visibilityTimer = setTimeout(() => {
                    updateStatus(false);
                }, 5 * 60 * 1000);
            } else {
                clearTimeout(visibilityTimer);
                updateStatus(true);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            clearTimeout(visibilityTimer);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            updateStatus(false);
        };
    }, [status, updateStatus]);
}

