-- Migration: Add tracking code to orders
-- Description: Adds a unique tracking code column to pedidos table for order tracking

-- Add codigo_tracking column
ALTER TABLE pedidos 
ADD COLUMN codigo_tracking VARCHAR(8) UNIQUE;

-- Create index for fast lookups
CREATE INDEX idx_pedidos_codigo_tracking ON pedidos(codigo_tracking);

-- Add comment
COMMENT ON COLUMN pedidos.codigo_tracking IS 'Código único de 8 caracteres para rastrear el pedido (ej: A3B7K9M2)';
