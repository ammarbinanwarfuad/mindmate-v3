import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import UserModel from '@/lib/db/models/User';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Validate base64 image
        if (!image.startsWith('data:image/')) {
            return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
        }

        await connectDB();

        const user = await UserModel.findByIdAndUpdate(
            session.user.id,
            { $set: { 'profile.coverPhoto': image } },
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: { coverPhoto: user.profile.coverPhoto },
        });
    } catch (error) {
        console.error('Error uploading cover photo:', error);
        return NextResponse.json(
            { error: 'Failed to upload cover photo' },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const user = await UserModel.findByIdAndUpdate(
            session.user.id,
            { $unset: { 'profile.coverPhoto': '' } },
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Cover photo removed successfully',
        });
    } catch (error) {
        console.error('Error removing cover photo:', error);
        return NextResponse.json(
            { error: 'Failed to remove cover photo' },
            { status: 500 }
        );
    }
}

