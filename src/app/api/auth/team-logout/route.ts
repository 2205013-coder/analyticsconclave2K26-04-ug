import { NextResponse } from 'next/server';
import { getTeamFromCookie, destroyTeamSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const team = await getTeamFromCookie();
    
    if (team) {
      // Clear active session lock so team can log in again
      await prisma.team.update({
        where: { id: team.id },
        data: { activeSessionId: null },
      }).catch(() => {});
    }
    
    await destroyTeamSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Team logout error:', error);
    // Still try to destroy the cookie
    await destroyTeamSession().catch(() => {});
    return NextResponse.json({ success: true });
  }
}
