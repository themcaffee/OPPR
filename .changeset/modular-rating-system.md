---
"@opprs/core": major
"@opprs/rating-system-base": minor
"@opprs/glicko-rating-system": minor
"demo": patch
"rest-api": patch
---

feat!: modular rating system architecture

BREAKING CHANGE: The `Player` type now uses a `ratings` object instead of flat `rating` and `ratingDeviation` properties.

This refactor introduces a modular rating system architecture that supports multiple rating systems simultaneously (e.g., Glicko and Elo).

**New packages:**
- `@opprs/rating-system-base`: Shared interfaces and rating system registry
- `@opprs/glicko-rating-system`: Glicko implementation extracted from core

**Migration:**
```typescript
// Before
const player = {
  id: '1',
  rating: 1500,
  ratingDeviation: 100,
  ranking: 50,
  isRated: true,
};

// After
import type { GlickoRatingData } from '@opprs/glicko-rating-system';

const player = {
  id: '1',
  ratings: {
    glicko: { value: 1500, ratingDeviation: 100 } as GlickoRatingData,
  },
  ranking: 50,
  isRated: true,
};

// To access rating value:
import { getPrimaryRating } from '@opprs/core';
const ratingValue = getPrimaryRating(player.ratings, 'glicko');
```
