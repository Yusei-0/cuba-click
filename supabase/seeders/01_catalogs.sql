-- Seeder: Catalogs (Provinces, Municipalities, Currencies, Payment Methods, Categories)

-- 1. Provinces
INSERT INTO public.provincias (nombre) VALUES 
('La Habana')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Municipalities (Linked to La Habana)
DO $$
DECLARE
    habana_id UUID;
BEGIN
    SELECT id INTO habana_id FROM public.provincias WHERE nombre = 'La Habana';

    IF habana_id IS NOT NULL THEN
        INSERT INTO public.municipios (provincia_id, nombre) VALUES
        (habana_id, 'Playa'),
        (habana_id, 'Plaza de la Revolución'),
        (habana_id, 'Centro Habana'),
        (habana_id, 'La Habana Vieja'),
        (habana_id, 'Regla'),
        (habana_id, 'La Habana del Este'), 
        (habana_id, 'Guanabacoa'),
        (habana_id, 'San Miguel del Padrón'),
        (habana_id, 'Diez de Octubre'),
        (habana_id, 'Cerro'),
        (habana_id, 'Marianao'),
        (habana_id, 'La Lisa'),
        (habana_id, 'Boyeros'),
        (habana_id, 'Arroyo Naranjo'),
        (habana_id, 'Cotorro')
        ON CONFLICT (provincia_id, nombre) DO NOTHING;
    END IF;
END $$;

-- 3. Currencies
INSERT INTO public.monedas (codigo, simbolo) VALUES
('CUP', 'CUP'),
('USD', 'USD'),
('MLC', 'MLC')
ON CONFLICT (codigo) DO NOTHING;

-- 4. Payment Methods
INSERT INTO public.metodos_pago (nombre) VALUES
('Efectivo'),
('Transferencia'),
('Clasica'),
('Zelle')
ON CONFLICT (nombre) DO NOTHING;

-- 5. Categories (Comprehensive Hierarchy)
DO $$
DECLARE
    -- Level 1 IDs
    p_electronica UUID;
    p_electrodomesticos UUID;
    p_ropa UUID;
    p_hogar UUID;
    p_transporte UUID;
    p_alimentos UUID;
    p_automotriz UUID;
    
    -- Level 2 IDs (Reusable)
    p_telefonos UUID;
    p_computacion UUID;
    p_tv_audio UUID;
    p_climatizacion UUID;
    p_cocina UUID;
    p_lavado UUID;
    p_ropa_hombre UUID;
    p_ropa_mujer UUID;
    p_motos UUID;
