import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { number: string } }
) {
  try {
    const roundNumber = parseInt(params.number, 10);
    if (isNaN(roundNumber)) {
      return NextResponse.json({ error: 'Invalid round number' }, { status: 400 });
    }

    const round = await prisma.gameRound.findUnique({
      where: { roundNumber },
    });

    if (!round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { actualGa, actualVip, ...safeRound } = round;

    return NextResponse.json({
      success: true,
      round: safeRound,
    });
  } catch (error) {
    console.error('Game round error:', error);
    return NextResponse.json({ error: 'Failed to fetch round' }, { status: 500 });
  }
}
