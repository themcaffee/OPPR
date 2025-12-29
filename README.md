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

## Constants and Calibration Rationale

This section explains why each constant in the system has its current value. The constants are carefully calibrated to create a balanced, mathematically sound ranking system.

### Design Philosophy

Most constants are chosen to:
1. **Cap maximum contributions** at specific thresholds
2. **Create mathematical relationships** between different components
3. **Follow established rating systems** (like Glicko)
4. **Reflect real-world competitive difficulty**

Many constants are interdependent - changing one often requires adjusting others to maintain system balance.

### Base Value Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| `POINTS_PER_PLAYER` | `0.5` | Chosen so 64 rated players yields exactly 32 points (0.5 × 64 = 32) |
| `MAX_BASE_VALUE` | `32` | Reasonable cap for tournament base value |
| `MAX_PLAYER_COUNT` | `64` | Player count where max is reached (32 ÷ 0.5 = 64) |
| `RATED_PLAYER_THRESHOLD` | `5` | Five events provides sufficient history to be "rated" |

**Key Insight:** The 0.5 coefficient creates perfect linear scaling where the cap is reached at a reasonable tournament size.

### Tournament Value Adjustment (TVA) Constants

#### Rating-based TVA

| Constant | Value | Rationale |
|----------|-------|-----------|
| `MAX_VALUE` | `25` | Ensures rating TVA contributes 1/3 of the 75-point total TVA cap |
| `COEFFICIENT` | `0.000546875` | Reverse-engineered so 64 players rated 2000 contribute exactly 25 points |
| `OFFSET` | `0.703125` | Paired with coefficient: `(2000 × 0.000546875) - 0.703125 ≈ 0.39` per player |
| `PERFECT_RATING` | `2000` | Reference rating for "perfect" player |
| `MIN_EFFECTIVE_RATING` | `1285.71` | Where formula crosses zero: `(1285.71 × 0.000546875) - 0.703125 ≈ 0` |

**Formula:** `(rating * 0.000546875) - 0.703125`

The coefficients ensure 64 perfect players contribute exactly 25 points: 64 × 0.39 ≈ 25 ✓

#### Ranking-based TVA

| Constant | Value | Rationale |
|----------|-------|-----------|
| `MAX_VALUE` | `50` | Largest component of TVA (2/3 of 75-point cap) |
| `COEFFICIENT` | `-0.211675054` | Calibrated so top 64 ranked players sum to exactly 50 points |
| `OFFSET` | `1.459827968` | Creates logarithmic decay favoring top-ranked players |

**Formula:** `ln(ranking) * -0.211675054 + 1.459827968`

- Rank #1: ~1.46 points
- Rank #2: ~1.31 points
- Sum of ranks 1-64: ~50 points

**Key Insight:** The logarithmic formula heavily rewards top-ranked players, while the rating formula is more linear.

#### General TVA

| Constant | Value | Rationale |
|----------|-------|-----------|
| `MAX_PLAYERS_CONSIDERED` | `64` | Limits calculation scope; prevents diminishing returns from large fields |

### TGP (Tournament Grading Percentage) Constants

#### Base Values

| Constant | Value | Rationale |
|----------|-------|-----------|
| `BASE_GAME_VALUE` | `0.04` (4%) | Base unit chosen so 25 meaningful games = 100% TGP |
| `MAX_WITHOUT_FINALS` | `1.0` (100%) | Standard cap for simple tournaments |
| `MAX_WITH_FINALS` | `2.0` (200%) | Allows qualifying + finals to each contribute up to 100% |
| `MAX_GAMES_FOR_200_PERCENT` | `50` | 50 games × 4% = 200% (matches the math) |

#### Format Multipliers

These reflect **competitive difficulty**:

| Format | Multiplier | Effective % | Rationale |
|--------|------------|-------------|-----------|
| Four-player groups | `2.0` | 8% per game | Most competitive format (PAPA-style) |
| Three-player groups | `1.5` | 6% per game | Less competitive than 4-player |
| Unlimited best game | `2.0` | 8% per game | Requires 20+ hours of qualifying |
| Hybrid best game | `3.0` | 12% per game | Combines multiple competitive elements |
| Unlimited card | `4.0` | 16% per game | Highest difficulty: unlimited practice + card format |

**Key Insight:** Higher multipliers = harder formats = more TGP value per game

#### Ball Count Adjustments

| Ball Count | Multiplier | Rationale |
|------------|------------|-----------|
| 1-ball | `0.33` (33%) | Less meaningful competition than standard 3-ball |
| 2-ball | `0.66` (66%) | Linear scaling between 1 and 3-ball |
| 3+ ball | `1.0` (100%) | Standard competitive format |

#### Unlimited Qualifying

| Constant | Value | Rationale |
|----------|-------|-----------|
| `PERCENT_PER_HOUR` | `0.01` (1%) | Rewards longer qualifying periods |
| `MAX_BONUS` | `0.2` (20%) | Caps at 20% bonus (achieved at 20 hours) |
| `MIN_HOURS_FOR_MULTIPLIER` | `20` | Must run 20+ hours to qualify for format multipliers |

