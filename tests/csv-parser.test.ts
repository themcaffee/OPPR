import { describe, it, expect } from 'vitest';
import { parsePlayerCSV, ValidationError } from '../src/index.js';
import type { ParsePlayerCSVOptions } from '../src/index.js';

describe('parsePlayerCSV', () => {
  const validCSV = `"Name","ID","Rank","Rating","Base points","Rating points","Rank points","Points"
"Alice Johnson",1001,1000,1500.5,0.5,0.1,0.05,0.65
"Bob Smith",1002,2000,1400.0,0.5,0,0,0.5
"Charlie Davis",1003,3000,1300.25,0.5,0.05,0,0.55`;

  describe('with useRankingData: true (default)', () => {
    it('should parse valid CSV with ranking data', () => {
      const result = parsePlayerCSV(validCSV);

      expect(result).toHaveLength(3);

      // Check first player
      expect(result[0].name).toBe('Alice Johnson');
      expect(result[0].player.id).toBe('1001');
      expect(result[0].player.rating).toBe(1500.5);
      expect(result[0].player.ranking).toBe(1000);
      expect(result[0].player.isRated).toBe(true);
      expect(result[0].player.eventCount).toBe(5);
      expect(result[0].player.ratingDeviation).toBe(100);

      // Check second player
      expect(result[1].name).toBe('Bob Smith');
      expect(result[1].player.id).toBe('1002');
      expect(result[1].player.rating).toBe(1400.0);
      expect(result[1].player.ranking).toBe(2000);

      // Check third player
      expect(result[2].name).toBe('Charlie Davis');
      expect(result[2].player.id).toBe('1003');
      expect(result[2].player.rating).toBe(1300.25);
      expect(result[2].player.ranking).toBe(3000);
    });

    it('should parse CSV with explicit useRankingData: true', () => {
      const options: ParsePlayerCSVOptions = { useRankingData: true };
      const result = parsePlayerCSV(validCSV, options);

      expect(result).toHaveLength(3);
      expect(result[0].player.rating).toBe(1500.5);
      expect(result[0].player.ranking).toBe(1000);
      expect(result[0].player.isRated).toBe(true);
    });

    it('should handle CSV with extra trailing columns', () => {
      const csvWithExtra = `"Name","ID","Rank","Rating","Extra1","Extra2","Extra3","Extra4","Extra5"
"Alice Johnson",1001,1000,1500.5,0.5,0.1,0.05,0.65,999`;

      const result = parsePlayerCSV(csvWithExtra);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice Johnson');
    });

    it('should handle CSV with trailing empty line', () => {
      const csvWithTrailingLine = validCSV + '\n';
      const result = parsePlayerCSV(csvWithTrailingLine);

      expect(result).toHaveLength(3);
    });

    it('should handle CSV with multiple trailing empty lines', () => {
      const csvWithTrailingLines = validCSV + '\n\n\n';
      const result = parsePlayerCSV(csvWithTrailingLines);

      expect(result).toHaveLength(3);
    });

    it('should handle CSV with whitespace in fields', () => {
      const csvWithWhitespace = `"Name","ID","Rank","Rating"
"  Alice Johnson  ",  1001  ,  1000  ,  1500.5  `;

      const result = parsePlayerCSV(csvWithWhitespace);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice Johnson');
      expect(result[0].player.id).toBe('1001');
    });

    it('should handle escaped quotes in names', () => {
      const csvWithQuotes = `"Name","ID","Rank","Rating"
"Alice ""The Wizard"" Johnson",1001,1000,1500.5`;

      const result = parsePlayerCSV(csvWithQuotes);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice "The Wizard" Johnson');
    });

    it('should handle commas in quoted names', () => {
      const csvWithCommas = `"Name","ID","Rank","Rating"
"Johnson, Alice",1001,1000,1500.5`;

      const result = parsePlayerCSV(csvWithCommas);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Johnson, Alice');
    });

    it('should throw for missing name (column 0)', () => {
      const csvMissingName = `"Name","ID","Rank","Rating"
"",1001,1000,1500.5`;

      expect(() => parsePlayerCSV(csvMissingName)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvMissingName)).toThrow('Name is required');
    });

    it('should throw for missing ID (column 1)', () => {
      const csvMissingID = `"Name","ID","Rank","Rating"
"Alice Johnson","",1000,1500.5`;

      expect(() => parsePlayerCSV(csvMissingID)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvMissingID)).toThrow('Player ID is required');
    });

    it('should throw for missing ranking when using ranking data (column 2)', () => {
      const csvMissingRanking = `"Name","ID","Rank","Rating"
"Alice Johnson",1001,"",1500.5`;

      expect(() => parsePlayerCSV(csvMissingRanking)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvMissingRanking)).toThrow(
        'Ranking is required when using ranking data'
      );
    });

    it('should throw for missing rating when using ranking data (column 3)', () => {
      const csvMissingRating = `"Name","ID","Rank","Rating"
"Alice Johnson",1001,1000,""`;

      expect(() => parsePlayerCSV(csvMissingRating)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvMissingRating)).toThrow(
        'Rating is required when using ranking data'
      );
    });

    it('should throw for invalid ranking value', () => {
      const csvInvalidRanking = `"Name","ID","Rank","Rating"
"Alice Johnson",1001,invalid,1500.5`;

      expect(() => parsePlayerCSV(csvInvalidRanking)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvInvalidRanking)).toThrow('Invalid ranking value');
    });

    it('should throw for invalid rating value', () => {
      const csvInvalidRating = `"Name","ID","Rank","Rating"
"Alice Johnson",1001,1000,invalid`;

      expect(() => parsePlayerCSV(csvInvalidRating)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvInvalidRating)).toThrow('Invalid rating value');
    });

    it('should throw for negative ranking', () => {
      const csvNegativeRanking = `"Name","ID","Rank","Rating"
"Alice Johnson",1001,-1,1500.5`;

      expect(() => parsePlayerCSV(csvNegativeRanking)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvNegativeRanking)).toThrow('Invalid ranking value');
    });

    it('should throw for negative rating', () => {
      const csvNegativeRating = `"Name","ID","Rank","Rating"
"Alice Johnson",1001,1000,-1`;

      expect(() => parsePlayerCSV(csvNegativeRating)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvNegativeRating)).toThrow('Invalid rating value');
    });

    it('should throw for duplicate player IDs', () => {
      const csvDuplicateIDs = `"Name","ID","Rank","Rating"
"Alice Johnson",1001,1000,1500.5
"Bob Smith",1001,2000,1400.0`;

      expect(() => parsePlayerCSV(csvDuplicateIDs)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvDuplicateIDs)).toThrow('Duplicate player ID: 1001');
    });
  });

  describe('with useRankingData: false', () => {
    it('should parse CSV ignoring ranking data and use defaults', () => {
      const options: ParsePlayerCSVOptions = { useRankingData: false };
      const result = parsePlayerCSV(validCSV, options);

      expect(result).toHaveLength(3);

      // Check that default values are used
      expect(result[0].name).toBe('Alice Johnson');
      expect(result[0].player.id).toBe('1001');
      expect(result[0].player.rating).toBe(1200); // default
      expect(result[0].player.ranking).toBe(999999); // default
      expect(result[0].player.isRated).toBe(false);
      expect(result[0].player.eventCount).toBe(0);

      expect(result[1].player.rating).toBe(1200);
      expect(result[1].player.ranking).toBe(999999);
    });

    it('should use custom default rating', () => {
      const options: ParsePlayerCSVOptions = {
        useRankingData: false,
        defaultRating: 1350,
      };
      const result = parsePlayerCSV(validCSV, options);

      expect(result[0].player.rating).toBe(1350);
      expect(result[1].player.rating).toBe(1350);
    });

    it('should use custom default ranking', () => {
      const options: ParsePlayerCSVOptions = {
        useRankingData: false,
        defaultRanking: 500000,
      };
      const result = parsePlayerCSV(validCSV, options);

      expect(result[0].player.ranking).toBe(500000);
      expect(result[1].player.ranking).toBe(500000);
    });

    it('should use both custom defaults', () => {
      const options: ParsePlayerCSVOptions = {
        useRankingData: false,
        defaultRating: 1350,
        defaultRanking: 500000,
      };
      const result = parsePlayerCSV(validCSV, options);

      expect(result[0].player.rating).toBe(1350);
      expect(result[0].player.ranking).toBe(500000);
    });

    it('should still extract name and ID correctly', () => {
      const options: ParsePlayerCSVOptions = { useRankingData: false };
      const result = parsePlayerCSV(validCSV, options);

      expect(result[0].name).toBe('Alice Johnson');
      expect(result[0].player.id).toBe('1001');
      expect(result[1].name).toBe('Bob Smith');
      expect(result[1].player.id).toBe('1002');
    });

    it('should still throw for missing name', () => {
      const csvMissingName = `"Name","ID","Rank","Rating"
"",1001,1000,1500.5`;

      const options: ParsePlayerCSVOptions = { useRankingData: false };
      expect(() => parsePlayerCSV(csvMissingName, options)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvMissingName, options)).toThrow('Name is required');
    });

    it('should still throw for missing ID', () => {
      const csvMissingID = `"Name","ID","Rank","Rating"
"Alice Johnson","",1000,1500.5`;

      const options: ParsePlayerCSVOptions = { useRankingData: false };
      expect(() => parsePlayerCSV(csvMissingID, options)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvMissingID, options)).toThrow('Player ID is required');
    });

    it('should still throw for duplicate IDs', () => {
      const csvDuplicateIDs = `"Name","ID","Rank","Rating"
"Alice Johnson",1001,1000,1500.5
"Bob Smith",1001,2000,1400.0`;

      const options: ParsePlayerCSVOptions = { useRankingData: false };
      expect(() => parsePlayerCSV(csvDuplicateIDs, options)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvDuplicateIDs, options)).toThrow('Duplicate player ID: 1001');
    });
  });

  describe('edge cases and errors', () => {
    it('should throw for empty CSV', () => {
      expect(() => parsePlayerCSV('')).toThrow(ValidationError);
      expect(() => parsePlayerCSV('')).toThrow('CSV data is empty');
    });

    it('should throw for CSV with only whitespace', () => {
      expect(() => parsePlayerCSV('   \n  \n  ')).toThrow(ValidationError);
      expect(() => parsePlayerCSV('   \n  \n  ')).toThrow('CSV data is empty');
    });

    it('should throw for CSV with only header', () => {
      const headerOnly = '"Name","ID","Rank","Rating"';
      expect(() => parsePlayerCSV(headerOnly)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(headerOnly)).toThrow('CSV contains no data rows');
    });

    it('should throw for CSV with only header and empty lines', () => {
      const headerOnly = '"Name","ID","Rank","Rating"\n\n\n';
      expect(() => parsePlayerCSV(headerOnly)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(headerOnly)).toThrow('CSV contains no data rows');
    });

    it('should throw for row with too few columns', () => {
      const csvTooFewCols = `"Name","ID","Rank","Rating"
"Alice Johnson",1001,1000`;

      expect(() => parsePlayerCSV(csvTooFewCols)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvTooFewCols)).toThrow('Expected at least 4 columns');
    });

    it('should throw for row with only 3 columns', () => {
      const csvThreeCols = `"Name","ID","Rank","Rating"
"Alice Johnson",1001,1000`;

      expect(() => parsePlayerCSV(csvThreeCols)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvThreeCols)).toThrow('Expected at least 4 columns, got 3');
    });

    it('should throw for row with only 2 columns', () => {
      const csvTwoCols = `"Name","ID","Rank","Rating"
"Alice Johnson",1001`;

      expect(() => parsePlayerCSV(csvTwoCols)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvTwoCols)).toThrow('Expected at least 4 columns, got 2');
    });

    it('should throw for row with only 1 column', () => {
      const csvOneCol = `"Name","ID","Rank","Rating"
"Alice Johnson"`;

      expect(() => parsePlayerCSV(csvOneCol)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvOneCol)).toThrow('Expected at least 4 columns, got 1');
    });

    it('should include line number in error messages', () => {
      const csvWithError = `"Name","ID","Rank","Rating"
"Alice Johnson",1001,1000,1500.5
"Bob Smith",1002,invalid,1400.0`;

      expect(() => parsePlayerCSV(csvWithError)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvWithError)).toThrow('Line 3:');
    });

    it('should handle error on first data line', () => {
      const csvWithError = `"Name","ID","Rank","Rating"
"Alice Johnson","",1000,1500.5`;

      expect(() => parsePlayerCSV(csvWithError)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvWithError)).toThrow('Line 2:');
    });

    it('should handle error on last data line', () => {
      const csvWithError = `"Name","ID","Rank","Rating"
"Alice Johnson",1001,1000,1500.5
"Bob Smith",1002,2000,1400.0
"Charlie Davis","",3000,1300.25`;

      expect(() => parsePlayerCSV(csvWithError)).toThrow(ValidationError);
      expect(() => parsePlayerCSV(csvWithError)).toThrow('Line 4:');
    });
  });

  describe('real-world example data', () => {
    it('should parse the example clipboard data format', () => {
      const exampleCSV = `"Name","ID","Rank","Rating","Base points","Rating points","Rank points","Points"
"Adrienne Schroeder",51150,24124,1173.23,0.5,0,0,0.5
"Becx Shipper",130318,23130,1114.98,0.5,0,0,0.5
"Brenna Bechtold",44966,5705,1364.52,0.5,0.04,0,0.54`;

      const result = parsePlayerCSV(exampleCSV);

      expect(result).toHaveLength(3);

      expect(result[0].name).toBe('Adrienne Schroeder');
      expect(result[0].player.id).toBe('51150');
      expect(result[0].player.ranking).toBe(24124);
      expect(result[0].player.rating).toBe(1173.23);

      expect(result[1].name).toBe('Becx Shipper');
      expect(result[1].player.id).toBe('130318');
      expect(result[1].player.ranking).toBe(23130);
      expect(result[1].player.rating).toBe(1114.98);

      expect(result[2].name).toBe('Brenna Bechtold');
      expect(result[2].player.id).toBe('44966');
      expect(result[2].player.ranking).toBe(5705);
      expect(result[2].player.rating).toBe(1364.52);
    });
  });
});
