import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import UserModel from '@/lib/db/models/User';

// Upload profile picture (base64)
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        console.log('[API] Upload - Session user ID:', session?.user?.id);

        if (!session?.user?.id) {
            console.log('[API] Upload - Unauthorized');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const { image } = await req.json();
        console.log('[API] Upload - Image received, length:', image?.length);

        if (!image) {
            console.log('[API] Upload - No image provided');
            return NextResponse.json(
                { error: 'No image provided' },
                { status: 400 }
            );
        }

        // Validate base64 image
        if (!image.startsWith('data:image/')) {
            console.log('[API] Upload - Invalid image format');
            return NextResponse.json(
                { error: 'Invalid image format' },
                { status: 400 }
            );
        }

        // Check file size (limit to 2MB)
        const base64Data = image.split(',')[1];
        const sizeInBytes = (base64Data.length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        console.log('[API] Upload - Image size:', sizeInMB.toFixed(2), 'MB');

        if (sizeInMB > 2) {
            console.log('[API] Upload - Image too large');
            return NextResponse.json(
                { error: 'Image size must be less than 2MB' },
                { status: 400 }
            );
        }

        console.log('[API] Upload - Updating user:', session.user.id);

        // Update user profile picture
        const user = await UserModel.findByIdAndUpdate(
            session.user.id,
            { $set: { 'profile.profilePicture': image } },
            { new: true, runValidators: false }
        );

        console.log('[API] Upload - User updated:', user ? 'Found' : 'Not found');
        console.log('[API] Upload - Profile picture saved:', user?.profile?.profilePicture ? 'Yes' : 'No');
        console.log('[API] Upload - Profile picture length:', user?.profile?.profilePicture?.length || 0);

        if (!user) {
            console.log('[API] Upload - User not found in database');
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const profilePicture = user.profile?.profilePicture || null;
        console.log('[API] Upload - Returning profilePicture:', profilePicture ? 'Yes' : 'No');

        return NextResponse.json({
            success: true,
            data: {
                profilePicture: profilePicture,
            },
        });
    } catch (error) {
        console.error('[API] Error uploading profile picture:', error);
        return NextResponse.json(
            { error: 'Failed to upload profile picture' },
            { status: 500 }
        );
    }
}

// Delete profile picture
export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        await UserModel.findByIdAndUpdate(
            session.user.id,
            { $unset: { 'profile.profilePicture': '' } }
        );

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error('Error deleting profile picture:', error);
        return NextResponse.json(
            { error: 'Failed to delete profile picture' },
            { status: 500 }
        );
    }
}

