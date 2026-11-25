ALTER TABLE "cases" ADD COLUMN "case_number" TEXT;
CREATE UNIQUE INDEX "cases_case_number_key" ON "cases"("case_number");
