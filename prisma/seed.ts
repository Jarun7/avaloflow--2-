import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.account.deleteMany();
  await prisma.keyword.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.autoDm.deleteMany();

  // 1. Accounts
  await prisma.account.createMany({
    data: [
      { name: 'cooklabs_by_beena', followers: '42.1k', status: 'Active', image: 'https://picsum.photos/seed/instagram/100/100', platform: 'Instagram' },
    ],
  });

  // 2. Keywords
  await prisma.keyword.createMany({
    data: [
      { text: '#pricing' },
      { text: 'info' },
      { text: 'help' },
      { text: 'link' },
    ],
  });

  // 3. Settings
  await prisma.setting.createMany({
    data: [
      { key: 'smart_delay', value: 'true', type: 'boolean' },
      { key: 'auto_comment_like', value: 'true', type: 'boolean' },
      { key: 'ai_tone_matching', value: 'false', type: 'boolean' },
      { key: 'spam_protection', value: 'true', type: 'boolean' },
    ],
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
