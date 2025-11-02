import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import UserModel from '@/lib/db/models/User';

// Get user settings
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const user = await UserModel.findById(session.user.id)
            .select('privacy preferences');

        return NextResponse.json({
            success: true,
            data: {
                privacy: user.privacy,
                preferences: user.preferences,
            },
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

// Update user settings
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const body = await req.json();
        const { privacy, preferences } = body;

        const updateData: any = {};
        if (privacy) updateData.privacy = privacy;
        if (preferences) updateData.preferences = preferences;

        const user = await UserModel.findByIdAndUpdate(
            session.user.id,
            { $set: updateData },
            { new: true }
        ).select('privacy preferences');

        return NextResponse.json({
            success: true,
            data: {
                privacy: user.privacy,
                preferences: user.preferences,
            },
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}

