import { useState } from 'react';

export default function TerminologyGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  const sections = [
    {
      title: 'System Overview',
      description: 'Understanding the Open Pinball Player Ranking System',
      terms: [
        {
          term: 'OPPR (Open Pinball Player Ranking System)',
          definition: 'A comprehensive ranking system that evaluates competitive pinball players based on tournament performance. The system calculates tournament value, distributes points to participants, applies time decay, and maintains player rankings using the top 15 active events.',
        },
        {
          term: 'How OPPR Works',
          definition: 'Tournament Value is calculated from player field strength (Base Value + TVAs). This is multiplied by TGP (format quality) and Event Booster (event tier) to get First Place Value. Points are distributed to all finishers (10% linear + 90% dynamic), then time decay is applied. Player rankings are the sum of their top 15 decayed event points.',
        },
        {
          term: 'Calculation Flow',
          definition: 'Base Value + Rating TVA + Ranking TVA = Raw Tournament Value → × TGP × Event Booster = First Place Value → Point Distribution (Linear 10% + Dynamic 90%) → Apply Time Decay → Sum Top 15 Events = Player Ranking Points',
        },
      ],
    },
    {
      title: 'Core System Concepts',
      terms: [
        {
          term: 'Rated Player',
          definition: 'A player who has participated in 5 or more competitive events. Rated players have established Glicko ratings and count toward tournament value calculations.',
        },
        {
          term: 'Provisional Rating',
          definition: 'The rating assigned to players with fewer than 5 events. Provisional players have higher rating deviation (uncertainty) and do not count toward tournament value calculations.',
        },
        {
          term: 'Active Event',
          definition: 'A tournament that occurred within the last 3 years. Only active events contribute points to player rankings, with time decay applied based on event age.',
        },
        {
          term: 'Top 15 Events',
          definition: 'The 15 highest-scoring active events for a player. Only these events count toward the player\'s ranking points, encouraging quality over quantity of tournament participation.',
        },
      ],
    },
    {
      title: 'Tournament Value Components',
      terms: [
        {
          term: 'Base Value',
          definition: 'Points calculated from the number of rated players in the tournament. Formula: 0.5 × rated_players (maximum 32 points at 64+ rated players).',
        },
        {
          term: 'Rating TVA (Tournament Value Added)',
          definition: 'Adjustment based on the Glicko rating strength of players. Formula: Σ(rating × 0.000546875 - 0.703125) for each rated player (maximum 25 points total).',
        },
        {
          term: 'Ranking TVA',
          definition: 'Adjustment based on the OPPR world rankings of players. Formula: Σ(ln(ranking) × -0.211675054 + 1.459827968) for each ranked player (maximum 50 points total).',
        },
        {
          term: 'Total TVA',
          definition: 'Sum of Rating TVA and Ranking TVA (maximum 75 points). Represents the combined strength adjustment based on both skill ratings and competitive rankings.',
        },
        {
          term: 'Raw Tournament Value',
          definition: 'Base Value + Total TVA, representing the total tournament strength before format and tier multipliers are applied (theoretical maximum 107 points).',
        },
        {
          term: 'First Place Value',
          definition: 'The final points awarded to the tournament winner. Calculated as: Raw Tournament Value × TGP × Event Booster. This value determines the point distribution for all finishers.',
        },
      ],
    },
    {
      title: 'Tournament Format & TGP',
      terms: [
        {
          term: 'TGP (Tournament Grading Percentage)',
          definition: 'A percentage multiplier based on tournament format and structure. Base TGP is calculated as 4% per meaningful game, with additional multipliers for group formats, unlimited play, and ball count.',
        },
        {
          term: 'Meaningful Games',
          definition: 'Competitive games that count toward TGP calculation. Includes qualifying games and finals games that contribute to advancement or final standings.',
        },
        {
          term: 'Qualifying',
          definition: 'The initial phase of a tournament where players compete to advance to finals. Qualifying games contribute to the base TGP calculation.',
        },
        {
          term: 'Finals',
          definition: 'The championship phase of a tournament. Finals games contribute to TGP and determine final player standings and point distribution.',
        },
        {
          term: 'Finals Eligibility',
          definition: 'The percentage of players who advance from qualifying to finals. Must be between 10-50% for valid TGP calculation. Lower percentages indicate more selective competition.',
        },
        {
          term: 'Four-Player Groups (PAPA-style)',
          definition: 'Match play format with 4 players per group competing head-to-head. Applies a 2× multiplier to TGP due to increased competitive intensity.',
        },
        {
          term: 'Three-Player Groups',
          definition: 'Match play format with 3 players per group. Applies a 1.5× multiplier to TGP.',
        },
        {
          term: 'Multi-Matchplay',
          definition: 'Head-to-head competition without group play structure. Uses base TGP without group multipliers.',
        },
        {
          term: 'Unlimited Formats',
          definition: 'Tournaments lasting 20+ hours with unrestricted play. Receive time bonus of 1% per hour (up to 20%) and format multipliers: Best Game (2×), Hybrid Best Game (3×), Card Qualifying (4×).',
        },
        {
          term: 'Ball Count Adjustment',
          definition: 'TGP modifier based on balls per game: 1-ball = 33%, 2-ball = 66%, 3+ ball = 100%. Adjusts for the skill expression opportunity in each game.',
        },
        {
          term: 'Tournament Formats',
          definition: 'Various competitive structures including Single Elimination, Double Elimination, Match Play, Best Game, Card Qualifying, Pin Golf, Flip Frenzy, Strike Format, Target Match Play, and Hybrid formats. Each affects TGP calculation differently.',
        },
      ],
    },
    {
      title: 'Event Classification',
      terms: [
        {
          term: 'Event Booster',
          definition: 'A multiplier applied based on tournament tier and significance. Ranges from 1.0× (standard events) to 2.0× (majors).',
        },
        {
          term: 'None (Standard Event)',
          definition: 'Events with 1.0× booster (100%). Default tier for regular tournaments that meet minimum requirements.',
        },
        {
          term: 'Certified Event',
          definition: 'Events with 1.25× booster (125%). Requires 24+ finalists and valid format structure. Recognizes well-organized competitive events.',
        },
        {
          term: 'Certified+ Event',
          definition: 'Events with 1.5× booster (150%). Requires 128+ rated players in the field. Recognizes large-scale competitive events with strong participation.',
        },
        {
          term: 'Championship Series',
          definition: 'Events with 1.5× booster (150%). Designated series events such as circuit championships or regional finals.',
        },
        {
          term: 'Major Championship',
          definition: 'Events with 2.0× booster (200%). The highest tier reserved for major championships with significant competitive importance.',
        },
      ],
    },
    {
      title: 'Point Distribution',
      terms: [
        {
          term: 'Linear Distribution',
          definition: 'The egalitarian component of point distribution. 10% of First Place Value is divided equally among all finishers. Formula: (First Place Value × 0.10) / total_finishers.',
        },
        {
          term: 'Dynamic Distribution',
          definition: 'The performance-based component of point distribution. 90% of First Place Value is distributed using an exponential decay curve favoring top finishers. Formula: (1 - ((position - 1) / min(rated_players/2, 64))^0.7)^3 × First Place Value × 0.90.',
        },
        {
          term: 'Position Exponent',
          definition: 'The exponent (0.7) used in the position calculation for dynamic distribution. Creates a curve that gradually reduces points for lower positions.',
        },
        {
          term: 'Value Exponent',
          definition: 'The cubic exponent (3) applied to the position-adjusted value. Creates an aggressive decay curve that significantly favors winning and top finishes.',
        },
        {
          term: 'Dynamic Cap',
          definition: 'Maximum of 64 players used in dynamic distribution calculation. Prevents excessive point dilution in very large tournaments while maintaining competitive advantage for top finishes.',
        },
      ],
    },
    {
      title: 'Time & Activity',
      terms: [
        {
          term: 'Time Decay',
          definition: 'Progressive reduction of event points based on age. Events lose value over time to emphasize recent performance and keep rankings current.',
        },
        {
          term: 'Decay Multiplier',
          definition: 'The percentage of points retained based on event age: Year 1 = 100%, Year 2 = 75%, Year 3 = 50%, Beyond 3 years = 0%. Applied to all event points before summing for player rankings.',
        },
        {
          term: 'Active Period',
          definition: 'The 3-year window during which events contribute to player rankings. Events older than 3 years are no longer active and do not contribute points.',
        },
      ],
    },
    {
      title: 'Rating System (Glicko)',
      terms: [
        {
          term: 'Glicko Rating System',
          definition: 'A skill rating system that measures player ability with uncertainty quantification. OPPR simulates head-to-head matches from tournament results and updates ratings using the Glicko algorithm.',
        },
        {
          term: 'Rating',
          definition: 'A numerical measure of player skill level. Default starting rating is 1300. Higher ratings indicate stronger competitive ability. Used to calculate Rating TVA.',
        },
        {
          term: 'Rating Deviation (RD)',
          definition: 'A measure of uncertainty in a player\'s rating. Ranges from 10 (very certain) to 200 (very uncertain). New players start with high RD that decreases as they compete more.',
        },
        {
          term: 'RD Decay',
          definition: 'Gradual increase in rating uncertainty over time (~0.3 per day of inactivity). Reflects reduced confidence in ratings for inactive players.',
        },
        {
          term: 'Expected Score (E)',
          definition: 'The predicted outcome of a match based on rating difference and uncertainty. Used by the Glicko algorithm to update ratings after actual results.',
        },
        {
          term: 'Q Value',
          definition: 'Mathematical constant used in Glicko calculations: ln(10)/400 ≈ 0.00575646273. Defines the rating scale and conversion factor.',
        },
        {
          term: 'Opponents Range',
          definition: 'For rating calculations, matches are simulated against opponents within ±32 world ranking positions. Limits comparisons to relevant competitive peers.',
        },
      ],
    },
    {
      title: 'Performance Metrics',
      terms: [
        {
          term: 'Efficiency',
          definition: 'The percentage of available tournament points captured by a player. Calculated as: (points_earned / first_place_value) × 100%. Measures performance quality independent of tournament size.',
        },
        {
          term: 'Overall Efficiency',
          definition: 'Average efficiency across all active events for a player. Indicates consistency of performance across tournament participation.',
        },
        {
          term: 'Top N Efficiency',
          definition: 'Average efficiency for a player\'s best N events (typically top 15). Measures peak performance capability and quality of best results.',
        },
        {
          term: 'Decayed Efficiency',
          definition: 'Efficiency calculation using time-decayed points. Reflects performance quality adjusted for recency, emphasizing current competitive form.',
        },
      ],
    },
    {
      title: 'Validation & Requirements',
      terms: [
        {
          term: 'Minimum Players',
          definition: 'A tournament must have at least 3 participating players to be considered a valid sanctioned event for OPPR.',
        },
        {
          term: 'Minimum Rated Players',
          definition: 'While events need only 3 total players, tournaments with few rated players will have low tournament value. Strong fields require multiple rated players.',
        },
        {
          term: 'Valid Format Structure',
          definition: 'Tournaments must use recognized competitive formats with appropriate meaningful game counts and finals eligibility percentages (10-50%) to receive proper TGP calculation.',
        },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
        aria-expanded={isExpanded}
      >
        <h2 className="text-lg font-semibold text-gray-900">
          OPPR System Guide & Glossary
        </h2>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 pt-2 space-y-8">
          {sections.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex > 0 ? 'pt-6 border-t border-gray-200' : ''}>
              <h3 className="text-md font-semibold text-gray-900 mb-1">
                {section.title}
              </h3>
              {section.description && (
                <p className="text-sm text-gray-600 mb-4">{section.description}</p>
              )}
              <div className="grid grid-cols-1 gap-4">
                {section.terms.map(({ term, definition }) => (
                  <div
                    key={term}
                    className="bg-blue-50 rounded-lg p-4 border border-blue-100"
                  >
                    <dt className="font-semibold text-blue-900 mb-1">{term}</dt>
                    <dd className="text-sm text-blue-800 whitespace-pre-line">{definition}</dd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