#### Finals Requirements

| Constant | Value | Rationale |
|----------|-------|-----------|
| `MIN_FINALISTS_PERCENT` | `0.1` (10%) | At least 10% must advance to ensure finals are meaningful |
| `MAX_FINALISTS_PERCENT` | `0.5` (50%) | Maximum 50% prevents finals from being too inclusive |

### Event Booster Constants

| Booster Type | Multiplier | Rationale |
|--------------|------------|-----------|
| None | `1.0` (100%) | Standard events, no adjustment |
| Certified | `1.25` (125%) | 25% boost for meeting certification requirements (24+ finalists, valid format) |
| Certified+ | `1.5` (150%) | 50% boost requires 128+ rated players |
| Championship Series | `1.5` (150%) | Same as Certified+ for series events |
| Major | `2.0` (200%) | 100% boost doubles the value of major championships |

**Key Insight:** These create tiers that incentivize higher-quality tournaments.

### Point Distribution Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| `LINEAR_PERCENTAGE` | `0.1` (10%) | Everyone gets some points |
| `DYNAMIC_PERCENTAGE` | `0.9` (90%) | Heavily rewards top finishers |
| `POSITION_EXPONENT` | `0.7` | Creates curve less steep than linear but more aggressive than logarithmic |
| `VALUE_EXPONENT` | `3` | Cubic function creates exponential decay from 1st to last place |
| `MAX_DYNAMIC_PLAYERS` | `64` | Caps denominator so small tournaments don't over-penalize lower finishers |

**Formula:**
```typescript
power((1 - power(((Position - 1) / min(RatedPlayerCount/2, 64)), 0.7)), 3) * 0.9 * FirstPlaceValue
```

**Key Insight:** The 10/90 split ensures everyone gets participation points while creating significant reward for top performance. The exponents were tuned empirically to create a "fair" distribution curve.

### Time Decay Constants

| Time Period | Multiplier | Rationale |
|-------------|------------|-----------|
| 0-1 years | `1.0` (100%) | Recent performance at full value |
| 1-2 years | `0.75` (75%) | 25% annual decay begins |
| 2-3 years | `0.5` (50%) | Continues progressive decay |
| 3+ years | `0.0` (0%) | Complete removal after 3 years |

| Constant | Value | Rationale |
|----------|-------|-----------|
| `DAYS_PER_YEAR` | `365` | Standard year length for calculations |

**Key Insight:** The 3-year window and 25% annual decay steps are standard in ranking systems, emphasizing recent performance while gradually phasing out older results.

### Ranking System Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| `TOP_EVENTS_COUNT` | `15` | Top 15 events count toward ranking (similar to IFPA) |
| `ENTRY_RANKING_PERCENTILE` | `0.1` (10th) | New players start at 10th percentile (reasonable pessimistic assumption) |

### Glicko Rating System Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| `DEFAULT_RATING` | `1300` | Standard Glicko starting rating (slightly below average) |
| `MIN_RD` | `10` | Minimum uncertainty for highly active players |
| `MAX_RD` | `200` | Maximum uncertainty (new/inactive players) |
| `RD_DECAY_PER_DAY` | `0.3` | ~90 days of inactivity returns to max uncertainty (0.3 × 300 ≈ 90) |
| `OPPONENTS_RANGE` | `32` | Limits calculation to 32 players above/below (performance optimization) |
| `Q` | `Math.LN10 / 400` | **Mathematical constant from Glicko formula** (≈ 0.00575646) |

**Key Insight:** These are standard Glicko parameters based on Mark Glickman's research, not arbitrary choices. The Q value is a mathematical constant: `ln(10) / 400`.

### Validation Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| `MIN_PLAYERS` | `3` | Absolute minimum for competitive validity |
| `MIN_PRIVATE_PLAYERS` | `16` | Higher bar for private tournaments |
| `MAX_GAMES_PER_MACHINE` | `3` | Prevents over-reliance on single machines |
| `MIN_PARTICIPATION_PERCENT` | `0.5` (50%) | Data quality threshold for including results |

### Mathematical Interdependencies

Several constants are **mathematically linked**:

1. **Base Value:** `0.5 × 64 = 32` (points per player × max players = max value)
2. **Rating TVA:** Coefficients ensure 64 perfect players = 25 points
3. **Ranking TVA:** Logarithmic coefficients ensure top 64 = 50 points
4. **TGP:** `0.04 × 50 = 2.0` (base value × max games = max TGP)
5. **Glicko Q:** `ln(10) / 400` is a mathematical constant, not arbitrary

**Warning:** The system is highly calibrated. Changing one constant often requires adjusting others to maintain balance.

### Summary

Most constants fall into three categories:

1. **Mathematical calibrations** (TVA coefficients, Glicko Q) - Derived from formulas
2. **Empirical balance tuning** (TGP multipliers, point distribution exponents) - Adjusted to feel "fair"
3. **Standard values** (Glicko defaults, 3-year decay) - Industry best practices

Together, these constants create a comprehensive ranking system where tournament value scales appropriately with field strength, format difficulty, and competitive level.

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
