-- Migration: Add subdomain support to portfolios
-- Based on current schema analysis from backup 20250713_172333

-- 1. Add subdomain column to portfolios table
ALTER TABLE public.portfolios 
ADD COLUMN subdomain TEXT;

-- 2. Create unique constraint for subdomain
ALTER TABLE public.portfolios 
ADD CONSTRAINT portfolios_subdomain_key UNIQUE (subdomain);

-- 3. Create index for fast subdomain lookups
CREATE INDEX idx_portfolios_subdomain ON public.portfolios(subdomain);

-- 4. Update RLS policy to allow public access via subdomain
CREATE POLICY "Published portfolios viewable by subdomain" ON public.portfolios
  FOR SELECT USING (is_published = true AND subdomain IS NOT NULL);

-- 5. Function to generate unique subdomain
CREATE OR REPLACE FUNCTION public.generate_unique_subdomain(input_subdomain TEXT)
RETURNS TEXT AS $$
DECLARE
  base_subdomain TEXT;
  final_subdomain TEXT;
  counter INTEGER := 1;
BEGIN
  -- Clean input subdomain: lowercase, alphanumeric + hyphens only
  base_subdomain := lower(regexp_replace(input_subdomain, '[^a-z0-9-]+', '', 'g'));
  base_subdomain := trim(both '-' from base_subdomain);
  
  -- Ensure it's not empty, fallback to 'portfolio'
  IF base_subdomain = '' OR length(base_subdomain) < 3 THEN
    base_subdomain := 'portfolio';
  END IF;
  
  -- Ensure max length of 63 characters (DNS limitation)
  base_subdomain := left(base_subdomain, 60);
  
  final_subdomain := base_subdomain;
  
  -- Check if subdomain exists and increment if needed
  WHILE EXISTS (SELECT 1 FROM public.portfolios WHERE subdomain = final_subdomain) LOOP
    final_subdomain := base_subdomain || counter;
    counter := counter + 1;
    
    -- Prevent infinite loop
    IF counter > 9999 THEN
      final_subdomain := base_subdomain || '-' || extract(epoch from now())::bigint;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_subdomain;
END;
$$ LANGUAGE plpgsql;

-- 6. Add comment for documentation
COMMENT ON COLUMN public.portfolios.subdomain IS 'Unique subdomain for portfolio access (e.g., username.folyx.me)';

-- 7. Optional: Update existing portfolios with generated subdomains (if any exist)
-- Uncomment the following if you want to auto-generate subdomains for existing portfolios:
/*
UPDATE public.portfolios 
SET subdomain = generate_unique_subdomain(
  COALESCE(
    regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'),
    'portfolio-' || substring(id::text, 1, 8)
  )
)
WHERE subdomain IS NULL;
*/