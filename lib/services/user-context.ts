import { connectDB } from '@/lib/db/mongodb';
import UserModel from '@/lib/db/models/User';
import MoodEntryModel from '@/lib/db/models/MoodEntry';
import JournalEntryModel from '@/lib/db/models/JournalEntry';
import ConversationModel from '@/lib/db/models/Conversation';
import { decrypt } from '@/lib/services/encryption';
import { subDays } from 'date-fns';

// Simple in-memory cache for user context
interface CachedContext {
    context: UserContext;
    timestamp: number;
}

const contextCache = new Map<string, CachedContext>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export interface UserContext {
    profile: {
        name: string;
        university?: string;
        year?: number;
        bio?: string;
    };
    moodPatterns: {
        averageScore: number;
        trend: 'improving' | 'declining' | 'stable';
        recentMood: number[];
        commonTriggers: { [key: string]: number };
        helpfulActivities: { [key: string]: number };
        sleepPatterns?: {
            averageHours: number;
            entriesWithSleep: number;
        };
    };
    journalThemes?: string[];
    conversationHistory: {
        recentTopics: string[];
        strategiesDiscussed: string[];
        messageCount: number;
    };
    behavioralInsights: {
        bestTimeOfDay?: string;
        triggerFrequency: { [key: string]: number };
        activityEffectiveness: { [key: string]: number };
    };
    privacySettings: {
        allowPersonalization: boolean;
        includeJournalEntries: boolean;
        includeMoodData: boolean;
    };
}

/**
 * Build comprehensive user context for AI personalization
 * Uses caching to reduce database queries
 */
export async function buildUserContext(userId: string, forceRefresh = false): Promise<UserContext> {
    // Check cache first
    if (!forceRefresh) {
        const cached = contextCache.get(userId);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.context;
        }
    }

    await connectDB();

    // Fetch user with privacy settings
    const user = await UserModel.findById(userId).lean();
    if (!user) {
        throw new Error('User not found');
    }

    // Check privacy settings (default to true if not set)
    const allowPersonalization = (user as any).privacy?.dataCollection?.allowPersonalization ?? true;
    const privacySettings = {
        allowPersonalization,
        includeJournalEntries: allowPersonalization && ((user as any).privacy?.dataCollection?.allowPersonalization ?? true),
        includeMoodData: allowPersonalization && ((user as any).privacy?.dataCollection?.allowPersonalization ?? true),
    };

    // If personalization is disabled, return minimal context
    if (!privacySettings.allowPersonalization) {
        return {
            profile: {
                name: (user as any).profile.name,
                university: (user as any).profile.university,
                year: (user as any).profile.year,
                bio: (user as any).profile.bio,
            },
            moodPatterns: {
                averageScore: 0,
                trend: 'stable',
                recentMood: [],
                commonTriggers: {},
                helpfulActivities: {},
            },
            conversationHistory: {
                recentTopics: [],
                strategiesDiscussed: [],
                messageCount: 0,
            },
            behavioralInsights: {
                triggerFrequency: {},
                activityEffectiveness: {},
            },
            privacySettings,
        };
    }

    // Fetch mood data (last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const moodEntries = await MoodEntryModel.find({
        userId,
        date: { $gte: thirtyDaysAgo },
    })
        .sort({ date: -1 })
        .lean();

    // Fetch journal entries (last 10, if privacy allows)
    let journalEntries: any[] = [];
    if (privacySettings.includeJournalEntries) {
        journalEntries = await JournalEntryModel.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
    }

    // Fetch conversation history
    const conversation = await ConversationModel.findOne({ userId }).lean();

    // Analyze mood patterns
    const moodPatterns = analyzeMoodPatterns(moodEntries);

    // Extract journal themes (if privacy allows)
    const journalThemes = privacySettings.includeJournalEntries && journalEntries.length > 0
        ? extractJournalThemes(journalEntries)
        : undefined;

    // Analyze conversation history
    const conversationHistory = analyzeConversationHistory(conversation);

    // Build behavioral insights
    const behavioralInsights = buildBehavioralInsights(moodEntries);

    const context: UserContext = {
        profile: {
            name: (user as any).profile.name,
            university: (user as any).profile.university,
            year: (user as any).profile.year,
            bio: (user as any).profile.bio,
        },
        moodPatterns,
        journalThemes,
        conversationHistory,
        behavioralInsights,
        privacySettings,
    };

    // Cache the context
    contextCache.set(userId, {
        context,
        timestamp: Date.now(),
    });

    return context;
}

