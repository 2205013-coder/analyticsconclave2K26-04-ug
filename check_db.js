const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rounds = await prisma.gameRound.findMany({ orderBy: { roundNumber: 'asc' } });
  console.log('=== GAME ROUNDS ===');
  console.log('Total rounds:', rounds.length);
  rounds.forEach(r => console.log('Round ' + r.roundNumber + ': ' + r.title + ' | status: ' + r.status));

  const users = await prisma.user.findMany();
  console.log('\n=== ADMIN USERS ===');
  users.forEach(u => console.log(u.email + ' | role: ' + u.role));

  const training = await prisma.trainingMatch.count();
  console.log('\n=== TRAINING EVENTS:', training, '===');

  const control = await prisma.gameControl.findFirst();
  console.log('\n=== GAME CONTROL ===');
  console.log(JSON.stringify(control, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
