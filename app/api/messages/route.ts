import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import MessageModel from '@/lib/db/models/Message';
import MatchModel from '@/lib/db/models/Match';
import UserModel from '@/lib/db/models/User';
import { encrypt, decrypt } from '@/lib/services/encryption';
import { createNotification } from '@/lib/services/notifications';
import { z } from 'zod';

const sendMessageSchema = z.object({
    receiverId: z.string().min(1, 'Receiver ID is required'),
    message: z.string().min(1, 'Message cannot be empty').max(5000),
});

// Generate a unique conversation ID for two users
function getConversationId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
}

// Send a message
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = sendMessageSchema.parse(body);

        await connectDB();

        // Check if users are connected
        const connection = await MatchModel.findOne({
            users: { $all: [session.user.id, validatedData.receiverId] },
            status: 'accepted'
        });

        if (!connection) {
            return NextResponse.json(
                { error: 'You must be connected to send messages' },
                { status: 403 }
            );
        }

        // Encrypt the message
        const { encrypted, iv, authTag } = encrypt(validatedData.message);

        // Create conversation ID
        const conversationId = getConversationId(session.user.id, validatedData.receiverId);

        // Save the message
        const message = await MessageModel.create({
            senderId: session.user.id,
            receiverId: validatedData.receiverId,
            conversationId,
            encryptedContent: encrypted,
            iv,
            authTag,
            read: false
        });

        // Send notification to receiver
        const sender = await UserModel.findById(session.user.id);
        await createNotification(
            validatedData.receiverId,
            'message',
            'New Message',
            `${sender?.profile.name || 'Someone'} sent you a message`,
            `/messages/${conversationId}`,
            {
                fromUserId: session.user.id,
                fromUserName: sender?.profile.name,
                metadata: { messageId: message._id }
            }
        );

        return NextResponse.json({
            success: true,
            data: {
                _id: message._id,
                senderId: message.senderId,
                receiverId: message.receiverId,
                message: validatedData.message, // Return decrypted for sender
                read: message.read,
                createdAt: message.createdAt
            },
            message: 'Message sent successfully'
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            );
        }
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}

// Get messages for a conversation
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const otherUserId = searchParams.get('userId');
        const limit = parseInt(searchParams.get('limit') || '50');

        if (!otherUserId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        await connectDB();

        // Check if users are connected
        const connection = await MatchModel.findOne({
            users: { $all: [session.user.id, otherUserId] },
            status: 'accepted'
        });

        if (!connection) {
            return NextResponse.json(
                { error: 'You must be connected to view messages' },
                { status: 403 }
            );
        }

        // Get conversation ID
        const conversationId = getConversationId(session.user.id, otherUserId);

        // Fetch messages
        const messages = await MessageModel
            .find({ conversationId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Decrypt messages and mark as read
        const decryptedMessages = messages.map((msg) => {
            try {
                const decryptedContent = decrypt({
                    encrypted: msg.encryptedContent,
                    iv: msg.iv,
                    authTag: msg.authTag
                });

                return {
                    _id: msg._id.toString(),
                    senderId: msg.senderId.toString(),
                    receiverId: msg.receiverId.toString(),
                    message: decryptedContent,
                    read: msg.read,
                    readAt: msg.readAt,
                    createdAt: msg.createdAt,
                    isSent: msg.senderId.toString() === session.user.id
                };
            } catch (error) {
                console.error('Error decrypting message:', error);
                return {
                    _id: msg._id.toString(),
                    senderId: msg.senderId.toString(),
                    receiverId: msg.receiverId.toString(),
                    message: '[Unable to decrypt message]',
                    read: msg.read,
                    readAt: msg.readAt,
                    createdAt: msg.createdAt,
                    isSent: msg.senderId.toString() === session.user.id
                };
            }
        });

        // Mark received messages as read
        await MessageModel.updateMany(
            {
                conversationId,
                receiverId: session.user.id,
                read: false
            },
            {
                read: true,
                readAt: new Date()
            }
        );

        return NextResponse.json({
            success: true,
            data: decryptedMessages.reverse() // Oldest first
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

