-- Migration: Simplify Category Names
-- Description: Renames verbose categories to simpler names to match user expectations and URL slugs.
-- Note: This assumes the 'generate_slug' trigger or similar logic will handle slug updates, 
-- or we update slugs manually to match.

-- 1. Celulares Smartphones -> Celulares
UPDATE public.categorias 
SET nombre = 'Celulares', slug = 'celulares' 
WHERE nombre = 'Celulares Smartphones';

-- 2. Muebles (Camas, Sofás) -> Muebles
UPDATE public.categorias 
SET nombre = 'Muebles', slug = 'muebles' 
WHERE nombre = 'Muebles (Camas, Sofás)';

-- 3. Componentes (Discos, RAM) -> Componentes
UPDATE public.categorias 
SET nombre = 'Componentes', slug = 'componentes' 
WHERE nombre = 'Componentes (Discos, RAM)';

-- 4. Bocinas y Audio Portátil -> Audio
-- Check collision first, if 'Audio' doesn't exist.
UPDATE public.categorias 
SET nombre = 'Audio', slug = 'audio' 
WHERE nombre = 'Bocinas y Audio Portátil';

-- 5. Accesorios para Autos -> Autos
UPDATE public.categorias 
SET nombre = 'Autos', slug = 'autos' 
WHERE nombre = 'Accesorios para Autos';

-- 6. Lavado y Limpieza -> Limpieza
UPDATE public.categorias 
SET nombre = 'Limpieza', slug = 'limpieza' 
WHERE nombre = 'Lavado y Limpieza';

-- 7. Pantalones y Jeans Hombre -> Pantalones
-- Be careful with gender. "Pantalones" implies general. 
-- If 'Zapatos Hombre' exists, maybe keep gender? 
-- User said "ponerlos en un solo nombre" (put in a single name).
-- Let's stick to the obvious ones first.

-- Fix 'Zapatos Hombre' -> 'Zapatos' (COLLISION RISK with 'Zapatos Mujer')
-- If we want generic categories, we might need to merge them, but that's complex (updating foreign keys).
-- For now, let's keep Gendered items unless user specifies otherwise, 
-- or rename to 'Zapatos (H)' / 'Zapatos (M)'? No, user wants simple.
-- Le's leave Zapatos/Bicicletas for now to avoid unique constraint errors.
