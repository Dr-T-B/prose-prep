-- Drop the FK from timed_sessions.plan_id to the now-empty saved_essay_plans table.
-- Stage 0.5 reconciled saved_essay_plans -> essay_plans and emptied the legacy table;
-- this FK now points at a permanently empty table and rejects any new timed-session
-- insert that carries a real plan_id from essay_plans.
--
-- The column itself stays (existing rows preserved); it becomes a soft uuid
-- reference until Stage 2 either repoints it to essay_plans(client_plan_id)
-- or removes the column entirely.
ALTER TABLE timed_sessions DROP CONSTRAINT IF EXISTS timed_sessions_plan_id_fkey;
