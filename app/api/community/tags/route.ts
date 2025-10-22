import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import ForumPostModel from '@/lib/db/models/ForumPost';

export async function GET() {
    try {
        await connectDB();

        // Get all posts to extract unique tags
        const posts = await ForumPostModel.find({}).select('tags').lean();

        // Extract all tags and count occurrences
        const tagMap: Record<string, number> = {};

        posts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
                post.tags.forEach(tag => {
                    if (tag) {
                        tagMap[tag] = (tagMap[tag] || 0) + 1;
                    }
                });
            }
        });

        // Get unique tags sorted by count (most used first)
        const sortedTags = Object.entries(tagMap)
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([tag]) => tag);

        return NextResponse.json({
            success: true,
            data: {
                tags: sortedTags,
                counts: tagMap,
            },
        });
    } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tags' },
            { status: 500 }
        );
    }
}

