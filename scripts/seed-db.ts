import dotenv from 'dotenv';
import { connectDB } from '../lib/db/mongodb';
import UserModel from '../lib/db/models/User';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

async function seedDatabase() {
    try {
        console.log('🌱 Seeding database...');

        await connectDB();

        // Create test user
        const existingUser = await UserModel.findOne({ email: 'test@example.com' });

        if (existingUser) {
            console.log('⚠️  Test user already exists');
        } else {
            const passwordHash = await bcrypt.hash('password123', 12);

            await UserModel.create({
                email: 'test@example.com',
                passwordHash,
                profile: {
                    name: 'Test User',
                    university: 'Test University',
                    year: 2,
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
                    termsAccepted: true,
                    termsVersion: '1.0.0',
                    privacyAccepted: true,
                    ageConfirmed: true,
                    consentDate: new Date(),
                },
            });

            console.log('✅ Test user created');
            console.log('   Email: test@example.com');
            console.log('   Password: password123');
        }

        console.log('\n✅ Database seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedDatabase();

