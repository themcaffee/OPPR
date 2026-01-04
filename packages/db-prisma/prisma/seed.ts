import { PrismaClient, EventBoosterType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample players (using upsert for idempotency)
  console.log('Creating players...');
  const playerData = [
    {
      externalId: 'player-1',
      playerNumber: 10001,
      name: 'Alice Champion',
      rating: 1850,
      ratingDeviation: 50,
      ranking: 5,
      isRated: true,
      eventCount: 25,
    },
    {
      externalId: 'player-2',
      playerNumber: 10002,
      name: 'Bob Wizard',
      rating: 1750,
      ratingDeviation: 60,
      ranking: 12,
      isRated: true,
      eventCount: 18,
    },
    {
      externalId: 'player-3',
      playerNumber: 10003,
      name: 'Charlie Flipper',
      rating: 1650,
      ratingDeviation: 75,
      ranking: 28,
      isRated: true,
      eventCount: 12,
    },
    {
      externalId: 'player-4',
      playerNumber: 10004,
      name: 'Diana Tilt',
      rating: 1550,
      ratingDeviation: 100,
      ranking: 45,
      isRated: true,
      eventCount: 8,
    },
    {
      externalId: 'player-5',
      playerNumber: 10005,
      name: 'Eve Plunger',
      rating: 1300,
      ratingDeviation: 150,
      ranking: null,
      isRated: false,
      eventCount: 3,
    },
  ];

  const player1 = await prisma.player.upsert({
    where: { externalId: 'player-1' },
    update: playerData[0],
    create: playerData[0],
  });

  const player2 = await prisma.player.upsert({
    where: { externalId: 'player-2' },
    update: playerData[1],
    create: playerData[1],
  });

  const player3 = await prisma.player.upsert({
    where: { externalId: 'player-3' },
    update: playerData[2],
    create: playerData[2],
  });

  const player4 = await prisma.player.upsert({
    where: { externalId: 'player-4' },
    update: playerData[3],
    create: playerData[3],
  });

  const player5 = await prisma.player.upsert({
    where: { externalId: 'player-5' },
    update: playerData[4],
    create: playerData[4],
  });

  console.log(`✓ Created ${await prisma.player.count()} players`);

  // Seed users from environment variables (development only)
  const seedAdminEmail = process.env.SEED_ADMIN_EMAIL;
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD;
  const seedTestEmail = process.env.SEED_TEST_EMAIL;
  const seedTestPassword = process.env.SEED_TEST_PASSWORD;

  // Create admin user if credentials provided
  if (seedAdminEmail && seedAdminPassword) {
    console.log('Creating admin user...');
    const adminPasswordHash = await bcrypt.hash(seedAdminPassword, BCRYPT_SALT_ROUNDS);
    await prisma.user.upsert({
      where: { email: seedAdminEmail },
      update: { passwordHash: adminPasswordHash, role: 'ADMIN' },
      create: { email: seedAdminEmail, passwordHash: adminPasswordHash, role: 'ADMIN' },
    });
    console.log(`✓ Created admin user (${seedAdminEmail})`);
  } else {
    console.log('⏭ Skipping admin user (SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD not set)');
  }

  // Create test user if credentials provided (linked to Alice Champion)
  if (seedTestEmail && seedTestPassword) {
    console.log('Creating test user...');
    const testPasswordHash = await bcrypt.hash(seedTestPassword, BCRYPT_SALT_ROUNDS);
    await prisma.user.upsert({
      where: { email: seedTestEmail },
      update: { passwordHash: testPasswordHash, role: 'USER', playerId: player1.id },
      create: { email: seedTestEmail, passwordHash: testPasswordHash, role: 'USER', playerId: player1.id },
    });
    console.log(`✓ Created test user (${seedTestEmail}) linked to ${player1.name}`);
  } else {
    console.log('⏭ Skipping test user (SEED_TEST_EMAIL/SEED_TEST_PASSWORD not set)');
  }

  // Create admin user
  console.log('Creating admin user...');
  const adminPassword = 'AdminPassword123!';
  const adminPasswordHash = await bcrypt.hash(adminPassword, BCRYPT_SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  console.log(`✓ Created admin user (admin@example.com / ${adminPassword})`);

  // Create sample locations (using upsert for idempotency)
  console.log('Creating locations...');

  const location1 = await prisma.location.upsert({
    where: { externalId: 'location-1' },
    update: {
      name: 'Las Vegas Convention Center',
      city: 'Las Vegas',
      state: 'NV',
      country: 'USA',
    },
    create: {
      externalId: 'location-1',
      name: 'Las Vegas Convention Center',
      city: 'Las Vegas',
      state: 'NV',
      country: 'USA',
    },
  });

  const location2 = await prisma.location.upsert({
    where: { externalId: 'location-2' },
    update: {
      name: 'Ground Kontrol',
      address: '115 NW 5th Ave',
      city: 'Portland',
      state: 'OR',
      country: 'USA',
    },
    create: {
      externalId: 'location-2',
      name: 'Ground Kontrol',
      address: '115 NW 5th Ave',
      city: 'Portland',
      state: 'OR',
      country: 'USA',
    },
  });

  const location3 = await prisma.location.upsert({
    where: { externalId: 'location-3' },
    update: {
      name: 'Add-a-Ball Amusements',
      city: 'Seattle',
      state: 'WA',
      country: 'USA',
    },
    create: {
      externalId: 'location-3',
      name: 'Add-a-Ball Amusements',
      city: 'Seattle',
      state: 'WA',
      country: 'USA',
    },
  });

  console.log(`✓ Created ${await prisma.location.count()} locations`);

  // Create sample tournaments (using upsert for idempotency)
  console.log('Creating tournaments...');

  const tournament1Data = {
    externalId: 'tournament-1',
    name: 'World Pinball Championship 2024',
    locationId: location1.id,
    date: new Date('2024-03-15'),
    eventBooster: EventBoosterType.MAJOR,
    allowsOptOut: false,
    tgpConfig: {
      qualifying: {
        type: 'limited',
        meaningfulGames: 12,
        fourPlayerGroups: true,
      },
      finals: {
        formatType: 'match-play',
        meaningfulGames: 20,
        fourPlayerGroups: true,
        finalistCount: 16,
      },
      ballCountAdjustment: 1.0,
    },
    baseValue: 32.0,
    tvaRating: 25.0,
    tvaRanking: 50.0,
    totalTVA: 75.0,
    tgp: 1.92,
    eventBoosterMultiplier: 2.0,
    firstPlaceValue: 411.84,
  };

  const tournament1 = await prisma.tournament.upsert({
    where: { externalId: 'tournament-1' },
    update: tournament1Data,
    create: tournament1Data,
  });

  const tournament2Data = {
    externalId: 'tournament-2',
    name: 'Spring Classics 2024',
    locationId: location2.id,
    date: new Date('2024-04-20'),
    eventBooster: EventBoosterType.CERTIFIED,
    allowsOptOut: true,
    tgpConfig: {
      qualifying: {
        type: 'limited',
        meaningfulGames: 7,
      },
      finals: {
        formatType: 'double-elimination',
        meaningfulGames: 15,
        fourPlayerGroups: false,
        finalistCount: 8,
      },
    },
    baseValue: 28.0,
    tvaRating: 18.5,
    tvaRanking: 32.0,
    totalTVA: 50.5,
    tgp: 0.88,
    eventBoosterMultiplier: 1.25,
    firstPlaceValue: 87.28,
  };

  const tournament2 = await prisma.tournament.upsert({
    where: { externalId: 'tournament-2' },
    update: tournament2Data,
    create: tournament2Data,
  });

  const tournament3Data = {
    externalId: 'tournament-3',
    name: 'Monthly League Finals',
    locationId: location3.id,
    date: new Date('2024-05-10'),
    eventBooster: EventBoosterType.NONE,
    allowsOptOut: false,
    tgpConfig: {
      qualifying: {
        type: 'none',
        meaningfulGames: 0,
      },
      finals: {
        formatType: 'match-play',
        meaningfulGames: 10,
        fourPlayerGroups: true,
        finalistCount: 8,
      },
    },
    baseValue: 15.0,
    tvaRating: 8.5,
    tvaRanking: 12.0,
    totalTVA: 20.5,
    tgp: 0.80,
    eventBoosterMultiplier: 1.0,
    firstPlaceValue: 28.4,
  };

  const tournament3 = await prisma.tournament.upsert({
    where: { externalId: 'tournament-3' },
    update: tournament3Data,
    create: tournament3Data,
  });

  console.log(`✓ Created ${await prisma.tournament.count()} tournaments`);

  // Create tournament results (delete existing first for idempotency)
  console.log('Creating tournament results...');

  // Delete existing results for seeded tournaments
  await prisma.tournamentResult.deleteMany({
    where: {
      tournamentId: {
        in: [tournament1.id, tournament2.id, tournament3.id],
      },
    },
  });

  // World Championship results
  await prisma.tournamentResult.createMany({
    data: [
      {
        playerId: player1.id,
        tournamentId: tournament1.id,
        position: 1,
        totalPoints: 411.84,
        linearPoints: 41.18,
        dynamicPoints: 370.66,
        ageInDays: 0,
        decayMultiplier: 1.0,
        decayedPoints: 411.84,
        efficiency: 85.5,
      },
      {
        playerId: player2.id,
        tournamentId: tournament1.id,
        position: 2,
        totalPoints: 298.45,
        linearPoints: 41.18,
        dynamicPoints: 257.27,
        ageInDays: 0,
        decayMultiplier: 1.0,
        decayedPoints: 298.45,
        efficiency: 72.5,
      },
      {
        playerId: player3.id,
        tournamentId: tournament1.id,
        position: 3,
        totalPoints: 215.32,
        linearPoints: 41.18,
        dynamicPoints: 174.14,
        ageInDays: 0,
        decayMultiplier: 1.0,
        decayedPoints: 215.32,
        efficiency: 65.2,
      },
      {
        playerId: player4.id,
        tournamentId: tournament1.id,
        position: 5,
        totalPoints: 125.18,
        linearPoints: 41.18,
        dynamicPoints: 84.00,
        ageInDays: 0,
        decayMultiplier: 1.0,
        decayedPoints: 125.18,
        efficiency: 48.3,
      },
    ],
  });

  // Spring Classics results
  await prisma.tournamentResult.createMany({
    data: [
      {
        playerId: player2.id,
        tournamentId: tournament2.id,
        position: 1,
        totalPoints: 87.28,
        linearPoints: 8.73,
        dynamicPoints: 78.55,
        ageInDays: 0,
        decayMultiplier: 1.0,
        decayedPoints: 87.28,
        efficiency: 92.0,
      },
      {
        playerId: player1.id,
        tournamentId: tournament2.id,
        position: 2,
        totalPoints: 63.25,
        linearPoints: 8.73,
        dynamicPoints: 54.52,
        ageInDays: 0,
        decayMultiplier: 1.0,
        decayedPoints: 63.25,
        efficiency: 78.5,
      },
      {
        playerId: player4.id,
        tournamentId: tournament2.id,
        position: 3,
        totalPoints: 45.67,
        linearPoints: 8.73,
        dynamicPoints: 36.94,
        ageInDays: 0,
        decayMultiplier: 1.0,
        decayedPoints: 45.67,
        efficiency: 68.2,
      },
      {
        playerId: player5.id,
        tournamentId: tournament2.id,
        position: 6,
        totalPoints: 18.52,
        linearPoints: 8.73,
        dynamicPoints: 9.79,
        ageInDays: 0,
        decayMultiplier: 1.0,
        decayedPoints: 18.52,
        efficiency: 35.8,
      },
    ],
  });

  // Monthly League results
  await prisma.tournamentResult.createMany({
    data: [
      {
        playerId: player3.id,
        tournamentId: tournament3.id,
        position: 1,
        totalPoints: 28.4,
        linearPoints: 2.84,
        dynamicPoints: 25.56,
        ageInDays: 0,
        decayMultiplier: 1.0,
        decayedPoints: 28.4,
        efficiency: 88.5,
      },
      {
        playerId: player4.id,
        tournamentId: tournament3.id,
        position: 2,
        totalPoints: 20.58,
        linearPoints: 2.84,
        dynamicPoints: 17.74,
        ageInDays: 0,
        decayMultiplier: 1.0,
        decayedPoints: 20.58,
        efficiency: 75.2,
      },
      {
        playerId: player5.id,
        tournamentId: tournament3.id,
        position: 3,
        totalPoints: 14.85,
        linearPoints: 2.84,
        dynamicPoints: 12.01,
        ageInDays: 0,
        decayMultiplier: 1.0,
        decayedPoints: 14.85,
        efficiency: 62.5,
      },
    ],
  });

  console.log(`✓ Created ${await prisma.tournamentResult.count()} tournament results`);

  console.log('');
  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('Summary:');
  console.log(`  - ${await prisma.player.count()} players`);
  console.log(`  - ${await prisma.user.count()} users`);
  console.log(`  - ${await prisma.location.count()} locations`);
  console.log(`  - ${await prisma.tournament.count()} tournaments`);
  console.log(`  - ${await prisma.tournamentResult.count()} tournament results`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
