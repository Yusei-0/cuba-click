-- Migration: Set RLS Policies

-- 1. Enable RLS on all tables
ALTER TABLE public.provincias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.costos_envio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monedas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metodos_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedor_metodos_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedor_monedas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalles_pedido ENABLE ROW LEVEL SECURITY;

-- 2. Define Policies

-- ========================================================
-- CATALOGS (Public Read, Admin Write)
-- ========================================================

-- Provincias
CREATE POLICY "Public Read Provincias" ON public.provincias FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin All Provincias" ON public.provincias FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Municipios
CREATE POLICY "Public Read Municipios" ON public.municipios FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin All Municipios" ON public.municipios FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Categorias
CREATE POLICY "Public Read Categorias" ON public.categorias FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin All Categorias" ON public.categorias FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Proveedores
CREATE POLICY "Public Read Proveedores" ON public.proveedores FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin All Proveedores" ON public.proveedores FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Productos
-- Public can only see active products
CREATE POLICY "Public Read Active Productos" ON public.productos FOR SELECT TO anon, authenticated USING (activo = true);
-- Admin can see/edit all
CREATE POLICY "Admin All Productos" ON public.productos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Costos Envio
CREATE POLICY "Public Read Costos Envio" ON public.costos_envio FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin All Costos Envio" ON public.costos_envio FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Monedas & Metodos Pago
CREATE POLICY "Public Read Monedas" ON public.monedas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin All Monedas" ON public.monedas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Metodos Pago" ON public.metodos_pago FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin All Metodos Pago" ON public.metodos_pago FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Pivot Tables (Proveedor relationships)
CREATE POLICY "Public Read Proveedor Metodos" ON public.proveedor_metodos_pago FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin All Proveedor Metodos" ON public.proveedor_metodos_pago FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Proveedor Monedas" ON public.proveedor_monedas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin All Proveedor Monedas" ON public.proveedor_monedas FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ========================================================
-- ORDERS (Public Insert, Admin All)
-- ========================================================

-- Pedidos
-- Allow anyone (guest) to create an order
CREATE POLICY "Public Insert Pedidos" ON public.pedidos FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Only Admin can view/edit/delete orders
CREATE POLICY "Admin All Pedidos" ON public.pedidos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Detalles Pedido
-- Allow anyone (guest) to add details to an order
CREATE POLICY "Public Insert Detalles" ON public.detalles_pedido FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Only Admin can view/edit/delete details
CREATE POLICY "Admin All Detalles" ON public.detalles_pedido FOR ALL TO authenticated USING (true) WITH CHECK (true);
