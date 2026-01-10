# @opprs/core

Core TypeScript library for the Open Pinball Player Ranking System (OPPRS). Provides all calculation functions for tournament rankings and player ratings.

## Installation

```bash
npm install @opprs/core
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
} from '@opprs/core';

// Define players
const players: Player[] = [
  { id: '1', rating: 1800, ranking: 1, isRated: true },
  { id: '2', rating: 1700, ranking: 5, isRated: true },
  { id: '3', rating: 1600, ranking: 10, isRated: true },
];

// Calculate tournament value components
const baseValue = calculateBaseValue(players);
const ratingTVA = calculateRatingTVA(players);
const rankingTVA = calculateRankingTVA(players);

// Configure tournament format
const tgpConfig: TGPConfig = {
  qualifying: { type: 'limited', meaningfulGames: 7 },
  finals: { formatType: 'match-play', meaningfulGames: 12, fourPlayerGroups: true },
};

const tgp = calculateTGP(tgpConfig);
const eventBooster = getEventBoosterMultiplier('none');

// Calculate first place value
const firstPlaceValue = (baseValue + ratingTVA + rankingTVA) * tgp * eventBooster;

// Distribute points based on finishing positions
const results: PlayerResult[] = [
  { player: players[0], position: 1 },
  { player: players[1], position: 2 },
  { player: players[2], position: 3 },
];

const distributions = distributePoints(results, firstPlaceValue);
```

## Features

- **Base Value** - Tournament value based on rated player count
- **TVA (Tournament Value Adjustment)** - Field strength from ratings and rankings
- **TGP (Tournament Grading Percentage)** - Format quality assessment
- **Event Boosters** - Multipliers for majors and championships
- **Point Distribution** - Linear and dynamic point allocation
- **Time Decay** - Point depreciation over time
- **Glicko Ratings** - Player skill ratings with uncertainty
- **Configuration** - Override any calculation constant via `configureOPPR()`

## Documentation

For detailed documentation including API reference, configuration options, and calibration rationale, see the [OPPRS Documentation](https://thatguyinabeanie.github.io/OPPR/).

## License

AGPL-3.0-or-later
