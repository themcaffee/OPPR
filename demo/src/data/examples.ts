import type { Player, TGPConfig } from 'oppr';

export interface ExampleTournament {
  id: string;
  name: string;
  description: string;
  players: Player[];
  tgpConfig: TGPConfig;
  eventBooster: 'none' | 'certified' | 'certified-plus' | 'major';
}

// Small Local Tournament (20 players)
export const localTournament: ExampleTournament = {
  id: 'local-1',
  name: 'Local League Finals',
  description: 'Small local tournament with 20 players, limited qualifying and match play finals',
  eventBooster: 'none',
  players: [
    { id: '1', rating: 1650, ranking: 45, isRated: true, ratingDeviation: 80, eventCount: 12 },
    { id: '2', rating: 1600, ranking: 78, isRated: true, ratingDeviation: 90, eventCount: 10 },
    { id: '3', rating: 1580, ranking: 95, isRated: true, ratingDeviation: 75, eventCount: 15 },
    { id: '4', rating: 1550, ranking: 120, isRated: true, ratingDeviation: 85, eventCount: 8 },
    { id: '5', rating: 1520, ranking: 150, isRated: true, ratingDeviation: 95, eventCount: 7 },
    { id: '6', rating: 1500, ranking: 180, isRated: true, ratingDeviation: 100, eventCount: 6 },
    { id: '7', rating: 1480, ranking: 210, isRated: true, ratingDeviation: 90, eventCount: 9 },
    { id: '8', rating: 1450, ranking: 250, isRated: true, ratingDeviation: 110, eventCount: 5 },
    { id: '9', rating: 1420, ranking: 300, isRated: true, ratingDeviation: 105, eventCount: 8 },
    { id: '10', rating: 1400, ranking: 350, isRated: true, ratingDeviation: 95, eventCount: 11 },
    { id: '11', rating: 1380, ranking: 400, isRated: true, ratingDeviation: 115, eventCount: 6 },
    { id: '12', rating: 1350, ranking: 500, isRated: true, ratingDeviation: 120, eventCount: 7 },
    { id: '13', rating: 1320, ranking: 650, isRated: false, ratingDeviation: 150, eventCount: 4 },
    { id: '14', rating: 1300, ranking: 800, isRated: false, ratingDeviation: 160, eventCount: 3 },
    { id: '15', rating: 1280, ranking: 1000, isRated: false, ratingDeviation: 170, eventCount: 2 },
    { id: '16', rating: 1300, ranking: 1200, isRated: false, ratingDeviation: 180, eventCount: 1 },
    { id: '17', rating: 1300, ranking: 1500, isRated: false, ratingDeviation: 200, eventCount: 0 },
    { id: '18', rating: 1300, ranking: 2000, isRated: false, ratingDeviation: 200, eventCount: 0 },
    { id: '19', rating: 1300, ranking: 2500, isRated: false, ratingDeviation: 200, eventCount: 0 },
    { id: '20', rating: 1300, ranking: 3000, isRated: false, ratingDeviation: 200, eventCount: 0 },
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
  players: Array.from({ length: 60 }, (_, i) => ({
    id: `${i + 1}`,
    rating: Math.max(1300, 1850 - i * 8),
    ranking: i < 40 ? i * 3 + 1 : i * 10,
    isRated: i < 45,
    ratingDeviation: i < 45 ? 60 + i : 150 + (i - 45) * 5,
    eventCount: i < 45 ? Math.max(5, 20 - i) : Math.max(0, 5 - (i - 45)),
  })),
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

    return {
      id: `${i + 1}`,
      rating,
      ranking,
      isRated,
      ratingDeviation: isRated ? Math.min(120, 50 + i * 0.15) : 180,
      eventCount: isRated ? Math.max(5, Math.round(50 - i * 0.1)) : Math.max(0, 5 - (i - 350)),
    };
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

// Export all examples
export const exampleTournaments = {
  local: localTournament,
  regional: regionalTournament,
  major: majorTournament,
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
