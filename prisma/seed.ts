import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('Admin@123', 10);

  // 1. Admin Account
  await prisma.user.upsert({
    where: { email: 'admin@housefull.com' }, // keep email as-is for existing admin login
    update: { passwordHash },
    create: {
      name: 'Game Master',
      email: 'admin@housefull.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // 2. Teams — created by Admin only. No default teams seeded.

  // 3. Scoring Configuration (60% Accuracy, 40% Logic & Strategy)
  const existingConfig = await prisma.scoringConfig.findFirst();
  if (!existingConfig) {
    await prisma.scoringConfig.create({
      data: {
        gaWeight: 0.6,
        vipWeight: 0.4,
        maxRoundScore: 100,
        underForecastPenalty: 1.0,
        overForecastPenalty: 1.0,
        active: true,
      },
    });
  } else {
    await prisma.scoringConfig.update({
      where: { id: existingConfig.id },
      data: {
        gaWeight: 0.6,
        vipWeight: 0.4,
        maxRoundScore: 100,
      }
    });
  }

  // 4. Game Control
  const existingControl = await prisma.gameControl.findFirst();
  if (!existingControl) {
    await prisma.gameControl.create({
      data: {
        gameStatus: 'active',
        timerEnabled: true,
        leaderboardEnabled: true,
        activeRound: 1,
      },
    });
  }

  // 5. Official Six Live Rounds (T061 to T066) from UG Analytics Game 2026 Case Study
  const rounds = [
    {
      roundNumber: 1,
      title: 'Round 1 — T061',
      theme: 'Open-Air Baseline',
      artistAct: 'Artist B',
      genre: 'Pop / Live Act',
      venueType: 'Open-Air Venue',
      promotionLevel: 2,
      venuePrestige: 2,
      weather: 'Sunny',
      concertDay: 'Weekday',
      competingEvents: 'Low',
      instructions: 'Analyze historical demand for Artist B in an Open-Air Venue on a Sunny Weekday with Promotion Level 2 and Venue Prestige 2. Competing events are Low. Submit Basic Occupancy (0–50,000), Premium Occupancy (0–10,000), and your forecasting logic.',
      actualGa: 16500,
      actualVip: 2400,
      timerSeconds: 600,
      status: 'ready'
    },
    {
      roundNumber: 2,
      title: 'Round 2 — T062',
      theme: 'Holiday Surge & Competition',
      artistAct: 'Artist A',
      genre: 'Headliner Rock / Pop',
      venueType: 'Indoor Hall',
      promotionLevel: 5,
      venuePrestige: 4,
      weather: 'Sunny',
      concertDay: 'Holiday',
      competingEvents: 'High',
      instructions: 'Artist A performing in an Indoor Hall on a Holiday with maximum Promotion Level 5 and Venue Prestige 4. Note high competing events in the city. Forecast Basic (0–50,000) and Premium (0–10,000) occupancy with full reasoning.',
      actualGa: 31200,
      actualVip: 6400,
      timerSeconds: 600,
      status: 'ready'
    },
    {
      roundNumber: 3,
      title: 'Round 3 — T063',
      theme: 'Prestige Weekend Showcase',
      artistAct: 'Artist B',
      genre: 'Pop / Live Act',
      venueType: 'Convention Centre',
      promotionLevel: 4,
      venuePrestige: 5,
      weather: 'Cloudy',
      concertDay: 'Weekend',
      competingEvents: 'Moderate',
      instructions: 'Artist B at a top-tier 5-Star Prestige Convention Centre on a Weekend with Promotion Level 4. Weather is Cloudy and Competing Events are Moderate. Provide your forecasts and analytical rationale.',
      actualGa: 24800,
      actualVip: 5200,
      timerSeconds: 600,
      status: 'ready'
    },
    {
      roundNumber: 4,
      title: 'Round 4 — T064',
      theme: 'Indoor Hall Clash',
      artistAct: 'Artist D',
      genre: 'Electronic / Indie',
      venueType: 'Indoor Hall',
      promotionLevel: 4,
      venuePrestige: 4,
      weather: 'Cloudy',
      concertDay: 'Weekday',
      competingEvents: 'High',
      instructions: 'Artist D performing in an Indoor Hall on a Weekday with Promotion Level 4 and Venue Prestige 4. Weather is Cloudy and Competing Events are High. Forecast Basic and Premium attendance.',
      actualGa: 21600,
      actualVip: 4300,
      timerSeconds: 600,
      status: 'ready'
    },
    {
      roundNumber: 5,
      title: 'Round 5 — T065',
      theme: 'High Promo / Entry Venue',
      artistAct: 'Artist A',
      genre: 'Headliner Rock / Pop',
      venueType: 'Open-Air Venue',
      promotionLevel: 4,
      venuePrestige: 1,
      weather: 'Cloudy',
      concertDay: 'Weekday',
      competingEvents: 'High',
      instructions: 'Artist A performing in an Open-Air Venue with low Prestige (Level 1) but high Promotion (Level 4) on a Weekday with Cloudy weather and High competing events. Submit your forecasts and defensible logic.',
      actualGa: 18400,
      actualVip: 2900,
      timerSeconds: 600,
      status: 'ready'
    },
    {
      roundNumber: 6,
      title: 'Round 6 — T066',
      theme: 'Solo Arena Grand Finale',
      artistAct: 'Artist C',
      genre: 'Festival Fusion / Alternative',
      venueType: 'Arena',
      promotionLevel: 1,
      venuePrestige: 2,
      weather: 'Sunny',
      concertDay: 'Weekday',
      competingEvents: 'No Competition',
      instructions: 'Grand Finale! Artist C performing in an Arena on a Sunny Weekday with low Promotion (Level 1) and Prestige Level 2, but with No Competing Events. Deliver your final tournament forecast.',
      actualGa: 26500,
      actualVip: 4200,
      timerSeconds: 600,
      status: 'ready'
    },
  ];

  for (const r of rounds) {
    await prisma.gameRound.upsert({
      where: { roundNumber: r.roundNumber },
      update: r,
      create: r,
    });
  }

  // 6. 60 Historical Training Events — exact data from Beyond The Stage Case Study
  const historicalEvents = [
    // [matchId, year, month, artistAct, genre, venueType, promoLevel, prestige, weather, eventDay, competing, basicOcc, premiumOcc]
    ['T001', 2021, 1,  'Artist A', 'Live Act', 'Arena',             3, 2, 'Sunny',  'Weekday', 'Moderate', 32493, 4089],
    ['T002', 2021, 2,  'Artist B', 'Live Act', 'Convention Centre', 1, 1, 'Sunny',  'Weekday', 'Moderate', 27295, 4018],
    ['T003', 2021, 3,  'Artist B', 'Live Act', 'Convention Centre', 4, 5, 'Cloudy', 'Weekday', 'Moderate', 34531, 3912],
    ['T004', 2021, 4,  'Artist C', 'Live Act', 'Open-Air Venue',    2, 2, 'Cloudy', 'Weekday', 'Low',      29658, 2513],
    ['T005', 2021, 5,  'Artist A', 'Live Act', 'Open-Air Venue',    3, 5, 'Cloudy', 'Weekday', 'High',     28061, 5234],
    ['T006', 2021, 6,  'Artist B', 'Live Act', 'Convention Centre', 5, 3, 'Cloudy', 'Holiday', 'Moderate', 40073, 6127],
    ['T007', 2021, 7,  'Artist A', 'Live Act', 'Indoor Hall',       2, 3, 'Sunny',  'Weekday', 'High',     31483, 1369],
    ['T008', 2021, 8,  'Artist C', 'Live Act', 'Open-Air Venue',    3, 2, 'Cloudy', 'Weekend', 'Low',      29050, 2750],
    ['T009', 2021, 9,  'Artist A', 'Live Act', 'Indoor Hall',       2, 5, 'Sunny',  'Weekday', 'High',     27974, 3951],
    ['T010', 2021, 10, 'Artist C', 'Live Act', 'Arena',             5, 2, 'Cloudy', 'Weekday', 'Moderate', 30683, 3470],
    ['T011', 2021, 11, 'Artist C', 'Live Act', 'Open-Air Venue',    3, 1, 'Sunny',  'Holiday', 'Low',      35931, 5119],
    ['T012', 2021, 12, 'Artist B', 'Live Act', 'Open-Air Venue',    4, 2, 'Cloudy', 'Weekday', 'Low',      30635, 1760],
    ['T013', 2022, 1,  'Artist B', 'Live Act', 'Indoor Hall',       4, 3, 'Sunny',  'Weekday', 'Moderate', 29911, 5188],
    ['T014', 2022, 2,  'Artist A', 'Live Act', 'Arena',             2, 2, 'Cloudy', 'Holiday', 'Moderate', 31198, 3700],
    ['T015', 2022, 3,  'Artist B', 'Live Act', 'Indoor Hall',       4, 5, 'Cloudy', 'Holiday', 'Moderate', 40798, 6566],
    ['T016', 2022, 4,  'Artist C', 'Live Act', 'Arena',             3, 1, 'Cloudy', 'Weekend', 'Moderate', 29796, 4281],
    ['T017', 2022, 5,  'Artist A', 'Live Act', 'Indoor Hall',       3, 5, 'Sunny',  'Holiday', 'High',     42973, 4853],
    ['T018', 2022, 6,  'Artist D', 'Live Act', 'Convention Centre', 3, 2, 'Sunny',  'Holiday', 'High',     36145, 3523],
    ['T019', 2022, 7,  'Artist A', 'Live Act', 'Arena',             3, 3, 'Sunny',  'Weekday', 'Moderate', 33417, 3032],
    ['T020', 2022, 8,  'Artist A', 'Live Act', 'Indoor Hall',       4, 1, 'Sunny',  'Weekday', 'High',     25343, 4457],
    ['T021', 2022, 9,  'Artist C', 'Live Act', 'Arena',             5, 4, 'Sunny',  'Holiday', 'Moderate', 46976, 6437],
    ['T022', 2022, 10, 'Artist B', 'Live Act', 'Indoor Hall',       3, 4, 'Cloudy', 'Weekday', 'Moderate', 31268, 4159],
    ['T023', 2022, 11, 'Artist A', 'Live Act', 'Open-Air Venue',    1, 5, 'Sunny',  'Holiday', 'High',     36042, 5324],
    ['T024', 2022, 12, 'Artist A', 'Live Act', 'Indoor Hall',       1, 2, 'Sunny',  'Weekday', 'High',     22578, 4045],
    ['T025', 2023, 1,  'Artist D', 'Live Act', 'Arena',             4, 2, 'Sunny',  'Holiday', 'Low',      37187, 4789],
    ['T026', 2023, 2,  'Artist B', 'Live Act', 'Open-Air Venue',    2, 1, 'Sunny',  'Holiday', 'Low',      31648, 3291],
    ['T027', 2023, 3,  'Artist B', 'Live Act', 'Open-Air Venue',    4, 1, 'Sunny',  'Weekday', 'Low',      26646, 3589],
    ['T028', 2023, 4,  'Artist A', 'Live Act', 'Arena',             2, 2, 'Cloudy', 'Weekday', 'Moderate', 24561, 3845],
    ['T029', 2023, 5,  'Artist C', 'Live Act', 'Open-Air Venue',    2, 1, 'Cloudy', 'Holiday', 'Low',      30321, 3952],
    ['T030', 2023, 6,  'Artist A', 'Live Act', 'Arena',             2, 2, 'Cloudy', 'Weekend', 'Moderate', 27162, 4680],
    ['T031', 2023, 7,  'Artist B', 'Live Act', 'Convention Centre', 2, 4, 'Sunny',  'Weekend', 'Moderate', 31541, 3951],
    ['T032', 2023, 8,  'Artist C', 'Live Act', 'Open-Air Venue',    5, 4, 'Sunny',  'Weekday', 'Low',      32287, 5043],
    ['T033', 2023, 9,  'Artist A', 'Live Act', 'Indoor Hall',       5, 1, 'Cloudy', 'Weekday', 'High',     32625, 4084],
    ['T034', 2023, 10, 'Artist D', 'Live Act', 'Convention Centre', 5, 1, 'Sunny',  'Weekday', 'High',     33855, 5602],
    ['T035', 2023, 11, 'Artist B', 'Live Act', 'Convention Centre', 5, 2, 'Sunny',  'Holiday', 'Moderate', 43223, 4983],
    ['T036', 2023, 12, 'Artist C', 'Live Act', 'Open-Air Venue',    2, 3, 'Sunny',  'Weekend', 'Low',      31722, 6130],
    ['T037', 2024, 1,  'Artist C', 'Live Act', 'Open-Air Venue',    3, 1, 'Sunny',  'Weekend', 'Low',      33928, 5851],
    ['T038', 2024, 2,  'Artist D', 'Live Act', 'Indoor Hall',       3, 2, 'Cloudy', 'Weekday', 'Low',      23260, 3057],
    ['T039', 2024, 3,  'Artist C', 'Live Act', 'Convention Centre', 4, 5, 'Cloudy', 'Holiday', 'High',     42174, 5360],
    ['T040', 2024, 4,  'Artist A', 'Live Act', 'Arena',             3, 1, 'Sunny',  'Holiday', 'Moderate', 37183, 2509],
    ['T041', 2024, 5,  'Artist C', 'Live Act', 'Arena',             2, 3, 'Sunny',  'Holiday', 'Moderate', 33560, 4685],
    ['T042', 2024, 6,  'Artist C', 'Live Act', 'Convention Centre', 1, 4, 'Cloudy', 'Weekday', 'High',     30455, 1785],
    ['T043', 2024, 7,  'Artist D', 'Live Act', 'Indoor Hall',       3, 2, 'Cloudy', 'Holiday', 'Low',      29883, 4698],
    ['T044', 2024, 8,  'Artist A', 'Live Act', 'Arena',             2, 5, 'Sunny',  'Weekend', 'Moderate', 39830, 4763],
    ['T045', 2024, 9,  'Artist D', 'Live Act', 'Convention Centre', 3, 3, 'Sunny',  'Weekend', 'High',     35940, 5810],
    ['T046', 2024, 10, 'Artist A', 'Live Act', 'Open-Air Venue',    5, 4, 'Sunny',  'Weekday', 'High',     38694, 6774],
    ['T047', 2024, 11, 'Artist B', 'Live Act', 'Convention Centre', 2, 3, 'Cloudy', 'Holiday', 'Moderate', 33595, 3537],
    ['T048', 2024, 12, 'Artist D', 'Live Act', 'Indoor Hall',       1, 4, 'Sunny',  'Weekend', 'Low',      33715, 3629],
    ['T049', 2025, 1,  'Artist B', 'Live Act', 'Open-Air Venue',    3, 2, 'Sunny',  'Weekday', 'Low',      32092, 3208],
    ['T050', 2025, 2,  'Artist C', 'Live Act', 'Open-Air Venue',    1, 3, 'Cloudy', 'Holiday', 'Low',      29010, 3112],
    ['T051', 2025, 3,  'Artist A', 'Live Act', 'Arena',             3, 2, 'Cloudy', 'Weekday', 'Moderate', 25669, 2063],
    ['T052', 2025, 4,  'Artist C', 'Live Act', 'Arena',             3, 4, 'Sunny',  'Weekend', 'Moderate', 37814, 3958],
    ['T053', 2025, 5,  'Artist A', 'Live Act', 'Indoor Hall',       4, 1, 'Sunny',  'Weekend', 'High',     31677, 5423],
    ['T054', 2025, 6,  'Artist C', 'Live Act', 'Arena',             3, 1, 'Cloudy', 'Holiday', 'Moderate', 33772, 3639],
    ['T055', 2025, 7,  'Artist C', 'Live Act', 'Open-Air Venue',    3, 5, 'Sunny',  'Weekday', 'Low',      32515, 4140],
    ['T056', 2025, 8,  'Artist D', 'Live Act', 'Indoor Hall',       5, 3, 'Cloudy', 'Weekday', 'Low',      37162, 5278],
    ['T057', 2025, 9,  'Artist C', 'Live Act', 'Convention Centre', 4, 5, 'Cloudy', 'Weekend', 'High',     35120, 6870],
    ['T058', 2025, 10, 'Artist D', 'Live Act', 'Indoor Hall',       2, 2, 'Sunny',  'Weekend', 'Low',      33115, 5741],
    ['T059', 2025, 11, 'Artist D', 'Live Act', 'Indoor Hall',       3, 2, 'Sunny',  'Weekday', 'Low',      31430, 3265],
    ['T060', 2025, 12, 'Artist D', 'Live Act', 'Arena',             5, 1, 'Cloudy', 'Weekend', 'Low',      37285, 4401],
  ];


  // Delete and recreate training data to ensure cleanly formatted 60 events
  await prisma.trainingMatch.deleteMany({});

  for (const item of historicalEvents) {
    const [matchId, year, month, artistAct, genre, venueType, promo, prestige, weather, day, competing, basic, premium] = item;
    await prisma.trainingMatch.create({
      data: {
        matchId: String(matchId),
        year: Number(year),
        month: Number(month),
        artistAct: String(artistAct),
        genre: String(genre),
        venueType: String(venueType),
        promotionLevel: Number(promo),
        venuePrestige: Number(prestige),
        weather: String(weather),
        concertDay: String(day),
        competingEvents: String(competing),
        actualGa: Number(basic),
        actualVip: Number(premium),
      },
    });
  }

  console.log(`✅ Seed completed: 6 Live Rounds (T061–T066) & 60 Historical Events seeded successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
