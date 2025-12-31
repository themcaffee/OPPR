# Configuration

::: info Core Library Reference
This page documents configuration options for the `@opprs/core` calculation library. If you're using the REST API, configuration is typically managed server-side. This reference is for developers directly integrating the library.
:::

The OPPRS library allows you to configure all calculation constants to customize the ranking system for your specific needs. By default, the library uses the standard OPPRS constants, but you can override any value globally.

## Basic Configuration

```typescript
import { configureOPPR, calculateBaseValue } from '@opprs/core';

// Configure specific constants
configureOPPR({
  BASE_VALUE: {
    POINTS_PER_PLAYER: 1.0,  // Override: changed from default 0.5
    MAX_BASE_VALUE: 64,       // Override: changed from default 32
  },
  TIME_DECAY: {
    YEAR_1_TO_2: 0.8,  // Override: changed from default 0.75
  },
});

// All function calls now use your configured values
const baseValue = calculateBaseValue(players);
```

## Configuration Options

You can configure any of the following constant groups:

- `BASE_VALUE` - Tournament base value calculation
- `TVA` - Tournament Value Adjustment (rating and ranking)
- `TGP` - Tournament Grading Percentage
- `EVENT_BOOSTERS` - Event multipliers
- `POINT_DISTRIBUTION` - Point allocation
- `TIME_DECAY` - Point depreciation
- `RANKING` - Player ranking rules
- `RATING` - Glicko rating system
- `VALIDATION` - Input validation rules

## Partial Configuration

You only need to specify the values you want to override. All other values will use the defaults:

```typescript
import { configureOPPR } from '@opprs/core';

// Only override specific nested values
configureOPPR({
  TVA: {
    RATING: {
      MAX_VALUE: 30,  // Only override this one value
      // All other TVA.RATING values use defaults
    },
    // TVA.RANKING uses all defaults
  },
});
```

## Resetting Configuration

```typescript
import { resetConfig } from '@opprs/core';

// Reset all constants back to defaults
resetConfig();
```

## Accessing Default Constants

```typescript
import { getDefaultConfig, DEFAULT_CONSTANTS } from '@opprs/core';

// Get the current defaults programmatically
const defaults = getDefaultConfig();
console.log(defaults.BASE_VALUE.POINTS_PER_PLAYER); // 0.5

// Or access the constant object directly
console.log(DEFAULT_CONSTANTS.BASE_VALUE.MAX_BASE_VALUE); // 32
```

## Configuration Examples

### Example 1: Higher Tournament Values

```typescript
import { configureOPPR } from '@opprs/core';

// Make tournaments worth more points
configureOPPR({
  BASE_VALUE: {
    POINTS_PER_PLAYER: 1.0,  // Double from 0.5
    MAX_BASE_VALUE: 64,      // Double from 32
  },
  TVA: {
    RATING: {
      MAX_VALUE: 50,  // Double from 25
    },
    RANKING: {
      MAX_VALUE: 100, // Double from 50
    },
  },
});
```

### Example 2: Slower Time Decay

```typescript
import { configureOPPR } from '@opprs/core';

// Keep points valuable longer
configureOPPR({
  TIME_DECAY: {
    YEAR_0_TO_1: 1.0,   // Default
    YEAR_1_TO_2: 0.9,   // Changed from 0.75
    YEAR_2_TO_3: 0.7,   // Changed from 0.5
    YEAR_3_PLUS: 0.5,   // Changed from 0.0
  },
});
```

### Example 3: Different TGP Scaling

```typescript
import { configureOPPR } from '@opprs/core';

// Adjust TGP values
configureOPPR({
  TGP: {
    BASE_GAME_VALUE: 0.05,        // 5% per game instead of 4%
    MAX_WITHOUT_FINALS: 1.5,      // 150% max instead of 100%
    MAX_WITH_FINALS: 2.5,         // 250% max instead of 200%
    MULTIPLIERS: {
      FOUR_PLAYER_GROUPS: 2.5,    // Higher multiplier
    },
  },
});
```

## TypeScript Support

The configuration system is fully typed. Your IDE will provide autocomplete and type checking:

```typescript
import { configureOPPR, type PartialOPPRConfig } from '@opprs/core';

const myConfig: PartialOPPRConfig = {
  BASE_VALUE: {
    POINTS_PER_PLAYER: 1.0,
    // TypeScript will show all available options
    // and catch any typos or invalid values
  },
};

configureOPPR(myConfig);
```
