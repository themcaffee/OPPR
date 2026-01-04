-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_externalId_key" ON "Location"("externalId");

-- CreateIndex
CREATE INDEX "Location_externalId_idx" ON "Location"("externalId");

-- CreateIndex
CREATE INDEX "Location_name_idx" ON "Location"("name");

-- CreateIndex
CREATE INDEX "Location_city_idx" ON "Location"("city");

-- AlterTable: Add new columns to Tournament
ALTER TABLE "Tournament" ADD COLUMN "description" VARCHAR(2000);
ALTER TABLE "Tournament" ADD COLUMN "locationId" TEXT;
ALTER TABLE "Tournament" ADD COLUMN "organizerId" TEXT;

-- DropColumn: Remove old location string column (replaced by Location relation)
ALTER TABLE "Tournament" DROP COLUMN IF EXISTS "location";

-- CreateIndex for new Tournament columns
CREATE INDEX "Tournament_locationId_idx" ON "Tournament"("locationId");

CREATE INDEX "Tournament_organizerId_idx" ON "Tournament"("organizerId");

-- AddForeignKey: Tournament -> Location
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Tournament -> Player (organizer)
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
