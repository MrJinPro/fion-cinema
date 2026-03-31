-- RPC helper for curated collections population without exposing service-role key.
-- This function replaces items for a curated collection identified by its slug.

CREATE OR REPLACE FUNCTION public.replace_collection_items_by_slug(
  collection_slug text,
  items jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_collection_id uuid;
  v_len integer;
BEGIN
  SELECT id
  INTO v_collection_id
  FROM public.curated_collections
  WHERE slug = collection_slug
    AND is_active = true
  LIMIT 1;

  IF v_collection_id IS NULL THEN
    RAISE EXCEPTION 'Collection not found: %', collection_slug;
  END IF;

  IF items IS NULL OR jsonb_typeof(items) <> 'array' THEN
    RAISE EXCEPTION 'items must be a JSON array';
  END IF;

  v_len := jsonb_array_length(items);
  IF v_len > 300 THEN
    RAISE EXCEPTION 'too many items: % (max 300)', v_len;
  END IF;

  DELETE FROM public.collection_items
  WHERE collection_id = v_collection_id;

  INSERT INTO public.collection_items (
    collection_id,
    tmdb_id,
    media_type,
    position,
    curator_note
  )
  SELECT
    v_collection_id,
    (elem->>'tmdb_id')::integer,
    COALESCE(elem->>'media_type', 'movie'),
    (elem->>'position')::integer,
    elem->>'curator_note'
  FROM jsonb_array_elements(items) AS elem;
END;
$$;

GRANT EXECUTE ON FUNCTION public.replace_collection_items_by_slug(text, jsonb) TO anon, authenticated;
