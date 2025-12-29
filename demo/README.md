# OPPR Demo Application

An interactive web demonstration of the **Open Pinball Player Ranking System (OPPR)**. This application showcases how to use the OPPR library to calculate tournament values, distribute points, and update player ratings.

## Features

### 1. Player Management
- Editable table with player information (name, rating, ranking, events, rating deviation)
- Load pre-configured examples (Local, Regional, Major tournaments)
- Add/remove players dynamically
- Automatic rated status calculation (5+ events)

### 2. Tournament Configuration
- **Qualifying Settings**:
  - Type selection (unlimited, limited, hybrid, none)
  - Meaningful games configuration
  - Group multipliers (3-player: 1.5x, 4-player: 2.0x)
  - Hours tracking for unlimited formats
- **Finals Settings**:
  - 10 different tournament format types
  - Meaningful games configuration
  - Group multipliers
  - Finalist count
- **Event Boosters**: None (1.0x), Certified (1.25x), Certified+ (1.5x), Major (2.0x)
- **Ball Count Adjustment**: 1-ball (0.33x), 2-ball (0.66x), 3-ball (1.0x)

### 3. Tournament Results Input
- Position-based ranking interface
- Up/down arrow buttons for quick adjustments
- Direct position editing
- Sort by rating
- Randomize functionality
- Medal indicators for top 3 finishers

### 4. Calculation Display
- **Base Value**: 0.5 per rated player (max 32.00)
- **Tournament Value Adjustment (TVA)**:
  - Rating TVA (max 25.00)
  - Ranking TVA (max 50.00)
  - Total TVA breakdown
- **TGP Multiplier**: Real-time calculation
- **Event Booster**: Applied multiplier
- **First Place Value**: Final calculated tournament value with formula breakdown

### 5. Points Distribution
- Stacked bar chart visualization (Linear vs Dynamic points)
- Detailed table with position, player info, and point breakdown
- Percentage of first place value
- Summary statistics (First, Median, Last place values)
- Top 20 players display with option to view all

### 6. Rating Changes
- Line chart showing old vs new ratings
- Glicko rating system calculations
- Rating deviation (RD) tracking
- Color-coded changes (green for gains, red for drops)
- Summary statistics (Largest gain, Average change, Largest drop)

### 7. Format Comparison
- Side-by-side tournament format comparison
- Pre-configured scenarios:
  - Current Configuration
  - PAPA Match Play
  - Best Game (Unlimited)
  - Strike/Knockout
  - Double Elimination
- Comparison metrics:
  - TGP percentage
  - First, 5th, and last place values
  - Top 5 player point distribution
- Format insights and explanations

## Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager

### Installation

