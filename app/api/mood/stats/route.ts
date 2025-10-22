import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import MoodEntryModel from '@/lib/db/models/MoodEntry';
import { subDays } from 'date-fns';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '30');

        await connectDB();

        const startDate = subDays(new Date(), days);

        const moodEntries = await MoodEntryModel
            .find({
                userId: session.user.id,
                date: { $gte: startDate },
            })
            .sort({ date: 1 })
            .lean();

        // Calculate statistics
        const avgMood = moodEntries.length > 0
            ? moodEntries.reduce((sum, entry) => sum + entry.moodScore, 0) / moodEntries.length
            : 0;

        const moodTrend = calculateTrend(moodEntries);
        const commonTriggers = getCommonItems(moodEntries, 'triggers');
        const commonActivities = getCommonItems(moodEntries, 'activities');

        return NextResponse.json({
            success: true,
            data: {
                avgMood: Math.round(avgMood * 10) / 10,
                totalEntries: moodEntries.length,
                moodTrend,
                commonTriggers,
                commonActivities,
                entries: moodEntries,
            },
        });
    } catch (error) {
        console.error('Error fetching mood stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch mood statistics' },
            { status: 500 }
        );
    }
}

function calculateTrend(entries: any[]): 'improving' | 'stable' | 'declining' {
    if (entries.length < 2) return 'stable';

    const halfPoint = Math.floor(entries.length / 2);
    const firstHalf = entries.slice(0, halfPoint);
    const secondHalf = entries.slice(halfPoint);

    const avgFirst = firstHalf.reduce((sum, e) => sum + e.moodScore, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, e) => sum + e.moodScore, 0) / secondHalf.length;

    const difference = avgSecond - avgFirst;

    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
}

function getCommonItems(entries: any[], field: string): string[] {
    const counts: Record<string, number> = {};

    entries.forEach(entry => {
        entry[field]?.forEach((item: string) => {
            counts[item] = (counts[item] || 0) + 1;
        });
    });

    return Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([item]) => item);
}

