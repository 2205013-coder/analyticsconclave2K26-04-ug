import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// ─── helpers ────────────────────────────────────────────────
function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[\s_\-\/]+/g, '');
}

function matchColumn(headers: string[], candidates: string[]): string | undefined {
  return headers.find(h => candidates.some(c => normalizeHeader(h).includes(normalizeHeader(c))));
}

function generateGameId(index: number): string {
  return `GM-${String(index).padStart(3, '0')}`;
}

function generatePassword(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I,O,0,1 to avoid confusion
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

// ─── POST /api/admin/bulk-import/parse ──────────────────────
// Step 1: Parse + validate the Excel file, return preview rows
// Does NOT write anything to the DB
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (rawRows.length === 0) {
      return NextResponse.json({ error: 'Excel file is empty or has no data rows' }, { status: 400 });
    }

    const headers = Object.keys(rawRows[0]);

    // Column mapping — flexible matching
    const teamNameCol    = matchColumn(headers, ['teamname', 'team', 'name', 'teamname']);
    const collegeCol     = matchColumn(headers, ['college', 'collegename', 'institution', 'university', 'school', 'org']);
    const leaderCol      = matchColumn(headers, ['leader', 'teamleader', 'leadername', 'contact', 'representativename']);
    const emailCol       = matchColumn(headers, ['email', 'mail', 'emailaddress']);
    const phoneCol       = matchColumn(headers, ['phone', 'mobile', 'contact', 'phonenumber', 'mobilenumber']);
    const membersCol     = matchColumn(headers, ['members', 'teammmembers', 'membernames', 'participants']);

    if (!teamNameCol) {
      return NextResponse.json({ error: 'Could not find a "Team Name" column. Please ensure the Excel has a column named Team Name, Team, or Name.' }, { status: 400 });
    }
    if (!collegeCol) {
      return NextResponse.json({ error: 'Could not find a "College Name" column. Please ensure the Excel has a column named College Name, College, Institution, or University.' }, { status: 400 });
    }

    // Fetch all existing teams for duplicate checking
    const existingTeams = await prisma.team.findMany({ select: { name: true, institution: true, teamCode: true } });
    const existingSet = new Set(existingTeams.map(t => `${t.name.toLowerCase()}|||${(t.institution || '').toLowerCase()}`));
    const existingCodeMap = new Map(existingTeams.map(t => [`${t.name.toLowerCase()}|||${(t.institution || '').toLowerCase()}`, t.teamCode]));

    // Find highest existing GM-XXX number
    const gmCodes = existingTeams.map(t => t.teamCode).filter(c => /^GM-\d+$/.test(c));
    let nextIndex = gmCodes.length > 0
      ? Math.max(...gmCodes.map(c => parseInt(c.replace('GM-', '')))) + 1
      : 1;

    // Parse all rows
    const preview: any[] = [];
    const seenInFile = new Set<string>(); // detect duplicates within the file itself

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const teamName  = String(row[teamNameCol] || '').trim();
      const college   = String(row[collegeCol!] || '').trim();
      const leader    = leaderCol  ? String(row[leaderCol]  || '').trim() : '';
      const email     = emailCol   ? String(row[emailCol]   || '').trim() : '';
      const phone     = phoneCol   ? String(row[phoneCol]   || '').trim() : '';
      const members   = membersCol ? String(row[membersCol] || '').trim() : '';

      if (!teamName) {
        preview.push({ rowIndex: i + 2, teamName: '(empty)', college, status: 'error', error: 'Team Name is required', duplicate: false });
        continue;
      }

      const key = `${teamName.toLowerCase()}|||${college.toLowerCase()}`;
      const isDuplicateInFile = seenInFile.has(key);
      const isDuplicateInDb   = existingSet.has(key);
      seenInFile.add(key);

      if (isDuplicateInFile) {
        preview.push({ rowIndex: i + 2, teamName, college, leader, email, phone, members, status: 'error', error: 'Duplicate within the uploaded file', duplicate: true });
        continue;
      }

      if (isDuplicateInDb) {
        const existingCode = existingCodeMap.get(key) || '?';
        preview.push({ rowIndex: i + 2, teamName, college, leader, email, phone, members, status: 'already_imported', gameId: existingCode, duplicate: true });
        continue;
      }

      // Valid — assign a provisional Game ID
      const gameId = generateGameId(nextIndex++);
      preview.push({ rowIndex: i + 2, teamName, college, leader, email, phone, members, status: 'ready', gameId, duplicate: false });
    }

    const columnMap = { teamNameCol, collegeCol, leaderCol, emailCol, phoneCol, membersCol };

    return NextResponse.json({
      success: true,
      totalRows: rawRows.length,
      preview,
      columnMap,
      readyCnt:    preview.filter(r => r.status === 'ready').length,
      duplicateCnt: preview.filter(r => r.duplicate).length,
      errorCnt:    preview.filter(r => r.status === 'error').length,
    });
  } catch (err) {
    console.error('Bulk parse error:', err);
    return NextResponse.json({ error: 'Failed to parse Excel file. Make sure it is a valid .xlsx file.' }, { status: 500 });
  }
}

// ─── PUT /api/admin/bulk-import/parse ───────────────────────
// Step 2: Confirm import — create accounts for 'ready' rows
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { rows } = await req.json() as { rows: any[] };
    const readyRows = rows.filter((r: any) => r.status === 'ready');

    if (readyRows.length === 0) {
      return NextResponse.json({ error: 'No valid rows to import' }, { status: 400 });
    }

    // Re-check for duplicates (in case admin waits and someone else imports)
    const existingTeams = await prisma.team.findMany({ select: { name: true, institution: true, teamCode: true } });
    const existingSet   = new Set(existingTeams.map(t => `${t.name.toLowerCase()}|||${(t.institution || '').toLowerCase()}`));

    const gmCodes = existingTeams.map(t => t.teamCode).filter(c => /^GM-\d+$/.test(c));
    let nextIndex = gmCodes.length > 0
      ? Math.max(...gmCodes.map(c => parseInt(c.replace('GM-', '')))) + 1
      : 1;

    // Track used passwords to guarantee uniqueness
    const usedPasswords = new Set<string>();

    const results: any[] = [];
    for (const row of readyRows) {
      const key = `${row.teamName.toLowerCase()}|||${(row.college || '').toLowerCase()}`;
      if (existingSet.has(key)) {
        results.push({ ...row, status: 'skipped', reason: 'Already exists' });
        continue;
      }

      const gameId = generateGameId(nextIndex++);
      let rawPassword = generatePassword();
      while (usedPasswords.has(rawPassword)) rawPassword = generatePassword();
      usedPasswords.add(rawPassword);

      const hashedPin = await bcrypt.hash(rawPassword, 10);

      await prisma.team.create({
        data: {
          teamCode:   gameId,
          name:       row.teamName,
          pin:        hashedPin,
          rawPin:     rawPassword, // stored for admin export — consider removing in prod
          leaderName: row.leader  || null,
          email:      row.email   || null,
          phone:      row.phone   || null,
          institution: row.college || null,
          isActive:   true,
          status:     'active',
          currentRound: 1,
          totalScore:   0,
        },
      });

      existingSet.add(key);
      results.push({ ...row, gameId, password: rawPassword, status: 'created' });
    }

    return NextResponse.json({
      success: true,
      created:  results.filter(r => r.status === 'created').length,
      skipped:  results.filter(r => r.status === 'skipped').length,
      results,
    });
  } catch (err) {
    console.error('Bulk confirm error:', err);
    return NextResponse.json({ error: 'Import failed. Please try again.' }, { status: 500 });
  }
}
