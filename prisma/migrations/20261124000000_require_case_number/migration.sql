-- Run `npx tsx prisma/backfill-case-numbers.ts` after the preceding nullable
-- migration and before applying this migration.
ALTER TABLE "cases" ALTER COLUMN "case_number" SET NOT NULL;
