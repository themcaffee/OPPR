-- DropForeignKey
ALTER TABLE "Entry" DROP CONSTRAINT "Entry_matchId_fkey";

-- DropForeignKey
ALTER TABLE "Entry" DROP CONSTRAINT "Entry_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_roundId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_tournamentId_fkey";

-- DropForeignKey
ALTER TABLE "Round" DROP CONSTRAINT "Round_tournamentId_fkey";

-- DropTable
DROP TABLE "Entry";

-- DropTable
DROP TABLE "Match";

-- DropTable
DROP TABLE "Round";

-- DropEnum
DROP TYPE "MatchResult";
