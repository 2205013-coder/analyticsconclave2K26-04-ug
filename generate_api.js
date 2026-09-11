const fs = require('fs');
const path = require('path');

const API_DIR = 'C:\\Users\\sibas\\.gemini\\antigravity\\scratch\\opti-x-galaxy\\src\\app\\api';

const files = {
  'auth/team-login/route.ts': `import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcryptjs from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { teamCode, pin, force } = await req.json();
    const team = await prisma.team.findUnique({ where: { teamCode } });
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    if (!team.isActive) return NextResponse.json({ error: 'Team is inactive' }, { status: 403 });
    
    const valid = await bcryptjs.compare(pin, team.pin);
    if (!valid) return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });

    const session = await getSession();
    const isAdmin = session?.role === 'ADMIN';

    if (team.activeSessionId && !force && !isAdmin) {
      return NextResponse.json({ error: 'Team is already logged in on another device' }, { status: 409 });
    }

    const sessionId = crypto.randomUUID();
    await prisma.team.update({
      where: { id: team.id },
      data: { activeSessionId: sessionId, lastActiveAt: new Date() }
    });

    const cookieStore = await cookies();
    cookieStore.set('team-token', team.id, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 12
    });

    const { pin: _, ...teamInfo } = team;
    return NextResponse.json(teamInfo);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,
  'game/status/route.ts': `import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

async function getTeamAuth() {
  const cookieStore = await cookies();
  const teamId = cookieStore.get('team-token')?.value;
  if (!teamId) return null;
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  return team?.isActive ? team : null;
}

export async function GET() {
  try {
    const team = await getTeamAuth();
    if (!team) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const game = await prisma.game.findFirst({ where: { status: { in: ['ACTIVE', 'PAUSED'] } }, include: { rounds: { where: { roundNumber: { gt: 0 } }, orderBy: { roundNumber: 'desc' }, take: 1 } } });
    if (!game) return NextResponse.json({ error: 'No active game' }, { status: 404 });

    const round = game.rounds[0];
    const inventory = await prisma.inventory.findMany({ where: { teamId: team.id } });
    const warehouseUsage = inventory.reduce((sum, item) => sum + item.quantity, 0); // Simplified

    return NextResponse.json({
      game: { id: game.id, name: game.name, currentRound: game.currentRound, status: game.status },
      round: round ? { id: round.id, roundNumber: round.roundNumber, status: round.status, phase: round.phase, deadline: round.deadline } : null,
      team: { capital: team.capital, warehouseUsage, warehouseCapNormal: team.warehouseCapNormal, warehouseCapEmergency: team.warehouseCapEmergency }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,
  'game/market/route.ts': `import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const teamId = cookieStore.get('team-token')?.value;
    if (!teamId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const game = await prisma.game.findFirst({ where: { status: { in: ['ACTIVE', 'PAUSED'] } }, include: { rounds: { orderBy: { roundNumber: 'desc' }, take: 1 } } });
    if (!game || !game.rounds.length) return NextResponse.json({ error: 'No active round' }, { status: 404 });

    const roundId = game.rounds[0].id;
    const marketPrices = await prisma.marketPrice.findMany({
      where: { roundId },
      include: { product: true, market: true }
    });
    const activeEvents = await prisma.activeEvent.findMany({
      where: { roundId },
      include: { event: { select: { id: true, name: true, description: true, emoji: true, category: true } } }
    });

    const safePrices = marketPrices.map(({ hiddenDemandProb, hiddenPriceMult, ...p }) => p);

    return NextResponse.json({ marketPrices: safePrices, activeEvents });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,
  'game/inventory/route.ts': `import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const teamId = cookieStore.get('team-token')?.value;
    if (!teamId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const inventory = await prisma.inventory.findMany({
      where: { teamId },
      include: { product: true }
    });

    return NextResponse.json({ inventory });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,
  'game/decision/route.ts': `import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

async function getTeamAuth() {
  const cookieStore = await cookies();
  const teamId = cookieStore.get('team-token')?.value;
  return teamId ? await prisma.team.findUnique({ where: { id: teamId } }) : null;
}

export async function GET() {
  try {
    const team = await getTeamAuth();
    if (!team) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const game = await prisma.game.findFirst({ where: { status: { in: ['ACTIVE', 'PAUSED'] } }, include: { rounds: { orderBy: { roundNumber: 'desc' }, take: 1 } } });
    if (!game || !game.rounds.length) return NextResponse.json({ error: 'No active round' }, { status: 404 });

    const decision = await prisma.decision.findUnique({
      where: { teamId_roundId: { teamId: team.id, roundId: game.rounds[0].id } },
      include: { buyOrders: true, sellOrders: true, shipmentOrders: true }
    });

    return NextResponse.json({ decision });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const team = await getTeamAuth();
    if (!team) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { buyOrders = [], sellOrders = [], shipmentOrders = [] } = await req.json();
    
    const game = await prisma.game.findFirst({ where: { status: { in: ['ACTIVE'] } }, include: { rounds: { orderBy: { roundNumber: 'desc' }, take: 1 } } });
    if (!game || !game.rounds.length) return NextResponse.json({ error: 'No active round' }, { status: 400 });
    const round = game.rounds[0];
    if (round.status !== 'PENDING' || (round.deadline && new Date() > new Date(round.deadline))) {
      return NextResponse.json({ error: 'Round is locked or deadline passed' }, { status: 403 });
    }

    // Cost calculation skipped for brevity in mockup
    const totalBuyCost = 0;
    const totalTransportCost = 0;
    const totalWarehouseCost = 0;

    const decision = await prisma.decision.upsert({
      where: { teamId_roundId: { teamId: team.id, roundId: round.id } },
      update: { totalBuyCost, totalTransportCost, totalWarehouseCost, status: 'SUBMITTED', submittedAt: new Date() },
      create: { teamId: team.id, roundId: round.id, totalBuyCost, totalTransportCost, totalWarehouseCost, status: 'SUBMITTED', submittedAt: new Date() }
    });

    return NextResponse.json({ decision });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,
  'game/calculator/route.ts': `import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  return NextResponse.json({
    cashAfterPurchases: 0,
    expectedTransportCost: 0,
    expectedWarehouseCost: 0,
    expectedRevenueRange: [0, 0],
    expectedProfitRange: [0, 0],
    remainingCash: 0,
    remainingWarehouseCapacity: 0,
    riskLevel: 'LOW'
  });
}
`,
  'game/results/[roundId]/route.ts': `import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { roundId: string } }) {
  try {
    const cookieStore = await cookies();
    const teamId = cookieStore.get('team-token')?.value;
    if (!teamId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const round = await prisma.round.findUnique({ where: { id: params.roundId } });
    if (!round || round.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Results not available yet' }, { status: 403 });
    }

    const result = await prisma.roundResult.findUnique({
      where: { teamId_roundId: { teamId, roundId: params.roundId } }
    });

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,
  'game/history/route.ts': `import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const teamId = cookieStore.get('team-token')?.value;
    if (!teamId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decisions = await prisma.decision.findMany({
      where: { teamId, round: { status: 'COMPLETED' } },
      include: { round: true, buyOrders: true, sellOrders: true }
    });

    const results = await prisma.roundResult.findMany({
      where: { teamId, round: { status: 'COMPLETED' } },
      include: { round: true }
    });

    return NextResponse.json({ decisions, results });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,
  'game/leaderboard/route.ts': `import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const scores = await prisma.score.findMany({
      include: { team: { select: { name: true, isActive: true } } },
      orderBy: { totalScore: 'desc' }
    });

    const leaderboard = scores.map((s, index) => ({
      rank: index + 1,
      teamName: s.team.name,
      totalScore: s.totalScore,
      profitScore: s.profitScore,
      overallRank: s.overallRank
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,
  'admin/game/route.ts': `import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const config = await prisma.game.findFirst({
      include: { products: true, markets: true, transportModes: true }
    });
    return NextResponse.json({ config });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // simplified game creation
    const game = await prisma.game.create({ data: { name: 'New Game' } });
    return NextResponse.json({ game });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,
  'admin/game/round/route.ts': `import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action } = await req.json();
    return NextResponse.json({ success: true, action });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const status = await prisma.round.findFirst({ orderBy: { roundNumber: 'desc' }});
    return NextResponse.json({ status });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,
  'admin/game/event/route.ts': `import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const events = await prisma.gameEvent.findMany({ where: { isTemplate: true }, include: { effects: true } });
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,
  'admin/game/price/route.ts': `import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,
  'admin/game/teams/route.ts': `import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcryptjs from 'bcryptjs';

export async function GET() {
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const teams = await prisma.team.findMany({
      include: { scores: true }
    });
    return NextResponse.json({ teams });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, teamCode, pin } = await req.json();
    const hashedPin = await bcryptjs.hash(pin, 10);
    const game = await prisma.game.findFirst();
    if (!game) return NextResponse.json({ error: 'No game' }, { status: 400 });

    const team = await prisma.team.create({
      data: { gameId: game.id, name, teamCode, pin: hashedPin, capital: game.startingCapital }
    });
    return NextResponse.json({ team });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,
  'admin/game/dashboard/route.ts': `import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return NextResponse.json({ dashboard: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,
  'admin/game/spectator/route.ts': `import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return NextResponse.json({ spectator: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(API_DIR, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

console.log('Done!');
