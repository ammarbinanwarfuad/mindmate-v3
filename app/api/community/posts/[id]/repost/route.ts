import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import ForumPostModel from '@/lib/db/models/ForumPost';
import UserModel from '@/lib/db/models/User';
import { createNotification } from '@/lib/services/notifications';

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content, isAnonymous } = await req.json();

        await connectDB();

        const originalPost = await ForumPostModel.findById(params.id);

        if (!originalPost) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        const user = await UserModel.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const authorName = (isAnonymous || user.profile.anonymous)
            ? 'Anonymous User'
            : user.profile.name;

        // Create repost
        const repost = await ForumPostModel.create({
            userId: session.user.id,
            authorName,
            title: originalPost.title,
            content: content ? `${content}\n\n--- Reposted from ${originalPost.authorName} ---\n${originalPost.content}` : originalPost.content,
            tags: [...originalPost.tags, 'Repost'],
            reactions: {
                love: 0,
                supportive: 0,
                relatable: 0,
                helpful: 0,
                insightful: 0,
            },
            userReactions: new Map(),
            comments: [],
            commentsCount: 0,
            isRepost: true,
            originalPostId: originalPost._id,
            originalAuthor: originalPost.authorName,
        });

        // Create notification for original post author
        if (originalPost.userId.toString() !== session.user.id) {
            await createNotification(
                originalPost.userId.toString(),
                'repost',
                'Your Post Was Reposted',
                `${authorName} reposted your post: "${originalPost.title}"`,
                `/community/posts/${repost._id}`,
                {
                    fromUserId: session.user.id,
                    fromUserName: user.profile.name,
                    metadata: { originalPostId: originalPost._id, repostId: repost._id }
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: repost,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating repost:', error);
        return NextResponse.json(
            { error: 'Failed to create repost' },
            { status: 500 }
        );
    }
}

