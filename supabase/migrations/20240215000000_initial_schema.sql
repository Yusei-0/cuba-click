-- Initial Schema Migration

-- 0. Extensions
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable Unaccent for slug generation
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 1. Locations
CREATE TABLE IF NOT EXISTS public.provincias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.municipios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provincia_id UUID NOT NULL REFERENCES public.provincias(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    UNIQUE(provincia_id, nombre)
);

-- 2. Catalog
CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE, -- URL friendly name (e.g. 'ropa-y-moda')
    parent_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL
);

-- Function to Generate Slug triggered on insert/update
CREATE OR REPLACE FUNCTION public.generate_slug() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        -- Convert to lowercase, remove accents, replace non-alphanumeric with dash
        NEW.slug := lower(
            regexp_replace(
                regexp_replace(
                    unaccent(NEW.nombre), 
                    '[^a-zA-Z0-9\s-]', '', 'g' -- Remove special chars
                ),
                '\s+', '-', 'g' -- Replace spaces with dashes
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Categories
CREATE TRIGGER trigger_generate_category_slug
BEFORE INSERT OR UPDATE ON public.categorias
FOR EACH ROW
EXECUTE FUNCTION public.generate_slug();


CREATE TABLE IF NOT EXISTS public.proveedores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    contacto TEXT,
    activo BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.productos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio_costo NUMERIC(10, 2) NOT NULL DEFAULT 0,
    precio_final NUMERIC(10, 2) NOT NULL DEFAULT 0,
    foto_url TEXT,
    garantia_dias INTEGER DEFAULT 0,
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE CASCADE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.costos_envio (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    proveedor_id UUID NOT NULL REFERENCES public.proveedores(id) ON DELETE CASCADE,
    municipio_id UUID NOT NULL REFERENCES public.municipios(id) ON DELETE CASCADE,
    costo NUMERIC(10, 2) NOT NULL DEFAULT 0,
    UNIQUE(proveedor_id, municipio_id)
);

-- 3. Finance
CREATE TABLE IF NOT EXISTS public.monedas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo TEXT NOT NULL UNIQUE,
    simbolo TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.metodos_pago (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.proveedor_metodos_pago (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    proveedor_id UUID NOT NULL REFERENCES public.proveedores(id) ON DELETE CASCADE,
    metodo_pago_id UUID NOT NULL REFERENCES public.metodos_pago(id) ON DELETE CASCADE,
    UNIQUE(proveedor_id, metodo_pago_id)
);

CREATE TABLE IF NOT EXISTS public.proveedor_monedas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    proveedor_id UUID NOT NULL REFERENCES public.proveedores(id) ON DELETE CASCADE,
    moneda_id UUID NOT NULL REFERENCES public.monedas(id) ON DELETE CASCADE,
    UNIQUE(proveedor_id, moneda_id)
);

-- 4. Orders
CREATE TABLE IF NOT EXISTS public.pedidos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cliente_nombre TEXT NOT NULL,
    cliente_telefono TEXT NOT NULL,
    municipio_id UUID REFERENCES public.municipios(id) ON DELETE SET NULL,
    direccion_detalle TEXT NOT NULL,
    moneda_id UUID REFERENCES public.monedas(id) ON DELETE SET NULL,
    metodo_pago_id UUID REFERENCES public.metodos_pago(id) ON DELETE SET NULL,
    proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE SET NULL,
    total_productos NUMERIC(10, 2) DEFAULT 0,
    total_envio NUMERIC(10, 2) DEFAULT 0,
    estado TEXT DEFAULT 'pendiente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.detalles_pedido (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES public.productos(id) ON DELETE SET NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- 5. Storage (Products Bucket)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access to products bucket
CREATE POLICY "Public Access Products" ON storage.objects 
FOR SELECT USING ( bucket_id = 'products' );

-- Policy to allow authenticated users to upload to products bucket
CREATE POLICY "Authenticated Insert Products" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK ( bucket_id = 'products' );

-- Policy to allow authenticated users to update files in products bucket
CREATE POLICY "Authenticated Update Products" ON storage.objects 
FOR UPDATE TO authenticated 
USING ( bucket_id = 'products' );

-- Policy to allow authenticated users to delete files in products bucket
CREATE POLICY "Authenticated Delete Products" ON storage.objects 
FOR DELETE TO authenticated 
USING ( bucket_id = 'products' );


-- 6. Functions (Advanced Logic)

-- Function: Get products by category slug (recursive)
-- Usage: SELECT * FROM get_products_by_category_slug('ropa')
CREATE OR REPLACE FUNCTION public.get_products_by_category_slug(slug_input TEXT)
RETURNS TABLE (
    id UUID,
    nombre TEXT,
    descripcion TEXT,
    precio_costo NUMERIC,
    precio_final NUMERIC,
    foto_url TEXT,
    garantia_dias INTEGER,
    categoria_id UUID,
    proveedor_id UUID,
    activo BOOLEAN,
    created_at TIMESTAMPTZ,
    categoria_nombre TEXT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE category_tree AS (
        -- Base case: The requested category
        SELECT c.id, c.nombre
        FROM public.categorias c
        WHERE c.slug = slug_input
        
        UNION ALL
        
        -- Recursive step: All subcategories
        SELECT c.id, c.nombre
        FROM public.categorias c
        INNER JOIN category_tree ct ON c.parent_id = ct.id
    )
    SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio_costo,
        p.precio_final,
        p.foto_url,
        p.garantia_dias,
        p.categoria_id,
        p.proveedor_id,
        p.activo,
        p.created_at,
        c.nombre as categoria_nombre
    FROM public.productos p
    JOIN category_tree c ON p.categoria_id = c.id
    WHERE p.activo = true;
END;
$$;
