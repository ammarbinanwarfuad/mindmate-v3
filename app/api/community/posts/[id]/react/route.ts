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

        const { reactionType } = await req.json();

        // Validate reaction type
        const validReactions = ['love', 'supportive', 'relatable', 'helpful', 'insightful'];
        if (!validReactions.includes(reactionType)) {
            return NextResponse.json(
                { error: 'Invalid reaction type' },
                { status: 400 }
            );
        }

        await connectDB();

        const post = await ForumPostModel.findById(params.id);

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        const userId = session.user.id;
        const currentReaction = post.userReactions.get(userId);

        // If user already reacted with the same type, remove it (toggle)
        if (currentReaction === reactionType) {
            post.userReactions.delete(userId);
            // Decrease count
            if (post.reactions[reactionType as keyof typeof post.reactions] !== undefined) {
                (post.reactions as any)[reactionType] = Math.max(0, (post.reactions as any)[reactionType] - 1);
            }
        } else {
            // Remove old reaction count if exists
            if (currentReaction && post.reactions[currentReaction as keyof typeof post.reactions] !== undefined) {
                (post.reactions as any)[currentReaction] = Math.max(0, (post.reactions as any)[currentReaction] - 1);
            }

            // Add new reaction
            post.userReactions.set(userId, reactionType);
            // Increase count
            if (post.reactions[reactionType as keyof typeof post.reactions] !== undefined) {
                (post.reactions as any)[reactionType] = ((post.reactions as any)[reactionType] || 0) + 1;
            } else {
                // For new reaction types not in original schema
                (post.reactions as any)[reactionType] = 1;
            }
        }

        await post.save();

        // Create notification for post author if reaction was added (not removed)
        if (post.userReactions.get(userId) && post.userId.toString() !== userId) {
            const user = await UserModel.findById(userId);
            const reactionEmojis: any = {
                love: '❤️',
                supportive: '💙',
                relatable: '🤝',
                helpful: '💡',
                insightful: '✨'
            };

            await createNotification(
                post.userId.toString(),
                'reaction',
                'New Reaction on Your Post',
                `${user?.profile.name || 'Someone'} reacted ${reactionEmojis[reactionType]} to your post: "${post.title}"`,
                `/community/posts/${post._id}`,
                {
                    fromUserId: userId,
                    fromUserName: user?.profile.name,
                    metadata: { reactionType, postId: post._id }
                }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                reactions: post.reactions,
                userReaction: post.userReactions.get(userId) || null,
            },
        });
    } catch (error) {
        console.error('Error updating reaction:', error);
        return NextResponse.json(
            { error: 'Failed to update reaction' },
            { status: 500 }
        );
    }
}

