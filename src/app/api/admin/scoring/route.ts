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
    const config = await prisma.scoringConfig.findFirst({
      where: { active: true },
    });
    return NextResponse.json({ success: true, config });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch scoring config' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const config = await prisma.scoringConfig.findFirst({ where: { active: true } });
    
    if (config) {
      await prisma.scoringConfig.update({
        where: { id: config.id },
        data: {
          gaWeight: body.gaWeight,
          vipWeight: body.vipWeight,
          maxRoundScore: body.maxRoundScore,
          underForecastPenalty: body.underForecastPenalty,
          overForecastPenalty: body.overForecastPenalty,
        },
      });
    } else {
      await prisma.scoringConfig.create({
        data: {
          gaWeight: body.gaWeight,
          vipWeight: body.vipWeight,
          maxRoundScore: body.maxRoundScore,
          underForecastPenalty: body.underForecastPenalty,
          overForecastPenalty: body.overForecastPenalty,
          active: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update scoring error:', error);
    return NextResponse.json({ error: 'Failed to update scoring config' }, { status: 500 });
  }
}
