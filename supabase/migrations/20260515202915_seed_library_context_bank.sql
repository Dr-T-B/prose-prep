INSERT INTO library_context_bank
  (context_title, context_point, source_text, context_type, theme_tags, ao_tags, exam_use)
VALUES
  (
    'Victorian Industrialisation',
    'The 1850s saw the rapid expansion of factory towns like Coketown. Dickens critiques the dehumanising effects of industrial capitalism, where workers were reduced to mechanised "Hands" stripped of individuality and imagination — a deliberate echo of Benthamite efficiency.',
    'Hard Times',
    'historical',
    ARRAY['class', 'imagination', 'systems'],
    ARRAY['AO3'],
    'Use to contextualise the Gradgrind system and the presentation of Coketown workers.'
  ),
  (
    'Utilitarianism and Bentham',
    'Jeremy Bentham''s utilitarian philosophy (greatest happiness for the greatest number) underpins Gradgrind''s "Facts" pedagogy. Victorian educational reform debates — including the Newcastle Commission of 1861 — echo Dickens''s satire. McEwan''s characters similarly impose rational frameworks that ignore emotional truth.',
    'Hard Times',
    'philosophical',
    ARRAY['education', 'imagination', 'class'],
    ARRAY['AO3', 'AO4'],
    'Directly supports questions on education, imagination, and critique of society.'
  ),
  (
    'Freudian Psychology and Repressed Memory',
    'McEwan studied psychology at the University of Sussex and draws on Freudian ideas about the unconscious and repression. Briony''s false accusation and the novel''s retrospective structure enact the psychoanalytic dynamics of guilt, confession, and the unreliable mind''s attempt at narrative repair.',
    'Atonement',
    'biographical-theoretical',
    ARRAY['guilt', 'imagination', 'narrative'],
    ARRAY['AO3'],
    'Use to contextualise Briony''s narrative unreliability and the limits of atonement.'
  ),
  (
    'World War II and Dunkirk',
    'McEwan researches historical events meticulously: the 1940 Dunkirk evacuation sections draw on Lyn Macdonald''s interviews with veterans. The war sections subvert the dominant Dunkirk "Dunkirk spirit" myth, showing chaos, waste, and the random cruelty of industrial conflict — aligning with the anti-heroic strand of mid-20th-century war writing.',
    'Atonement',
    'historical',
    ARRAY['systems', 'narrative', 'guilt'],
    ARRAY['AO3', 'AO4'],
    'Use to contextualise Robbie''s war narrative and the gap between official history and experience.'
  ),
  (
    'Second-Wave Feminism and Female Agency',
    'Dickens writes within Victorian patriarchal norms but complicates them through characters like Louisa and Sissy. McEwan, writing in 2001, reflects second-wave feminist critiques of how women''s testimony and agency are undermined by class and gender hierarchy — Briony''s misreading and Cecilia''s silencing enact these power structures.',
    'both',
    'socio-cultural',
    ARRAY['gender', 'class', 'perception'],
    ARRAY['AO3', 'AO4'],
    'Use to contextualise questions on gender, independence, and relationships between female characters.'
  ),
  (
    'Metafiction and Postmodernism',
    'Atonement is formally self-conscious: Part Three reveals the narrative has been written by an elderly Briony, questioning whether fiction can achieve real atonement. This postmodern scepticism about narrative authority aligns McEwan with writers such as John Fowles (The French Lieutenant''s Woman), and invites comparison with Dickens''s own omniscient narrator, who intrudes explicitly to shape reader sympathy.',
    'Atonement',
    'literary-theoretical',
    ARRAY['narrative', 'imagination', 'guilt'],
    ARRAY['AO3', 'AO4'],
    'Use to contextualise questions on narrative authority, hope, and the limits of storytelling.'
  ),
  (
    'The Victorian Novel and Social Reform',
    'Hard Times (1854) was serialised in Dickens''s journal Household Words and was explicitly intended as social critique. Victorian "Condition of England" novels (cf. Gaskell''s North and South, Disraeli''s Sybil) addressed industrialisation, poverty, and class inequality. Dickens''s target included parliamentary utilitarianism and the Poor Law Amendment Act (1834).',
    'Hard Times',
    'historical-literary',
    ARRAY['class', 'systems', 'education'],
    ARRAY['AO3', 'AO4'],
    'Use to contextualise the satirical intent of Coketown and Gradgrind''s school.'
  )
ON CONFLICT DO NOTHING;