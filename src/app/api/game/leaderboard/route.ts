import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const gameControl = await prisma.gameControl.findFirst();

    if (!gameControl?.leaderboardEnabled) {
      return NextResponse.json({ visible: false });
    }

    const teams = await prisma.team.findMany({
      orderBy: { totalScore: 'desc' },
      select: {
        id: true,
        name: true,
        institution: true,
        totalScore: true,
      },
    });

    const leaderboard = teams.map((team, index) => ({
      ...team,
      rank: index + 1,
    }));

    return NextResponse.json({
      visible: true,
      leaderboard,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
