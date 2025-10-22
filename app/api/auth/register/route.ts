import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongodb';
import UserModel from '@/lib/db/models/User';
import { registerSchema } from '@/lib/utils/validation';
import { TERMS_VERSION } from '@/lib/utils/constants';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate input
        const validatedData = registerSchema.parse(body);

        await connectDB();

        // Check if user already exists
        const existingUser = await UserModel.findOne({
            email: validatedData.email.toLowerCase(),
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(validatedData.password, 12);

        // Create user
        const user = await UserModel.create({
            email: validatedData.email.toLowerCase(),
            passwordHash,
            profile: {
                name: validatedData.name,
                university: validatedData.university,
                year: validatedData.year,
                anonymous: false,
            },
            preferences: {
                notifications: true,
                publicProfile: false,
                shareData: true,
            },
            privacy: {
                dataCollection: {
                    allowAnalytics: false,
                    allowResearch: false,
                    allowPersonalization: true,
                },
                visibility: {
                    profilePublic: false,
                    showInMatching: true,
                    allowMessages: 'matches',
                },
            },
            consent: {
                termsAccepted: validatedData.termsAccepted,
                termsVersion: TERMS_VERSION,
                privacyAccepted: validatedData.privacyAccepted,
                ageConfirmed: validatedData.ageConfirmed,
                consentDate: new Date(),
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Account created successfully',
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.profile.name,
                },
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error('Registration error:', error);

        if ((error as any).name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input data', details: (error as any).errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create account' },
            { status: 500 }
        );
    }
}

