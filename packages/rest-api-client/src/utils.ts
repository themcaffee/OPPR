/**
 * Constructs full display name from name parts
 */
export function formatPlayerName(player: {
  firstName: string;
  middleInitial?: string | null;
  lastName: string;
}): string {
  const parts = [player.firstName];
  if (player.middleInitial) {
    parts.push(player.middleInitial.endsWith('.') ? player.middleInitial : `${player.middleInitial}.`);
  }
  parts.push(player.lastName);
  return parts.join(' ');
}
