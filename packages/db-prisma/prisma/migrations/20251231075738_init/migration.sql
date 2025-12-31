-- CreateEnum
CREATE TYPE "EventBoosterType" AS ENUM ('NONE', 'CERTIFIED', 'CERTIFIED_PLUS', 'CHAMPIONSHIP_SERIES', 'MAJOR');

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "externalId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "ratingDeviation" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "ranking" INTEGER,
    "isRated" BOOLEAN NOT NULL DEFAULT false,
    "eventCount" INTEGER NOT NULL DEFAULT 0,
    "lastRatingUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEventDate" TIMESTAMP(3),

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "tgpConfig" JSONB,
    "eventBooster" "EventBoosterType" NOT NULL DEFAULT 'NONE',
    "allowsOptOut" BOOLEAN NOT NULL DEFAULT false,
    "baseValue" DOUBLE PRECISION,
    "tvaRating" DOUBLE PRECISION,
    "tvaRanking" DOUBLE PRECISION,
    "totalTVA" DOUBLE PRECISION,
    "tgp" DOUBLE PRECISION,
    "eventBoosterMultiplier" DOUBLE PRECISION,
    "firstPlaceValue" DOUBLE PRECISION,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentResult" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playerId" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "optedOut" BOOLEAN NOT NULL DEFAULT false,
    "linearPoints" DOUBLE PRECISION DEFAULT 0,
    "dynamicPoints" DOUBLE PRECISION DEFAULT 0,
    "totalPoints" DOUBLE PRECISION,
    "ageInDays" INTEGER DEFAULT 0,
    "decayMultiplier" DOUBLE PRECISION DEFAULT 1.0,
    "decayedPoints" DOUBLE PRECISION,
    "efficiency" DOUBLE PRECISION,

    CONSTRAINT "TournamentResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_externalId_key" ON "Player"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");

-- CreateIndex
CREATE INDEX "Player_email_idx" ON "Player"("email");

-- CreateIndex
CREATE INDEX "Player_externalId_idx" ON "Player"("externalId");

-- CreateIndex
CREATE INDEX "Player_rating_idx" ON "Player"("rating");

-- CreateIndex
CREATE INDEX "Player_ranking_idx" ON "Player"("ranking");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_externalId_key" ON "Tournament"("externalId");

-- CreateIndex
CREATE INDEX "Tournament_date_idx" ON "Tournament"("date");

-- CreateIndex
CREATE INDEX "Tournament_eventBooster_idx" ON "Tournament"("eventBooster");

-- CreateIndex
CREATE INDEX "Tournament_externalId_idx" ON "Tournament"("externalId");

-- CreateIndex
CREATE INDEX "TournamentResult_playerId_idx" ON "TournamentResult"("playerId");

-- CreateIndex
CREATE INDEX "TournamentResult_tournamentId_idx" ON "TournamentResult"("tournamentId");

-- CreateIndex
CREATE INDEX "TournamentResult_position_idx" ON "TournamentResult"("position");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentResult_playerId_tournamentId_key" ON "TournamentResult"("playerId", "tournamentId");

-- AddForeignKey
ALTER TABLE "TournamentResult" ADD CONSTRAINT "TournamentResult_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentResult" ADD CONSTRAINT "TournamentResult_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
