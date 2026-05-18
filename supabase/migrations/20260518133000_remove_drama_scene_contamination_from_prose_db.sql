-- Remove empty Component 1 Drama scene-schema contaminants from the
-- Component 2 Prose database.
--
-- These tables belong to the separate Drama app/schema and were verified as
-- empty in the prose DB audit. This migration deliberately drops only the
-- exact tables listed below and does not alter prose content tables, RLS, or
-- legacy interpretive compatibility tables.

drop table if exists public.drama_scene_themes cascade;
drop table if exists public.drama_scene_characters cascade;
drop table if exists public.drama_scene_ao2_methods cascade;
drop table if exists public.drama_scene_ao3_context cascade;
drop table if exists public.drama_scene_ao4_connections cascade;
drop table if exists public.drama_scene_ao5_readings cascade;
drop table if exists public.drama_scene_essay_uses cascade;
drop table if exists public.drama_scene_ao1_arguments cascade;
drop table if exists public.drama_scenes cascade;
