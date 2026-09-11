import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function checkAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return false;
  return true;
}

export async function GET(request: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const round = searchParams.get('round');
    const teamCode = searchParams.get('teamCode');

    let whereClause: any = {};
    if (round) {
      whereClause.roundNumber = parseInt(round, 10);
    }
    if (teamCode) {
      whereClause.team = {
        teamCode: {
          contains: teamCode.toUpperCase(),
        },
      };
    }

    const submissions = await prisma.submission.findMany({
      where: whereClause,
      include: {
        team: {
          select: {
            teamCode: true,
            name: true,
            institution: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({ success: true, submissions });
  } catch (error) {
    console.error('Submissions error:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
