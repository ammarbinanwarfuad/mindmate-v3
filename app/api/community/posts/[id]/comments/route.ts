import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import ForumPostModel from '@/lib/db/models/ForumPost';
import UserModel from '@/lib/db/models/User';
import { createNotification } from '@/lib/services/notifications';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(req.url);
        const sortBy = searchParams.get('sortBy') || 'newest'; // newest, oldest, mostLiked

        await connectDB();

        const post = await ForumPostModel.findById(params.id);

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        const comments = [...post.comments];

        // Sort comments
        if (sortBy === 'newest') {
            comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortBy === 'oldest') {
            comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        } else if (sortBy === 'mostLiked') {
            comments.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        }

        return NextResponse.json({
            success: true,
            data: comments,
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

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

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: 'Comment content is required' },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await UserModel.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const post = await ForumPostModel.findById(params.id);

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        const authorName = (isAnonymous || user.profile.anonymous)
            ? 'Anonymous User'
            : user.profile.name;

        const newComment = {
            userId: session.user.id,
            authorName,
            content: content.trim(),
            likes: 0,
            likedBy: [],
            createdAt: new Date(),
        };

        post.comments.push(newComment as any);
        post.commentsCount = post.comments.length;

        await post.save();

        // Create notification for post author
        if (post.userId.toString() !== session.user.id) {
            await createNotification(
                post.userId.toString(),
                'comment',
                'New Comment on Your Post',
                `${authorName} commented on your post: "${post.title}"`,
                `/community/posts/${post._id}`,
                {
                    fromUserId: session.user.id,
                    fromUserName: user.profile.name,
                    metadata: { postId: post._id }
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: newComment,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json(
            { error: 'Failed to create comment' },
            { status: 500 }
        );
    }
}

