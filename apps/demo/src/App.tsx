import { useState, useMemo } from 'react';
import type { TGPConfig } from '@oppr/core';
import { PlayerInput } from './components/PlayerInput';
import { TournamentConfig } from './components/TournamentConfig';
import { ResultsInput } from './components/ResultsInput';
import { CalculationDisplay } from './components/CalculationDisplay';
import { PointsDistribution } from './components/PointsDistribution';
import { RatingsChart } from './components/RatingsChart';
import { FormatComparison } from './components/FormatComparison';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import TerminologyGuide from './components/TerminologyGuide';
import type { PlayerWithName, PlayerResultWithName } from './utils/calculations';
import { calculateTournamentResults } from './utils/calculations';
import { exampleTournaments, generatePlayerNames } from './data/examples';

type TabType = 'demo' | 'config' | 'format-comparison';

function App() {
  // Initialize with local tournament example
  const initialPlayers = useMemo(() => {
    const names = generatePlayerNames(exampleTournaments.local.players.length);
    return exampleTournaments.local.players.map((p, i) => ({
      ...p,
      name: names[i],
    }));
  }, []);

  const [activeTab, setActiveTab] = useState<TabType>('demo');
  const [players, setPlayers] = useState<PlayerWithName[]>(initialPlayers);
  const [results, setResults] = useState<PlayerResultWithName[]>([]);
  const [tgpConfig, setTgpConfig] = useState<TGPConfig>(exampleTournaments.local.tgpConfig);
  const [eventBooster, setEventBooster] = useState<'none' | 'certified' | 'certified-plus' | 'major'>('none');

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
        {/* Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('demo')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'demo'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tournament Demo
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'config'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Configuration
            </button>
            <button
              onClick={() => setActiveTab('format-comparison')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'format-comparison'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Format Comparison
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'demo' && (
          <>
            <div className="mb-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to the OPPR Demo!</h2>
              <p className="text-gray-600 text-sm">
                This demo showcases the Open Pinball Player Ranking System. Input a table of players
                with their ratings and rankings, configure tournament settings, and see how points are
                calculated and distributed.
              </p>
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

            {/* Tournament Results */}
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
        )}

        {activeTab === 'config' && (
          <div className="mb-8">
            <ConfigurationPanel />
          </div>
        )}

        {activeTab === 'format-comparison' && (
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
            <p className="text-xs mt-3">
              <a
                href="https://github.com/themcaffee/OPPR"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors underline"
              >
                View on GitHub
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
