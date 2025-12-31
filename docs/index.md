---
layout: home
hero:
  name: OPPRS
  text: Open Pinball Player Ranking System
  tagline: A comprehensive TypeScript library for calculating pinball tournament rankings and player ratings
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/your-org/opprs
features:
  - title: Configurable Constants
    details: Override any calculation constant to customize the ranking system for your specific needs.
  - title: Complete Tournament Scoring
    details: Base Value, TVA, TGP, Event Boosters, and Point Distribution calculations built-in.
  - title: Glicko Rating System
    details: Player skill rating with uncertainty tracking using the proven Glicko algorithm.
  - title: TypeScript First
    details: Full type safety and IntelliSense support with comprehensive type definitions.
---

## Quick Overview

OPPRS provides everything you need to implement a competitive pinball ranking system:

- **Base Value Calculation** - Tournament value based on number of rated players
- **Tournament Value Adjustment (TVA)** - Strength indicators from player ratings and rankings
- **Tournament Grading Percentage (TGP)** - Format quality assessment
- **Event Boosters** - Multipliers for major championships and certified events
- **Point Distribution** - Linear and dynamic point allocation
- **Time Decay** - Automatic point depreciation over time
- **Glicko Rating System** - Player skill rating with uncertainty
- **Efficiency Tracking** - Performance metrics
- **Input Validation** - Comprehensive data validation

## Installation

```bash
npm install @opprs/core
```

See the [Getting Started](/getting-started) guide for more details.
