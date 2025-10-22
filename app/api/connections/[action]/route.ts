import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import MatchModel from '@/lib/db/models/Match';
import UserModel from '@/lib/db/models/User';
import { createNotification } from '@/lib/services/notifications';
import { z } from 'zod';

const connectionActionSchema = z.object({
    connectionId: z.string().min(1, 'Connection ID is required'),
});

// Accept or decline connection request
export async function POST(
    req: Request,
    { params }: { params: { action: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const action = params.action;

        if (!['accept', 'decline'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const body = await req.json();
        const validatedData = connectionActionSchema.parse(body);

        await connectDB();

        // Find the connection request
        const connection = await MatchModel.findById(validatedData.connectionId);

        if (!connection) {
            return NextResponse.json({ error: 'Connection request not found' }, { status: 404 });
        }

        // Verify that the current user is the receiver
        if (connection.receiverId.toString() !== session.user.id) {
            return NextResponse.json(
                { error: 'You are not authorized to perform this action' },
                { status: 403 }
            );
        }

        // Check if already processed
        if (connection.status !== 'pending') {
            return NextResponse.json(
                { error: `Connection request already ${connection.status}` },
                { status: 400 }
            );
        }

        // Update status
        connection.status = action === 'accept' ? 'accepted' : 'declined';
        await connection.save();

        // Send notification to requester
        const currentUser = await UserModel.findById(session.user.id);
        const requesterName = currentUser?.profile.name || 'Someone';

        if (action === 'accept') {
            await createNotification(
                connection.requesterId.toString(),
                'match_accepted',
                'Connection Accepted! 🎉',
                `${requesterName} accepted your connection request! You can now message each other.`,
                '/connections',
                {
                    fromUserId: session.user.id,
                    fromUserName: requesterName,
                    metadata: { connectionId: connection._id }
                }
            );
        }

        return NextResponse.json({
            success: true,
            data: connection,
            message: `Connection request ${action === 'accept' ? 'accepted' : 'declined'}!`
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            );
        }
        console.error(`Error ${params.action}ing connection:`, error);
        return NextResponse.json(
            { error: `Failed to ${params.action} connection` },
            { status: 500 }
        );
    }
}

