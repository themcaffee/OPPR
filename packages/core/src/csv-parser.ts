import { validatePlayer, ValidationError } from './validators.js';
import type { Player } from './types.js';

/**
 * Options for parsing player CSV data
 */
export interface ParsePlayerCSVOptions {
  /** Use ranking and rating data from CSV (columns 2-3), or use defaults */
  useRankingData?: boolean;
  /** Default rating to use when not using ranking data (default: 1200) */
  defaultRating?: number;
  /** Default ranking to use when not using ranking data (default: 999999) */
  defaultRanking?: number;
}

/**
 * Parsed player data including both Player object and name
 */
export interface ParsedPlayer {
  /** Player object for OPPR calculations */
  player: Player;
  /** Player name from CSV */
  name: string;
}

/**
 * Parses a CSV row handling quoted fields and escaped quotes
 *
 * @param row - CSV row string
 * @returns Array of field values
 */
function parseCSVRow(row: string): string[] {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Add the last field
  fields.push(currentField);

  return fields;
}

/**
 * Parses player data from CSV format
 *
 * Expected CSV format (first line is header and will be skipped):
 * - Column 0: Name
 * - Column 1: Player ID
 * - Column 2: Ranking
 * - Column 3: Rating
 * - Columns 4-7: Ignored
 *
 * @param csvText - CSV text to parse
 * @param options - Parsing options
 * @returns Array of parsed players with names
 * @throws ValidationError if CSV is invalid or players fail validation
 */
export function parsePlayerCSV(
  csvText: string,
  options: ParsePlayerCSVOptions = {}
): ParsedPlayer[] {
  const { useRankingData = true, defaultRating = 1200, defaultRanking = 999999 } = options;

  // Split into lines and filter out empty lines
  const lines = csvText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new ValidationError('CSV data is empty');
  }

  // Skip the first line (header)
  const dataLines = lines.slice(1);

  if (dataLines.length === 0) {
    throw new ValidationError('CSV contains no data rows');
  }

  const parsedPlayers: ParsedPlayer[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < dataLines.length; i++) {
    const lineNumber = i + 2; // +2 because we skipped header and arrays are 0-indexed
    const line = dataLines[i];

    try {
      const fields = parseCSVRow(line);

      // Validate minimum number of columns
      if (fields.length < 4) {
        throw new ValidationError(
          `Line ${lineNumber}: Expected at least 4 columns, got ${fields.length}`
        );
      }

      const name = fields[0].trim();
      const idStr = fields[1].trim();
      const rankingStr = fields[2].trim();
      const ratingStr = fields[3].trim();

      // Validate required fields are present
      if (!name) {
        throw new ValidationError(`Line ${lineNumber}: Name is required (column 0)`);
      }

      if (!idStr) {
        throw new ValidationError(`Line ${lineNumber}: Player ID is required (column 1)`);
      }

      // Parse ID (convert to string)
      const id = idStr;

      // Check for duplicate IDs
      if (seenIds.has(id)) {
        throw new ValidationError(`Line ${lineNumber}: Duplicate player ID: ${id}`);
      }
      seenIds.add(id);

      let rating: number;
      let ranking: number;
      let isRated: boolean;
      let eventCount: number;

      if (useRankingData) {
        // Validate and parse ranking
        if (!rankingStr) {
          throw new ValidationError(
            `Line ${lineNumber}: Ranking is required when using ranking data (column 2)`
          );
        }

        ranking = parseFloat(rankingStr);
        if (isNaN(ranking) || ranking < 0) {
          throw new ValidationError(`Line ${lineNumber}: Invalid ranking value: ${rankingStr}`);
        }

        // Validate and parse rating
        if (!ratingStr) {
          throw new ValidationError(
            `Line ${lineNumber}: Rating is required when using ranking data (column 3)`
          );
        }

        rating = parseFloat(ratingStr);
        if (isNaN(rating) || rating < 0) {
          throw new ValidationError(`Line ${lineNumber}: Invalid rating value: ${ratingStr}`);
        }

        // When using ranking data, assume player is rated
        isRated = true;
        eventCount = 5;
      } else {
        // Use defaults
        rating = defaultRating;
        ranking = defaultRanking;
        isRated = false;
        eventCount = 0;
      }

      const player: Player = {
        id,
        ranking,
        isRated,
        eventCount,
        ratings: {
          // Using type assertion for Glicko-specific ratingDeviation property
          glicko: {
            value: rating,
            ratingDeviation: 100,
          } as { value: number; ratingDeviation: number },
        },
      };

      // Validate the player object
      validatePlayer(player);

      parsedPlayers.push({
        player,
        name,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Line ${lineNumber}: Failed to parse - ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return parsedPlayers;
}