1. Navigate to the demo directory:
   ```bash
   cd demo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the OPPR library (if not already built):
   ```bash
   cd ..
   npm run build
   cd demo
   ```

### Running the Demo

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the demo application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Usage Guide

### Quick Start

1. **Load Example Data**: Click one of the "Load" buttons to populate the player table with example data:
   - **Load Local (20)**: Small local tournament
   - **Load Regional (60)**: Medium regional championship
   - **Load Major (400)**: Large major championship

2. **Configure Tournament**: Adjust the tournament settings in the "Tournament Configuration" panel:
   - Set qualifying type and meaningful games
   - Configure finals format and games
   - Select event booster level
   - Adjust ball count if needed

3. **Set Results**: The results are auto-initialized in order. You can:
   - Use up/down arrows to adjust positions
   - Edit position numbers directly
   - Click "Sort by Rating" for seed-based results
   - Click "Randomize" for random results

4. **View Calculations**: See the complete breakdown of tournament value calculation and points distribution

5. **Compare Formats**: Switch to the "Format Comparison" tab to see how different tournament formats affect point values

### Example Workflows

#### Scenario 1: Local League Finals
1. Click "Load Local (20)"
2. Keep default settings (5 qualifying games, 8 finals games)
3. Click "Randomize" in results
4. Review the points distribution

#### Scenario 2: Major Championship
1. Click "Load Major (400)"
2. Set event booster to "Major (2.0x)"
3. Configure 40 qualifying games with 4-player groups
4. Set 12 finals games with 4-player groups
5. Sort by rating to see expected results
6. Switch to "Format Comparison" to see impact

#### Scenario 3: Custom Tournament
1. Start with any example or add players manually
2. Adjust qualifying settings:
   - Set type to "unlimited"
   - Enter 20 hours
   - Set 20 meaningful games
3. Configure finals with your preferred format
4. Set custom results
5. Analyze the calculations

## Tournament Format Types

The demo supports all OPPR tournament formats:

- **Single Elimination**: Direct knockout format
- **Double Elimination**: Losers bracket format
- **Match Play**: PAPA-style group play
- **Best Game**: High score competition
- **Card Qualifying**: IFPA-style card play
- **Pin Golf**: Low score competition
- **Flip Frenzy**: Speed-based format
- **Strike Format**: Knockout with strikes
- **Target Match Play**: Goal-based competition
- **Hybrid**: Combined format types

## Data Structures

### Player Object
```typescript
interface PlayerWithName {
  id: string;
  name: string;
  rating: number;           // Glicko rating (1300 default)
  ranking: number;          // World ranking (1 = best)
  isRated: boolean;         // Has 5+ events
  ratingDeviation?: number; // Uncertainty (10-200)
  eventCount?: number;      // Number of events attended
}
```

### TGP Configuration
```typescript
interface TGPConfig {
  qualifying: {
    type: 'unlimited' | 'limited' | 'hybrid' | 'none';
    meaningfulGames: number;
    hours?: number;
    fourPlayerGroups?: boolean;
    threePlayerGroups?: boolean;
  };
  finals: {
    formatType: TournamentFormatType;
    meaningfulGames: number;
    fourPlayerGroups?: boolean;
    threePlayerGroups?: boolean;
    finalistCount?: number;
  };
  ballCountAdjustment?: number;
}
```

## Technology Stack

- **React 19**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Data visualization
- **TanStack Table**: (available for advanced features)
- **OPPR Library**: Core ranking calculations

## Project Structure

```
demo/
├── src/
│   ├── components/
│   │   ├── PlayerInput.tsx          # Player data entry
│   │   ├── TournamentConfig.tsx     # Tournament settings
│   │   ├── ResultsInput.tsx         # Results entry
│   │   ├── CalculationDisplay.tsx   # Value breakdown
│   │   ├── PointsDistribution.tsx   # Points table & chart
│   │   ├── RatingsChart.tsx         # Rating changes
│   │   └── FormatComparison.tsx     # Format comparison
│   ├── data/
│   │   └── examples.ts              # Example tournaments
│   ├── utils/
│   │   └── calculations.ts          # OPPR integration
│   ├── App.tsx                      # Main application
│   └── index.css                    # Tailwind styles
├── package.json
├── vite.config.ts
└── README.md
```

## OPPR Calculation Formula

```
First Place Value = (Base Value + Total TVA) × TGP × Event Booster

Where:
- Base Value = 0.5 per rated player (max 32)
- Total TVA = Rating TVA (max 25) + Ranking TVA (max 50)
- TGP = Tournament Grading Percentage (based on format quality)
- Event Booster = 1.0x to 2.0x multiplier
```

Point distribution is then calculated as:
- **Linear Component (10%)**: Evenly distributed
- **Dynamic Component (90%)**: Heavily weighted toward top finishers

## Contributing

This demo is part of the OPPR library. For contributions, please refer to the main library repository.

## License

MIT - See LICENSE file in the root directory

## Links

- [OPPR Library Documentation](../README.md)
- [IFPA Tournament Guide](https://www.ifpapinball.com)
- [Pinball Ranking Systems](https://www.ifpapinball.com/wppr/system-guide/)
