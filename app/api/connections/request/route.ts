import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import MatchModel from '@/lib/db/models/Match';
import UserModel from '@/lib/db/models/User';
import { createNotification } from '@/lib/services/notifications';
import { z } from 'zod';

const connectionRequestSchema = z.object({
    receiverId: z.string().min(1, 'Receiver ID is required'),
    matchScore: z.number().min(0).max(100).optional(),
    commonInterests: z.array(z.string()).optional(),
});

// Send connection request
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = connectionRequestSchema.parse(body);

        await connectDB();

        // Check if user is trying to connect with themselves
        if (session.user.id === validatedData.receiverId) {
            return NextResponse.json({ error: 'Cannot send connection request to yourself' }, { status: 400 });
        }

        // Check if receiver exists
        const receiver = await UserModel.findById(validatedData.receiverId);
        if (!receiver) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if connection request already exists
        const existingConnection = await MatchModel.findOne({
            users: { $all: [session.user.id, validatedData.receiverId] }
        });

        if (existingConnection) {
            if (existingConnection.status === 'accepted') {
                return NextResponse.json({ error: 'Already connected' }, { status: 400 });
            } else if (existingConnection.status === 'pending') {
                return NextResponse.json({ error: 'Connection request already sent' }, { status: 400 });
            } else if (existingConnection.status === 'declined') {
                // Allow re-sending after decline
                existingConnection.status = 'pending';
                existingConnection.requesterId = session.user.id as any;
                existingConnection.receiverId = validatedData.receiverId as any;
                await existingConnection.save();

                // Send notification
                const requester = await UserModel.findById(session.user.id);
                await createNotification(
                    validatedData.receiverId,
                    'match',
                    'New Connection Request',
                    `${requester?.profile.name || 'Someone'} sent you a connection request!`,
                    '/matches',
                    {
                        fromUserId: session.user.id,
                        fromUserName: requester?.profile.name,
                        metadata: { matchId: existingConnection._id }
                    }
                );

                return NextResponse.json({
                    success: true,
                    data: existingConnection,
                    message: 'Connection request sent!'
                });
            }
        }

        // Create new connection request
        const connectionRequest = await MatchModel.create({
            users: [session.user.id, validatedData.receiverId],
            requesterId: session.user.id,
            receiverId: validatedData.receiverId,
            matchScore: validatedData.matchScore || 0,
            commonInterests: validatedData.commonInterests || [],
            status: 'pending'
        });

        // Send notification
        const requester = await UserModel.findById(session.user.id);
        await createNotification(
            validatedData.receiverId,
            'match',
            'New Connection Request',
            `${requester?.profile.name || 'Someone'} sent you a connection request!`,
            '/matches',
            {
                fromUserId: session.user.id,
                fromUserName: requester?.profile.name,
                metadata: { matchId: connectionRequest._id }
            }
        );

        return NextResponse.json({
            success: true,
            data: connectionRequest,
            message: 'Connection request sent!'
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            );
        }
        console.error('Error sending connection request:', error);
        return NextResponse.json(
            { error: 'Failed to send connection request' },
            { status: 500 }
        );
    }
}

