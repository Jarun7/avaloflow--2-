import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.audienceHistory.deleteMany();
  await prisma.audienceNote.deleteMany();
  await prisma.audience.deleteMany();
  await prisma.account.deleteMany();
  await prisma.keyword.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.template.deleteMany();
  await prisma.dashboardStat.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.chartData.deleteMany();
  await prisma.report.deleteMany();
  await prisma.flow.deleteMany();

  // 1. Dashboard Stats
  const stats = [
    { key: 'total_revenue', label: 'Total Revenue', value: '$128,430', trend: '+12.5%', isPositive: true, icon: 'DollarSign' },
    { key: 'active_campaigns', label: 'Active Campaigns', value: '42', trend: '+3', isPositive: true, icon: 'Zap' },
    { key: 'total_audience', label: 'Total Audience', value: '84,200', trend: '+1,200', isPositive: true, icon: 'Users' },
    { key: 'avg_engagement', label: 'Avg. Engagement', value: '4.8%', trend: '-0.4%', isPositive: false, icon: 'Target' },
  ];

  for (const stat of stats) {
    await prisma.dashboardStat.upsert({
      where: { key: stat.key },
      update: stat,
      create: stat,
    });
  }

  // 2. Chart Data
  const chartData = [
    // Performance
    { name: 'MON', value: 400, order: 1, type: 'performance', color: '#6366f1' },
    { name: 'TUE', value: 300, order: 2, type: 'performance', color: '#6366f1' },
    { name: 'WED', value: 600, order: 3, type: 'performance', color: '#6366f1' },
    { name: 'THU', value: 800, order: 4, type: 'performance', color: '#6366f1' },
    { name: 'FRI', value: 500, order: 5, type: 'performance', color: '#6366f1' },
    { name: 'SAT', value: 900, order: 6, type: 'performance', color: '#6366f1' },
    { name: 'SUN', value: 700, order: 7, type: 'performance', color: '#6366f1' },
    // Channel
    { name: 'Instagram', value: 45, order: 1, type: 'channel', color: '#E1306C' },
    { name: 'Facebook', value: 25, order: 2, type: 'channel', color: '#1877F2' },
    { name: 'Twitter', value: 20, order: 3, type: 'channel', color: '#1DA1F2' },
    { name: 'Other', value: 10, order: 4, type: 'channel', color: '#6366f1' },
  ];

  for (const data of chartData) {
    await prisma.chartData.create({ data });
  }

  // 3. Campaigns
  const campaigns = [
    {
      name: 'Summer Sale 2024',
      description: 'Main summer promotional campaign',
      status: 'active',
      steps: 12,
      stat: '4.2k',
      label: 'Conversions',
      image: 'https://picsum.photos/seed/summer/400/200',
      comments: 124,
      sentDms: 842,
      impressions: '124.5k',
      clicks: '12.4k',
      ctr: '10.2%',
      conversions: '4,200'
    },
    {
      name: 'New Collection Launch',
      description: 'Promoting the autumn collection',
      status: 'active',
      steps: 8,
      stat: '1.8k',
      label: 'Signups',
      image: 'https://picsum.photos/seed/autumn/400/200',
      comments: 86,
      sentDms: 420,
      impressions: '84.2k',
      clicks: '8.6k',
      ctr: '9.8%',
      conversions: '1,800'
    },
    {
      name: 'Re-engagement Flow',
      description: 'Targeting inactive users',
      status: 'paused',
      steps: 5,
      stat: '12%',
      label: 'Recovery Rate',
      image: 'https://picsum.photos/seed/reengage/400/200',
      comments: 12,
      sentDms: 1200,
      impressions: '45.0k',
      clicks: '4.2k',
      ctr: '8.4%',
      conversions: '540'
    },
  ];

  for (const campaign of campaigns) {
    await prisma.campaign.create({ data: campaign });
  }

  // 4. Activity
  const activities = [
    { title: 'New Campaign Active', desc: 'Summer Sale 2024 is now live', icon: 'Zap', color: 'text-emerald-500', category: 'Campaign' },
    { title: 'Goal Reached', desc: '1,000 conversions in 24 hours', icon: 'Target', color: 'text-indigo-500', category: 'Milestone' },
    { title: 'System Update', desc: 'New automation nodes available', icon: 'Settings', color: 'text-slate-500', category: 'System' },
    { title: 'New Audience Segment', desc: 'High-LTV users identified', icon: 'Users', color: 'text-blue-500', category: 'Audience' },
  ];

  for (const activity of activities) {
    await prisma.activity.create({ data: activity });
  }

  // 5. Accounts
  await prisma.account.createMany({
    data: [
      { name: 'velocity_design_studio', followers: '42.1k', status: 'Active', image: 'https://picsum.photos/seed/brand1/100/100', platform: 'Instagram' },
      { name: 'joshua_creatives', followers: '1.2k', status: 'Active', image: 'https://picsum.photos/seed/brand2/100/100', platform: 'Facebook' },
    ],
  });

  // 6. Keywords
  await prisma.keyword.createMany({
    data: [
      { text: '#pricing' },
      { text: 'info' },
      { text: 'help' },
      { text: 'link' },
    ],
  });

  // 7. Settings
  await prisma.setting.createMany({
    data: [
      { key: 'smart_delay', value: 'true', type: 'boolean' },
      { key: 'auto_comment_like', value: 'true', type: 'boolean' },
      { key: 'ai_tone_matching', value: 'false', type: 'boolean' },
      { key: 'spam_protection', value: 'true', type: 'boolean' },
    ],
  });

  // 8. Audiences
  const audience1 = await prisma.audience.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      tag: 'VIP',
      status: 'online',
      image: 'https://picsum.photos/seed/user1/100/100',
      location: 'San Francisco, CA',
      engagementScore: 92,
      ltv: 4200,
      openRate: 84,
      eventsCount: 156,
      bio: 'CTO at TechFlow. Early adopter and automation enthusiast.',
      tags: JSON.stringify(['Decision Maker', 'Cloud Computing', 'High LTV']),
    },
  });

  await prisma.audienceHistory.createMany({
    data: [
      {
        audienceId: audience1.id,
        icon: 'ShoppingCart',
        title: 'Purchase Completed',
        desc: 'Alex Rivera purchased the "Enterprise Automation Suite" annual plan.',
        details: JSON.stringify(['$4,200.00', 'Transaction: #EF-9482']),
        color: 'bg-primary-fixed text-on-primary-fixed-variant',
      },
      {
        audienceId: audience1.id,
        icon: 'Mail',
        title: 'Email Interaction',
        desc: 'Opened and clicked link in "October Product Roadmap" newsletter.',
        color: 'bg-surface-container-highest text-primary',
      },
    ],
  });

  await prisma.audienceNote.create({
    data: {
      audienceId: audience1.id,
      text: 'Expressed interest in the upcoming API v3 release. Preferred contact via email.',
      author: 'Alex K.',
    },
  });

  // 9. Templates
  await prisma.template.createMany({
    data: [
      { name: 'Welcome Series', category: 'Onboarding', desc: 'A 3-step welcome sequence for new followers.', usage: 1240, rating: 4.8, icon: 'Zap', color: 'bg-primary/10 text-primary' },
      { name: 'Flash Sale', category: 'Sales', desc: 'High-urgency promotional flow for limited time offers.', usage: 850, rating: 4.5, icon: 'ShoppingCart', color: 'bg-emerald-500/10 text-emerald-600' },
      { name: 'Support Bot', category: 'Service', desc: 'Keyword-based automated support responses.', usage: 2100, rating: 4.9, icon: 'MessageSquare', color: 'bg-amber-500/10 text-amber-600' },
    ],
  });

  // 10. Assets
  await prisma.asset.createMany({
    data: [
      { name: 'logo_white.png', type: 'Image', size: '1.2 MB', url: 'https://picsum.photos/seed/logo/200/200' },
      { name: 'promo_video.mp4', type: 'Video', size: '45.8 MB', url: 'https://picsum.photos/seed/video/200/200' },
      { name: 'product_catalog.pdf', type: 'PDF', size: '4.5 MB', url: 'https://picsum.photos/seed/pdf/200/200' },
    ],
  });

  // 11. Reports
  await prisma.report.createMany({
    data: [
      { name: 'Monthly Performance', type: 'Analytics', status: 'Ready', size: '2.4 MB' },
      { name: 'Audience Growth', type: 'Demographics', status: 'Processing', size: '1.1 MB' },
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
