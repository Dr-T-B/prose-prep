-- Migrate stranded rows from saved_essay_plans (legacy persist path) into
-- essay_plans (canonical hybrid path). Skip rows without a user_id (anonymous
-- saves are not portable into essay_plans, which has NOT NULL user_id).
-- Idempotent: WHERE NOT EXISTS guards against duplicate runs.

INSERT INTO essay_plans (
  user_id,
  client_plan_id,
  question_id,
  family,
  route_id,
  thesis_level,
  thesis_id,
  selected_quote_ids,
  paragraph_cards,
  interpretive_extension_enabled,
  selected_interpretive_extension_ids,
  is_current,
  created_at,
  updated_at
)
SELECT
  s.user_id,
  s.id::text                                            AS client_plan_id,
  s.question_id,
  s.family,
  s.route_id,
  COALESCE(s.thesis_level, 'strong')                    AS thesis_level,
  s.thesis_id,
  to_jsonb(COALESCE(s.selected_quote_ids, ARRAY[]::text[])) AS selected_quote_ids,
  s.paragraph_cards,
  s.interpretive_extension_enabled,
  to_jsonb(COALESCE(s.selected_interpretive_extension_ids, ARRAY[]::text[])) AS selected_interpretive_extension_ids,
  false                                                 AS is_current,
  s.created_at,
  s.updated_at
FROM saved_essay_plans s
WHERE s.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM essay_plans e
    WHERE e.user_id = s.user_id AND e.client_plan_id = s.id::text
  );

-- Empty the source table but keep the schema; Stage 2 drops the table.
-- DELETE (not TRUNCATE / DROP) because timed_sessions.plan_id has a FK to
-- saved_essay_plans.id ON DELETE SET NULL — TRUNCATE is blocked by the FK,
-- whereas DELETE lets the FK quietly null out historical plan_id references
-- without losing the timed_sessions rows. Keeping the table itself preserves
-- RLS and avoids 404s from in-flight client writes during the rollout window.
DELETE FROM saved_essay_plans;
