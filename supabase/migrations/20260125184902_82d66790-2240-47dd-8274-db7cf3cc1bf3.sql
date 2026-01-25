-- Update the property type check constraint to include Duplex
ALTER TABLE public.properties DROP CONSTRAINT properties_type_check;

ALTER TABLE public.properties ADD CONSTRAINT properties_type_check 
CHECK (type = ANY (ARRAY['Studio'::text, 'Apartment'::text, 'Penthouse'::text, 'House'::text, 'Villa'::text, 'Duplex'::text]));