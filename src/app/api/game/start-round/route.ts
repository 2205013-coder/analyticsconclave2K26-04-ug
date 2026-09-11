import { NextResponse } from 'next/server';
import { getTeamFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST /api/game/start-round — called when team clicks "Start Timer"
// Records the server-side start timestamp so the timer survives refreshes
export async function POST(req: Request) {
  try {
    const team = await getTeamFromCookie();
    if (!team) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { roundNumber } = await req.json();

    // Only allow starting the timer for the team's current round
    if (roundNumber !== team.currentRound) {
      return NextResponse.json({ error: 'Round mismatch' }, { status: 400 });
    }

    // If timer is already running for this round, return existing start time
    if (team.roundStartedAt) {
      const round = await prisma.gameRound.findUnique({ where: { roundNumber } });
      const durationSeconds = round?.timerSeconds ?? 600;
      const startedAt = team.roundStartedAt.getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startedAt) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsed);

      return NextResponse.json({
        success: true,
        alreadyStarted: true,
        roundStartedAt: team.roundStartedAt.toISOString(),
        remaining,
        duration: durationSeconds,
      });
    }

    // First time starting — record the timestamp
    const now = new Date();
    await prisma.team.update({
      where: { id: team.id },
      data: { roundStartedAt: now },
    });

    const round = await prisma.gameRound.findUnique({ where: { roundNumber } });
    const durationSeconds = round?.timerSeconds ?? 600;

    return NextResponse.json({
      success: true,
      alreadyStarted: false,
      roundStartedAt: now.toISOString(),
      remaining: durationSeconds,
      duration: durationSeconds,
    });
  } catch (error) {
    console.error('Start round error:', error);
    return NextResponse.json({ error: 'Failed to start round' }, { status: 500 });
  }
}
