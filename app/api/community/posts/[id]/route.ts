import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import ForumPostModel from '@/lib/db/models/ForumPost';

// GET single post
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const post = await ForumPostModel.findById(params.id).lean();

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: post,
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        return NextResponse.json(
            { error: 'Failed to fetch post' },
            { status: 500 }
        );
    }
}

// UPDATE post
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, content, tags } = await req.json();

        await connectDB();

        const post = await ForumPostModel.findById(params.id);

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        // Check if user owns the post
        if (post.userId.toString() !== session.user.id) {
            return NextResponse.json(
                { error: 'You can only edit your own posts' },
                { status: 403 }
            );
        }

        post.title = title || post.title;
        post.content = content || post.content;
        post.tags = tags || post.tags;

        await post.save();

        return NextResponse.json({
            success: true,
            data: post,
        });
    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json(
            { error: 'Failed to update post' },
            { status: 500 }
        );
    }
}

// DELETE post
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const post = await ForumPostModel.findById(params.id);

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        // Check if user owns the post
        if (post.userId.toString() !== session.user.id) {
            return NextResponse.json(
                { error: 'You can only delete your own posts' },
                { status: 403 }
            );
        }

        await ForumPostModel.findByIdAndDelete(params.id);

        return NextResponse.json({
            success: true,
            message: 'Post deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json(
            { error: 'Failed to delete post' },
            { status: 500 }
        );
    }
}

