/*
  Warnings:

  - You are about to drop the column `email` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the `TournamentResult` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MatchResult" AS ENUM ('WIN', 'LOSS', 'TIE');

-- DropForeignKey
ALTER TABLE "TournamentResult" DROP CONSTRAINT "TournamentResult_playerId_fkey";

-- DropForeignKey
ALTER TABLE "TournamentResult" DROP CONSTRAINT "TournamentResult_tournamentId_fkey";

-- DropIndex
DROP INDEX "Player_email_idx";

-- DropIndex
DROP INDEX "Player_email_key";

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "email";

-- DropTable
DROP TABLE "TournamentResult";

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT,
    "isFinals" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "roundId" TEXT,
    "number" INTEGER,
    "machineName" TEXT,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "matchId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "result" "MatchResult" NOT NULL,
    "position" INTEGER,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Standing" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isFinals" BOOLEAN NOT NULL DEFAULT false,
    "optedOut" BOOLEAN NOT NULL DEFAULT false,
    "linearPoints" DOUBLE PRECISION DEFAULT 0,
    "dynamicPoints" DOUBLE PRECISION DEFAULT 0,
    "totalPoints" DOUBLE PRECISION,
    "ageInDays" INTEGER DEFAULT 0,
    "decayMultiplier" DOUBLE PRECISION DEFAULT 1.0,
    "decayedPoints" DOUBLE PRECISION,
    "efficiency" DOUBLE PRECISION,

    CONSTRAINT "Standing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Round_tournamentId_idx" ON "Round"("tournamentId");

-- CreateIndex
CREATE INDEX "Round_tournamentId_isFinals_idx" ON "Round"("tournamentId", "isFinals");

-- CreateIndex
CREATE UNIQUE INDEX "Round_tournamentId_number_isFinals_key" ON "Round"("tournamentId", "number", "isFinals");

-- CreateIndex
CREATE INDEX "Match_tournamentId_idx" ON "Match"("tournamentId");

-- CreateIndex
CREATE INDEX "Match_roundId_idx" ON "Match"("roundId");

-- CreateIndex
CREATE INDEX "Entry_matchId_idx" ON "Entry"("matchId");

-- CreateIndex
CREATE INDEX "Entry_playerId_idx" ON "Entry"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Entry_matchId_playerId_key" ON "Entry"("matchId", "playerId");

-- CreateIndex
CREATE INDEX "Standing_playerId_idx" ON "Standing"("playerId");

-- CreateIndex
CREATE INDEX "Standing_tournamentId_idx" ON "Standing"("tournamentId");

-- CreateIndex
CREATE INDEX "Standing_tournamentId_isFinals_idx" ON "Standing"("tournamentId", "isFinals");

-- CreateIndex
CREATE INDEX "Standing_position_idx" ON "Standing"("position");

-- CreateIndex
CREATE UNIQUE INDEX "Standing_playerId_tournamentId_isFinals_key" ON "Standing"("playerId", "tournamentId", "isFinals");

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Standing" ADD CONSTRAINT "Standing_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Standing" ADD CONSTRAINT "Standing_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
