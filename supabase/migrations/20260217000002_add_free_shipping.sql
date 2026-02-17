-- Add envio_gratis column to products table
ALTER TABLE public.productos ADD COLUMN envio_gratis BOOLEAN DEFAULT FALSE;

-- Update RLS policies if necessary (usually unrelated to column addition if policies are on table level)
-- Existing policies for productos allow read for everyone and write for admin, which covers this new column.
