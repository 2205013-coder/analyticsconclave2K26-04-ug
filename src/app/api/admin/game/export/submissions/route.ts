import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const teams = await prisma.team.findMany({
      include: { submissions: { orderBy: { roundNumber: 'asc' } } },
      orderBy: { teamCode: 'asc' },
    });

    // Build one row per team, with columns for each round's Basic, Premium, Reasoning
    const roundNumbers = [1, 2, 3, 4, 5, 6];

    const headers = [
      'Team ID',
      'Team Name',
      'Participants',
      'Institution',
      'Status',
      ...roundNumbers.flatMap(r => [
        `R${r} Basic Forecast`,
        `R${r} Premium Forecast`,
        `R${r} Reasoning / Logic`,
        `R${r} Submitted At`,
      ]),
    ];

    const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = teams.map(team => {
      const submissionMap: Record<number, any> = {};
      team.submissions.forEach(s => { submissionMap[s.roundNumber] = s; });

      const roundCols = roundNumbers.flatMap(r => {
        const sub = submissionMap[r];
        return [
          sub ? sub.predictedGa : '',
          sub ? sub.predictedVip : '',
          escape(sub ? sub.reasoning : ''),
          escape(sub ? sub.submittedAt.toISOString() : ''),
        ];
      });

      return [
        team.teamCode,
        escape(team.name),
        escape(team.leaderName),   // participant names stored here
        escape(team.institution),
        team.status,
        ...roundCols,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const date = new Date().toISOString().split('T')[0];

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="beyond_the_stage_results_${date}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
