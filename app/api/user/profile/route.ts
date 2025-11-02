import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import UserModel from '@/lib/db/models/User';
import { profileUpdateSchema } from '@/lib/utils/validation';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const user = await UserModel.findById(session.user.id).select('-passwordHash');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = profileUpdateSchema.parse(body);

        await connectDB();

        const updateData: any = {};

        if (validatedData.name) updateData['profile.name'] = validatedData.name;
        if (validatedData.headline !== undefined) updateData['profile.headline'] = validatedData.headline;
        if (validatedData.university) updateData['profile.university'] = validatedData.university;
        if (validatedData.year) updateData['profile.year'] = validatedData.year;
        if (validatedData.bio !== undefined) updateData['profile.bio'] = validatedData.bio;
        if (validatedData.about !== undefined) updateData['profile.about'] = validatedData.about;
        if (validatedData.anonymous !== undefined) updateData['profile.anonymous'] = validatedData.anonymous;
        if (validatedData.education !== undefined) updateData['profile.education'] = validatedData.education;
        if (validatedData.experience !== undefined) updateData['profile.experience'] = validatedData.experience;

        const user = await UserModel.findByIdAndUpdate(
            session.user.id,
            { $set: updateData },
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: user,
        });
    } catch (error: any) {
        console.error('Error updating profile:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input data', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}

