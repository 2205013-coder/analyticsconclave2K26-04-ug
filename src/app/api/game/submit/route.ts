import { NextRequest, NextResponse } from 'next/server';
import { getTeamFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateScore } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const team = await getTeamFromCookie();
    if (!team) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { roundNumber, predictedGa, predictedVip, reasoning } = body;

    if (
      typeof roundNumber !== 'number' ||
      typeof predictedGa !== 'number' ||
      typeof predictedVip !== 'number'
    ) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    if (team.currentRound !== roundNumber) {
      return NextResponse.json({ error: 'Submitting for incorrect round' }, { status: 400 });
    }

    const round = await prisma.gameRound.findUnique({
      where: { roundNumber },
    });

    if (!round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    const scoringConfig = await prisma.scoringConfig.findFirst({
      where: { active: true },
    });

    if (!scoringConfig) {
      return NextResponse.json({ error: 'Scoring configuration not found' }, { status: 500 });
    }

    const existingSubmission = await prisma.submission.findUnique({
      where: {
        teamId_roundNumber: {
          teamId: team.id,
          roundNumber,
        },
      },
    });

    if (existingSubmission) {
      return NextResponse.json({
        success: true,
        submittedValues: {
          predictedGa: existingSubmission.predictedGa,
          predictedVip: existingSubmission.predictedVip,
          reasoning: existingSubmission.reasoning,
        },
      });
    }

    const result = calculateScore(
      predictedGa,
      predictedVip,
      round.actualGa,
      round.actualVip,
      scoringConfig,
    );

    const isLastRound = roundNumber === 6;

    await prisma.$transaction(async (tx) => {
      await tx.submission.create({
        data: {
          teamId: team.id,
          roundNumber,
          predictedGa,
          predictedVip,
          reasoning: reasoning || '',
          actualGa: round.actualGa,
          actualVip: round.actualVip,
          gaError: result.gaError,
          vipError: result.vipError,
          accuracy: result.accuracy,
          score: result.score,
        },
      });

      await tx.team.update({
        where: { id: team.id },
        data: {
          currentRound: team.currentRound + 1,
          totalScore: team.totalScore + result.score,
          status: isLastRound ? 'completed' : team.status,
          roundStartedAt: null, // clear so next round gets a fresh timer
        },
      });
    });

    return NextResponse.json({
      success: true,
      submittedValues: {
        predictedGa,
        predictedVip,
        reasoning,
      },
    });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
