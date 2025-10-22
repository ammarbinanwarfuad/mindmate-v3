import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import MatchModel from '@/lib/db/models/Match';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { connectionId } = await req.json();

        if (!connectionId) {
            return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 });
        }

        await connectDB();

        const connection = await MatchModel.findById(connectionId);

        if (!connection) {
            return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
        }

        // Verify that the current user is part of this connection
        const isPartOfConnection = connection.users.some(
            (userId: any) => userId.toString() === session.user.id
        );

        if (!isPartOfConnection) {
            return NextResponse.json({ error: 'Not authorized to disconnect this connection' }, { status: 403 });
        }

        // Delete the connection (disconnect)
        await MatchModel.findByIdAndDelete(connectionId);

        console.log('✅ Connection disconnected successfully!');

        return NextResponse.json({
            success: true,
            message: 'Connection removed successfully'
        });
    } catch (error) {
        console.error('Error disconnecting connection:', error);
        return NextResponse.json(
            { error: 'Failed to disconnect connection' },
            { status: 500 }
        );
    }
}