/**
 * Invalidate cached context for a user (call when data changes)
 */
export function invalidateUserContext(userId: string): void {
    contextCache.delete(userId);
}

/**
 * Clear all cached contexts (useful for testing or memory management)
 */
export function clearContextCache(): void {
    contextCache.clear();
}

/**
 * Analyze mood patterns from mood entries
 */
function analyzeMoodPatterns(moodEntries: any[]) {
    if (moodEntries.length === 0) {
        return {
            averageScore: 0,
            trend: 'stable' as const,
            recentMood: [],
            commonTriggers: {},
            helpfulActivities: {},
        };
    }

    // Calculate average mood score
    const scores = moodEntries.map(entry => entry.moodScore);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Determine trend (comparing first half vs second half of entries)
    const midpoint = Math.floor(moodEntries.length / 2);
    const firstHalf = moodEntries.slice(0, midpoint).map(e => e.moodScore);
    const secondHalf = moodEntries.slice(midpoint).map(e => e.moodScore);
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    let trend: 'improving' | 'declining' | 'stable';
    if (secondAvg > firstAvg + 0.5) {
        trend = 'improving';
    } else if (secondAvg < firstAvg - 0.5) {
        trend = 'declining';
    } else {
        trend = 'stable';
    }

    // Recent mood scores (last 7 days)
    const recentMood = moodEntries
        .slice(0, 7)
        .map(entry => entry.moodScore);

    // Count trigger frequency
    const commonTriggers: { [key: string]: number } = {};
    moodEntries.forEach(entry => {
        if (entry.triggers && Array.isArray(entry.triggers)) {
            entry.triggers.forEach((trigger: string) => {
                commonTriggers[trigger] = (commonTriggers[trigger] || 0) + 1;
            });
        }
    });

    // Calculate activity effectiveness (average mood score when activity was done)
    const helpfulActivities: { [key: string]: { count: number; avgMood: number } } = {};
    moodEntries.forEach(entry => {
        if (entry.activities && Array.isArray(entry.activities)) {
            entry.activities.forEach((activity: string) => {
                if (!helpfulActivities[activity]) {
                    helpfulActivities[activity] = { count: 0, avgMood: 0 };
                }
                helpfulActivities[activity].count += 1;
                helpfulActivities[activity].avgMood += entry.moodScore;
            });
        }
    });

    // Convert to average mood per activity
    const activityEffectiveness: { [key: string]: number } = {};
    Object.keys(helpfulActivities).forEach(activity => {
        activityEffectiveness[activity] = helpfulActivities[activity].avgMood / helpfulActivities[activity].count;
    });

    // Sort by effectiveness (highest first)
    const sortedActivities: { [key: string]: number } = {};
    Object.entries(activityEffectiveness)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10) // Top 10 most effective
        .forEach(([activity, score]) => {
            sortedActivities[activity] = Math.round(score * 10) / 10;
        });

    // Analyze sleep patterns
    const sleepEntries = moodEntries.filter(e => e.sleepHours != null && e.sleepHours > 0);
    let sleepPatterns;
    if (sleepEntries.length > 0) {
        const totalSleep = sleepEntries.reduce((sum, e) => sum + (e.sleepHours || 0), 0);
        sleepPatterns = {
            averageHours: Math.round((totalSleep / sleepEntries.length) * 10) / 10,
            entriesWithSleep: sleepEntries.length,
        };
    }

    return {
        averageScore: Math.round(averageScore * 10) / 10,
        trend,
        recentMood,
        commonTriggers: Object.fromEntries(
            Object.entries(commonTriggers)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10) // Top 10 most common triggers
        ),
        helpfulActivities: sortedActivities,
        ...(sleepPatterns && { sleepPatterns }),
    };
}

