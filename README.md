# OPPR - Open Pinball Player Ranking System

A comprehensive TypeScript library for calculating pinball tournament rankings and player ratings. This library implements a complete ranking system with support for various tournament formats, player ratings, and point distribution calculations.

## Features

- **Base Value Calculation** - Tournament value based on number of rated players
- **Tournament Value Adjustment (TVA)** - Strength indicators from player ratings and rankings
- **Tournament Grading Percentage (TGP)** - Format quality assessment
- **Event Boosters** - Multipliers for major championships and certified events
- **Point Distribution** - Linear and dynamic point allocation
- **Time Decay** - Automatic point depreciation over time
- **Glicko Rating System** - Player skill rating with uncertainty
- **Efficiency Tracking** - Performance metrics
- **Input Validation** - Comprehensive data validation
- **TypeScript First** - Full type safety and IntelliSense support

## Installation

```bash
npm install oppr
```

## Quick Start

```typescript
import {
  calculateBaseValue,
  calculateRatingTVA,
  calculateRankingTVA,
  calculateTGP,
  getEventBoosterMultiplier,
  distributePoints,
  type Player,
  type TGPConfig,
  type PlayerResult,
} from 'oppr';

// Define your players
const players: Player[] = [
  { id: '1', rating: 1800, ranking: 1, isRated: true },
  { id: '2', rating: 1700, ranking: 5, isRated: true },
  { id: '3', rating: 1600, ranking: 10, isRated: true },
];

// Calculate tournament value
const baseValue = calculateBaseValue(players);
const ratingTVA = calculateRatingTVA(players);
const rankingTVA = calculateRankingTVA(players);

// Configure tournament format
const tgpConfig: TGPConfig = {
  qualifying: {
    type: 'limited',
    meaningfulGames: 7,
  },
  finals: {
    formatType: 'match-play',
    meaningfulGames: 12,
    fourPlayerGroups: true, // PAPA-style 4-player groups
  },
};

const tgp = calculateTGP(tgpConfig);
const eventBooster = getEventBoosterMultiplier('none');

// Calculate first place value
const firstPlaceValue = (baseValue + ratingTVA + rankingTVA) * tgp * eventBooster;

// Distribute points to players based on finishing positions
const results: PlayerResult[] = [
  { player: players[0], position: 1 },
  { player: players[1], position: 2 },
  { player: players[2], position: 3 },
];

const distributions = distributePoints(results, firstPlaceValue);

console.log(`First place gets: ${distributions[0].totalPoints.toFixed(2)} points`);
```

## Core Concepts

### Base Value

The base value of a tournament is calculated based on the number of rated players (players with 5+ events):

- **0.5 points per rated player**
- **Maximum of 32 points** (achieved at 64+ rated players)

```typescript
import { calculateBaseValue } from 'oppr';

const baseValue = calculateBaseValue(players);
```

### Tournament Value Adjustment (TVA)

TVA increases tournament value based on the strength of the field:

#### Rating-based TVA
- Uses Glicko ratings to assess player skill
- Maximum contribution: **25 points**
- Formula: `(rating * 0.000546875) - 0.703125`

#### Ranking-based TVA
- Uses world rankings to assess field strength
- Maximum contribution: **50 points**
- Formula: `ln(ranking) * -0.211675054 + 1.459827968`

```typescript
import { calculateRatingTVA, calculateRankingTVA } from 'oppr';

const ratingTVA = calculateRatingTVA(players);
const rankingTVA = calculateRankingTVA(players);
```

### Tournament Grading Percentage (TGP)

TGP measures the quality and completeness of a tournament format:

- **Base value:** 4% per meaningful game
- **Without separate qualifying:** Max 100%
- **With qualifying and finals:** Max 200%
- **Multipliers:**
  - 4-player groups: 2X
  - 3-player groups: 1.5X
  - Unlimited best game (20+ hours): 2X
  - Hybrid best game: 3X
  - Unlimited card qualifying: 4X

```typescript
import { calculateTGP, type TGPConfig } from 'oppr';

const tgpConfig: TGPConfig = {
  qualifying: {
    type: 'limited',
    meaningfulGames: 7,
  },
  finals: {
    formatType: 'match-play',
    meaningfulGames: 15,
    fourPlayerGroups: true,
  },
};

const tgp = calculateTGP(tgpConfig);
```

### Event Boosters

Event boosters multiply the final tournament value:

