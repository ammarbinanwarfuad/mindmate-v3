import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import ForumPostModel from '@/lib/db/models/ForumPost';
import UserModel from '@/lib/db/models/User';
import { createNotification } from '@/lib/services/notifications';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string; commentId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { id, commentId } = await params;
        const post = await ForumPostModel.findById(id);

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        const comment = post.comments.id(commentId);

        if (!comment) {
            return NextResponse.json(
                { error: 'Comment not found' },
                { status: 404 }
            );
        }

        const userId = session.user.id;
        const likedBy = (comment as any).likedBy || [];
        const isLiking = !likedBy.includes(userId);

        // Toggle like
        if (likedBy.includes(userId)) {
            // Unlike
            (comment as any).likedBy = likedBy.filter((id: string) => id !== userId);
            (comment as any).likes = Math.max(0, ((comment as any).likes || 0) - 1);
        } else {
            // Like
            (comment as any).likedBy = [...likedBy, userId];
            (comment as any).likes = ((comment as any).likes || 0) + 1;
        }

        await post.save();

        // Create notification for comment author if liked (not unliked)
        if (isLiking && (comment as any).userId.toString() !== userId) {
            const currentUser = await UserModel.findById(userId);
            const userName = currentUser?.profile.name || 'Someone';

            await createNotification(
                (comment as any).userId.toString(),
                'reaction',
                'Comment Liked ❤️',
                `${userName} liked your comment on: "${post.title}"`,
                `/community/posts/${post._id}`,
                {
                    fromUserId: userId,
                    fromUserName: userName,
                    metadata: { postId: post._id, commentId }
                }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                likes: (comment as any).likes,
                isLiked: (comment as any).likedBy.includes(userId),
            },
        });
    } catch (error) {
        console.error('Error liking comment:', error);
        return NextResponse.json(
            { error: 'Failed to like comment' },
            { status: 500 }
        );
    }
}

