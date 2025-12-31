import { PrismaClient, EventBoosterType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample players
  console.log('Creating players...');
  const player1 = await prisma.player.create({
    data: {
      externalId: 'player-1',
      name: 'Alice Champion',
      email: 'alice@example.com',
      rating: 1850,
      ratingDeviation: 50,
      ranking: 5,
      isRated: true,
      eventCount: 25,
    },
  });

  const player2 = await prisma.player.create({
    data: {
      externalId: 'player-2',
      name: 'Bob Wizard',
      email: 'bob@example.com',
      rating: 1750,
      ratingDeviation: 60,
      ranking: 12,
      isRated: true,
      eventCount: 18,
    },
  });

  const player3 = await prisma.player.create({
    data: {
      externalId: 'player-3',
      name: 'Charlie Flipper',
      email: 'charlie@example.com',
      rating: 1650,
      ratingDeviation: 75,
      ranking: 28,
      isRated: true,
      eventCount: 12,
    },
  });

  const player4 = await prisma.player.create({
    data: {
      externalId: 'player-4',
      name: 'Diana Tilt',
      email: 'diana@example.com',
      rating: 1550,
      ratingDeviation: 100,
      ranking: 45,
      isRated: true,
      eventCount: 8,
    },
  });

  const player5 = await prisma.player.create({
    data: {
      externalId: 'player-5',
      name: 'Eve Plunger',
      email: 'eve@example.com',
      rating: 1300,
      ratingDeviation: 150,
      ranking: null,
      isRated: false,
      eventCount: 3,
    },
  });

  console.log(`✓ Created ${await prisma.player.count()} players`);

  // Create sample tournaments
  console.log('Creating tournaments...');

  // Major Championship Tournament
  const tournament1 = await prisma.tournament.create({
    data: {
      externalId: 'tournament-1',
      name: 'World Pinball Championship 2024',
      location: 'Las Vegas, NV',
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
    },
  });

  // Certified Tournament
  const tournament2 = await prisma.tournament.create({
    data: {
      externalId: 'tournament-2',
      name: 'Spring Classics 2024',
      location: 'Portland, OR',
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
    },
  });

  // Local Tournament
  const tournament3 = await prisma.tournament.create({
    data: {
      externalId: 'tournament-3',
      name: 'Monthly League Finals',
      location: 'Seattle, WA',
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
    },
  });

  console.log(`✓ Created ${await prisma.tournament.count()} tournaments`);

  // Create tournament results
  console.log('Creating tournament results...');

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
