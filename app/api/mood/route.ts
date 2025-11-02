import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import MoodEntryModel from '@/lib/db/models/MoodEntry';
import { moodEntrySchema } from '@/lib/utils/validation';
import { encrypt } from '@/lib/services/encryption';
import { createNotification } from '@/lib/services/notifications';
import { invalidateUserContext } from '@/lib/services/user-context';
import { MOOD_EMOJIS } from '@/lib/utils/constants';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '30');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        await connectDB();

        const query: any = { userId: session.user.id };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const moodEntries = await MoodEntryModel
            .find(query)
            .sort({ date: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({ success: true, data: moodEntries });
    } catch (error) {
        console.error('Error fetching mood entries:', error);
        return NextResponse.json(
            { error: 'Failed to fetch mood entries' },
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

        const body = await req.json();
        const validatedData = moodEntrySchema.parse(body);

        await connectDB();

        // Encrypt journal entry if provided
        let journalEntry;
        if (validatedData.journalEntry) {
            journalEntry = encrypt(validatedData.journalEntry);
        }

        const moodEntry = await MoodEntryModel.create({
            userId: session.user.id,
            date: new Date(),
            moodScore: validatedData.moodScore,
            emoji: validatedData.emoji,
            journalEntry,
            triggers: validatedData.triggers || [],
            activities: validatedData.activities || [],
            sleepHours: validatedData.sleepHours,
            analyzedSentiment: 0, // Can be enhanced with sentiment analysis
        });

        // Create notification for mood entry
        const moodEmoji = MOOD_EMOJIS[validatedData.moodScore as keyof typeof MOOD_EMOJIS] || validatedData.emoji;
        let moodMessage = '';

        if (validatedData.moodScore >= 8) {
            moodMessage = `Great mood today! ${moodEmoji} Keep up the positive energy!`;
        } else if (validatedData.moodScore >= 6) {
            moodMessage = `Good mood logged ${moodEmoji}. You're doing well today!`;
        } else if (validatedData.moodScore >= 4) {
            moodMessage = `Mood entry logged ${moodEmoji}. Remember, it's okay to have neutral days.`;
        } else {
            moodMessage = `Mood entry logged ${moodEmoji}. We're here to support you. Consider reaching out to resources.`;
        }

        await createNotification(
            session.user.id,
            'mood',
            'Mood Entry Logged',
            moodMessage,
            '/mood',
            {
                fromUserId: session.user.id,
                metadata: { moodScore: validatedData.moodScore, entryId: moodEntry._id }
            }
        );

        // Invalidate user context cache since mood data changed
        invalidateUserContext(session.user.id);

        return NextResponse.json(
            { success: true, data: moodEntry },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating mood entry:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input data', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create mood entry' },
            { status: 500 }
        );
    }
}

