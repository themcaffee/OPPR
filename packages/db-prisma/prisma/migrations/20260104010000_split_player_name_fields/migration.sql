-- Split the single "name" field into firstName, middleInitial, lastName

-- Step 1: Add new columns as nullable
ALTER TABLE "Player" ADD COLUMN "firstName" TEXT;
ALTER TABLE "Player" ADD COLUMN "middleInitial" TEXT;
ALTER TABLE "Player" ADD COLUMN "lastName" TEXT;

-- Step 2: Migrate existing data
-- For names with spaces: first word -> firstName, last word -> lastName
-- For names without spaces: entire name -> firstName, "Player" -> lastName
-- For NULL names: "Unknown" -> firstName, "Player" -> lastName
UPDATE "Player" SET
  "firstName" = CASE
    WHEN "name" IS NULL OR TRIM("name") = '' THEN 'Unknown'
    WHEN POSITION(' ' IN TRIM("name")) = 0 THEN TRIM("name")
    ELSE SPLIT_PART(TRIM("name"), ' ', 1)
  END,
  "lastName" = CASE
    WHEN "name" IS NULL OR TRIM("name") = '' THEN 'Player'
    WHEN POSITION(' ' IN TRIM("name")) = 0 THEN 'Player'
    ELSE TRIM(SUBSTRING(TRIM("name") FROM LENGTH(TRIM("name")) - POSITION(' ' IN REVERSE(TRIM("name"))) + 2))
  END;

-- Step 3: Make firstName and lastName NOT NULL
ALTER TABLE "Player" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "Player" ALTER COLUMN "lastName" SET NOT NULL;

-- Step 4: Drop the old name column
ALTER TABLE "Player" DROP COLUMN "name";
