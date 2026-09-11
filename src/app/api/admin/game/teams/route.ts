import { NextRequest, NextResponse } from 'next/server';
import { getSession, hashPassword } from '@/lib/auth';
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
    const teams = await prisma.team.findMany({
      include: {
        _count: { select: { submissions: true } },
      },
      orderBy: { teamCode: 'asc' },
    });

    const now = Date.now();
    const ONLINE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

    const teamsWithStatus = teams.map(t => ({
      ...t,
      isOnline: t.lastActiveAt
        ? (now - new Date(t.lastActiveAt).getTime()) < ONLINE_THRESHOLD_MS
        : false,
      lastActiveAt: t.lastActiveAt ? t.lastActiveAt.toISOString() : null,
    }));

    return NextResponse.json({ success: true, teams: teamsWithStatus });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const { name, teamCode, pin, leaderName, email, phone, institution, department, year } = body;
      const hashedPin = await hashPassword(pin);
      
      const team = await prisma.team.create({
        data: {
          name,
          teamCode: teamCode.toUpperCase(),
          pin: hashedPin,
          rawPin: pin,
          leaderName,
          email,
          phone,
          institution,
          department,
          year,
          status: 'registered',
        },
      });
      return NextResponse.json({ success: true, team });
    }

    if (action === 'bulk') {
      const { count, prefix, institution, namePattern } = body;
      const createdTeams = [];
      
      for (let i = 1; i <= count; i++) {
        const teamCode = `${prefix}-${String(i).padStart(3, '0')}`;
        const rawPin = Math.floor(1000 + Math.random() * 9000).toString();
        const hashedPin = await hashPassword(rawPin);
        
        const team = await prisma.team.create({
          data: {
            name: namePattern ? namePattern.replace('{n}', String(i)) : `Team ${i}`,
            teamCode: teamCode.toUpperCase(),
            pin: hashedPin,
            rawPin,
            institution,
            status: 'registered',
          },
        });
        createdTeams.push(team);
      }
      return NextResponse.json({ success: true, teams: createdTeams });
    }

    if (action === 'delete') {
      await prisma.team.delete({ where: { id: body.id } });
      return NextResponse.json({ success: true });
    }

    if (action === 'reset') {
      await prisma.submission.deleteMany({ where: { teamId: body.id } });
      const team = await prisma.team.update({
        where: { id: body.id },
        data: {
          currentRound: 1,
          totalScore: 0,
          status: 'active',
          roundStartedAt: null,
        },
      });
      return NextResponse.json({ success: true, team });
    }

    if (action === 'forceLogout') {
      await prisma.team.update({
        where: { id: body.id },
        data: { activeSessionId: null },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Teams action error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
