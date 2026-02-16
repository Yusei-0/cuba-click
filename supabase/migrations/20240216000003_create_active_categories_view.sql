-- Create a view to filter categories that have at least one product
CREATE OR REPLACE VIEW active_categories AS
SELECT DISTINCT c.*
FROM categorias c
JOIN productos p ON c.id = p.categoria_id;

-- Grant access to the view (if using RLS, you might need specific policies, 
-- but views usually inherit permissions of the underlying tables or the view owner depending on configuration)
-- For public read access:
GRANT SELECT ON active_categories TO anon, authenticated, service_role;
