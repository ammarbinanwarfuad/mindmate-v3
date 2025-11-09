import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { buildUserContext, buildContextSummary } from '@/lib/services/user-context';

/**
 * Test endpoint to check if personalization is working
 * GET /api/test-personalization
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Build user context
        const userContext = await buildUserContext(session.user.id);

        // Build context summary to see what data is available
        const contextSummary = buildContextSummary(userContext);

        return NextResponse.json({
            success: true,
            personalizationEnabled: userContext.privacySettings.allowPersonalization,
            hasData: {
                hasProfile: !!userContext.profile.name,
                hasMoodData: userContext.moodPatterns.averageScore > 0,
                hasJournalThemes: (userContext.journalThemes?.length ?? 0) > 0,
                hasConversationHistory: userContext.conversationHistory.messageCount > 0,
            },
            contextSummary,
            contextPreview: {
                name: userContext.profile.name,
                averageMood: userContext.moodPatterns.averageScore,
                moodTrend: userContext.moodPatterns.trend,
                commonTriggers: Object.keys(userContext.moodPatterns.commonTriggers).slice(0, 3),
                helpfulActivities: Object.keys(userContext.moodPatterns.helpfulActivities).slice(0, 3),
            },
        });
    } catch (error) {
        console.error('Error testing personalization:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to test personalization',
            details: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
