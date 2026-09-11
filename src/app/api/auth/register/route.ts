import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { teamName, participants, passcode, institution } = await request.json();

    if (!teamName || !passcode || !institution) {
      return NextResponse.json({ error: 'Team name, passcode and institution are required.' }, { status: 400 });
    }
    if (passcode.length < 4) {
      return NextResponse.json({ error: 'Passcode must be at least 4 characters.' }, { status: 400 });
    }

    // Auto-generate sequential Team ID: BTS-001, BTS-002, ...
    const count = await prisma.team.count();
    const teamCode = `BTS-${String(count + 1).padStart(3, '0')}`;

    // Check for duplicate team name
    const existing = await prisma.team.findFirst({ where: { name: teamName } });
    if (existing) {
      return NextResponse.json({ error: 'A team with this name already exists.' }, { status: 409 });
    }

    const hashedPin = await hashPassword(passcode);

    const team = await prisma.team.create({
      data: {
        name: teamName,
        teamCode,
        pin: hashedPin,
        rawPin: passcode,
        leaderName: participants || '',   // store participant names here
        institution,
        status: 'registered',
        currentRound: 1,
        totalScore: 0,
      },
    });

    return NextResponse.json({
      success: true,
      teamId: team.teamCode,
      message: `Registration successful! Your Team ID is ${team.teamCode}. Use it with your passcode to log in.`,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
