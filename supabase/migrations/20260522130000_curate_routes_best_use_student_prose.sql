-- Forward-only data-curation migration: replace raw comma-separated family-tag
-- slug lists in public.routes.best_use with student-facing prose for the
-- Builder "Why this fits" panel (rendered in src/pages/EssayBuilder.tsx).
--
-- Scope (narrow): only the six routes referenced by currently-active questions
-- in the four supported Builder families (childhood, class, guilt, imagination):
--   route-class, route-systems, route-guilt, route-narrative,
--   route-imagination, route-perception.
-- route-gender is intentionally not touched (referenced only by the inactive
-- gender family; out of scope per the Builder Stabilisation remit).
--
-- Style target: Pearson Edexcel A-Level English Literature Component 2: Prose,
-- focused on Hard Times and Atonement, A/A* register, prose rather than tags.
--
-- Non-destructive:
--   * no schema change
--   * no RLS change
--   * no type regeneration
--   * no DELETE / DROP / TRUNCATE
--   * no active/inactive question-family status change
--
-- Idempotent: each UPDATE is gated with `best_use IS DISTINCT FROM` the new
-- prose, so re-application is a no-op rather than a re-write.
--
-- Audit trail (pre-curation values, captured 2026-05-22):
--   route-class       : 'class, critique_of_society, crime, marriage, independence, difficult_circumstances'
--   route-systems     : 'settings, industrialism, difficult_circumstances, conflict, roles_of_children'
--   route-guilt       : 'guilt, important_choices, difficult_circumstances, hope'
--   route-imagination : 'imagination, education, childhood, hope, conflict'
--   route-perception  : 'difficult_circumstances, truth, education, critique_of_society'
--   route-narrative   : 'truth, roles_of_children, hope, conflict'

begin;

update public.routes
set best_use = 'Best used when the question asks how Dickens and McEwan present class as a structural force that determines whose voice is heard and whose suffering is believed — Stephen Blackpool''s exclusion from speech and justice set against Robbie''s destruction by the Tallises'' class-coded misreading.',
    updated_at = now()
where id = 'route-class'
  and best_use is distinct from 'Best used when the question asks how Dickens and McEwan present class as a structural force that determines whose voice is heard and whose suffering is believed — Stephen Blackpool''s exclusion from speech and justice set against Robbie''s destruction by the Tallises'' class-coded misreading.';

update public.routes
set best_use = 'Best used when the question turns on how Dickens and McEwan dramatise the individual crushed by large impersonal systems — Coketown''s mechanised industrial order and the 1940 retreat to Dunkirk — and on how each novel measures private feeling against historical force.',
    updated_at = now()
where id = 'route-systems'
  and best_use is distinct from 'Best used when the question turns on how Dickens and McEwan dramatise the individual crushed by large impersonal systems — Coketown''s mechanised industrial order and the 1940 retreat to Dunkirk — and on how each novel measures private feeling against historical force.';

update public.routes
set best_use = 'Best used when the question asks how Dickens and McEwan present guilt as both a private moral burden and a structural force shaping memory, judgement and attempted repair — Louisa''s collapse before her father and Briony''s lifelong act of fictive atonement.',
    updated_at = now()
where id = 'route-guilt'
  and best_use is distinct from 'Best used when the question asks how Dickens and McEwan present guilt as both a private moral burden and a structural force shaping memory, judgement and attempted repair — Louisa''s collapse before her father and Briony''s lifelong act of fictive atonement.';

update public.routes
set best_use = 'Best used when the question pits imagination against rational or empirical systems — Gradgrind''s facts-only schooling against Briony''s "labyrinth of construction" — and asks where each novel locates the greater danger: the system that suppresses fancy, or the unsupervised mind that elaborates it.',
    updated_at = now()
where id = 'route-imagination'
  and best_use is distinct from 'Best used when the question pits imagination against rational or empirical systems — Gradgrind''s facts-only schooling against Briony''s "labyrinth of construction" — and asks where each novel locates the greater danger: the system that suppresses fancy, or the unsupervised mind that elaborates it.';

update public.routes
set best_use = 'Best used when the question concerns how reality is distorted by imposed or self-generated frameworks — Gradgrind''s calculus of fact and Briony''s child-novelist misreading of the fountain and library scenes — and how each text exposes interpretation itself as the source of harm.',
    updated_at = now()
where id = 'route-perception'
  and best_use is distinct from 'Best used when the question concerns how reality is distorted by imposed or self-generated frameworks — Gradgrind''s calculus of fact and Briony''s child-novelist misreading of the fountain and library scenes — and how each text exposes interpretation itself as the source of harm.';

update public.routes
set best_use = 'Best used when the question interrogates narrative authority itself — Dickens''s overt narrator-judge of Coketown against McEwan''s metafictional disclosure that Briony has authored the consoling version we just read — and asks whether telling can ever stand in for truth or repair.',
    updated_at = now()
where id = 'route-narrative'
  and best_use is distinct from 'Best used when the question interrogates narrative authority itself — Dickens''s overt narrator-judge of Coketown against McEwan''s metafictional disclosure that Briony has authored the consoling version we just read — and asks whether telling can ever stand in for truth or repair.';

commit;
