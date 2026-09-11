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

    const gameControl = await prisma.gameControl.findFirst();
    if (!gameControl) {
      return NextResponse.json({ error: 'Game not initialized' }, { status: 500 });
    }

    // ── Heartbeat: update lastActiveAt so admin can see who is online ──
    await prisma.team.update({
      where: { id: team.id },
      data: { lastActiveAt: new Date() },
    });

    // ── Server-side timer: calculate remaining time from stored start ──
    let timerState: { timerStarted: boolean; remaining: number; roundStartedAt: string | null } = {
      timerStarted: false,
      remaining: 600,
      roundStartedAt: null,
    };

    if (team.roundStartedAt) {
      const round = await prisma.gameRound.findUnique({
        where: { roundNumber: team.currentRound },
      });
      const durationSeconds = round?.timerSeconds ?? 600;
      const elapsed = Math.floor((Date.now() - team.roundStartedAt.getTime()) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsed);

      timerState = {
        timerStarted: true,
        remaining,
        roundStartedAt: team.roundStartedAt.toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      teamName: team.name,
      currentRound: team.currentRound,
      totalScore: team.totalScore,
      status: team.status,
      timerState,
      gameControl: {
        activeRound: gameControl.activeRound,
        timerEnabled: gameControl.timerEnabled,
        gameStatus: gameControl.gameStatus,
      },
    });
  } catch (error) {
    console.error('Game status error:', error);
    return NextResponse.json({ error: 'Failed to fetch game status' }, { status: 500 });
  }
}
