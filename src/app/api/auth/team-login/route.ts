import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createTeamSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { teamCode, pin, forceLogin } = await request.json();

    if (!teamCode || !pin) {
      return NextResponse.json({ error: 'Team name and passcode are required' }, { status: 400 });
    }

    const nameOrCode = teamCode.trim();

    // Try finding by teamCode first, then by team name (case-insensitive via SQLite LIKE)
    let team = await prisma.team.findUnique({ where: { teamCode: nameOrCode.toUpperCase() } });
    if (!team) {
      // Search by name (case-insensitive)
      const allTeams = await prisma.team.findMany({ where: { isActive: true } });
      team = allTeams.find(t => t.name.toLowerCase() === nameOrCode.toLowerCase()) || null;
    }

    if (!team || !team.isActive) {
      return NextResponse.json({ error: 'Team not found. Check your team name or contact the Game Master.' }, { status: 401 });
    }

    const isValidPin = await verifyPassword(pin, team.pin);
    if (!isValidPin) {
      return NextResponse.json({ error: 'Incorrect passcode. Please try again.' }, { status: 401 });
    }

    // Session conflict check
    if (team.activeSessionId && !forceLogin) {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      if (!team.lastActiveAt || new Date(team.lastActiveAt) >= twoHoursAgo) {
        return NextResponse.json({
          error: 'This team is already logged in on another device.',
          code: 'SESSION_CONFLICT',
        }, { status: 409 });
      }
    }

    const activeSessionId = crypto.randomUUID();
    await prisma.team.update({
      where: { id: team.id },
      data: { activeSessionId, lastActiveAt: new Date(), status: 'active' },
    });

    await createTeamSession(team.id);

    return NextResponse.json({
      success: true,
      team: { id: team.id, name: team.name, teamCode: team.teamCode, currentRound: team.currentRound },
    });
  } catch (error) {
    console.error('Team login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
