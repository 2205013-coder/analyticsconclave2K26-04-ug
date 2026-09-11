import { NextRequest, NextResponse } from 'next/server';
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
    let gameControl = await prisma.gameControl.findFirst();
    if (!gameControl) {
      gameControl = await prisma.gameControl.create({
        data: {
          gameStatus: 'active',
          timerEnabled: true,
          leaderboardEnabled: false,
          activeRound: 1,
        },
      });
    }
    return NextResponse.json({ success: true, gameControl });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch game control' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { action, payload } = await request.json();
    const gameControl = await prisma.gameControl.findFirst();
    
    if (!gameControl) {
      return NextResponse.json({ error: 'Game control not initialized' }, { status: 500 });
    }

    if (action === 'setActiveRound') {
      await prisma.gameControl.update({
        where: { id: gameControl.id },
        data: { activeRound: payload.roundNumber },
      });
    } else if (action === 'toggleTimer') {
      await prisma.gameControl.update({
        where: { id: gameControl.id },
        data: { timerEnabled: payload.enabled },
      });
    } else if (action === 'toggleLeaderboard') {
      await prisma.gameControl.update({
        where: { id: gameControl.id },
        data: { leaderboardEnabled: payload.enabled },
      });
    } else if (action === 'resetGame') {
      await prisma.$transaction([
        prisma.submission.deleteMany(),
        prisma.team.updateMany({
          data: {
            currentRound: 1,
            totalScore: 0,
            status: 'active',
          },
        }),
        prisma.gameControl.update({
          where: { id: gameControl.id },
          data: {
            activeRound: 1,
            gameStatus: 'active',
            timerEnabled: true,
            leaderboardEnabled: false,
          },
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Game control action error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
