-- Migration: Backfill Category Slugs
-- Description: Updates existing categories that have a null slug by generating one from the name.

UPDATE public.categorias 
SET slug = lower(
    regexp_replace(
        regexp_replace(
            unaccent(nombre), 
            '[^a-zA-Z0-9\s-]', '', 'g' -- Remove special chars
        ),
        '\s+', '-', 'g' -- Replace spaces with dashes
    )
)
WHERE slug IS NULL OR slug = '';
