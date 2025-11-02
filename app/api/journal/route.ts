import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import JournalEntryModel from '@/lib/db/models/JournalEntry';
import { invalidateUserContext } from '@/lib/services/user-context';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const body = await req.json();
        const { category, prompt, content, promptIndex } = body;

        // Validate input
        if (!category || !prompt || !content || promptIndex === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create journal entry
        const journalEntry = await JournalEntryModel.create({
            userId: session.user.id,
            category,
            prompt,
            content,
            promptIndex,
        });

        // Invalidate user context cache since journal data changed
        invalidateUserContext(session.user.id);

        return NextResponse.json({
            success: true,
            data: {
                id: journalEntry._id,
                createdAt: journalEntry.createdAt,
            },
        });
    } catch (error) {
        console.error('Error saving journal entry:', error);
        return NextResponse.json(
            { error: 'Failed to save journal entry' },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '50');

        // Build query
        const query: any = { userId: session.user.id };
        if (category) {
            query.category = category;
        }

        // Fetch journal entries
        const entries = await JournalEntryModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            data: entries,
        });
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        return NextResponse.json(
            { error: 'Failed to fetch journal entries' },
            { status: 500 }
        );
    }
}

