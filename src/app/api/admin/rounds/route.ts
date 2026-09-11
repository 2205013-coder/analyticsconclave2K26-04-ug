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
    const rounds = await prisma.gameRound.findMany({
      orderBy: { roundNumber: 'asc' },
    });
    return NextResponse.json({ success: true, rounds });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rounds' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { id, ...data } = body;

    const round = await prisma.gameRound.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, round });
  } catch (error) {
    console.error('Update round error:', error);
    return NextResponse.json({ error: 'Failed to update round' }, { status: 500 });
  }
}
