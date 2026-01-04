import type { CreateStandingInput } from '../../src/standings.js';

/**
 * Creates a standing input object with default values
 */
export function createStandingInput(
  playerId: string,
  tournamentId: string,
  overrides: Partial<Omit<CreateStandingInput, 'playerId' | 'tournamentId'>> = {},
): CreateStandingInput {
  return {
    playerId,
    tournamentId,
    position: 1,
    isFinals: false,
    optedOut: false,
    linearPoints: 50,
    dynamicPoints: 50,
    totalPoints: 100,
    efficiency: 0.95,
    ...overrides,
  };
}

/**
 * Creates multiple standing inputs for batch operations
 */
export function createManyStandingInputs(
  players: { id: string }[],
  tournamentId: string,
  overridesFn?: (index: number, playerId: string) => Partial<Omit<CreateStandingInput, 'playerId' | 'tournamentId'>>,
): CreateStandingInput[] {
  return players.map((player, index) => {
    const overrides = overridesFn ? overridesFn(index, player.id) : {};
    return createStandingInput(player.id, tournamentId, {
      position: index + 1,
      totalPoints: 100 - index * 10,
      linearPoints: 50 - index * 5,
      dynamicPoints: 50 - index * 5,
      efficiency: 0.95 - index * 0.05,
      ...overrides,
    });
  });
}
