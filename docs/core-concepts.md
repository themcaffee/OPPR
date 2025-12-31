# Core Concepts

::: info Core Library Reference
This page documents the `@opprs/core` calculation library. If you're running the full OPPRS stack (REST API + Frontend), these calculations are handled automatically. This reference is for developers who want to understand the algorithms or integrate the library into custom applications.
:::

This page explains the fundamental concepts and calculations used in the OPPRS ranking system.

## Base Value

The base value of a tournament is calculated based on the number of rated players (players with 5+ events):

- **0.5 points per rated player**
- **Maximum of 32 points** (achieved at 64+ rated players)

```typescript
import { calculateBaseValue } from '@opprs/core';

const baseValue = calculateBaseValue(players);
```

## Tournament Value Adjustment (TVA)

TVA increases tournament value based on the strength of the field:

### Rating-based TVA

- Uses Glicko ratings to assess player skill
- Maximum contribution: **25 points**
- Formula: `(rating * 0.000546875) - 0.703125`

### Ranking-based TVA

- Uses world rankings to assess field strength
- Maximum contribution: **50 points**
- Formula: `ln(ranking) * -0.211675054 + 1.459827968`

```typescript
import { calculateRatingTVA, calculateRankingTVA } from '@opprs/core';

const ratingTVA = calculateRatingTVA(players);
const rankingTVA = calculateRankingTVA(players);
```

## Tournament Grading Percentage (TGP)

TGP measures the quality and completeness of a tournament format:

- **Base value:** 4% per meaningful game
- **Without separate qualifying:** Max 100%
- **With qualifying and finals:** Max 200%

### Multipliers

| Format | Multiplier |
|--------|------------|
| 4-player groups | 2X |
| 3-player groups | 1.5X |
| Unlimited best game (20+ hours) | 2X |
| Hybrid best game | 3X |
| Unlimited card qualifying | 4X |

```typescript
import { calculateTGP, type TGPConfig } from '@opprs/core';

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

## Event Boosters

Event boosters multiply the final tournament value:

| Booster Type | Multiplier |
|--------------|------------|
| None | 1.0X (100%) |
| Certified | 1.25X (125%) |
| Certified+ | 1.5X (150%) |
| Championship Series | 1.5X (150%) |
| Major | 2.0X (200%) |

```typescript
import { getEventBoosterMultiplier } from '@opprs/core';

const booster = getEventBoosterMultiplier('major'); // Returns 2.0
```

## Point Distribution

Points are distributed using two components:

1. **Linear Distribution (10%):** Evenly distributed across positions
2. **Dynamic Distribution (90%):** Heavily weighted toward top finishers

```typescript
import { distributePoints } from '@opprs/core';

const distributions = distributePoints(results, firstPlaceValue);
```

## Time Decay

Points decay over time to emphasize recent performance:

| Time Period | Value Retained |
|-------------|----------------|
| 0-1 years | 100% |
| 1-2 years | 75% |
| 2-3 years | 50% |
| 3+ years | 0% (inactive) |

```typescript
import { applyTimeDecay, isEventActive } from '@opprs/core';

const eventDate = new Date('2023-01-01');
const decayedPoints = applyTimeDecay(100, eventDate);
const active = isEventActive(eventDate);
```

## Glicko Rating System

Player ratings use the Glicko system with rating deviation (uncertainty):

- **Default rating:** 1300
- **Rating deviation (RD):** 10-200
- **RD decay:** ~0.3 per day of inactivity

```typescript
import { updateRating, type RatingUpdate } from '@opprs/core';

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
