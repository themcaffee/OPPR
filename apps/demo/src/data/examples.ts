import type { Player, TGPConfig } from '@opprs/core';
import type { GlickoRatingData } from '@opprs/glicko-rating-system';

export interface ExampleTournament {
  id: string;
  name: string;
  description: string;
  players: Player[];
  tgpConfig: TGPConfig;
  eventBooster: 'none' | 'certified' | 'certified-plus' | 'major';
}

// Helper to create a player with Glicko rating
function createPlayer(
  id: string,
  rating: number,
  ranking: number,
  isRated: boolean,
  ratingDeviation: number,
  eventCount: number
): Player {
  return {
    id,
    ranking,
    isRated,
    eventCount,
    ratings: {
      glicko: { value: rating, ratingDeviation } as GlickoRatingData,
    },
  };
}

// Small Local Tournament (20 players)
export const localTournament: ExampleTournament = {
  id: 'local-1',
  name: 'Local League Finals',
  description: 'Small local tournament with 20 players, limited qualifying and match play finals',
  eventBooster: 'none',
  players: [
    createPlayer('1', 1650, 45, true, 80, 12),
    createPlayer('2', 1600, 78, true, 90, 10),
    createPlayer('3', 1580, 95, true, 75, 15),
    createPlayer('4', 1550, 120, true, 85, 8),
    createPlayer('5', 1520, 150, true, 95, 7),
    createPlayer('6', 1500, 180, true, 100, 6),
    createPlayer('7', 1480, 210, true, 90, 9),
    createPlayer('8', 1450, 250, true, 110, 5),
    createPlayer('9', 1420, 300, true, 105, 8),
    createPlayer('10', 1400, 350, true, 95, 11),
    createPlayer('11', 1380, 400, true, 115, 6),
    createPlayer('12', 1350, 500, true, 120, 7),
    createPlayer('13', 1320, 650, false, 150, 4),
    createPlayer('14', 1300, 800, false, 160, 3),
    createPlayer('15', 1280, 1000, false, 170, 2),
    createPlayer('16', 1300, 1200, false, 180, 1),
    createPlayer('17', 1300, 1500, false, 200, 0),
    createPlayer('18', 1300, 2000, false, 200, 0),
    createPlayer('19', 1300, 2500, false, 200, 0),
    createPlayer('20', 1300, 3000, false, 200, 0),
  ],
  tgpConfig: {
    qualifying: {
      type: 'limited',
      meaningfulGames: 5,
    },
    finals: {
      formatType: 'match-play',
      meaningfulGames: 8,
      fourPlayerGroups: true,
    },
  },
};

// Regional Championship (60 players)
export const regionalTournament: ExampleTournament = {
  id: 'regional-1',
  name: 'Regional Championship',
  description: 'Medium-sized regional tournament with 60 players, PAPA-style qualifying and finals',
  eventBooster: 'certified-plus',
  players: Array.from({ length: 60 }, (_, i) =>
    createPlayer(
      `${i + 1}`,
      Math.max(1300, 1850 - i * 8),
      i < 40 ? i * 3 + 1 : i * 10,
      i < 45,
      i < 45 ? 60 + i : 150 + (i - 45) * 5,
      i < 45 ? Math.max(5, 20 - i) : Math.max(0, 5 - (i - 45))
    )
  ),
  tgpConfig: {
    qualifying: {
      type: 'limited',
      meaningfulGames: 16,
      fourPlayerGroups: true,
    },
    finals: {
      formatType: 'match-play',
      meaningfulGames: 12,
      fourPlayerGroups: true,
    },
  },
};

// Major Championship (Pinburgh-style, 400 players)
export const majorTournament: ExampleTournament = {
  id: 'major-1',
  name: 'Major Championship (Pinburgh-style)',
  description: 'Large major championship with 400 players, extensive qualifying and finals',
  eventBooster: 'major',
  players: Array.from({ length: 400 }, (_, i) => {
    // Create a realistic distribution of ratings
    const baseRating = 1900 - i * 1.2;
    const rating = Math.max(1300, Math.round(baseRating));

    // Top players have better rankings
    const ranking = i < 100 ? i + 1 :
                    i < 200 ? 100 + (i - 100) * 2 :
                    i < 300 ? 300 + (i - 200) * 5 :
                    800 + (i - 300) * 10;

    // Most players in a major are rated
    const isRated = i < 350;

    return createPlayer(
      `${i + 1}`,
      rating,
      ranking,
      isRated,
      isRated ? Math.min(120, 50 + i * 0.15) : 180,
      isRated ? Math.max(5, Math.round(50 - i * 0.1)) : Math.max(0, 5 - (i - 350))
    );
  }),
  tgpConfig: {
    qualifying: {
      type: 'limited',
      meaningfulGames: 40,
      fourPlayerGroups: true,
    },
    finals: {
      formatType: 'match-play',
      meaningfulGames: 12,
      fourPlayerGroups: true,
      finalistCount: 24,
    },
  },
};

// Best Game Tournament (40 players, no finals)
export const bestGameTournament: ExampleTournament = {
  id: 'bestgame-1',
  name: 'Best Game Tournament',
  description: 'Best game format with no separate finals - qualifying only',
  eventBooster: 'none',
  players: Array.from({ length: 40 }, (_, i) =>
    createPlayer(
      `${i + 1}`,
      Math.max(1300, 1750 - i * 10),
      i < 30 ? i * 4 + 1 : i * 15,
      i < 32,
      i < 32 ? 70 + i : 140 + (i - 32) * 8,
      i < 32 ? Math.max(5, 18 - i) : Math.max(0, 5 - (i - 32))
    )
  ),
  tgpConfig: {
    qualifying: {
      type: 'limited',
      meaningfulGames: 12,
    },
    finals: {
      formatType: 'none',
      meaningfulGames: 0,
    },
  },
};

// Export all examples
export const exampleTournaments = {
  local: localTournament,
  regional: regionalTournament,
  major: majorTournament,
  bestGame: bestGameTournament,
};

// Helper to get player names (for display purposes)
export const generatePlayerNames = (count: number): string[] => {
  const firstNames = [
    'Alex', 'Blake', 'Casey', 'Dana', 'Eli', 'Finn', 'Gale', 'Harper',
    'Iris', 'Jordan', 'Kelly', 'Logan', 'Morgan', 'Nico', 'Oakley', 'Parker',
    'Quinn', 'Riley', 'Sage', 'Taylor', 'Uma', 'Val', 'Winter', 'Xen',
    'Yael', 'Zane', 'Avery', 'Brooks', 'Charlie', 'Drew', 'Emery', 'Frankie',
  ];

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
    'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
    'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  ];

  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const suffix = Math.floor(i / (firstNames.length * lastNames.length));
    names.push(`${firstName} ${lastName}${suffix > 0 ? ` ${suffix}` : ''}`);
  }

  return names;
};