/**
 * Extract themes from journal entries
 */
function extractJournalThemes(journalEntries: any[]): string[] {
    // Simple keyword extraction (can be enhanced with AI)
    const themes: Set<string> = new Set();
    const keywords = [
        'stress', 'anxiety', 'worried', 'nervous',
        'happy', 'excited', 'joy', 'grateful',
        'sad', 'lonely', 'down', 'depressed',
        'tired', 'exhausted', 'sleep',
        'study', 'exam', 'test', 'assignment',
        'friend', 'family', 'relationship',
        'exercise', 'workout', 'fitness',
        'meditation', 'mindfulness', 'relax',
        'goal', 'plan', 'future',
    ];

    journalEntries.forEach(entry => {
        const content = (entry.content || '').toLowerCase();
        keywords.forEach(keyword => {
            if (content.includes(keyword)) {
                themes.add(keyword);
            }
        });
    });

    return Array.from(themes).slice(0, 10); // Top 10 themes
}

/**
 * Analyze conversation history for topics and strategies
 */
function analyzeConversationHistory(conversation: any) {
    if (!conversation || !conversation.messages || conversation.messages.length === 0) {
        return {
            recentTopics: [],
            strategiesDiscussed: [],
            messageCount: 0,
        };
    }

    const messages = conversation.messages;
    const recentMessages = messages.slice(-20); // Last 20 messages

    // Extract topics from messages
    const topics: Set<string> = new Set();
    const strategyKeywords = [
        'breathing', 'meditation', 'exercise', 'sleep',
        'schedule', 'plan', 'goal', 'journal',
        'support', 'therapy', 'help', 'coping',
    ];

    recentMessages.forEach((msg: any) => {
        const content = (msg.content || '').toLowerCase();
        
        // Look for topic indicators
        if (content.includes('stress') || content.includes('anxious')) topics.add('stress/anxiety');
        if (content.includes('sad') || content.includes('depressed')) topics.add('mood/depression');
        if (content.includes('sleep')) topics.add('sleep issues');
        if (content.includes('study') || content.includes('exam')) topics.add('academic concerns');
        if (content.includes('friend') || content.includes('relationship')) topics.add('relationships');

        // Look for strategies
        strategyKeywords.forEach(keyword => {
            if (content.includes(keyword)) {
                topics.add(keyword);
            }
        });
    });

    const recentTopics = Array.from(topics).slice(0, 10);
    const strategiesDiscussed = strategyKeywords.filter(keyword =>
        recentMessages.some((msg: any) => msg.content.toLowerCase().includes(keyword))
    );

    return {
        recentTopics,
        strategiesDiscussed,
        messageCount: messages.length,
    };
}

/**
 * Build behavioral insights from mood data
 */
function buildBehavioralInsights(moodEntries: any[]) {
    if (moodEntries.length === 0) {
        return {
            triggerFrequency: {},
            activityEffectiveness: {},
        };
    }

    // Trigger frequency
    const triggerFrequency: { [key: string]: number } = {};
    moodEntries.forEach(entry => {
        if (entry.triggers && Array.isArray(entry.triggers)) {
            entry.triggers.forEach((trigger: string) => {
                triggerFrequency[trigger] = (triggerFrequency[trigger] || 0) + 1;
            });
        }
    });

    // Activity effectiveness (average mood when activity is done)
    const activityMoods: { [key: string]: number[] } = {};
    moodEntries.forEach(entry => {
        if (entry.activities && Array.isArray(entry.activities)) {
            entry.activities.forEach((activity: string) => {
                if (!activityMoods[activity]) {
                    activityMoods[activity] = [];
                }
                activityMoods[activity].push(entry.moodScore);
            });
        }
    });

    const activityEffectiveness: { [key: string]: number } = {};
    Object.keys(activityMoods).forEach(activity => {
        const moods = activityMoods[activity];
        const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
        activityEffectiveness[activity] = Math.round(avg * 10) / 10;
    });

    return {
        triggerFrequency: Object.fromEntries(
            Object.entries(triggerFrequency)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
        ),
        activityEffectiveness: Object.fromEntries(
            Object.entries(activityEffectiveness)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
        ),
    };
}

