-- Nullify invalid tasa_cambio_id references to prevent constraint violation
UPDATE proveedor_moneda_metodos_pago
SET tasa_cambio_id = NULL
WHERE tasa_cambio_id IS NOT NULL
AND tasa_cambio_id NOT IN (SELECT id FROM tasas_cambio);

-- Add foreign key relationship between proveedor_moneda_metodos_pago and tasas_cambio
ALTER TABLE proveedor_moneda_metodos_pago
ADD CONSTRAINT fk_proveedor_moneda_metodos_pago_tasas_cambio
FOREIGN KEY (tasa_cambio_id)
REFERENCES tasas_cambio(id)
ON DELETE SET NULL;
