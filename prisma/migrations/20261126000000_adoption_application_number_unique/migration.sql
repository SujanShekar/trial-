WITH duplicates AS (
  SELECT id, app_number, row_number() OVER (PARTITION BY app_number ORDER BY created_at, id) AS n
  FROM adoption_applications
)
UPDATE adoption_applications a
SET app_number = a.app_number || '-' || d.n
FROM duplicates d
WHERE a.id = d.id AND d.n > 1;

CREATE UNIQUE INDEX "adoption_applications_app_number_key" ON "adoption_applications"("app_number");
