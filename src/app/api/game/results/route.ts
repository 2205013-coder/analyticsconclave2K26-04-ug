import { NextResponse } from 'next/server';
import { getTeamFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const team = await getTeamFromCookie();
    if (!team) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (team.status !== 'completed') {
      return NextResponse.json({ error: 'Results not yet available' }, { status: 403 });
    }

    const submissions = await prisma.submission.findMany({
      where: { teamId: team.id },
      orderBy: { roundNumber: 'asc' },
    });

    return NextResponse.json({
      success: true,
      team: {
        name: team.name,
        teamCode: team.teamCode,
        totalScore: team.totalScore,
      },
      submissions,
    });
  } catch (error) {
    console.error('Results error:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
