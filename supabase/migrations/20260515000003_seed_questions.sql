-- Seed questions table (Essay Builder flow)
-- 15 Section B comparative questions, all level_tag = 'A*'
-- Dry-run count: 15 rows

INSERT INTO questions (id, family, stem, primary_route_id, secondary_route_id, likely_core_methods, level_tag, is_active)
VALUES
  ('q-difficult-circumstances',
   'difficult_circumstances',
   'Compare the ways Dickens and McEwan present characters responding to difficult circumstances.',
   'route-systems', 'route-class',
   ARRAY['symbolism', 'juxtaposition', 'focalisation'],
   'A*', true),

  ('q-friendship',
   'friendship',
   'Compare the ways Dickens and McEwan present friendship.',
   'route-gender', 'route-class',
   ARRAY['characterisation', 'dialogue', 'irony'],
   'A*', true),

  ('q-critique-of-society',
   'critique_of_society',
   'Compare the ways Dickens and McEwan criticise aspects of society.',
   'route-class', 'route-perception',
   ARRAY['satire', 'irony', 'symbolism'],
   'A*', true),

  ('q-education',
   'education',
   'Compare the ways Dickens and McEwan present the role of education.',
   'route-imagination', 'route-perception',
   ARRAY['metaphor', 'imagery', 'characterisation'],
   'A*', true),

  ('q-settings',
   'settings',
   'Compare the ways Dickens and McEwan use settings.',
   'route-systems', 'route-class',
   ARRAY['pathetic fallacy', 'symbolism', 'motif'],
   'A*', true),

  ('q-changing-relationships',
   'changing_relationships',
   'Compare the ways Dickens and McEwan present changing relationships.',
   'route-gender', 'route-guilt',
   ARRAY['focalisation', 'dialogue', 'structural contrast'],
   'A*', true),

  ('q-role-models',
   'role_models',
   'Compare the ways Dickens and McEwan present role models.',
   'route-class', 'route-gender',
   ARRAY['characterisation', 'irony', 'juxtaposition'],
   'A*', true),

  ('q-love',
   'love',
   'Compare the ways Dickens and McEwan present love.',
   'route-gender', 'route-class',
   ARRAY['imagery', 'symbolism', 'focalisation'],
   'A*', true),

  ('q-hope',
   'hope',
   'Compare the ways Dickens and McEwan present hope.',
   'route-narrative', 'route-imagination',
   ARRAY['structural contrast', 'imagery', 'tone'],
   'A*', true),

  ('q-conflict',
   'conflict',
   'Compare the ways Dickens and McEwan present conflict.',
   'route-systems', 'route-class',
   ARRAY['juxtaposition', 'symbolism', 'imagery'],
   'A*', true),

  ('q-marriage',
   'marriage',
   'Compare the ways Dickens and McEwan present marriage.',
   'route-gender', 'route-class',
   ARRAY['irony', 'characterisation', 'dialogue'],
   'A*', true),

  ('q-independence',
   'independence',
   'Compare the ways Dickens and McEwan present characters attempting to achieve independence.',
   'route-gender', 'route-class',
   ARRAY['focalisation', 'symbolism', 'structural contrast'],
   'A*', true),

  ('q-important-choices',
   'important_choices',
   'Compare the ways Dickens and McEwan present the importance of choices.',
   'route-guilt', 'route-perception',
   ARRAY['focalisation', 'irony', 'motif'],
   'A*', true),

  ('q-roles-of-children',
   'roles_of_children',
   'Compare the ways Dickens and McEwan present the roles of children.',
   'route-imagination', 'route-systems',
   ARRAY['imagery', 'characterisation', 'symbolism'],
   'A*', true),

  ('q-female-relationships',
   'female_relationships',
   'Compare the ways Dickens and McEwan present relationships between female characters.',
   'route-gender', 'route-class',
   ARRAY['characterisation', 'focalisation', 'dialogue'],
   'A*', true)

ON CONFLICT (id) DO NOTHING;
