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
      select: {
        roundNumber: true,
        actualGa: true,
        actualVip: true,
      },
      orderBy: { roundNumber: 'asc' },
    });
    return NextResponse.json({ success: true, rounds });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { rounds } = await request.json();

    if (!Array.isArray(rounds)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    await prisma.$transaction(
      rounds.map((round: any) =>
        prisma.gameRound.update({
          where: { roundNumber: round.roundNumber },
          data: {
            actualGa: round.actualGa,
            actualVip: round.actualVip,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update answers error:', error);
    return NextResponse.json({ error: 'Failed to update answers' }, { status: 500 });
  }
}
