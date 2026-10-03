-- Keep scene videos optional for cases that only have a photo or no media.
ALTER TABLE "cases" ADD COLUMN "video_url" TEXT;
