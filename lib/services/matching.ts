import { connectDB } from '@/lib/db/mongodb';
import UserModel from '@/lib/db/models/User';
import MoodEntryModel from '@/lib/db/models/MoodEntry';
import MatchModel from '@/lib/db/models/Match';

interface MatchingCriteria {
    university?: string;
    year?: number;
    moodRange?: number;
}

export async function findPotentialMatches(
    userId: string,
    criteria: MatchingCriteria = {}
): Promise<any[]> {
    await connectDB();

    const currentUser = await UserModel.findById(userId);
    if (!currentUser) {
        throw new Error('User not found');
    }

    // Get user's recent mood data
    const userMoodData = await MoodEntryModel
        .find({ userId })
        .sort({ date: -1 })
        .limit(7);

    const avgUserMood = userMoodData.length > 0
        ? userMoodData.reduce((sum, entry) => sum + entry.moodScore, 0) / userMoodData.length
        : 5;

    // Find existing matches to exclude
    const existingMatches = await MatchModel.find({
        users: userId,
    });

    const excludedUserIds = existingMatches.flatMap(match =>
        match.users.map((id: any) => id.toString())
    );

    // Build query for potential matches
    const query: any = {
        _id: { $ne: userId, $nin: excludedUserIds },
        'privacy.visibility.showInMatching': true,
    };

    if (criteria.university && currentUser.profile.university) {
        query['profile.university'] = currentUser.profile.university;
    }

    if (criteria.year && currentUser.profile.year) {
        query['profile.year'] = {
            $gte: currentUser.profile.year - 1,
            $lte: currentUser.profile.year + 1,
        };
    }

    const potentialMatches = await UserModel.find(query).limit(10);

    // Calculate match scores
    const matchesWithScores = await Promise.all(
        potentialMatches.map(async (match) => {
            const matchMoodData = await MoodEntryModel
                .find({ userId: match._id })
                .sort({ date: -1 })
                .limit(7);

            const avgMatchMood = matchMoodData.length > 0
                ? matchMoodData.reduce((sum, entry) => sum + entry.moodScore, 0) / matchMoodData.length
                : 5;

            let score = 50; // Base score

            // Similar mood score
            const moodDifference = Math.abs(avgUserMood - avgMatchMood);
            if (moodDifference <= 2) score += 30;
            else if (moodDifference <= 4) score += 15;

            // Same university
            if (currentUser.profile.university === match.profile.university) {
                score += 20;
            }

            return {
                userId: match._id,
                name: match.profile.anonymous ? 'Anonymous User' : match.profile.name,
                university: match.profile.university,
                year: match.profile.year,
                bio: match.profile.bio,
                matchScore: Math.min(score, 100),
                commonInterests: [], // Can be enhanced
            };
        })
    );

    return matchesWithScores.sort((a, b) => b.matchScore - a.matchScore);
}

export async function createMatch(
    userId1: string,
    userId2: string,
    matchScore: number,
    commonInterests: string[] = []
) {
    await connectDB();

    const match = await MatchModel.create({
        users: [userId1, userId2],
        matchScore,
        commonInterests,
        status: 'pending',
    });

    return match;
}

export async function updateMatchStatus(
    matchId: string,
    status: 'accepted' | 'declined'
) {
    await connectDB();

    const match = await MatchModel.findByIdAndUpdate(
        matchId,
        { status },
        { new: true }
    );

    return match;
}

