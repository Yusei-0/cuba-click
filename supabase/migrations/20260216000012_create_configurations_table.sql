-- Create configurations table
CREATE TABLE IF NOT EXISTS configuraciones (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE configuraciones ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for configurations"
ON configuraciones FOR SELECT
USING (true);

CREATE POLICY "Admin write access for configurations"
ON configuraciones FOR ALL
USING (auth.role() = 'authenticated');

-- Insert default base currency config if not exists
INSERT INTO configuraciones (key, value, description)
VALUES (
    'base_exchange_source',
    '{"moneda_id": "", "metodo_pago_id": ""}'::jsonb,
    'Defines the base currency and payment method for exchange rate calculations.'
) ON CONFLICT (key) DO NOTHING;
