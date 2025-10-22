import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import {
    getNotifications,
    getUnreadCount,
    markAllAsRead
} from '@/lib/services/notifications';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');

        if (action === 'count') {
            const count = await getUnreadCount(session.user.id);
            return NextResponse.json({ success: true, data: { count } });
        }

        const limit = parseInt(searchParams.get('limit') || '20');
        const notifications = await getNotifications(session.user.id, limit);

        return NextResponse.json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action } = await req.json();

        if (action === 'markAllRead') {
            await markAllAsRead(session.user.id);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error updating notifications:', error);
        return NextResponse.json(
            { error: 'Failed to update notifications' },
            { status: 500 }
        );
    }
}

