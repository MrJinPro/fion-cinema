-- Исправление предупреждений безопасности для функций
CREATE OR REPLACE FUNCTION update_collection_total_items()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.curated_collections 
  SET total_items = (
    SELECT COUNT(*) 
    FROM public.collection_items 
    WHERE collection_id = COALESCE(NEW.collection_id, OLD.collection_id)
  )
  WHERE id = COALESCE(NEW.collection_id, OLD.collection_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;