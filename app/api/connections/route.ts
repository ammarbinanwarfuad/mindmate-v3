import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import MatchModel from '@/lib/db/models/Match';
import UserModel from '@/lib/db/models/User';

// Get all connections for current user
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status'); // 'pending', 'accepted', 'declined', or 'all'
        const type = searchParams.get('type'); // 'sent', 'received', or 'all'
        const userId = searchParams.get('userId'); // Check connection status with specific user

        await connectDB();

        // Check connection status with specific user
        if (userId) {
            const connection = await MatchModel.findOne({
                users: { $all: [session.user.id, userId] }
            });

            return NextResponse.json({
                success: true,
                data: connection,
                connected: connection?.status === 'accepted',
                pending: connection?.status === 'pending',
                isRequester: connection?.requesterId?.toString() === session.user.id,
                isReceiver: connection?.receiverId?.toString() === session.user.id,
            });
        }

        // Build query
        const query: any = {
            users: session.user.id
        };

        if (status && status !== 'all') {
            query.status = status;
        }

        if (type === 'sent') {
            query.requesterId = session.user.id;
        } else if (type === 'received') {
            query.receiverId = session.user.id;
        }

        // Get connections
        const connections = await MatchModel
            .find(query)
            .sort({ createdAt: -1 })
            .lean();

        // Populate user details
        const connectionsWithUsers = await Promise.all(
            connections.map(async (connection) => {
                const otherUserId = connection.users.find(
                    (id: any) => id.toString() !== session.user.id
                );

                const user = await UserModel.findById(otherUserId).select(
                    'profile.name profile.headline profile.university profile.year profile.bio profile.profilePicture'
                );

                return {
                    ...connection,
                    _id: connection._id.toString(),
                    user: {
                        userId: otherUserId?.toString(),
                        name: user?.profile.name,
                        headline: user?.profile.headline,
                        university: user?.profile.university,
                        year: user?.profile.year,
                        bio: user?.profile.bio,
                        profilePicture: user?.profile.profilePicture,
                    },
                    isRequester: connection.requesterId.toString() === session.user.id,
                    isReceiver: connection.receiverId.toString() === session.user.id,
                };
            })
        );

        // Separate into categories
        const accepted = connectionsWithUsers.filter((c: any) => c.status === 'accepted');
        const pendingSent = connectionsWithUsers.filter(
            (c: any) => c.status === 'pending' && c.isRequester
        );
        const pendingReceived = connectionsWithUsers.filter(
            (c: any) => c.status === 'pending' && c.isReceiver
        );

        return NextResponse.json({
            success: true,
            data: {
                all: connectionsWithUsers,
                accepted,
                pendingSent,
                pendingReceived,
                counts: {
                    total: connectionsWithUsers.length,
                    accepted: accepted.length,
                    pendingSent: pendingSent.length,
                    pendingReceived: pendingReceived.length,
                }
            }
        });
    } catch (error) {
        console.error('Error fetching connections:', error);
        return NextResponse.json(
            { error: 'Failed to fetch connections' },
            { status: 500 }
        );
    }
}

