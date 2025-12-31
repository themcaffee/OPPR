# API Reference

Complete reference for all types and functions exported by `@opprs/core`.

## Types

### Player

Represents a player in the ranking system.

```typescript
interface Player {
  id: string;
  rating: number;
  ranking: number;
  isRated: boolean;
  ratingDeviation?: number;
  eventCount?: number;
}
```

### TGPConfig

Configuration for Tournament Grading Percentage calculation.

```typescript
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
```

### PlayerResult

Represents a player's finish in a tournament.

```typescript
interface PlayerResult {
  player: Player;
  position: number;
  optedOut?: boolean;
}
```

### PointDistribution

Result of point distribution calculation for a player.

```typescript
interface PointDistribution {
  player: Player;
  position: number;
  linearPoints: number;
  dynamicPoints: number;
  totalPoints: number;
}
```

## Functions

### Base Value

#### calculateBaseValue

Calculates the base value of a tournament based on the number of rated players.

```typescript
function calculateBaseValue(players: Player[]): number
```

#### countRatedPlayers

Counts the number of rated players in a list.

```typescript
function countRatedPlayers(players: Player[]): number
```

#### isPlayerRated

Checks if a player is rated based on their event count.

```typescript
function isPlayerRated(eventCount: number): boolean
```

### TVA (Tournament Value Adjustment)

#### calculateRatingTVA

Calculates the rating-based Tournament Value Adjustment.

```typescript
function calculateRatingTVA(players: Player[]): number
```

#### calculateRankingTVA

Calculates the ranking-based Tournament Value Adjustment.

```typescript
function calculateRankingTVA(players: Player[]): number
```

#### calculateTotalTVA

Calculates both TVA components and returns the total.

```typescript
function calculateTotalTVA(players: Player[]): {
  ratingTVA: number;
  rankingTVA: number;
  totalTVA: number;
}
```

### TGP (Tournament Grading Percentage)

#### calculateTGP

Calculates the overall Tournament Grading Percentage.

```typescript
function calculateTGP(config: TGPConfig): number
```

#### calculateQualifyingTGP

Calculates the TGP contribution from the qualifying round.

```typescript
function calculateQualifyingTGP(config: TGPConfig): number
```

#### calculateFinalsTGP

Calculates the TGP contribution from the finals round.

```typescript
function calculateFinalsTGP(config: TGPConfig): number
```

### Event Boosters

#### getEventBoosterMultiplier

Returns the multiplier for a given event booster type.

```typescript
function getEventBoosterMultiplier(type: EventBoosterType): number
```

#### qualifiesForCertified

Checks if a tournament qualifies for Certified status.

```typescript
function qualifiesForCertified(...): boolean
```

#### qualifiesForCertifiedPlus

Checks if a tournament qualifies for Certified+ status.

```typescript
function qualifiesForCertifiedPlus(...): boolean
```

### Point Distribution

#### distributePoints

Distributes points to all players based on their finishing positions.

```typescript
function distributePoints(
  results: PlayerResult[],
  firstPlaceValue: number
): PointDistribution[]
```

#### calculatePlayerPoints

Calculates points for a single player position.

```typescript
function calculatePlayerPoints(
  position: number,
  playerCount: number,
  ratedPlayerCount: number,
  firstPlaceValue: number
): number
```

### Time Decay

#### applyTimeDecay

Applies time decay to a point value based on event date.

```typescript
function applyTimeDecay(points: number, eventDate: Date): number
```

#### isEventActive

Checks if an event is still active (within 3 years).

```typescript
function isEventActive(eventDate: Date): boolean
```

#### getDecayMultiplier

Returns the decay multiplier for a given age in years.

```typescript
function getDecayMultiplier(ageInYears: number): number
```

### Rating

#### updateRating

Updates a player's Glicko rating based on match results.

```typescript
function updateRating(update: RatingUpdate): RatingResult
```

#### simulateTournamentMatches

Simulates matches for a tournament based on finishing positions.

```typescript
function simulateTournamentMatches(
  position: number,
  results: PlayerResult[]
): MatchResult[]
```

### Efficiency

#### calculateOverallEfficiency

Calculates a player's overall efficiency across events.

```typescript
function calculateOverallEfficiency(events: PlayerEvent[]): number
```

#### getEfficiencyStats

Returns detailed efficiency statistics for a player.

```typescript
function getEfficiencyStats(events: PlayerEvent[]): EfficiencyStats
```
