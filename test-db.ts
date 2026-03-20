import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const stats = await prisma.dashboardStat.findMany();
    console.log('Stats:', stats);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
