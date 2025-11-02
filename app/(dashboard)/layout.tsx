'use client';

import Sidebar from '@/components/layout/Sidebar';
import { useActiveStatus } from '@/hooks/useActiveStatus';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Track user's active status
    useActiveStatus();

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-8">{children}</div>
        </div>
    );
}
