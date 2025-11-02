import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { updateMatchStatus } from '@/lib/services/matching';
import { createNotification } from '@/lib/services/notifications';
import { connectDB } from '@/lib/db/mongodb';
import UserModel from '@/lib/db/models/User';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { matchId, otherUserId } = await req.json();

        if (!matchId) {
            return NextResponse.json(
                { error: 'Match ID is required' },
                { status: 400 }
            );
        }

        const match = await updateMatchStatus(matchId, 'accepted');

        // Create notification for the other user
        if (otherUserId) {
            await connectDB();
            const currentUser = await UserModel.findById(session.user.id);
            const userName = currentUser?.profile.name || 'Someone';

            await createNotification(
                otherUserId,
                'match_accepted',
                'Match Accepted! 🎉',
                `${userName} accepted your match request! Start connecting now.`,
                '/matches',
                {
                    fromUserId: session.user.id,
                    fromUserName: userName,
                    metadata: { matchId }
                }
            );
        }

        return NextResponse.json({
            success: true,
            data: match,
        });
    } catch (error) {
        console.error('Error accepting match:', error);
        return NextResponse.json(
            { error: 'Failed to accept match' },
            { status: 500 }
        );
    }
}