- **None:** 1.0X (100%)
- **Certified:** 1.25X (125%)
- **Certified+:** 1.5X (150%)
- **Championship Series:** 1.5X (150%)
- **Major:** 2.0X (200%)

```typescript
import { getEventBoosterMultiplier } from 'oppr';

const booster = getEventBoosterMultiplier('major'); // Returns 2.0
```

### Point Distribution

Points are distributed using two components:

1. **Linear Distribution (10%):** Evenly distributed across positions
2. **Dynamic Distribution (90%):** Heavily weighted toward top finishers

```typescript
import { distributePoints } from 'oppr';

const distributions = distributePoints(results, firstPlaceValue);
```

### Time Decay

Points decay over time to emphasize recent performance:

- **0-1 years:** 100% value
- **1-2 years:** 75% value
- **2-3 years:** 50% value
- **3+ years:** 0% value (inactive)

```typescript
import { applyTimeDecay, isEventActive } from 'oppr';

const eventDate = new Date('2023-01-01');
const decayedPoints = applyTimeDecay(100, eventDate);
const active = isEventActive(eventDate);
```

### Glicko Rating System

Player ratings use the Glicko system with rating deviation (uncertainty):

- **Default rating:** 1300
- **Rating deviation (RD):** 10-200
- **RD decay:** ~0.3 per day of inactivity

```typescript
import { updateRating, type RatingUpdate } from 'oppr';

const update: RatingUpdate = {
  currentRating: 1500,
  currentRD: 100,
  results: [
    { opponentRating: 1600, opponentRD: 80, score: 1 }, // Win
    { opponentRating: 1550, opponentRD: 90, score: 0 }, // Loss
  ],
};

const { newRating, newRD } = updateRating(update);
```

## API Reference

### Types

```typescript
interface Player {
  id: string;
  rating: number;
  ranking: number;
  isRated: boolean;
  ratingDeviation?: number;
  eventCount?: number;
}

interface TGPConfig {
  qualifying: {
    type: 'unlimited' | 'limited' | 'hybrid' | 'none';
    meaningfulGames: number;
    hours?: number;
    fourPlayerGroups?: boolean;
    threePlayerGroups?: boolean;
    multiMatchplay?: boolean;
  };
  finals: {
    formatType: TournamentFormatType;
    meaningfulGames: number;
    fourPlayerGroups?: boolean;
    threePlayerGroups?: boolean;
  };
  ballCountAdjustment?: number;
}

interface PlayerResult {
  player: Player;
  position: number;
  optedOut?: boolean;
}

interface PointDistribution {
  player: Player;
  position: number;
  linearPoints: number;
  dynamicPoints: number;
  totalPoints: number;
}
```

### Functions

#### Base Value
- `calculateBaseValue(players: Player[]): number`
- `countRatedPlayers(players: Player[]): number`
- `isPlayerRated(eventCount: number): boolean`

#### TVA
- `calculateRatingTVA(players: Player[]): number`
- `calculateRankingTVA(players: Player[]): number`
- `calculateTotalTVA(players: Player[]): { ratingTVA, rankingTVA, totalTVA }`

#### TGP
- `calculateTGP(config: TGPConfig): number`
- `calculateQualifyingTGP(config: TGPConfig): number`
- `calculateFinalsTGP(config: TGPConfig): number`

#### Event Boosters
- `getEventBoosterMultiplier(type: EventBoosterType): number`
- `qualifiesForCertified(...): boolean`
- `qualifiesForCertifiedPlus(...): boolean`

#### Point Distribution
- `distributePoints(results: PlayerResult[], firstPlaceValue: number): PointDistribution[]`
- `calculatePlayerPoints(position, playerCount, ratedPlayerCount, firstPlaceValue): number`

#### Time Decay
- `applyTimeDecay(points: number, eventDate: Date): number`
- `isEventActive(eventDate: Date): boolean`
- `getDecayMultiplier(ageInYears: number): number`

#### Rating
- `updateRating(update: RatingUpdate): RatingResult`
- `simulateTournamentMatches(position, results): MatchResult[]`

#### Efficiency
- `calculateOverallEfficiency(events: PlayerEvent[]): number`
- `getEfficiencyStats(events: PlayerEvent[]): EfficiencyStats`

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build the library
npm run build

# Lint and format
npm run lint
npm run format
```

## Testing

The library includes comprehensive unit and integration tests with 95%+ coverage:

```bash
npm run test:coverage
```

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please ensure all tests pass and maintain the existing code style.

## Acknowledgments

This library implements a ranking system based on tournament ranking principles for competitive pinball events.
