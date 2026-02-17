-- Migración: Sistema de Tasas de Cambio
-- Fecha: 2026-02-16
-- Descripción: Crea tabla tasas_cambio y agrega referencia en proveedor_moneda_metodos_pago

-- 1. Crear tabla tasas_cambio
CREATE TABLE IF NOT EXISTS tasas_cambio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL, -- Ej: "Efectivo", "Transferencia", "Zelle"
    moneda_origen VARCHAR(3) NOT NULL DEFAULT 'USD',
    moneda_destino VARCHAR(3) NOT NULL DEFAULT 'CUP',
    tasa NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar tasas iniciales configurales (Base: valor de 1 Unidad de Moneda Origen en Moneda Destino/CUP)
INSERT INTO tasas_cambio (nombre, moneda_origen, moneda_destino, tasa) VALUES
('Efectivo', 'USD', 'CUP', 500.00),
('Transferencia', 'USD', 'CUP', 540.00),
('Zelle', 'USD', 'CUP', 495.63),
('Clásica', 'USD', 'CUP', 485.41);

-- 2. Agregar columna tasa_cambio_id a proveedor_moneda_metodos_pago
ALTER TABLE proveedor_moneda_metodos_pago 
ADD COLUMN IF NOT EXISTS tasa_cambio_id UUID REFERENCES tasas_cambio(id) ON DELETE SET NULL;

-- 3. Crear índices
CREATE INDEX IF NOT EXISTS idx_proveedor_moneda_metodos_tasa ON proveedor_moneda_metodos_pago(tasa_cambio_id);

-- 4. Comentarios
COMMENT ON TABLE tasas_cambio IS 'Configuración global de tasas de cambio para conversión de monedas';
COMMENT ON COLUMN proveedor_moneda_metodos_pago.tasa_cambio_id IS 'Referencia a la tasa de cambio a utilizar para este método de pago';
