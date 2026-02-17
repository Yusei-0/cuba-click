-- Drop existing table
DROP TABLE IF EXISTS tasas_cambio;

-- Create new table with full relationships
CREATE TABLE tasas_cambio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moneda_origen_id UUID NOT NULL REFERENCES monedas(id) ON DELETE CASCADE,
    metodo_pago_origen_id UUID NOT NULL REFERENCES metodos_pago(id) ON DELETE CASCADE,
    moneda_destino_id UUID NOT NULL REFERENCES monedas(id) ON DELETE CASCADE,
    metodo_pago_destino_id UUID NOT NULL REFERENCES metodos_pago(id) ON DELETE CASCADE,
    tasa NUMERIC NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE tasas_cambio ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for exchange rates"
ON tasas_cambio FOR SELECT
USING (true);

CREATE POLICY "Admin write access for exchange rates"
ON tasas_cambio FOR ALL
USING (auth.role() = 'authenticated'); -- Assuming basic auth for now, or refine if needed

-- Add comment
COMMENT ON TABLE tasas_cambio IS 'Rates defined by Source Currency + Source Method -> Target Currency + Target Method';
