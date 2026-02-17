-- Allow anonymous users to view orders (needed for INSERT ... RETURNING and Order Confirmation)
-- Note: This allows public read access to orders. In a production app with sensitive data, 
-- you would restrict this to the user who created it (via session or similar).
DROP POLICY IF EXISTS "Public Read Pedidos" ON "public"."pedidos";
CREATE POLICY "Public Read Pedidos" ON "public"."pedidos"
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Read Detalles Pedido" ON "public"."detalles_pedido";
CREATE POLICY "Public Read Detalles Pedido" ON "public"."detalles_pedido"
FOR SELECT TO anon, authenticated USING (true);

-- Ensure Insert is also open (just in case)
DROP POLICY IF EXISTS "Public Insert Pedidos" ON "public"."pedidos";
CREATE POLICY "Public Insert Pedidos" ON "public"."pedidos"
FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public Insert Detalles" ON "public"."detalles_pedido";
CREATE POLICY "Public Insert Detalles" ON "public"."detalles_pedido"
FOR INSERT TO anon, authenticated WITH CHECK (true);
