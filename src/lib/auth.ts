import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcryptjs from 'bcryptjs';
import prisma from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'housefull-game-secret-key-change-in-production'
);
const ADMIN_COOKIE = 'oxg-session';
const TEAM_COOKIE = 'team-token';

const ADMIN_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const TEAM_SESSION_DURATION = 12 * 60 * 60 * 1000;  // 12 hours

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

// ─── ADMIN AUTH ────────────────────────────────────────
export async function createAdminSession(userId: string) {
  const token = crypto.randomUUID() + '-' + crypto.randomUUID();
  const tokenHash = await bcryptjs.hash(token, 6);
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_DURATION);

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      isActive: true,
      lastActivity: new Date(),
    },
  });

  const jwt = await new SignJWT({ userId, role: 'ADMIN', sessionId: session.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return { session, jwt };
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    if (!token) return null;

    let payload;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      payload = verified.payload;
    } catch {
      return null;
    }

    const { userId, role, sessionId } = payload as {
      userId: string;
      role: string;
      sessionId: string;
    };

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || !session.isActive || session.revokedAt || new Date(session.expiresAt) < new Date()) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) return null;

    return { user, session, role };
  } catch {
    return null;
  }
}

export async function destroyAdminSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    if (!token) return;

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const { sessionId } = payload as { sessionId: string };
      await prisma.session.update({
        where: { id: sessionId },
        data: { isActive: false, revokedAt: new Date() },
      }).catch(() => {});
    } catch {}

    cookieStore.delete(ADMIN_COOKIE);
  } catch {
    try {
      const cookieStore = await cookies();
      cookieStore.delete(ADMIN_COOKIE);
    } catch {}
  }
}

// ─── TEAM AUTH ──────────────────────────────────────────
export async function createTeamSession(teamId: string) {
  const cookieStore = await cookies();
  cookieStore.set(TEAM_COOKIE, teamId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 hours
  });
}

export async function getTeamFromCookie() {
  try {
    const cookieStore = await cookies();
    const teamId = cookieStore.get(TEAM_COOKIE)?.value;
    if (!teamId) return null;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || !team.isActive) return null;
    return team;
  } catch {
    return null;
  }
}

export async function destroyTeamSession() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(TEAM_COOKIE);
  } catch {}
}
