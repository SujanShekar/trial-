-- Store the species selected for ABC entries without requiring an Animal record.
ALTER TABLE "abc_records" ADD COLUMN "animal_type" TEXT;
