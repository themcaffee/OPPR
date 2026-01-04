-- AlterTable
-- First add playerNumber as nullable, populate it, then make it required
ALTER TABLE "Player" ADD COLUMN "playerNumber" INTEGER;

-- Populate existing players with unique 5-digit player numbers
-- Use a sequence starting from 10000, incrementing for each existing row
WITH numbered_players AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") + 9999 AS num
  FROM "Player"
)
UPDATE "Player"
SET "playerNumber" = numbered_players.num::INTEGER
FROM numbered_players
WHERE "Player".id = numbered_players.id;

-- Make the column required and add unique constraint
ALTER TABLE "Player" ALTER COLUMN "playerNumber" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Player_playerNumber_key" ON "Player"("playerNumber");

-- CreateIndex
CREATE INDEX "Player_playerNumber_idx" ON "Player"("playerNumber");
