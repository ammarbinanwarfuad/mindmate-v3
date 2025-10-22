import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import UserModel from '@/lib/db/models/User';

// Update user's online status
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const { isOnline } = await req.json();

        // Update user's online status and last active time
        await UserModel.findByIdAndUpdate(session.user.id, {
            isOnline: isOnline,
            lastActive: new Date(),
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error('Error updating status:', error);
        return NextResponse.json(
            { error: 'Failed to update status' },
            { status: 500 }
        );
    }
}

// Get online status of users
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const userIds = searchParams.get('userIds')?.split(',') || [];

        // Get users who have active status enabled
        const users = await UserModel.find({
            _id: { $in: userIds },
            'privacy.showActiveStatus': true,
        }).select('_id isOnline lastActive');

        // Consider user online if they were active in the last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const statuses = users.map(user => ({
            userId: user._id.toString(),
            isOnline: user.isOnline && user.lastActive > fiveMinutesAgo,
            lastActive: user.lastActive,
        }));

        return NextResponse.json({
            success: true,
            data: statuses,
        });
    } catch (error) {
        console.error('Error fetching statuses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statuses' },
            { status: 500 }
        );
    }
}

