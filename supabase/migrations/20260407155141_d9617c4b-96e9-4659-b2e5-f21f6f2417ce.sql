-- Remove anonymous SELECT on share_links — access must go through resolve_share_link RPC only
DROP POLICY IF EXISTS "Anonymous users can view their own share links" ON public.share_links;
DROP POLICY IF EXISTS "Anyone can view share links by slug" ON public.share_links;