import { useState } from 'react';

export default function TerminologyGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  const terms = [
    {
      term: 'Base Value',
      definition: 'Points calculated from number of rated players (0.5 per player, max 32)',
    },
    {
      term: 'Rating TVA',
      definition: 'Adjustment based on average player rating strength (max 25)',
    },
    {
      term: 'Ranking TVA',
      definition: 'Adjustment based on top-ranked players in field (max 50)',
    },
    {
      term: 'Total TVA',
      definition: 'Sum of Rating TVA and Ranking TVA (max 75)',
    },
    {
      term: 'Raw Tournament Value',
      definition: 'Base Value + Total TVA before modifiers',
    },
    {
      term: 'TGP (Tournament Grading Percentage)',
      definition: 'Multiplier based on tournament format/settings',
    },
    {
      term: 'Event Booster',
      definition: 'Additional multiplier for special events',
    },
    {
      term: 'First Place Value',
      definition: 'Final points awarded to tournament winner',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
        aria-expanded={isExpanded}
      >
        <h2 className="text-lg font-semibold text-gray-900">Terminology Guide</h2>
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
        <div className="px-6 pb-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {terms.map(({ term, definition }) => (
              <div
                key={term}
                className="bg-blue-50 rounded-lg p-4 border border-blue-100"
              >
                <dt className="font-semibold text-blue-900 mb-1">{term}</dt>
                <dd className="text-sm text-blue-800">{definition}</dd>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