BEGIN
    -- =============================================
    -- 1. ELECTRONICA Y TECNOLOGIA
    -- =============================================
    INSERT INTO public.categorias (nombre) VALUES ('Electrónica y Tecnología') ON CONFLICT(nombre) DO UPDATE SET nombre=EXCLUDED.nombre RETURNING id INTO p_electronica;
    
        -- 1.1 Telefonía
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Celulares y Telefonía', p_electronica) ON CONFLICT(nombre) DO UPDATE SET parent_id=EXCLUDED.parent_id RETURNING id INTO p_telefonos;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Celulares Smartphones', p_telefonos) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Teléfonos Fijos', p_telefonos) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Accesorios para Celulares', p_telefonos) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Smartwatches', p_telefonos) ON CONFLICT(nombre) DO NOTHING;

        -- 1.2 Computación
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Computación', p_electronica) ON CONFLICT(nombre) DO UPDATE SET parent_id=EXCLUDED.parent_id RETURNING id INTO p_computacion;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Laptops', p_computacion) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Tablets', p_computacion) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('PC de Escritorio', p_computacion) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Monitores', p_computacion) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Componentes (Discos, RAM)', p_computacion) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Impresoras y Escáneres', p_computacion) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Periféricos (Teclados, Mouse)', p_computacion) ON CONFLICT(nombre) DO NOTHING;

        -- 1.3 TV y Audio
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('TV y Audio', p_electronica) ON CONFLICT(nombre) DO UPDATE SET parent_id=EXCLUDED.parent_id RETURNING id INTO p_tv_audio;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Televisores', p_tv_audio) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Bocinas y Audio Portátil', p_tv_audio) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Audífonos', p_tv_audio) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('TV Box y Streaming', p_tv_audio) ON CONFLICT(nombre) DO NOTHING;

    -- =============================================
    -- 2. ELECTRODOMESTICOS
    -- =============================================
    INSERT INTO public.categorias (nombre) VALUES ('Electrodomésticos') ON CONFLICT(nombre) DO UPDATE SET nombre=EXCLUDED.nombre RETURNING id INTO p_electrodomesticos;

        -- 2.1 Climatización
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Climatización', p_electrodomesticos) ON CONFLICT(nombre) DO UPDATE SET parent_id=EXCLUDED.parent_id RETURNING id INTO p_climatizacion;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Aires Acondicionados (Split)', p_climatizacion) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Ventiladores', p_climatizacion) ON CONFLICT(nombre) DO NOTHING;

        -- 2.2 Cocina
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Cocina', p_electrodomesticos) ON CONFLICT(nombre) DO UPDATE SET parent_id=EXCLUDED.parent_id RETURNING id INTO p_cocina;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Ollas Reina y Arroceras', p_cocina) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Batidoras y Licuadoras', p_cocina) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Cafeteras', p_cocina) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Cocinas de Gas/Eléctricas', p_cocina) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Microwave y Hornos', p_cocina) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Refrigeradores y Freezers', p_cocina) ON CONFLICT(nombre) DO NOTHING;

        -- 2.3 Lavado
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Lavado y Limpieza', p_electrodomesticos) ON CONFLICT(nombre) DO UPDATE SET parent_id=EXCLUDED.parent_id RETURNING id INTO p_lavado;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Lavadoras', p_lavado) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Secadoras', p_lavado) ON CONFLICT(nombre) DO NOTHING;

    -- =============================================
    -- 3. ROPA Y MODA
    -- =============================================
    INSERT INTO public.categorias (nombre) VALUES ('Ropa y Moda') ON CONFLICT(nombre) DO UPDATE SET nombre=EXCLUDED.nombre RETURNING id INTO p_ropa;

        -- 3.1 Hombre
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Hombre', p_ropa) ON CONFLICT(nombre) DO UPDATE SET parent_id=EXCLUDED.parent_id RETURNING id INTO p_ropa_hombre;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Pantalones y Jeans Hombre', p_ropa_hombre) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Camisas y Pullovers Hombre', p_ropa_hombre) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Zapatos Hombre', p_ropa_hombre) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Ropa Interior Hombre', p_ropa_hombre) ON CONFLICT(nombre) DO NOTHING;

        -- 3.2 Mujer
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Mujer', p_ropa) ON CONFLICT(nombre) DO UPDATE SET parent_id=EXCLUDED.parent_id RETURNING id INTO p_ropa_mujer;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Vestidos y Faldas', p_ropa_mujer) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Blusas y Tops', p_ropa_mujer) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Pantalones y Jeans Mujer', p_ropa_mujer) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Zapatos Mujer', p_ropa_mujer) ON CONFLICT(nombre) DO NOTHING;
            INSERT INTO public.categorias (nombre, parent_id) VALUES ('Bolsos y Carteras', p_ropa_mujer) ON CONFLICT(nombre) DO NOTHING;

        -- 3.3 Infantil
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Niños y Bebés', p_ropa) ON CONFLICT(nombre) DO NOTHING;

    -- =============================================
    -- 4. TRANSPORTE
    -- =============================================
    INSERT INTO public.categorias (nombre) VALUES ('Transporte y Movilidad') ON CONFLICT(nombre) DO UPDATE SET nombre=EXCLUDED.nombre RETURNING id INTO p_transporte;
    
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Motos Eléctricas', p_transporte) ON CONFLICT(nombre) DO UPDATE SET parent_id=EXCLUDED.parent_id RETURNING id INTO p_motos;
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Bicicletas Eléctricas', p_transporte) ON CONFLICT(nombre) DO NOTHING;
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Bicicletas', p_transporte) ON CONFLICT(nombre) DO NOTHING;
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Piezas de Moto/Bici', p_transporte) ON CONFLICT(nombre) DO NOTHING;
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Baterías y Accesorios', p_transporte) ON CONFLICT(nombre) DO NOTHING;

    -- =============================================
    -- 5. HOGAR Y MUEBLES
    -- =============================================
    INSERT INTO public.categorias (nombre) VALUES ('Hogar y Muebles') ON CONFLICT(nombre) DO UPDATE SET nombre=EXCLUDED.nombre RETURNING id INTO p_hogar;
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Muebles (Camas, Sofás)', p_hogar) ON CONFLICT(nombre) DO NOTHING;
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Colchones', p_hogar) ON CONFLICT(nombre) DO NOTHING;
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Decoración', p_hogar) ON CONFLICT(nombre) DO NOTHING;
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Ferretería y Herramientas', p_hogar) ON CONFLICT(nombre) DO NOTHING;
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Materiales de Construcción', p_hogar) ON CONFLICT(nombre) DO NOTHING;

    -- =============================================
    -- 6. AUTOMOTRIZ
    -- =============================================
    INSERT INTO public.categorias (nombre) VALUES ('Automotriz') ON CONFLICT(nombre) DO UPDATE SET nombre=EXCLUDED.nombre RETURNING id INTO p_automotriz;
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Piezas de Autos', p_automotriz) ON CONFLICT(nombre) DO NOTHING;
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Accesorios para Autos', p_automotriz) ON CONFLICT(nombre) DO NOTHING;
        INSERT INTO public.categorias (nombre, parent_id) VALUES ('Neumáticos', p_automotriz) ON CONFLICT(nombre) DO NOTHING;

END $$;