/**
 * Build context summary string for Gemini
 */
export function buildContextSummary(context: UserContext): string {
    const parts: string[] = [];

    // Profile
    parts.push(`User Profile: ${context.profile.name}`);
    if (context.profile.university) {
        parts.push(`University: ${context.profile.university}`);
    }
    if (context.profile.year) {
        parts.push(`Year: ${context.profile.year}`);
    }

    // Mood Patterns (if allowed)
    if (context.privacySettings.includeMoodData && context.moodPatterns.averageScore > 0) {
        parts.push(`\nMood Patterns:`);
        parts.push(`- Average mood: ${context.moodPatterns.averageScore}/10`);
        parts.push(`- Trend: ${context.moodPatterns.trend}`);
        
        if (context.moodPatterns.recentMood.length > 0) {
            parts.push(`- Recent mood: ${context.moodPatterns.recentMood.join(', ')}`);
        }

        if (Object.keys(context.moodPatterns.commonTriggers).length > 0) {
            const triggers = Object.entries(context.moodPatterns.commonTriggers)
                .slice(0, 5)
                .map(([trigger, count]) => `${trigger} (${count}x)`)
                .join(', ');
            parts.push(`- Common triggers: ${triggers}`);
        }

        if (Object.keys(context.moodPatterns.helpfulActivities).length > 0) {
            const activities = Object.entries(context.moodPatterns.helpfulActivities)
                .slice(0, 5)
                .map(([activity, score]) => `${activity} (avg mood: ${score})`)
                .join(', ');
            parts.push(`- Helpful activities: ${activities}`);
        }

        if (context.moodPatterns.sleepPatterns) {
            parts.push(`- Average sleep: ${context.moodPatterns.sleepPatterns.averageHours} hours`);
        }
    }

    // Journal Themes (if allowed)
    if (context.privacySettings.includeJournalEntries && context.journalThemes && context.journalThemes.length > 0) {
        parts.push(`\nJournal Themes: ${context.journalThemes.join(', ')}`);
    }

    // Conversation History
    if (context.conversationHistory.recentTopics.length > 0) {
        parts.push(`\nRecent Conversation Topics: ${context.conversationHistory.recentTopics.slice(0, 5).join(', ')}`);
    }

    if (context.conversationHistory.strategiesDiscussed.length > 0) {
        parts.push(`Strategies Discussed: ${context.conversationHistory.strategiesDiscussed.slice(0, 5).join(', ')}`);
    }

    // Behavioral Insights
    if (Object.keys(context.behavioralInsights.triggerFrequency).length > 0) {
        const triggers = Object.entries(context.behavioralInsights.triggerFrequency)
            .slice(0, 5)
            .map(([trigger, count]) => `${trigger} (${count}x)`)
            .join(', ');
        parts.push(`\nBehavioral Patterns - Frequent Triggers: ${triggers}`);
    }

    return parts.join('\n');
}

/**
 * Get decrypted journal entries from mood entries (if privacy allows)
 */
export async function getDecryptedJournalEntries(userId: string, limit: number = 5): Promise<string[]> {
    // Check user privacy settings
    const user = await UserModel.findById(userId).select('privacy').lean();
    if (user && (user as any).privacy?.dataCollection?.allowPersonalization === false) {
        return [];
    }

    try {
        const moodEntries = await MoodEntryModel.find({
            userId,
            'journalEntry.encrypted': { $exists: true, $ne: null },
        })
            .sort({ date: -1 })
            .limit(limit)
            .lean();

        const decryptedEntries: string[] = [];

        for (const entry of moodEntries) {
            if (entry.journalEntry && entry.journalEntry.encrypted) {
                try {
                    const decrypted = decrypt({
                        encrypted: entry.journalEntry.encrypted,
                        iv: entry.journalEntry.iv,
                        authTag: entry.journalEntry.authTag,
                    });
                    decryptedEntries.push(decrypted);
                } catch (error) {
                    console.error('Error decrypting journal entry:', error);
                    // Skip this entry
                }
            }
        }

        return decryptedEntries;
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        return [];
    }
}

