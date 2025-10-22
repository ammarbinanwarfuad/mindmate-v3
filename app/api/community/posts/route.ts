import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import ForumPostModel from '@/lib/db/models/ForumPost';
import UserModel from '@/lib/db/models/User';
import { forumPostSchema } from '@/lib/utils/validation';
import { createNotification } from '@/lib/services/notifications';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const tag = searchParams.get('tag');

    await connectDB();

    const query: any = {};
    if (tag) {
      query.tags = tag;
    }

    const posts = await ForumPostModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Convert userReactions Map to object for JSON serialization
    const postsWithReactions = posts.map(post => {
      // After .lean(), userReactions is a plain object, not a Map
      const userReactionsObj = post.userReactions || {};
      const userReaction = session?.user?.id && userReactionsObj ?
        userReactionsObj[session.user.id] : null;

      return {
        ...post,
        userReaction,
        userReactions: undefined, // Remove from response
      };
    });

    return NextResponse.json({
      success: true,
      data: postsWithReactions,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = forumPostSchema.parse(body);

    await connectDB();

    // Get user info for author name
    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if post should be anonymous (from user preference or request)
    const isAnonymous = body.isAnonymous || user.profile.anonymous;
    const authorName = isAnonymous ? 'Anonymous User' : user.profile.name;

    const post = await ForumPostModel.create({
      userId: session.user.id,
      authorName,
      title: validatedData.title,
      content: validatedData.content,
      tags: validatedData.tags || [],
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
    });

    // Create notification for the user (self-notification)
    await createNotification(
      session.user.id,
      'post',
      'Post Published Successfully! 📝',
      `Your post "${validatedData.title}" has been published to the community.`,
      `/community/posts/${post._id}`,
      {
        fromUserId: session.user.id,
        fromUserName: user.profile.name,
        metadata: { postId: post._id }
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: post,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating post:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

