import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { findPotentialMatches } from '@/lib/services/matching';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const filterByUniversity = searchParams.get('university') === 'true';
        const filterByYear = searchParams.get('year') === 'true';

        const criteria: any = {};
        if (filterByUniversity) criteria.university = true;
        if (filterByYear) criteria.year = true;

        const matches = await findPotentialMatches(session.user.id, criteria);

        return NextResponse.json({
            success: true,
            data: matches,
        });
    } catch (error) {
        console.error('Error finding matches:', error);
        return NextResponse.json(
            { error: 'Failed to find matches' },
            { status: 500 }
        );
    }
}

