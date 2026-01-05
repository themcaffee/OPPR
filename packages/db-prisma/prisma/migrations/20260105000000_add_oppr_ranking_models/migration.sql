-- CreateEnum
CREATE TYPE "OpprRankingChangeType" AS ENUM ('INITIAL', 'TOURNAMENT_RESULT', 'RANKING_REFRESH', 'RD_DECAY', 'MANUAL_ADJUSTMENT');

-- CreateTable
CREATE TABLE "OpprPlayerRanking" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playerId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "ratingDeviation" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "lastRatingUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ranking" INTEGER,
    "isRated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OpprPlayerRanking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpprRankingHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opprPlayerRankingId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "ratingDeviation" DOUBLE PRECISION NOT NULL,
    "ranking" INTEGER,
    "isRated" BOOLEAN NOT NULL,
    "changeType" "OpprRankingChangeType" NOT NULL,
    "tournamentId" TEXT,
    "notes" VARCHAR(500),

    CONSTRAINT "OpprRankingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpprPlayerRanking_playerId_key" ON "OpprPlayerRanking"("playerId");

-- CreateIndex
CREATE INDEX "OpprPlayerRanking_playerId_idx" ON "OpprPlayerRanking"("playerId");

-- CreateIndex
CREATE INDEX "OpprPlayerRanking_rating_idx" ON "OpprPlayerRanking"("rating");

-- CreateIndex
CREATE INDEX "OpprPlayerRanking_ranking_idx" ON "OpprPlayerRanking"("ranking");

-- CreateIndex
CREATE INDEX "OpprPlayerRanking_isRated_idx" ON "OpprPlayerRanking"("isRated");

-- CreateIndex
CREATE INDEX "OpprRankingHistory_opprPlayerRankingId_idx" ON "OpprRankingHistory"("opprPlayerRankingId");

-- CreateIndex
CREATE INDEX "OpprRankingHistory_createdAt_idx" ON "OpprRankingHistory"("createdAt");

-- CreateIndex
CREATE INDEX "OpprRankingHistory_tournamentId_idx" ON "OpprRankingHistory"("tournamentId");

-- CreateIndex
CREATE INDEX "OpprRankingHistory_opprPlayerRankingId_createdAt_idx" ON "OpprRankingHistory"("opprPlayerRankingId", "createdAt");

-- AddForeignKey
ALTER TABLE "OpprPlayerRanking" ADD CONSTRAINT "OpprPlayerRanking_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpprRankingHistory" ADD CONSTRAINT "OpprRankingHistory_opprPlayerRankingId_fkey" FOREIGN KEY ("opprPlayerRankingId") REFERENCES "OpprPlayerRanking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpprRankingHistory" ADD CONSTRAINT "OpprRankingHistory_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate existing Player rating data to OpprPlayerRanking
INSERT INTO "OpprPlayerRanking" ("id", "createdAt", "updatedAt", "playerId", "rating", "ratingDeviation", "lastRatingUpdate", "ranking", "isRated")
SELECT
    gen_random_uuid()::text,
    NOW(),
    NOW(),
    "id",
    "rating",
    "ratingDeviation",
    "lastRatingUpdate",
    "ranking",
    "isRated"
FROM "Player";

-- Create initial history records for all migrated rankings
INSERT INTO "OpprRankingHistory" ("id", "createdAt", "opprPlayerRankingId", "rating", "ratingDeviation", "ranking", "isRated", "changeType", "notes")
SELECT
    gen_random_uuid()::text,
    NOW(),
    opr."id",
    opr."rating",
    opr."ratingDeviation",
    opr."ranking",
    opr."isRated",
    'INITIAL',
    'Migrated from Player model'
FROM "OpprPlayerRanking" opr;

-- Drop old indexes from Player table
DROP INDEX IF EXISTS "Player_rating_idx";
DROP INDEX IF EXISTS "Player_ranking_idx";

-- Remove old columns from Player table
ALTER TABLE "Player" DROP COLUMN "rating";
ALTER TABLE "Player" DROP COLUMN "ratingDeviation";
ALTER TABLE "Player" DROP COLUMN "ranking";
ALTER TABLE "Player" DROP COLUMN "isRated";
ALTER TABLE "Player" DROP COLUMN "lastRatingUpdate";
