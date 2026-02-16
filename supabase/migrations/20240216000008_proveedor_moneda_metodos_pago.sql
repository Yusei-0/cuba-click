-- Migración: Relación Moneda-Métodos de Pago por Proveedor
-- Fecha: 2024-02-16
-- Descripción: Crea tabla para relacionar proveedores, monedas y métodos de pago

-- Crear tabla proveedor_moneda_metodos_pago
CREATE TABLE IF NOT EXISTS proveedor_moneda_metodos_pago (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proveedor_id UUID NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
    moneda VARCHAR(3) NOT NULL, -- CUP, USD, EUR, MLC
    metodo_pago_id UUID NOT NULL REFERENCES metodos_pago(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(proveedor_id, moneda, metodo_pago_id)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_proveedor_moneda_metodos_pago_proveedor 
    ON proveedor_moneda_metodos_pago(proveedor_id);

CREATE INDEX idx_proveedor_moneda_metodos_pago_moneda 
    ON proveedor_moneda_metodos_pago(moneda);

-- Migrar datos existentes de proveedor_metodos_pago
-- Asumimos USD como moneda por defecto para los métodos existentes
INSERT INTO proveedor_moneda_metodos_pago (proveedor_id, moneda, metodo_pago_id)
SELECT 
    proveedor_id,
    'USD' as moneda,
    metodo_pago_id
FROM proveedor_metodos_pago
ON CONFLICT (proveedor_id, moneda, metodo_pago_id) DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE proveedor_moneda_metodos_pago IS 
    'Relaciona proveedores con métodos de pago disponibles por moneda';

COMMENT ON COLUMN proveedor_moneda_metodos_pago.moneda IS 
    'Código de moneda (CUP, USD, EUR, MLC)';
