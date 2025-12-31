# Getting Started

This guide will help you get up and running with OPPRS quickly.

## Installation

Install the `@opprs/core` package using your preferred package manager:

```bash
npm install @opprs/core
```

Or with other package managers:

```bash
# pnpm
pnpm add @opprs/core

# yarn
yarn add @opprs/core
```

## Quick Start

Here's a complete example showing how to calculate tournament points:

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

## What's Next?

- Learn about [Configuration](/configuration) to customize the ranking system
- Understand the [Core Concepts](/core-concepts) behind the calculations
- Explore the [Constants & Calibration](/constants) rationale
- Browse the complete [API Reference](/api-reference)
