import type { CreateResultInput } from '../../src/results.js';

/**
 * Creates a result input object with default values
 */
export function createResultInput(
  playerId: string,
  tournamentId: string,
  overrides: Partial<Omit<CreateResultInput, 'playerId' | 'tournamentId'>> = {},
): CreateResultInput {
  return {
    playerId,
    tournamentId,
    position: 1,
    optedOut: false,
    linearPoints: 50,
    dynamicPoints: 50,
    totalPoints: 100,
    efficiency: 0.95,
    ...overrides,
  };
}

/**
 * Creates multiple result inputs for batch operations
 */
export function createManyResultInputs(
  players: { id: string }[],
  tournamentId: string,
  overridesFn?: (index: number, playerId: string) => Partial<Omit<CreateResultInput, 'playerId' | 'tournamentId'>>,
): CreateResultInput[] {
  return players.map((player, index) => {
    const overrides = overridesFn ? overridesFn(index, player.id) : {};
    return createResultInput(player.id, tournamentId, {
      position: index + 1,
      totalPoints: 100 - index * 10,
      linearPoints: 50 - index * 5,
      dynamicPoints: 50 - index * 5,
      efficiency: 0.95 - index * 0.05,
      ...overrides,
    });
  });
}
