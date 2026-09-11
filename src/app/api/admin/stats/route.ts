import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function checkAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return false;
  return true;
}

export async function GET() {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const gameControl = await prisma.gameControl.findFirst();
    const totalTeams = await prisma.team.count();
    
    // Active teams (in the last 2 hours)
    const activeTeams = await prisma.team.count({
      where: {
        lastActiveAt: {
          gte: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      },
    });

    const totalSubmissions = await prisma.submission.count();
    const completedTeams = await prisma.team.count({
      where: { status: 'completed' },
    });

    const avgScoreResult = await prisma.team.aggregate({
      _avg: {
        totalScore: true,
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        activeRound: gameControl?.activeRound || 1,
        totalTeams,
        activeTeams,
        totalSubmissions,
        avgScore: avgScoreResult._avg.totalScore || 0,
        completedTeams,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
