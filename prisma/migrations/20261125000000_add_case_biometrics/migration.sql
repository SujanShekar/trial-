ALTER TABLE "cases"
  ADD COLUMN "nose_video_url" TEXT,
  ADD COLUMN "body_video_url" TEXT,
  ADD COLUMN "biometric_status" TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN "biometric_metadata" JSONB,
  ADD COLUMN "biometric_error" TEXT,
  ADD COLUMN "biometric_attempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "biometric_updated_at" TIMESTAMP(3);
CREATE INDEX "cases_biometric_status_idx" ON "cases"("biometric_status");
