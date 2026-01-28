-- POLICY: Permitir todo a usuarios autenticados (Admin)
-- PRECAUCIÓN: Esto asume que TODOS los usuarios autenticados son administradores.
-- En un sistema más complejo, deberías verificar un rol específico.

-- Habilitar RLS en todas las tablas importantes si no está habilitado (ya lo hiciste en el script inicial)
ALTER TABLE IF EXISTS public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.detalles_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.costos_envio ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.monedas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.metodos_pago ENABLE ROW LEVEL SECURITY;

-- Borrar políticas existentes si es necesario para evitar conflictos (opcional, pero limpio)
-- DROP POLICY IF EXISTS "Admin ALL pedidos" ON public.pedidos;

-- 1. PEDIDOS
CREATE POLICY "Admin ALL pedidos" 
ON public.pedidos 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 2. DETALLES PEDIDO
CREATE POLICY "Admin ALL detalles_pedido" 
ON public.detalles_pedido 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. PRODUCTOS
-- Actualmente hay política pública de lectura. Añadimos escritura para admin.
CREATE POLICY "Admin ALL productos" 
ON public.productos 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 4. CATEGORIAS, PROVEEDORES, MUNICIPIOS, ETC
CREATE POLICY "Admin ALL categorias" ON public.categorias FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin ALL proveedores" ON public.proveedores FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin ALL municipios" ON public.municipios FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin ALL costos_envio" ON public.costos_envio FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin ALL monedas" ON public.monedas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin ALL metodos_pago" ON public.metodos_pago FOR ALL TO authenticated USING (true) WITH CHECK (true);
