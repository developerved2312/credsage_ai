import 'dotenv/config';
import { prisma } from '../src/config/prisma';
import { Prisma } from '@prisma/client';

async function main() {
  console.log('🌱 Starting database seeding with Prisma 7...');

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@credsage.ai' },
    update: {},
    create: {
      email: 'demo@credsage.ai',
      firstName: 'Demo',
      lastName: 'User',
      phone: '+1234567890',
      dateOfBirth: new Date('1990-01-01'),
      address: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      employmentStatus: 'employed',
      annualIncome: new Prisma.Decimal(75000),
      occupation: 'Software Engineer',
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create sample credit score with Prisma 7 JSON handling
  const creditScore = await prisma.creditScore.create({
    data: {
      userId: demoUser.id,
      score: 720,
      scoreCategory: 'Good',
      rechargeFreqPerMonth: new Prisma.Decimal(4), avgRechargeValue: new Prisma.Decimal(399), rechargeGapStd: new Prisma.Decimal(2.5),
      billOnTimeRatio: new Prisma.Decimal(0.95), avgDaysLate: new Prisma.Decimal(1), autopayEnrolled: true,
      monthlySpendVolatility: new Prisma.Decimal(0.18), emiUsageRate: new Prisma.Decimal(0.25), orderFreqTrend: new Prisma.Decimal(0.12), phoneTenureMonths: 36,
      modelVersion: 'v1.0.0',
      confidence: new Prisma.Decimal(0.92),
      shapValues: {
        bill_on_time_ratio: 0.15,
        phone_tenure_months: 0.12,
        avg_days_late: -0.08,
        recharge_freq_per_month: 0.05,
      },
      topFactors: [
        { factor: 'Bill On-Time Ratio', impact: 'positive', value: 0.15 },
        { factor: 'Phone Tenure Months', impact: 'positive', value: 0.12 },
        { factor: 'Average Days Late', impact: 'negative', value: -0.08 },
      ],
    },
  });

  console.log('✅ Created sample credit score:', creditScore.score);

  // Create sample portfolio
  const portfolio = await prisma.portfolio.create({
    data: {
      userId: demoUser.id,
      name: 'Primary Portfolio',
      description: 'Diversified investment portfolio',
      totalValue: new Prisma.Decimal(10000),
      cashBalance: new Prisma.Decimal(2000),
      riskTolerance: 'medium',
      investmentHorizon: 'long',
      totalReturn: new Prisma.Decimal(500),
      totalReturnPercent: new Prisma.Decimal(5.0),
    },
  });

  console.log('✅ Created sample portfolio:', portfolio.name);

  // Create sample investments using Prisma 7 Decimal
  const investments = await prisma.investment.createMany({
    data: [
      {
        userId: demoUser.id,
        portfolioId: portfolio.id,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'stock',
        quantity: new Prisma.Decimal(10),
        purchasePrice: new Prisma.Decimal(150),
        currentPrice: new Prisma.Decimal(175),
        totalValue: new Prisma.Decimal(1750),
        profitLoss: new Prisma.Decimal(250),
        profitLossPercent: new Prisma.Decimal(16.67),
        recommendationScore: new Prisma.Decimal(0.85),
        riskLevel: 'medium',
        recommendedBy: 'ml_model',
      },
      {
        userId: demoUser.id,
        portfolioId: portfolio.id,
        symbol: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        type: 'etf',
        quantity: new Prisma.Decimal(20),
        purchasePrice: new Prisma.Decimal(200),
        currentPrice: new Prisma.Decimal(215),
        totalValue: new Prisma.Decimal(4300),
        profitLoss: new Prisma.Decimal(300),
        profitLossPercent: new Prisma.Decimal(7.5),
        recommendationScore: new Prisma.Decimal(0.9),
        riskLevel: 'low',
        recommendedBy: 'ml_model',
      },
      {
        userId: demoUser.id,
        portfolioId: portfolio.id,
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        type: 'stock',
        quantity: new Prisma.Decimal(5),
        purchasePrice: new Prisma.Decimal(300),
        currentPrice: new Prisma.Decimal(350),
        totalValue: new Prisma.Decimal(1750),
        profitLoss: new Prisma.Decimal(250),
        profitLossPercent: new Prisma.Decimal(16.67),
        recommendationScore: new Prisma.Decimal(0.88),
        riskLevel: 'medium',
        recommendedBy: 'ml_model',
      },
    ],
  });

  console.log('✅ Created sample investments:', investments.count);

  // Create sample chat conversation
  const conversation = await prisma.chatConversation.create({
    data: {
      userId: demoUser.id,
      title: 'Credit Score Questions',
      context: 'credit',
      lastMessageAt: new Date(),
      messages: {
        create: [
          {
            userId: demoUser.id,
            role: 'user',
            content: 'What factors affect my credit score?',
          },
          {
            userId: demoUser.id,
            role: 'assistant',
            content:
              'Your credit score is influenced by several key factors: payment history (35%), credit utilization (30%), length of credit history (15%), types of credit (10%), and recent credit inquiries (10%). Based on your current profile, your income and credit history are positively impacting your score.',
            model: 'gemini-pro',
            tokens: 85,
          },
        ],
      },
    },
  });

  console.log('✅ Created sample chat conversation:', conversation.title);

  // Log the seed operation
  await prisma.systemLog.create({
    data: {
      level: 'info',
      service: 'api',
      message: 'Database seeded successfully',
      metadata: {
        usersCreated: 1,
        creditScoresCreated: 1,
        portfoliosCreated: 1,
        investmentsCreated: investments.count,
        conversationsCreated: 1,
      },
    },
  });

  console.log('🎉 Database seeding completed with Prisma 7!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
