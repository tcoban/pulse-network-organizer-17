-- Remove duplicate contacts based on email, keeping the oldest one for each email
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at ASC) as row_num
  FROM contacts
)
DELETE FROM contacts 
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);

-- Add unique constraint on email to prevent future duplicates
ALTER TABLE contacts ADD CONSTRAINT contacts_email_unique UNIQUE (email);

-- Update the RLS policies to ensure they work with the unique constraint
-- (No changes needed, existing policies are sufficient)