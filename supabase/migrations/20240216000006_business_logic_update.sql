-- Add currency to products (default to USD for existing ones)
ALTER TABLE "public"."productos" 
ADD COLUMN "moneda" text NOT NULL DEFAULT 'USD';

-- Add customer ID to orders
ALTER TABLE "public"."pedidos" 
ADD COLUMN "cliente_ci" text;

-- Create table for product-specific delivery locations
-- If a product has NO entries in this table, it is available in ALL locations
-- If it has entries, it is ONLY available in those locations
CREATE TABLE "public"."producto_municipios" (
    "producto_id" uuid NOT NULL REFERENCES "public"."productos"("id") ON DELETE CASCADE,
    "municipio_id" uuid NOT NULL REFERENCES "public"."municipios"("id") ON DELETE CASCADE,
    CONSTRAINT "producto_municipios_pkey" PRIMARY KEY ("producto_id", "municipio_id")
);

-- Enable RLS
ALTER TABLE "public"."producto_municipios" ENABLE ROW LEVEL SECURITY;

-- Policies for producto_municipios
-- Everyone can read
CREATE POLICY "Enable read for all users" ON "public"."producto_municipios"
    FOR SELECT USING (true);

-- Only authenticated users (admins/providers) can insert/update/delete
-- Assuming 'authenticated' role is sufficient for now, or stricter if needed
CREATE POLICY "Enable insert for authenticated users" ON "public"."producto_municipios"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON "public"."producto_municipios"
    FOR DELETE USING (auth.role() = 'authenticated');
