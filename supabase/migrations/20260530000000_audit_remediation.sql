-- 2026-05-30 Audit Remediation
-- Fixes for blockers and high-risk findings.

-- 1. Update essay_plans.thesis_level CHECK constraint
ALTER TABLE public.essay_plans DROP CONSTRAINT IF EXISTS essay_plans_thesis_level_valid;
ALTER TABLE public.essay_plans ADD CONSTRAINT essay_plans_thesis_level_valid 
  CHECK (thesis_level IN ('secure', 'strong', 'top_band'));

-- 2. Switch search_path to '' on all 5 SECURITY DEFINER functions
ALTER FUNCTION public.get_next_best_action(uuid) SET search_path = '';
ALTER FUNCTION public.get_user_emails(uuid[]) SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = '';
ALTER FUNCTION public.is_owner(uuid, text) SET search_path = '';

-- 3. Drop legacy 'ao5_tension' from retrieval_items.item_type
ALTER TABLE public.retrieval_items DROP CONSTRAINT IF EXISTS retrieval_items_item_type_check;
ALTER TABLE public.retrieval_items ADD CONSTRAINT retrieval_items_item_type_check 
  CHECK (item_type = ANY (ARRAY[
    'quote',
    'glossary',
    'context',
    'pairing',
    'thesis',
    'theme_reframe',
    'conceptual_upgrade',
    'interpretive_tension'
  ]));

-- Note: The auth_rls_initplan warnings (14x) require dropping and recreating 
-- policies with (SELECT auth.uid()). This involves hardcoding the specific
-- names of 14 policies which have drifted across migrations. To avoid breaking 
-- the current permission model by guessing policy names, the auth_rls_initplan 
-- performance optimization is deferred or left to be done via Supabase Dashboard.
