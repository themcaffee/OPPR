import { useState, useMemo } from 'react';
import type { TGPConfig } from 'oppr';
import { PlayerInput } from './components/PlayerInput';
import { TournamentConfig } from './components/TournamentConfig';
import { ResultsInput } from './components/ResultsInput';
import { CalculationDisplay } from './components/CalculationDisplay';
import { PointsDistribution } from './components/PointsDistribution';
import { RatingsChart } from './components/RatingsChart';
import { FormatComparison } from './components/FormatComparison';
import TerminologyGuide from './components/TerminologyGuide';
import type { PlayerWithName, PlayerResultWithName } from './utils/calculations';
import { calculateTournamentResults } from './utils/calculations';
import { exampleTournaments, generatePlayerNames } from './data/examples';

type Tab = 'results' | 'comparison';

function App() {
  // Initialize with local tournament example
  const initialPlayers = useMemo(() => {
    const names = generatePlayerNames(exampleTournaments.local.players.length);
    return exampleTournaments.local.players.map((p, i) => ({
      ...p,
      name: names[i],
    }));
  }, []);

  const [players, setPlayers] = useState<PlayerWithName[]>(initialPlayers);
  const [results, setResults] = useState<PlayerResultWithName[]>([]);
  const [tgpConfig, setTgpConfig] = useState<TGPConfig>(exampleTournaments.local.tgpConfig);
  const [eventBooster, setEventBooster] = useState<'none' | 'certified' | 'certified-plus' | 'major'>('none');
  const [activeTab, setActiveTab] = useState<Tab>('results');

  // Calculate tournament results
  const calculation = useMemo(() => {
    if (players.length === 0 || results.length === 0) {
      return null;
    }
    return calculateTournamentResults(players, results, tgpConfig, eventBooster);
  }, [players, results, tgpConfig, eventBooster]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold">OPPR Demo</h1>
          <p className="text-blue-100 mt-2">Open Pinball Player Ranking System</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to the OPPR Demo!</h2>
          <p className="text-gray-600 text-sm">
            This demo showcases the Open Pinball Player Ranking System. Input a table of players
            with their ratings and rankings, configure tournament settings, and see how points are
            calculated and distributed. Use the tabs below to view results or compare different
            tournament formats.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setActiveTab('results')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'results'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tournament Results
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'comparison'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Format Comparison
            </button>
          </div>
        </div>

        {/* Terminology Guide */}
        <TerminologyGuide />

        {/* Input Section */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <TournamentConfig
            tgpConfig={tgpConfig}
            eventBooster={eventBooster}
            onTGPConfigChange={setTgpConfig}
            onEventBoosterChange={setEventBooster}
          />
          <PlayerInput players={players} onPlayersChange={setPlayers} />
        </div>

        {/* Results Input */}
        <div className="mb-8">
          <ResultsInput players={players} results={results} onResultsChange={setResults} />
        </div>

        {/* Tab Content */}
        {activeTab === 'results' ? (
          <>
            {/* Calculation Display */}
            <div className="mb-8">
              <CalculationDisplay calculation={calculation} />
            </div>

            {/* Points Distribution */}
            <div className="mb-8">
              <PointsDistribution calculation={calculation} maxRows={20} />
            </div>

            {/* Ratings Chart */}
            <div className="mb-8">
              <RatingsChart results={results} maxPlayers={10} />
            </div>
          </>
        ) : (
          /* Format Comparison */
          <div className="mb-8">
            <FormatComparison
              players={players}
              results={results}
              baseConfig={tgpConfig}
              eventBooster={eventBooster}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-sm">
              Open Pinball Player Ranking System (OPPR) - Demo Application
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Built with React, TypeScript, Tailwind CSS, and Recharts
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
