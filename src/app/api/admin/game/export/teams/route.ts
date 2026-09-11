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
      orderBy: { teamCode: 'asc' },
    });

    const headers = [
      'Team Code',
      'PIN/Password',
      'Team Name',
      'Leader Name',
      'Email',
      'Phone',
      'Institution',
      'Department',
      'Year',
      'Status',
      'Registered At',
    ];

    const rows = teams.map((team) => [
      team.teamCode,
      team.rawPin || '',
      `"${(team.name || '').replace(/"/g, '""')}"`,
      `"${(team.leaderName || '').replace(/"/g, '""')}"`,
      team.email || '',
      team.phone || '',
      `"${(team.institution || '').replace(/"/g, '""')}"`,
      `"${(team.department || '').replace(/"/g, '""')}"`,
      team.year || '',
      team.status,
      team.createdAt.toISOString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="teams_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export teams error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
