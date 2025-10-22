import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import ConversationModel from '@/lib/db/models/Conversation';
import { getChatResponse } from '@/lib/services/gemini';
import { detectCrisis } from '@/lib/services/crisis-detection';
import { createNotification } from '@/lib/services/notifications';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const conversation = await ConversationModel
            .findOne({ userId: session.user.id })
            .sort({ lastMessageAt: -1 })
            .lean();

        if (!conversation) {
            return NextResponse.json({
                success: true,
                data: { messages: [] },
            });
        }

        return NextResponse.json({
            success: true,
            data: conversation,
        });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversation' },
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

        const { message } = await req.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Get or create conversation
        let conversation = await ConversationModel.findOne({
            userId: session.user.id,
        });

        if (!conversation) {
            conversation = await ConversationModel.create({
                userId: session.user.id,
                messages: [],
                lastMessageAt: new Date(),
                crisisDetected: false,
            });
        }

        // Check for crisis
        const crisisResult = detectCrisis(message);

        if (crisisResult.isCrisis) {
            conversation.crisisDetected = true;

            // Create notification for critical cases
            if (crisisResult.severity === 'critical' || crisisResult.severity === 'high') {
                await createNotification(
                    session.user.id,
                    'system',
                    'Crisis Support Available',
                    'We detected you may be in distress. Please reach out to crisis resources.',
                    '/resources/crisis',
                    {
                        metadata: { severity: crisisResult.severity }
                    }
                );
            }
        }

        // Add user message
        conversation.messages.push({
            role: 'user',
            content: message,
            timestamp: new Date(),
        });

        // Get AI response
        const aiResponse = await getChatResponse(
            conversation.messages.slice(-10), // Last 10 messages for context
            message
        );

        // Add AI response
        conversation.messages.push({
            role: 'assistant',
            content: aiResponse.message,
            timestamp: new Date(),
        });

        conversation.lastMessageAt = new Date();
        await conversation.save();

        return NextResponse.json({
            success: true,
            data: {
                message: aiResponse.message,
                crisisDetected: crisisResult.isCrisis,
                crisisMessage: crisisResult.message,
            },
        });
    } catch (error) {
        console.error('Error in chat:', error);
        return NextResponse.json(
            { error: 'Failed to process message' },
            { status: 500 }
        );
    }
}

