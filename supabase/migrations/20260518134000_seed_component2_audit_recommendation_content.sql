-- Component 2 Prose audit recommendation content seed.
-- Scope: Hard Times and Atonement only. Pearson Edexcel 9ET0/02 assesses
-- AO1, AO2, AO3, and AO4, so interpretive extension content is framed as
-- AO1 sophistication and comparison rather than a separate assessed objective.

begin;

-- ---------------------------------------------------------------------------
-- symbol_entries: core motifs and exam use
-- ---------------------------------------------------------------------------

insert into public.symbol_entries (id, source_text, name, one_line, themes)
values
  ('se_ht_hands', 'Hard Times', 'Hands', 'The workers are reduced to a body part, making industrial capitalism feel morally and linguistically dehumanising.', array['class', 'industrialisation', 'dehumanisation', 'social injustice']),
  ('se_ht_smoke', 'Hard Times', 'Smoke', 'Smoke obscures colour and vitality in Coketown, turning setting into a symbol of social and emotional suffocation.', array['industrialisation', 'setting', 'class', 'repression']),
  ('se_ht_fog_industrial_atmosphere', 'Hard Times', 'Fog and industrial atmosphere', 'Dickens makes atmosphere oppressive so that Coketown becomes both a real factory town and a moral climate.', array['setting', 'industrialisation', 'class', 'social critique']),
  ('se_ht_circus', 'Hard Times', 'Circus', 'Sleary''s circus symbolises fancy, play, and humane community against the rigid discipline of facts.', array['imagination', 'education', 'community', 'feeling']),
  ('se_ht_gradgrind_square', 'Hard Times', 'Gradgrind''s square imagery', 'Square and mechanical imagery turns Gradgrind''s thinking into a visual emblem of measurement without sympathy.', array['education', 'utilitarianism', 'repression', 'childhood']),
  ('se_ht_coketown_machinery', 'Hard Times', 'Coketown machinery', 'Machines make human routine seem repetitive and replaceable, supporting comparisons about systems that train people into damage.', array['industrialisation', 'systems', 'class', 'dehumanisation']),
  ('se_at_vase', 'Atonement', 'Vase', 'The broken vase turns desire, class tension, and misinterpretation into one fragile object whose damage cannot simply be restored.', array['class', 'love', 'truth and perception', 'guilt']),
  ('se_at_fountain', 'Atonement', 'Fountain', 'The fountain scene symbolises the gap between experience and interpretation because Briony converts adult tension into a childish narrative.', array['truth and perception', 'childhood', 'imagination', 'class']),
  ('se_at_window', 'Atonement', 'Window', 'Windows frame partial vision: Briony sees from above, but her elevated viewpoint produces authority without understanding.', array['narrative authority', 'truth and perception', 'childhood', 'class']),
  ('se_at_manuscript', 'Atonement', 'Manuscript', 'The manuscript symbolises fiction as both witness and control, making repair inseparable from the writer''s power over outcomes.', array['narrative authority', 'guilt and atonement', 'truth and fiction', 'memory']),
  ('se_at_dunkirk_landscape', 'Atonement', 'War and Dunkirk landscape', 'The war landscape externalises trauma and strips romance from Robbie''s journey, exposing institutional violence at bodily scale.', array['war and its consequences', 'systems', 'violence', 'memory']),
  ('se_at_letter_written_text', 'Atonement', 'Letter and written text', 'The letter makes language materially dangerous: a private draft becomes public evidence through misdelivery and misreading.', array['truth and perception', 'class', 'guilt and atonement', 'narrative authority'])
on conflict (id) do update set
  source_text = excluded.source_text,
  name = excluded.name,
  one_line = excluded.one_line,
  themes = excluded.themes,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- interpretive_tensions: AO1 sophistication and debate positions
-- ---------------------------------------------------------------------------

insert into public.interpretive_tensions (
  id, focus, dominant_reading, alternative_reading, interpretive_stem, level_tag, best_use
)
values
  ('it_ht_gradgrind_reformable', 'Hard Times - Gradgrind', 'Gradgrind can be read as the architect of emotional damage because he turns education and family life into experiments in fact.', 'His remorse also makes him a reformable figure, so Dickens attacks the ideology more than a single irredeemable villain.', 'A more sophisticated reading is that Gradgrind matters because he changes, exposing both the harm of fact-worship and Dickens''s belief in moral correction.', 'A/A*', array['education', 'family', 'responsibility']),
  ('it_ht_dickens_reform_sentiment', 'Hard Times - Dickens'' social critique', 'Dickens is a reformist critic who exposes industrial capitalism, utilitarian schooling, and class hierarchy.', 'His solutions can seem sentimental because moral goodness is concentrated in figures such as Sissy rather than structural political change.', 'This lets the essay argue that Dickens diagnoses systemic harm while still imagining repair through private feeling and moral example.', 'A/A*', array['class', 'social critique', 'hope']),
  ('it_ht_sissy_centre_device', 'Hard Times - Sissy Jupe', 'Sissy is the moral centre of the novel because she preserves fancy, affection, and humane judgement.', 'She can also be read as an idealised feminine device whose goodness is less psychologically complex than Louisa''s suffering.', 'A balanced reading sees Sissy as both Dickens''s ethical answer to Gradgrind and a sign of the novel''s gendered limits.', 'A/A*', array['gender', 'education', 'imagination']),
  ('it_ht_coketown_realism_symbol', 'Hard Times - Coketown', 'Coketown works as social realism because it evokes the pollution and labour discipline of Victorian factory towns.', 'It is also deliberately exaggerated and symbolic, more moral diagram than neutral documentary.', 'The setting can therefore be used to show Dickens blending realism with fable-like critique.', 'A/A*', array['settings', 'industrialisation', 'class']),
  ('it_ht_fact_discipline_ideology', 'Hard Times - Fact', 'Fact appears to offer discipline, accuracy, and social usefulness in education.', 'Dickens presents it as dehumanising when it excludes imagination, sympathy, and moral uncertainty.', 'The tension is not fact versus ignorance, but narrow measurement versus a fuller account of human value.', 'A/A*', array['education', 'childhood', 'imagination']),
  ('it_at_briony_child_novelist', 'Atonement - Briony', 'Briony is a guilty child whose false certainty damages Robbie and Cecilia irreversibly.', 'She is also a self-conscious novelist whose adult narration exposes the dangers of turning life into story.', 'A strong paragraph can hold both positions: Briony is culpable because her imagination becomes authorial power before it becomes ethical understanding.', 'A/A*', array['guilt', 'childhood', 'narrative authority']),
  ('it_at_robbie_victim_romance', 'Atonement - Robbie', 'Robbie is a victim of class prejudice, police assumption, and the Tallis family''s need for a convenient culprit.', 'The novel also risks romanticising him through Cecilia''s loyalty and Briony''s later reparative imagination.', 'This reading helps compare social victimhood with the way narrative can idealise the person it tries to restore.', 'A/A*', array['class', 'love', 'guilt']),
  ('it_at_cecilia_rebel_constraint', 'Atonement - Cecilia', 'Cecilia is an autonomous rebel who rejects family expectation and chooses Robbie.', 'Her independence remains constrained by class codes, gendered respectability, and Briony''s narrative control.', 'Cecilia''s rebellion is powerful precisely because the novel keeps showing the social structures that narrow it.', 'A/A*', array['independence', 'gender', 'class']),
  ('it_at_ending_repair_evasion', 'Atonement - ending', 'The ending can be read as an act of atonement because Briony gives Robbie and Cecilia the life history denied them.', 'It can also be read as aesthetic evasion because fictional happiness cannot undo legal, bodily, or emotional harm.', 'The ending is useful because it forces judgement on whether narrative repair is ethically generous or self-protective.', 'A/A*', array['guilt', 'hope', 'truth and fiction']),
  ('it_at_fiction_repair_fraud', 'Atonement - fiction', 'Fiction offers moral repair by witnessing damage, preserving memory, and resisting oblivion.', 'Fiction also becomes morally suspect when the writer controls the victims and decides what consolation readers receive.', 'McEwan makes fiction both necessary and compromised, so essays should avoid treating storytelling as simple redemption.', 'A/A*', array['narrative authority', 'truth and fiction', 'guilt']),
  ('it_cmp_moral_confidence_uncertainty', 'Comparison - moral confidence and uncertainty', 'Dickens writes with moral confidence: social damage can be named, judged, and partly corrected.', 'McEwan writes with epistemological uncertainty: narrative can expose harm but cannot guarantee truth or restitution.', 'The comparison matters because both novels condemn harm, but they differ sharply over whether narrative judgement can repair it.', 'A*', array['guilt', 'narrative authority', 'hope']),
  ('it_cmp_industry_war_institution', 'Comparison - systemic violence', 'Hard Times locates oppression in industrial capitalism, schooling, and the factory town.', 'Atonement relocates comparable damage into class institutions, wartime bureaucracy, and narrative authority.', 'Both novels present harm as systemic, but Dickens externalises system through place while McEwan internalises it through memory and narrative form.', 'A*', array['systems', 'class', 'war and its consequences']),
  ('it_cmp_childhood_training', 'Comparison - childhood formation', 'Childhood is shaped by adult systems: Gradgrind trains children into facts, while Briony learns to turn perception into story.', 'The children are not only victims; their formation also produces later harm for others.', 'This supports a judgement that both novels treat childhood as morally formative rather than merely innocent.', 'A/A*', array['childhood', 'education', 'responsibility']),
  ('it_cmp_gender_constraint_voice', 'Comparison - gender and voice', 'Both novels expose how women are constrained by family, class, and social scripts.', 'They also differ because Dickens often idealises female moral influence while McEwan makes female authorship ethically unstable.', 'A comparative reading can argue that gendered constraint is visible in both texts, but narrative power is distributed very differently.', 'A*', array['gender', 'family', 'narrative authority'])
on conflict (id) do update set
  focus = excluded.focus,
  dominant_reading = excluded.dominant_reading,
  alternative_reading = excluded.alternative_reading,
  interpretive_stem = excluded.interpretive_stem,
  level_tag = excluded.level_tag,
  best_use = excluded.best_use,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- paragraph_stems: Component 2 comparative prose sentence moves
-- ---------------------------------------------------------------------------

insert into public.paragraph_stems (
  id, stem_text, "function", ao, source_text, text_focus, best_themes, level_band, example_use, sort_order, is_active, curation_status
)
values
  ('ps_thesis_01', 'Both novels present harm as systemic, but Dickens makes the system visible through social institutions while McEwan makes it unstable through memory and narrative control.', 'thesis/opening argument', array['AO1', 'AO4'], 'Comparative', 'systemic harm', array['systems', 'class', 'guilt'], 'A/A*', 'Opening sentence for class, conflict, or difficult circumstances.', 10, true, 'strong'),
  ('ps_thesis_02', 'The comparison is not simply between two damaged characters, but between two different explanations of how damage is produced and understood.', 'thesis/opening argument', array['AO1', 'AO4'], 'Comparative', 'conceptual framing', array['guilt', 'responsibility'], 'A/A*', 'Use after naming a question focus.', 20, true, 'strong'),
  ('ps_thesis_03', 'Dickens tends to moralise the question directly, whereas McEwan makes the reader question how any moral account has been constructed.', 'thesis/opening argument', array['AO1', 'AO2', 'AO4'], 'Comparative', 'moral judgement and narration', array['narrative authority', 'truth and fiction'], 'A*', 'Use for narrative truth, guilt, or hope.', 30, true, 'strong'),
  ('ps_thesis_04', 'In both texts, childhood is not protected innocence but a training ground where adult values become future consequences.', 'thesis/opening argument', array['AO1', 'AO4'], 'Comparative', 'childhood formation', array['childhood', 'education', 'responsibility'], 'A/A*', 'Use for education, children, role models.', 40, true, 'strong'),
  ('ps_thesis_05', 'Where Dickens exposes social damage through externalised industrial setting, McEwan relocates comparable damage into the instability of memory and retrospective narration.', 'thesis/opening argument', array['AO1', 'AO2', 'AO4'], 'Comparative', 'setting and narrative', array['settings', 'memory', 'systems'], 'A*', 'High-value opener for settings or difficult circumstances.', 50, true, 'strong'),
  ('ps_transition_01', 'This is where the comparison sharpens: Dickens turns the problem outward into social satire, while McEwan turns it inward into acts of perception.', 'comparative transition', array['AO1', 'AO4'], 'Comparative', 'outward/inward contrast', array['social critique', 'truth and perception'], 'A/A*', 'Move between Hard Times and Atonement evidence.', 60, true, 'strong'),
  ('ps_transition_02', 'McEwan echoes Dickens''s concern with damaged lives, but refuses Dickens''s confidence that the source of damage can be fully named.', 'comparative transition', array['AO1', 'AO4'], 'Comparative', 'moral certainty', array['guilt', 'systems'], 'A*', 'Use after a Dickens paragraph when shifting to Atonement.', 70, true, 'strong'),
  ('ps_transition_03', 'A similar pattern appears in Atonement, although McEwan makes the danger less institutional and more interpretive.', 'comparative transition', array['AO1', 'AO4'], 'Atonement', 'interpretive danger', array['imagination', 'narrative authority'], 'A/A*', 'Bridge from Gradgrind/facts to Briony/story.', 80, true, 'strong'),
  ('ps_transition_04', 'By contrast, Hard Times makes the pressure material and public, so private suffering becomes evidence of a wider social failure.', 'comparative transition', array['AO1', 'AO4'], 'Hard Times', 'public pressure', array['class', 'industrialisation'], 'A/A*', 'Bridge from Atonement back to Dickens.', 90, true, 'strong'),
  ('ps_ao2_01', 'The method is not merely descriptive: it turns the character''s private experience into a structural argument about social damage.', 'AO2 method analysis', array['AO2', 'AO1'], 'Comparative', 'method to meaning', array['systems', 'characterisation'], 'A/A*', 'Use after close analysis of imagery or focalisation.', 100, true, 'strong'),
  ('ps_ao2_02', 'Dickens''s imagery works by compression, reducing people to objects, numbers, or functions so that the language enacts dehumanisation.', 'AO2 method analysis', array['AO2'], 'Hard Times', 'imagery and reduction', array['dehumanisation', 'education', 'class'], 'A/A*', 'Use with Hands, Girl number twenty, facts, Coketown.', 110, true, 'strong'),
  ('ps_ao2_03', 'McEwan''s focalisation is ethically unstable because the reader is placed inside a consciousness before being asked to judge its errors.', 'AO2 method analysis', array['AO2'], 'Atonement', 'focalisation', array['truth and perception', 'guilt', 'narrative authority'], 'A*', 'Use with Briony window/fountain/library moments.', 120, true, 'strong'),
  ('ps_ao2_04', 'The repeated motif matters because it gathers social pressure into a visible object, allowing the essay to move from detail to argument.', 'AO2 method analysis', array['AO2', 'AO1'], 'Comparative', 'motif', array['symbolism', 'class', 'guilt'], 'A/A*', 'Use with vase, smoke, machinery, letters.', 130, true, 'strong'),
  ('ps_ao2_05', 'The syntax creates moral pressure: what looks like certainty at sentence level becomes a sign of interpretive narrowness at novel level.', 'AO2 method analysis', array['AO2', 'AO1'], 'Comparative', 'syntax and certainty', array['truth and perception', 'education'], 'A*', 'Use with declaratives, lists, rhetorical questions.', 140, true, 'strong'),
  ('ps_ao2_06', 'The setting is doing argumentative work, not background work: it trains the reader to see environment as a maker of consciousness.', 'AO2 method analysis', array['AO2', 'AO3'], 'Comparative', 'setting', array['settings', 'systems'], 'A/A*', 'Use for Coketown and Dunkirk/Tallis estate comparisons.', 150, true, 'strong'),
  ('ps_context_01', 'The context should not sit outside the paragraph: Victorian industrialisation explains why Dickens makes labour, routine, and pollution part of the novel''s moral language.', 'AO3 context integration', array['AO3', 'AO1'], 'Hard Times', 'industrial context', array['industrialisation', 'class'], 'A/A*', 'Integrate AO3 after Coketown or Hands analysis.', 160, true, 'strong'),
  ('ps_context_02', 'Utilitarian context is useful here because Gradgrind''s school turns an intellectual system into daily emotional training.', 'AO3 context integration', array['AO3', 'AO1'], 'Hard Times', 'utilitarian education', array['education', 'utilitarianism'], 'A/A*', 'Use with Facts, horse definition, Louisa.', 170, true, 'strong'),
  ('ps_context_03', 'McEwan''s late twentieth-century context matters because the novel is suspicious of inherited realist authority and asks who controls the version of events.', 'AO3 context integration', array['AO3', 'AO2'], 'Atonement', 'postmodern fiction', array['narrative authority', 'truth and fiction'], 'A*', 'Use with the coda or adult Briony.', 180, true, 'strong'),
  ('ps_context_04', 'The wartime context expands Robbie''s private suffering into institutional damage, making the body a record of history rather than just romance.', 'AO3 context integration', array['AO3', 'AO1'], 'Atonement', 'war trauma', array['war and its consequences', 'violence'], 'A/A*', 'Use for Dunkirk and hospital sections.', 190, true, 'strong'),
  ('ps_context_05', 'Class context should be tied to judgement: both novels show that social rank changes what characters are allowed to know, say, and be believed about.', 'AO3 context integration', array['AO3', 'AO4'], 'Comparative', 'class belief systems', array['class', 'truth and perception'], 'A/A*', 'Use for Bounderby/Hands or Robbie/Tallis family.', 200, true, 'strong'),
  ('ps_context_06', 'Serial publication helps explain Dickens''s direct moral patterning: the novel teaches publicly, whereas McEwan teaches by making certainty collapse.', 'AO3 context integration', array['AO3', 'AO4'], 'Comparative', 'literary form context', array['narrative authority', 'social critique'], 'A*', 'Use for narrator/form comparisons.', 210, true, 'strong'),
  ('ps_ao4_01', 'This comparison matters because both novels present harm as systemic, but they disagree about whether narrative can repair that harm.', 'AO4 comparison/divergence', array['AO4', 'AO1'], 'Comparative', 'repair', array['guilt', 'systems', 'hope'], 'A*', 'Judgement sentence for endings or guilt.', 220, true, 'strong'),
  ('ps_ao4_02', 'The divergence is that Dickens makes moral education possible after damage, while McEwan makes belated understanding painfully insufficient.', 'AO4 comparison/divergence', array['AO4', 'AO1'], 'Comparative', 'belated understanding', array['education', 'guilt', 'hope'], 'A/A*', 'Use in conclusion or paragraph judgement.', 230, true, 'strong'),
  ('ps_ao4_03', 'Both writers connect class with misrecognition, but Dickens stresses economic structure while McEwan stresses the social habits of seeing.', 'AO4 comparison/divergence', array['AO4', 'AO3'], 'Comparative', 'class and perception', array['class', 'truth and perception'], 'A/A*', 'Use for class/social critique questions.', 240, true, 'strong'),
  ('ps_ao4_04', 'The two settings are comparable because each turns place into pressure: Coketown disciplines workers, while the war landscape strips Robbie of safety and agency.', 'AO4 comparison/divergence', array['AO4', 'AO2'], 'Comparative', 'setting as pressure', array['settings', 'systems', 'violence'], 'A/A*', 'Use for settings/conflict questions.', 250, true, 'strong'),
  ('ps_ao4_05', 'Dickens uses contrast to clarify moral alternatives; McEwan uses contrast to expose how attractive alternatives may be inventions.', 'AO4 comparison/divergence', array['AO4', 'AO2'], 'Comparative', 'contrast', array['truth and fiction', 'hope'], 'A*', 'Use with Sissy/Louisa and Robbie/Cecilia ending.', 260, true, 'strong'),
  ('ps_judgement_01', 'A stronger judgement is that the novel condemns the system while also asking how far individuals remain responsible inside it.', 'judgement/evaluation', array['AO1'], 'Comparative', 'responsibility', array['responsibility', 'systems'], 'A/A*', 'End paragraph without drifting into summary.', 270, true, 'strong'),
  ('ps_judgement_02', 'The reader is therefore pushed beyond sympathy into judgement: the suffering matters because it reveals the values that produced it.', 'judgement/evaluation', array['AO1', 'AO2'], 'Comparative', 'sympathy to judgement', array['suffering', 'social critique'], 'A/A*', 'Use after evidence close analysis.', 280, true, 'strong'),
  ('ps_judgement_03', 'Ultimately, the comparison suggests that moral certainty can expose injustice, but it can also become another form of control.', 'judgement/evaluation', array['AO1', 'AO4'], 'Comparative', 'certainty', array['truth and perception', 'power'], 'A*', 'Use for Briony/Gradgrind comparison.', 290, true, 'strong'),
  ('ps_judgement_04', 'The point is not that one novel is hopeful and the other hopeless, but that they imagine repair through different kinds of narrative authority.', 'judgement/evaluation', array['AO1', 'AO4'], 'Comparative', 'repair and authority', array['hope', 'narrative authority'], 'A*', 'Use in a conclusion on endings.', 300, true, 'strong'),
  ('ps_counter_01', 'A counter-reading is that Dickens''s moral clarity may simplify the problem, since emotional goodness alone cannot dismantle class hierarchy.', 'counter-reading', array['AO1', 'AO3'], 'Hard Times', 'limits of reform', array['class', 'social critique'], 'A*', 'Use to complicate Dickens without dismissing him.', 310, true, 'strong'),
  ('ps_counter_02', 'However, McEwan''s uncertainty can be read not as evasion but as ethical honesty about the impossibility of undoing harm.', 'counter-reading', array['AO1'], 'Atonement', 'ethical uncertainty', array['guilt', 'truth and fiction'], 'A*', 'Use after criticising the ending.', 320, true, 'strong'),
  ('ps_counter_03', 'This reading should be qualified because the character is both shaped by a system and capable of choices that intensify its damage.', 'counter-reading', array['AO1'], 'Comparative', 'agency and structure', array['responsibility', 'systems'], 'A/A*', 'Use for Bounderby, Briony, Gradgrind, Lola/Paul.', 330, true, 'strong'),
  ('ps_counter_04', 'The apparent binary between fact and imagination is unstable, because both novels ask what happens when either one is detached from sympathy.', 'counter-reading', array['AO1', 'AO4'], 'Comparative', 'fact and imagination', array['education', 'imagination'], 'A*', 'Use for education or narrative questions.', 340, true, 'strong'),
  ('ps_conclusion_01', 'Therefore, the most persuasive comparison is that both novels expose damaged ways of knowing, though Dickens seeks moral re-education and McEwan exposes the cost of knowing too late.', 'concluding sentence', array['AO1', 'AO4'], 'Comparative', 'damaged knowledge', array['education', 'guilt', 'truth and perception'], 'A*', 'Concluding sentence for a full essay.', 350, true, 'strong'),
  ('ps_conclusion_02', 'The paragraph shows that method, context, and comparison point to one claim: private suffering becomes politically meaningful when the novel shows who benefits from it.', 'concluding sentence', array['AO1', 'AO2', 'AO3', 'AO4'], 'Comparative', 'private suffering and politics', array['class', 'systems'], 'A/A*', 'Close a paragraph after integrated analysis.', 360, true, 'strong'),
  ('ps_conclusion_03', 'In that sense, both texts make the reader examine not only what characters do, but the social and narrative conditions that make those actions legible.', 'concluding sentence', array['AO1', 'AO4'], 'Comparative', 'legibility and conditions', array['narrative authority', 'class'], 'A*', 'Close an A* paragraph on judgement.', 370, true, 'strong'),
  ('ps_conclusion_04', 'The lasting difference is that Dickens imagines correction through humane feeling, whereas McEwan leaves correction trapped inside the very fiction that offers it.', 'concluding sentence', array['AO1', 'AO4'], 'Comparative', 'correction and fiction', array['hope', 'truth and fiction', 'guilt'], 'A*', 'Use for endings, guilt, or hope.', 380, true, 'strong')
on conflict (id) do update set
  stem_text = excluded.stem_text,
  "function" = excluded."function",
  ao = excluded.ao,
  source_text = excluded.source_text,
  text_focus = excluded.text_focus,
  best_themes = excluded.best_themes,
  level_band = excluded.level_band,
  example_use = excluded.example_use,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  curation_status = excluded.curation_status,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- library_context_bank: add 20 entries to bring total from 7 to at least 24
-- ---------------------------------------------------------------------------

insert into public.library_context_bank (
  context_title, context_point, source_text, context_type, theme_tags, ao_tags, exam_use, notes, content_hash, source_dataset
)
values
  ('Victorian factory labour and class hierarchy', 'Factory labour in Hard Times is presented through the collective label of the Hands, showing how industrial society can erase individuality while depending on working-class bodies.', 'Hard Times', 'historical', array['class', 'industrialisation', 'dehumanisation'], array['AO3', 'AO4'], 'Use for class, social injustice, settings, and conflict questions.', 'Extends existing industrial context with worker hierarchy focus.', md5('context|Victorian factory labour and class hierarchy'), 'codex_audit_seed_20260518'),
  ('Political economy and laissez-faire capitalism', 'Dickens attacks the language of economic self-interest by exposing how laissez-faire thinking can excuse suffering as necessary, efficient, or deserved.', 'Hard Times', 'historical-philosophical', array['class', 'systems', 'social critique'], array['AO3'], 'Use when analysing Bounderby, Coketown, and the limits of individual charity.', null, md5('context|Political economy and laissez-faire capitalism'), 'codex_audit_seed_20260518'),
  ('Dickens as reformist journalist', 'Dickens wrote as a public moralist and journalist, using fiction to make social conditions emotionally legible for readers rather than presenting policy analysis alone.', 'Hard Times', 'biographical-literary', array['social critique', 'class', 'education'], array['AO3'], 'Use to explain direct narrator judgement and satirical pressure.', null, md5('context|Dickens as reformist journalist'), 'codex_audit_seed_20260518'),
  ('Serial publication and moral didacticism', 'Hard Times appeared in Household Words, so its structure and narrator often work didactically, guiding readers toward moral recognition in instalments.', 'Hard Times', 'literary-form', array['narrative form', 'social critique', 'hope'], array['AO3', 'AO2'], 'Use to connect form, narrator, and Dickens''s public reform purpose.', null, md5('context|Serial publication and moral didacticism'), 'codex_audit_seed_20260518'),
  ('Separate spheres and Victorian gender expectations', 'Victorian gender ideology often associated women with feeling and the domestic moral sphere, which helps explain both Louisa''s constraint and Sissy''s idealised moral function.', 'Hard Times', 'socio-cultural', array['gender', 'family', 'feeling'], array['AO3'], 'Use for questions on female relationships, marriage, role models, and independence.', null, md5('context|Separate spheres and Victorian gender expectations'), 'codex_audit_seed_20260518'),
  ('Gradgrindian empiricism', 'Gradgrind''s insistence on measurable fact reflects a broader nineteenth-century confidence in statistics, classification, and empirical knowledge, but Dickens shows the emotional cost of applying this to children.', 'Hard Times', 'intellectual history', array['education', 'utilitarianism', 'childhood'], array['AO3', 'AO2'], 'Use with classroom scenes, Louisa, Tom, and Sissy.', null, md5('context|Gradgrindian empiricism'), 'codex_audit_seed_20260518'),
  ('Condition of England fiction', 'Hard Times belongs to the Condition of England tradition, where the novel becomes a way of diagnosing industrial unrest, class division, and national moral failure.', 'Hard Times', 'literary-historical', array['class', 'industrialisation', 'social critique'], array['AO3', 'AO4'], 'Use to compare Dickens''s public social diagnosis with McEwan''s later private/narrative diagnosis.', null, md5('context|Condition of England fiction'), 'codex_audit_seed_20260518'),
  ('Late twentieth-century postmodern fiction', 'Atonement inherits postmodern suspicion about stable truth, using a realist surface before revealing how fully that surface has been authored.', 'Atonement', 'literary-theoretical', array['truth and fiction', 'narrative authority', 'memory'], array['AO3', 'AO2'], 'Use for questions on truth, choices, guilt, and hope.', null, md5('context|Late twentieth-century postmodern fiction'), 'codex_audit_seed_20260518'),
  ('Metafiction as moral problem', 'Metafiction in Atonement is not just technical display: it asks whether an author can repair harm when the victims remain subject to the author''s invention.', 'Atonement', 'literary-theoretical', array['narrative authority', 'guilt and atonement', 'truth and fiction'], array['AO3', 'AO2'], 'Use with the coda, adult Briony, and the novel''s final ethical question.', null, md5('context|Metafiction as moral problem'), 'codex_audit_seed_20260518'),
  ('Unreliable narration and focalisation', 'McEwan uses restricted focalisation so that readers inhabit Briony''s certainty before recognising its danger, making unreliability a moral experience rather than a trick ending.', 'Atonement', 'narrative form', array['truth and perception', 'childhood', 'guilt'], array['AO2', 'AO3'], 'Use for Briony, the fountain, the library, and accusation scenes.', null, md5('context|Unreliable narration and focalisation'), 'codex_audit_seed_20260518'),
  ('Trauma and memory', 'Atonement presents memory as both necessary and unstable: trauma survives through bodily detail, repetition, and belated narration rather than neat recollection.', 'Atonement', 'psychological-literary', array['memory', 'war and its consequences', 'guilt'], array['AO3', 'AO2'], 'Use for war, hospital, and retrospective narration paragraphs.', null, md5('context|Trauma and memory'), 'codex_audit_seed_20260518'),
  ('Interwar class hierarchy', 'The Tallis household reflects interwar class hierarchy, where Robbie''s education does not fully protect him from assumptions attached to birth, dependence, and service.', 'Atonement', 'historical-social', array['class', 'truth and perception', 'power'], array['AO3'], 'Use for Robbie, Cecilia, Leon, Paul Marshall, and social judgement.', null, md5('context|Interwar class hierarchy'), 'codex_audit_seed_20260518'),
  ('Gender and female authorship', 'Atonement links female authorship to power and guilt: Briony gains narrative authority, but the novel asks whether that authority can ethically represent Cecilia and Robbie.', 'Atonement', 'gender-literary', array['gender', 'narrative authority', 'guilt'], array['AO3', 'AO2'], 'Use for Briony as writer and Cecilia as constrained daughter/lover.', null, md5('context|Gender and female authorship'), 'codex_audit_seed_20260518'),
  ('Crime, guilt, and retrospective confession', 'The novel borrows the structure of confession but withholds simple absolution, because Briony can confess narratively without restoring what the crime destroyed.', 'Atonement', 'ethical-literary', array['guilt and atonement', 'truth and fiction', 'responsibility'], array['AO3', 'AO1'], 'Use for guilt, choices, hope, and endings.', null, md5('context|Crime, guilt, and retrospective confession'), 'codex_audit_seed_20260518'),
  ('Victorian moral realism and postmodern uncertainty', 'Dickens uses realism to direct moral judgement toward social reform, while McEwan uses realism and then unsettles it to question narrative authority itself.', 'both', 'comparative-literary', array['narrative authority', 'social critique', 'truth and fiction'], array['AO3', 'AO4'], 'Use as a high-level comparison for almost any essay introduction or conclusion.', null, md5('context|Victorian moral realism and postmodern uncertainty'), 'codex_audit_seed_20260518'),
  ('Social reform and narrative self-interrogation', 'Hard Times asks readers to recognise and correct social damage; Atonement asks readers to question whether recognition through story can ever be enough.', 'both', 'comparative-literary', array['guilt', 'social critique', 'hope'], array['AO3', 'AO4'], 'Use to distinguish Dickens''s public reform energy from McEwan''s ethical uncertainty.', null, md5('context|Social reform and narrative self-interrogation'), 'codex_audit_seed_20260518'),
  ('Institutional power across periods', 'Both novels expose institutional power: schools, factories, families, courts, medicine, and war systems shape what characters can know and survive.', 'both', 'comparative-historical', array['systems', 'class', 'violence'], array['AO3', 'AO4'], 'Use for difficult circumstances, conflict, class, and settings.', null, md5('context|Institutional power across periods'), 'codex_audit_seed_20260518'),
  ('Childhood formation and ideological training', 'Gradgrind''s children and Briony are trained into damaging ways of knowing: one through facts, the other through story, certainty, and social assumptions.', 'both', 'comparative-conceptual', array['childhood', 'education', 'truth and perception'], array['AO3', 'AO4'], 'Use for education, children, role models, and choices.', null, md5('context|Childhood formation and ideological training'), 'codex_audit_seed_20260518'),
  ('Class as structural violence', 'Class in both novels is not only background status; it shapes whose testimony is believed, whose labour is used, and whose suffering becomes socially disposable.', 'both', 'comparative-social', array['class', 'power', 'social injustice'], array['AO3', 'AO4'], 'Use for class, critique of society, love, and conflict.', null, md5('context|Class as structural violence'), 'codex_audit_seed_20260518'),
  ('Writing as witness, confession, or control', 'Writing can witness damage, confess guilt, and control outcomes; Dickens uses authorial judgement to reform readers, while McEwan questions the ethics of that control.', 'both', 'comparative-literary', array['narrative authority', 'guilt', 'truth and fiction'], array['AO2', 'AO3', 'AO4'], 'Use for narrative, guilt, hope, and important choices.', null, md5('context|Writing as witness, confession, or control'), 'codex_audit_seed_20260518')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- glossary_terms: Component 2 prose-critical vocabulary
-- ---------------------------------------------------------------------------

insert into public.glossary_terms (
  id, term, definition, source_text, category, level_tag, sort_order, is_active
)
values
  ('gt-free-indirect-discourse', 'free indirect discourse', 'A narrative mode that blends third-person narration with a character''s idiom, feelings, or assumptions.', 'Atonement', 'narrative method', 'A/A*', 10, true),
  ('gt-focalisation', 'focalisation', 'The perspective through which events are filtered, shaping what the reader sees, misses, or misjudges.', 'Atonement', 'narrative method', 'A/A*', 20, true),
  ('gt-unreliable-narration', 'unreliable narration', 'Narration whose account is limited, distorted, self-protective, or later revised.', 'Atonement', 'narrative method', 'A/A*', 30, true),
  ('gt-metafiction', 'metafiction', 'Fiction that draws attention to its own making, authority, or limits.', 'Atonement', 'narrative form', 'A/A*', 40, true),
  ('gt-retrospective-narration', 'retrospective narration', 'Narration from a later viewpoint that looks back on earlier events with changed knowledge or guilt.', 'Atonement', 'narrative form', 'A/A*', 50, true),
  ('gt-bildungsroman', 'bildungsroman', 'A novel of formation or development, often tracking moral, social, or psychological education.', 'Comparative', 'genre', 'A/A*', 60, true),
  ('gt-industrial-novel', 'industrial novel', 'A nineteenth-century novel concerned with factory life, labour conditions, class conflict, and industrial society.', 'Hard Times', 'genre', 'A/A*', 70, true),
  ('gt-social-realism', 'social realism', 'A mode that represents social conditions and ordinary lives in order to expose material pressures and injustice.', 'Hard Times', 'genre/mode', 'A/A*', 80, true),
  ('gt-satire', 'satire', 'The use of ridicule, irony, exaggeration, or caricature to criticise social behaviour or institutions.', 'Hard Times', 'method', 'A/A*', 90, true),
  ('gt-symbolism', 'symbolism', 'The use of an object, place, or image to carry larger thematic meaning.', 'Comparative', 'method', 'B/A', 100, true),
  ('gt-motif', 'motif', 'A repeated image, object, phrase, or situation that builds meaning across a text.', 'Comparative', 'method', 'B/A', 110, true),
  ('gt-structural-irony', 'structural irony', 'Irony created by the design of the whole text, where the reader''s later knowledge reframes earlier scenes.', 'Atonement', 'structure', 'A/A*', 120, true),
  ('gt-narrative-frame', 'narrative frame', 'A structural device that encloses or mediates a story through another speaker, document, or later perspective.', 'Atonement', 'structure', 'A/A*', 130, true),
  ('gt-epilogue-coda', 'epilogue / coda', 'A closing section that reframes the main narrative, often by adding future knowledge or final judgement.', 'Atonement', 'structure', 'A/A*', 140, true),
  ('gt-analepsis-flashback', 'analepsis / flashback', 'A movement backwards in narrative time that reveals earlier events or memories.', 'Comparative', 'structure', 'A/A*', 150, true),
  ('gt-prolepsis', 'prolepsis', 'A movement forward in narrative time or a hint of future events.', 'Comparative', 'structure', 'A/A*', 160, true),
  ('gt-omniscient-narrator', 'omniscient narrator', 'A narrator with broad knowledge of events, characters, and moral patterns.', 'Hard Times', 'narrative method', 'B/A', 170, true),
  ('gt-limited-perspective', 'limited perspective', 'A restricted viewpoint that controls information and may create misunderstanding.', 'Atonement', 'narrative method', 'B/A', 180, true),
  ('gt-semantic-field', 'semantic field', 'A cluster of related words that builds an atmosphere, idea, or pattern of meaning.', 'Comparative', 'language method', 'B/A', 190, true),
  ('gt-juxtaposition', 'juxtaposition', 'The placement of contrasting ideas, characters, settings, or images beside each other for effect.', 'Comparative', 'method', 'B/A', 200, true),
  ('gt-foil', 'foil', 'A character who highlights another character''s qualities through contrast.', 'Comparative', 'character method', 'B/A', 210, true),
  ('gt-moral-didacticism', 'moral didacticism', 'A mode that openly teaches or directs moral judgement.', 'Hard Times', 'narrative purpose', 'A/A*', 220, true),
  ('gt-utilitarianism', 'utilitarianism', 'A philosophy associated with usefulness and measurable outcomes, satirised by Dickens when it excludes feeling and imagination.', 'Hard Times', 'context', 'A/A*', 230, true),
  ('gt-postmodernism', 'postmodernism', 'A late twentieth-century literary tendency that questions stable truth, authority, originality, and the transparency of narrative.', 'Atonement', 'context', 'A/A*', 240, true),
  ('gt-trauma-narrative', 'trauma narrative', 'Narrative shaped by shock, belated memory, bodily damage, repetition, or difficulty in representing suffering.', 'Atonement', 'genre/mode', 'A/A*', 250, true),
  ('gt-class-consciousness', 'class consciousness', 'Awareness of class position, hierarchy, power, and the assumptions attached to social rank.', 'Comparative', 'context', 'A/A*', 260, true),
  ('gt-gender-ideology', 'gender ideology', 'A set of social beliefs about masculine and feminine roles, behaviour, agency, and authority.', 'Comparative', 'context', 'A/A*', 270, true),
  ('gt-authorial-intrusion', 'authorial intrusion', 'A moment when the narrator openly intervenes, comments, or directs judgement.', 'Hard Times', 'narrative method', 'A/A*', 280, true),
  ('gt-narrative-withholding', 'narrative withholding', 'The strategic delay or concealment of information to shape interpretation.', 'Atonement', 'structure', 'A/A*', 290, true),
  ('gt-ambiguity', 'ambiguity', 'Openness to more than one meaning or judgement, often used to create interpretive complexity.', 'Comparative', 'concept', 'A/A*', 300, true),
  ('gt-polyphony', 'polyphony', 'The presence of multiple voices or viewpoints within a text.', 'Comparative', 'narrative method', 'A/A*', 310, true),
  ('gt-realism', 'realism', 'A mode that creates the impression of believable social life, detail, and causality.', 'Comparative', 'genre/mode', 'B/A', 320, true),
  ('gt-confession', 'confession', 'A form of retrospective admission that may seek truth, absolution, control, or self-justification.', 'Atonement', 'narrative form', 'A/A*', 330, true),
  ('gt-atonement', 'atonement', 'An attempt to make amends for wrongdoing, though the term may expose the gap between confession and repair.', 'Atonement', 'concept', 'A/A*', 340, true),
  ('gt-pathetic-fallacy', 'pathetic fallacy', 'The attribution of emotion or moral pressure to weather, landscape, or atmosphere.', 'Comparative', 'setting method', 'B/A', 350, true),
  ('gt-caricature', 'caricature', 'Exaggerated characterisation used to expose a social type, habit, or ideology.', 'Hard Times', 'character method', 'B/A', 360, true),
  ('gt-epistemological-uncertainty', 'epistemological uncertainty', 'Uncertainty about what can be known, trusted, or verified.', 'Atonement', 'concept', 'A*', 370, true),
  ('gt-retrospective-confession', 'retrospective confession', 'A later-life admission that reshapes the reader''s understanding of earlier events.', 'Atonement', 'narrative form', 'A/A*', 380, true)
on conflict (id) do update set
  term = excluded.term,
  definition = excluded.definition,
  source_text = excluded.source_text,
  category = excluded.category,
  level_tag = excluded.level_tag,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- quote_pairs: 20 cross-text comparative quote pairings
-- ---------------------------------------------------------------------------

insert into public.quote_pairs (
  quote_pair_code, theme_label, hard_times_quote, atonement_quote, hard_times_location, atonement_location,
  method_category, hard_times_method, atonement_method, key_word_image_focus, effect_on_meaning,
  structural_function, ao3_historical_context, ao3_literary_context, ao3_context_trigger_sentence,
  ao4_comparison_type, how_they_compare, why_useful_in_essay, student_action, interpretive_tension
)
values
  ('qp_education_childhood_01', 'education and childhood formation', 'Now, what I want is, Facts.', 'She was one of those children possessed by a desire to have the world just so.', 'Book I classroom opening', 'Part One opening Briony section', 'characterising discourse', 'imperative direct speech', 'free indirect discourse', 'facts / world just so', 'Both openings show adults or children trying to impose order on messy human life.', 'Introduces each novel''s central damaged way of knowing.', 'Victorian utilitarian education and interwar upper-class social training.', 'Didactic realism compared with psychologically filtered modern fiction.', 'Context should show how education and social training become moral formation.', 'parallel with divergence', 'Dickens attacks institutional schooling; McEwan exposes imaginative self-schooling.', 'High utility for education, children, role models, and choices.', 'Use this pair to argue that formation creates later harm.', 'Order can be discipline, but both novels show order becoming coercive.'),
  ('qp_education_childhood_02', 'education and childhood formation', 'Girl number twenty unable to define a horse!', 'She had in mind a more rounded, less deliberate, more childlike approach to the truth.', 'Book I classroom', 'Part One Briony drafting scene', 'dehumanising perspective', 'exclamatory syntax', 'free indirect discourse', 'number / childlike truth', 'Both quotations expose childhood being judged through flawed adult or authorial standards.', 'Links early formation to later questions of truth.', 'Victorian schooling debates and childhood discipline.', 'McEwan revises childhood innocence through retrospective narration.', 'Use context to show why childishness is never neutral in these texts.', 'contrast', 'Dickens shows adults denying childhood; McEwan shows childish narration distorting truth.', 'Useful for childhood, education, truth, and narrative questions.', 'Compare how children are reduced or empowered by language.', 'Childhood is vulnerable, but not automatically innocent.'),
  ('qp_fact_imagination_01', 'imagination versus fact and fiction', 'You don''t know what you''re talking about when you talk about Fancy.', 'Briony had always been a child who could construct a scene with a few telling details.', 'Sleary circus world', 'Part One Briony narration', 'metacommentary on imagination', 'dramatic irony', 'free indirect discourse', 'Fancy / construct a scene', 'Both novels test imagination as a counter-force to narrow fact, but McEwan makes it dangerous.', 'Builds a route from Dickens''s fancy to McEwan''s fiction.', 'Victorian suspicion of utilitarian fact-worship.', 'Postmodern concern with constructed narrative.', 'Context should distinguish imaginative freedom from fictional control.', 'direct conceptual divergence', 'Dickens values fancy as humane; McEwan makes imaginative construction ethically risky.', 'Strong for imagination, truth, and fiction questions.', 'Use to avoid a simplistic pro-imagination argument.', 'Imagination can humanise or falsify.'),
  ('qp_fact_imagination_02', 'imagination versus fact and fiction', 'There is a wisdom of the Head, and a wisdom of the Heart.', 'The truth had become as ghostly as invention.', 'Gradgrind moral recognition', 'Adult Briony retrospective logic', 'antithesis and metaphor', 'antithesis', 'abstract metaphor', 'Head / Heart / ghostly truth', 'Both writers separate rational knowledge from deeper ethical understanding.', 'Works near conclusions about knowledge and repair.', 'Dickens writes within a moral-reform tradition.', 'McEwan writes after modernist and postmodern scepticism about truth.', 'Use context to explain why certainty collapses differently in each novel.', 'difference in resolution', 'Dickens restores balance; McEwan leaves truth haunted by invention.', 'Strong for endings, guilt, hope, and narrative truth.', 'Make this a judgement pair rather than only a language point.', 'Knowing the truth does not guarantee repair.'),
  ('qp_class_injustice_01', 'class injustice', 'It''s a muddle. Aw a muddle!', 'It was not in her interest to see Robbie clearly.', 'Stephen Blackpool scenes', 'Briony/Robbie interpretation', 'voice and perception', 'dialect', 'free indirect discourse', 'muddle / see clearly', 'Class damage appears as both material confusion and perceptual distortion.', 'Links class with truth and social legibility.', 'Working-class speech and Victorian labour politics.', 'Interwar class prejudice and unreliable social perception.', 'Class context should show who is believed and who is made unclear.', 'parallel', 'Dickens gives class suffering a public voice; McEwan shows class prejudice shaping private judgement.', 'High utility for class and social critique.', 'Use to show class as epistemic as well as economic.', 'Class can make people socially unreadable.'),
  ('qp_class_injustice_02', 'class injustice', 'I am Josiah Bounderby of Coketown.', 'She was the one who had seen him. The others had not.', 'Bounderby self-mythology', 'Briony accusation sequence', 'assertive certainty', 'repetition', 'short declaratives', 'I am / she was the one', 'Both speakers or focalised positions turn social confidence into authority.', 'Shows how self-certainty can become power.', 'Industrial self-help myth and capitalist ideology.', 'Upper-class domestic authority and witness credibility.', 'Use context to expose the social basis of certainty.', 'analogy', 'Bounderby manufactures authority; Briony mistakes perception for authority.', 'Useful for class, power, role models, and choices.', 'Track who gets believed and why.', 'Authority often disguises social interest.'),
  ('qp_gender_constraint_01', 'gender and constraint', 'You have trained me so well, that I never dreamed a child''s dream.', 'From her high window, Briony watched her sister''s humiliation.', 'Louisa confronts Gradgrind', 'Fountain scene from Briony''s viewpoint', 'gendered enclosure', 'anaphora', 'spatial focalisation', 'trained / high window', 'Female experience is shaped by confinement, training, and partial vision.', 'Connects Louisa and Cecilia/Briony through family structures.', 'Victorian separate spheres and patriarchal education.', 'Interwar gender codes and female authorship.', 'Context should not flatten all women into victims; it should show different forms of constraint.', 'comparative variation', 'Dickens foregrounds emotional training; McEwan foregrounds looking, misreading, and social display.', 'Useful for female relationships, independence, marriage.', 'Compare constraint through voice and space.', 'Female agency is present but socially framed.'),
  ('qp_gender_constraint_02', 'gender and constraint', 'Father, I have often thought that life is very short. This is the first time I have thought, that life may be long.', 'Come back. Come back to me.', 'Louisa after emotional crisis', 'Cecilia/Robbie separation', 'repetition and emotional pressure', 'parallelism', 'imperative mood', 'life short/long / come back', 'Both moments turn female feeling into compressed language under pressure.', 'Supports a paragraph on love, hope, and constraint.', 'Victorian marriage and filial duty.', 'War separation and gendered waiting.', 'Use context to link private speech with historical constraint.', 'parallel', 'Louisa speaks from a failed domestic system; Cecilia speaks against forced separation.', 'Useful for love, marriage, hope, and independence.', 'Analyse repetition as emotional compression.', 'Love is powerful but not socially free.'),
  ('qp_moral_responsibility_01', 'moral responsibility', 'I have been bent and broken, but - I hope - into a better shape.', 'She would never be able to undo what she had done and she knew it. Nevertheless, she had to try.', 'Gradgrind remorse', 'Adult Briony restitution attempt', 'belated self-judgement', 'metaphor and parenthesis', 'adversative conjunction', 'bent and broken / nevertheless', 'Both quotations frame responsibility as belated and incomplete.', 'Useful for endings and moral development.', 'Dickensian reform and moral didacticism.', 'Confession and late twentieth-century scepticism about repair.', 'Context should explain why apology is not the same as repair.', 'parallel with sharper divergence', 'Dickens permits moral reshaping; McEwan stresses the impossibility of undoing harm.', 'Core pair for guilt, responsibility, and hope.', 'Judge the limits of late remorse.', 'Belated responsibility may be necessary but insufficient.'),
  ('qp_moral_responsibility_02', 'moral responsibility', 'How could you give me life, and take from me all the inappreciable things that raise it from the state of conscious death?', 'How can a novelist achieve atonement when, with her absolute power of deciding outcomes, she is also God?', 'Louisa confronts Gradgrind', 'Final coda', 'rhetorical questioning', 'rhetorical question', 'rhetorical question', 'life / God / power', 'Both questions accuse forms of authority that create life while limiting its meaning.', 'Connects family authority to authorial authority.', 'Victorian patriarchy and utilitarian education.', 'Metafiction and authorial power.', 'Use context to compare authority across family, society, and narration.', 'conceptual analogy', 'Gradgrind''s parental power damages Louisa; Briony''s authorial power controls the dead.', 'Excellent for A* conclusions.', 'Move beyond plot into power and ethics.', 'Authority can create meaning while violating autonomy.'),
  ('qp_guilt_damage_01', 'guilt and damage', 'They were tired, they were exhausted, they were sick of all the facts and figures with which they were overloaded.', 'A person is, among all else, a material thing, easily torn, not easily mended.', 'Gradgrind children/Louisa damage', 'War hospital/body reflection', 'body and burden imagery', 'anaphora', 'aphorism', 'overloaded / torn / mended', 'Both writers make damage bodily, not merely emotional or intellectual.', 'Expands guilt into embodied consequence.', 'Educational overload and industrial discipline.', 'War trauma and medical materiality.', 'Context should make the body a site of historical pressure.', 'parallel', 'Dickens shows psychic exhaustion from facts; McEwan shows bodily vulnerability in war.', 'Useful for difficult circumstances, war, education.', 'Use to connect method to human cost.', 'Systems write themselves onto bodies.'),
  ('qp_guilt_damage_02', 'guilt and damage', 'There seems to be nothing there but languid and monotonous smoke. Yet when the night comes, Fire bursts out.', 'There was nothing she could do about it, and they would never meet again.', 'Louisa fire imagery', 'Coda revelation', 'suppressed consequence', 'juxtaposition', 'flat declarative statement', 'smoke/fire / nothing/never', 'Both quotations reveal pressure that cannot remain hidden.', 'Good for structural turn points and late consequence.', 'Victorian emotional repression.', 'Retrospective narration and irrevocable loss.', 'Context should show why repression returns as damage.', 'contrast', 'Dickens dramatises repressed feeling erupting; McEwan states finality without consolation.', 'Useful for guilt, endings, hope, and repression.', 'Analyse tonal difference.', 'Hidden damage eventually becomes visible, but not always reparable.'),
  ('qp_systems_power_01', 'social systems and institutional power', 'Let us strike the key-note, Coketown, before pursuing our tune.', 'Older, harsher experience confirmed what the girl had merely intuited.', 'Narrator introduces Coketown', 'Adult perspective on youthful error', 'structural framing', 'narratorial intrusion', 'temporal contrast', 'key-note / older experience', 'Both quotations reveal narrators organising experience into patterns.', 'Useful for comparing narrative authority.', 'Public moral narrator in Victorian fiction.', 'Retrospective narrative structure in contemporary fiction.', 'Use context to compare how narrators teach the reader.', 'formal contrast', 'Dickens openly conducts judgement; McEwan makes later judgement revise earlier belief.', 'Useful for settings, truth, and narrative questions.', 'Ask how narration creates authority.', 'Narrative order is itself a form of power.'),
  ('qp_systems_power_02', 'social systems and institutional power', 'I have been ruthless in the matter of pounds, shillings, and pence - but I can change.', 'The problem these fifty-nine years has been this: how can a novelist achieve atonement when, with her absolute power of deciding outcomes, she is also God?', 'Gradgrind financial language', 'Final coda', 'confession and power', 'financial register', 'direct address', 'pounds / absolute power', 'Both speakers confront the systems of value that shaped their wrongs.', 'Works for high-level responsibility arguments.', 'Political economy and moral reform.', 'Authorial ethics and retrospective confession.', 'Context should show how value systems shape moral imagination.', 'comparative divergence', 'Gradgrind imagines change in life; Briony faces power after irreversible loss.', 'Useful for responsibility and endings.', 'Compare different kinds of confession.', 'Confession exposes power but does not erase its effects.'),
  ('qp_narrative_truth_01', 'narrative truth', 'There is a wisdom of the Head, and a wisdom of the Heart.', 'In my account of what happened at the library I have described Robbie''s state of mind in detail... In fact, he says nothing of the kind.', 'Gradgrind recognition', 'Coda narrative confession', 'truth and correction', 'antithesis', 'metafictional confession', 'wisdom / in fact', 'Both quotations distinguish surface knowledge from ethically responsible understanding.', 'Useful for analysing correction and revision.', 'Dickensian moral clarity.', 'Metafictional revision of realist authority.', 'Use context to explain how truth is revised in each form.', 'contrast', 'Dickens frames correction as moral balance; McEwan frames correction as exposure of fiction-making.', 'Useful for truth, fiction, and choices.', 'Show how form creates the argument.', 'Correction can clarify, but it can also reveal prior manipulation.'),
  ('qp_narrative_truth_02', 'narrative truth', 'Quadruped. Graminivorous. Forty teeth, namely twenty-four grinders, four eye-teeth, and twelve incisive.', 'She knew. It was Robbie. With that certainty she could start to calculate what had to be done.', 'Bitzer horse definition', 'Briony accusation sequence', 'false precision', 'listing', 'short declaratives', 'definition / certainty', 'Both quotations show how precision can be mistaken for truth.', 'Good for education and perception links.', 'Empirical classification in Victorian education.', 'Child witness and narrative unreliability.', 'Context should show why certainty is culturally rewarded but ethically dangerous.', 'parallel', 'Dickens satirises factual precision; McEwan exposes moral catastrophe caused by false certainty.', 'Very strong for education, truth, and children.', 'Analyse sentence shape as intellectual error.', 'Certainty is not the same as understanding.'),
  ('qp_violence_cost_01', 'violence and human cost', 'It was a town of red brick, or of brick that would have been red if the smoke and ashes had allowed it.', 'The vase fell and broke with a sound that rang out in the silence like a pistol shot.', 'Coketown description', 'Fountain scene', 'violent imagery in objects', 'conditional syntax', 'simile', 'smoke/ashes / pistol shot', 'Both writers load objects and settings with violence before open catastrophe arrives.', 'Links industrial violence and domestic/war foreshadowing.', 'Factory pollution and industrial capitalism.', 'Interwar domestic space shadowed by later war.', 'Use context to show violence can be atmospheric before it is physical.', 'foreshadowing comparison', 'Dickens makes industrial violence environmental; McEwan lets domestic rupture echo future war.', 'Useful for conflict, settings, violence.', 'Track how images forecast wider harm.', 'Violence often enters first as atmosphere.'),
  ('qp_violence_cost_02', 'violence and human cost', 'It''s a muddle. Aw a muddle!', 'A person is, among all else, a material thing, easily torn, not easily mended.', 'Stephen Blackpool''s social trap', 'Robbie''s war sections', 'plain suffering', 'dialect', 'aphorism', 'muddle / torn / mended', 'Both quotations resist heroic consolation by stressing confusion and vulnerability.', 'Useful for difficult circumstances and institutional violence.', 'Industrial labour and legal/social exclusion.', 'Modern warfare and bodily trauma.', 'Context should keep the focus on ordinary human cost.', 'parallel', 'Stephen suffers under class machinery; Robbie suffers under class prejudice and war machinery.', 'Useful for class, conflict, war, and suffering.', 'Compare how simple language intensifies seriousness.', 'The novels distrust heroic simplification.'),
  ('qp_endings_resolution_01', 'endings and moral resolution', 'Dear father, you are tired. You have been so tender to me. You have done so much.', 'I gave them happiness, but I was not so self-serving as to let them forgive me.', 'Louisa and Gradgrind late tenderness', 'Final coda', 'qualified consolation', 'tricolon', 'self-correction mid-sentence', 'tender / happiness / forgive', 'Both endings offer consolation while limiting what consolation can mean.', 'Strong for hope, endings, and repair.', 'Victorian moral reconciliation.', 'Postmodern scepticism about invented happiness.', 'Context should show why closure works differently in the two periods.', 'divergence in closure', 'Dickens allows tenderness to count as moral repair; McEwan refuses full forgiveness.', 'Excellent for conclusion on hope or guilt.', 'Judge what each ending can and cannot repair.', 'Consolation may be ethically necessary but incomplete.'),
  ('qp_endings_resolution_02', 'endings and moral resolution', 'I have been bent and broken, but - I hope - into a better shape.', 'I like to think that it isn''t weakness or evasion, but a final act of kindness, a stand against oblivion and despair.', 'Gradgrind changed by suffering', 'Final coda self-justification', 'qualified hope', 'parenthesis', 'qualified assertion', 'hope / evasion / kindness', 'Both quotations make hope conditional and self-questioning.', 'Useful for sophisticated final judgement.', 'Dickensian moral growth.', 'Late twentieth-century ethical self-questioning.', 'Use context to distinguish moral reform from narrative self-defence.', 'qualified comparison', 'Dickens presents hope as reshaping; McEwan presents hope as possibly self-serving fiction.', 'High utility for hope, endings, and atonement.', 'Use the qualifiers as method evidence.', 'Hope is most persuasive when the text admits its limits.'),
  ('qp_love_choice_01', 'love and important choices', 'Father, I have often thought that life is very short. This is the first time I have thought, that life may be long.', 'He needed to see her, even for a moment, to know that she was real.', 'Louisa emotional crisis', 'Robbie separated from Cecilia', 'love under pressure', 'parallelism', 'free indirect discourse', 'life / real', 'Both quotations present love as a test of reality against systems that make life feel emptied or unreal.', 'Supports love, hope, and difficult circumstances.', 'Victorian marriage constraint.', 'War separation and memory.', 'Context should connect private feeling to larger social pressures.', 'parallel', 'Louisa discovers emotional deprivation; Robbie clings to Cecilia as proof against war damage.', 'Useful for love and hope questions.', 'Analyse how private feeling resists dehumanisation.', 'Love can preserve reality but not guarantee safety.'),
  ('qp_role_models_01', 'role models and moral influence', 'People mutht be amuthed. They can''t be alwayth a learning, nor yet they can''t be alwayth a working, they must be amuthed.', 'She was not yet old enough to understand that making a new draft would not atone for her mistake.', 'Sleary''s humane philosophy', 'Young Briony writing logic', 'moral education', 'dialect and repetition', 'free indirect discourse', 'amused / draft / atone', 'Both quotations teach limits: humans need play, but writing cannot magically repair wrongdoing.', 'Useful for role models and moral formation.', 'Circus culture as alternative education.', 'Authorship, childhood, and retrospective correction.', 'Use context to compare humane instruction with painful self-instruction.', 'contrast', 'Sleary offers practical wisdom; Briony learns ethical limits too late.', 'Useful for role models, education, and imagination.', 'Set up judgement about what students learn from each text.', 'Moral education may come from unlikely places or painful failure.')
on conflict (quote_pair_code) do update set
  theme_label = excluded.theme_label,
  hard_times_quote = excluded.hard_times_quote,
  atonement_quote = excluded.atonement_quote,
  hard_times_location = excluded.hard_times_location,
  atonement_location = excluded.atonement_location,
  method_category = excluded.method_category,
  hard_times_method = excluded.hard_times_method,
  atonement_method = excluded.atonement_method,
  key_word_image_focus = excluded.key_word_image_focus,
  effect_on_meaning = excluded.effect_on_meaning,
  structural_function = excluded.structural_function,
  ao3_historical_context = excluded.ao3_historical_context,
  ao3_literary_context = excluded.ao3_literary_context,
  ao3_context_trigger_sentence = excluded.ao3_context_trigger_sentence,
  ao4_comparison_type = excluded.ao4_comparison_type,
  how_they_compare = excluded.how_they_compare,
  why_useful_in_essay = excluded.why_useful_in_essay,
  student_action = excluded.student_action,
  interpretive_tension = excluded.interpretive_tension,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- quote_question_links: link all 40 existing quote_methods to real questions
-- ---------------------------------------------------------------------------

with mappings(quote_id, question_id, relevance_score, rationale) as (
  values
    ('qm_ht_01', 'q-education', 100, 'Gradgrind''s opening demand is the core evidence for education and fact-worship.'),
    ('qm_ht_01', 'q-critique-of-society', 92, 'The classroom becomes a miniature version of Dickens''s social critique.'),
    ('qm_ht_02', 'q-hope', 92, 'Head/Heart antithesis supports arguments about moral repair and hope.'),
    ('qm_ht_02', 'q-love', 88, 'The contrast between intellect and feeling helps analyse love and emotional education.'),
    ('qm_ht_03', 'q-education', 96, 'The horse definition satirises sterile factual education.'),
    ('qm_ht_03', 'q-roles-of-children', 88, 'Bitzer/Sissy contrast exposes how children are trained to value facts over humanity.'),
    ('qm_ht_04', 'q-settings', 98, 'Coketown description is central setting evidence.'),
    ('qm_ht_04', 'q-conflict', 85, 'Smoke and ashes imply industrial conflict and environmental violence.'),
    ('qm_ht_05', 'q-difficult-circumstances', 92, 'Overloaded bodies and minds show characters under systemic pressure.'),
    ('qm_ht_05', 'q-education', 88, 'The language of overload critiques fact-heavy formation.'),
    ('qm_ht_06', 'q-marriage', 90, 'Smoke and fire imagery helps read Louisa''s repressed marriage.'),
    ('qm_ht_06', 'q-love', 86, 'The image dramatises feeling trapped beneath social routine.'),
    ('qm_ht_07', 'q-critique-of-society', 100, 'Stephen''s muddle is core class and social injustice evidence.'),
    ('qm_ht_07', 'q-difficult-circumstances', 96, 'The line captures working-class entrapment.'),
    ('qm_ht_08', 'q-critique-of-society', 92, 'Bounderby''s self-myth exposes capitalist ideology.'),
    ('qm_ht_08', 'q-role-models', 82, 'Bounderby functions as a negative social model.'),
    ('qm_ht_09', 'q-roles-of-children', 96, 'Louisa diagnoses the cost of her childhood training.'),
    ('qm_ht_09', 'q-education', 94, 'The line directly links education to emotional deprivation.'),
    ('qm_ht_10', 'q-important-choices', 88, 'Louisa challenges Gradgrind''s formative choices.'),
    ('qm_ht_10', 'q-changing-relationships', 86, 'The confrontation changes father-daughter understanding.'),
    ('qm_ht_11', 'q-marriage', 90, 'Mrs Sparsit''s staircase fantasy reveals surveillance around marriage.'),
    ('qm_ht_11', 'q-female-relationships', 82, 'Her watching of Louisa gives a female relationship route.'),
    ('qm_ht_12', 'q-hope', 96, 'Gradgrind''s reshaping is a strong hope and repair quotation.'),
    ('qm_ht_12', 'q-important-choices', 88, 'His remorse supports judgement about change after damaging choices.'),
    ('qm_ht_13', 'q-education', 90, 'The Fancy line attacks narrow adult definitions of learning.'),
    ('qm_ht_13', 'q-roles-of-children', 84, 'It shows children being denied imaginative understanding.'),
    ('qm_ht_14', 'q-friendship', 82, 'Sleary''s humane community supports alternative social bonds.'),
    ('qm_ht_14', 'q-critique-of-society', 86, 'The circus philosophy critiques a work-only society.'),
    ('qm_ht_15', 'q-marriage', 88, 'Harthouse/Bounderby-era observation helps analyse emotional struggle in marriage.'),
    ('qm_ht_15', 'q-love', 82, 'The line exposes feeling as studied, watched, and pressured.'),
    ('qm_ht_16', 'q-marriage', 92, 'Louisa''s life-short/life-long contrast is core marriage evidence.'),
    ('qm_ht_16', 'q-independence', 86, 'It shows the cost of trying to imagine a different life.'),
    ('qm_ht_17', 'q-education', 94, 'The numbered child quotation is essential classroom satire.'),
    ('qm_ht_17', 'q-roles-of-children', 92, 'It dehumanises Sissy as a child in the school system.'),
    ('qm_ht_18', 'q-settings', 94, 'The narrator makes Coketown a structural key-note.'),
    ('qm_ht_18', 'q-critique-of-society', 88, 'Narratorial intrusion turns setting into social argument.'),
    ('qm_ht_19', 'q-hope', 90, 'Gradgrind''s financial register and change claim support moral repair.'),
    ('qm_ht_19', 'q-critique-of-society', 86, 'The line exposes money as a value system Dickens critiques.'),
    ('qm_ht_20', 'q-changing-relationships', 90, 'Louisa''s tender address shows altered father-daughter relation.'),
    ('qm_ht_20', 'q-hope', 84, 'The tricolon supports guarded emotional repair.'),
    ('qm_at_01', 'q-roles-of-children', 96, 'Briony''s desire for control is central childhood evidence.'),
    ('qm_at_01', 'q-important-choices', 90, 'Her ordering impulse leads toward damaging choices.'),
    ('qm_at_02', 'q-important-choices', 92, 'The claim to have seen Robbie drives the accusation.'),
    ('qm_at_02', 'q-critique-of-society', 88, 'Her perception is shaped by social assumptions about Robbie.'),
    ('qm_at_03', 'q-hope', 94, 'The final question tests whether narrative can offer hope or repair.'),
    ('qm_at_03', 'q-critique-of-society', 84, 'Authorial power can be compared with other social powers.'),
    ('qm_at_04', 'q-important-choices', 90, 'The confession revises earlier narrative choices.'),
    ('qm_at_04', 'q-hope', 86, 'It asks whether truthful revision can repair damage.'),
    ('qm_at_05', 'q-conflict', 94, 'The body aphorism is core evidence for war and violence.'),
    ('qm_at_05', 'q-difficult-circumstances', 92, 'It captures physical vulnerability under historical pressure.'),
    ('qm_at_06', 'q-roles-of-children', 90, 'Young Briony''s drafting logic shows childish moral limits.'),
    ('qm_at_06', 'q-education', 82, 'It works for self-education and moral learning.'),
    ('qm_at_07', 'q-settings', 90, 'The high window frames perspective through space.'),
    ('qm_at_07', 'q-female-relationships', 84, 'Briony watching Cecilia creates a sisterly misreading.'),
    ('qm_at_08', 'q-important-choices', 98, 'False certainty triggers the central damaging choice.'),
    ('qm_at_08', 'q-roles-of-children', 88, 'The line shows a child converting perception into action.'),
    ('qm_at_09', 'q-love', 94, 'Robbie''s need to see Cecilia is central love evidence.'),
    ('qm_at_09', 'q-hope', 88, 'Cecilia becomes a fragile anchor of hope.'),
    ('qm_at_10', 'q-hope', 90, 'The flat declarative denies easy hope.'),
    ('qm_at_10', 'q-conflict', 84, 'It links war and narrative finality.'),
    ('qm_at_11', 'q-hope', 94, 'Briony gives happiness but withholds forgiveness.'),
    ('qm_at_11', 'q-love', 82, 'The invented happiness concerns Robbie and Cecilia''s love.'),
    ('qm_at_12', 'q-love', 92, 'The vase scene crystallises desire and rupture.'),
    ('qm_at_12', 'q-settings', 88, 'The fountain setting makes domestic space symbolic.'),
    ('qm_at_13', 'q-critique-of-society', 94, 'The line directly shows interest and class-shaped misrecognition.'),
    ('qm_at_13', 'q-changing-relationships', 86, 'It exposes the social convenience of misreading Robbie.'),
    ('qm_at_14', 'q-love', 94, 'The imperative is central to separated love.'),
    ('qm_at_14', 'q-conflict', 86, 'War makes reunion urgent and uncertain.'),
    ('qm_at_15', 'q-hope', 96, 'The fifty-nine-year question is a final test of atonement.'),
    ('qm_at_15', 'q-important-choices', 84, 'It reframes Briony''s lifelong narrative choice.'),
    ('qm_at_16', 'q-roles-of-children', 92, 'Briony constructs scenes as a child author.'),
    ('qm_at_16', 'q-education', 82, 'The quote supports moral formation through story-making.'),
    ('qm_at_17', 'q-roles-of-children', 90, 'Her childlike approach to truth is a key childhood limitation.'),
    ('qm_at_17', 'q-important-choices', 84, 'The quote shows truth being shaped before choice.'),
    ('qm_at_18', 'q-difficult-circumstances', 86, 'Older experience confirms and complicates youthful intuition.'),
    ('qm_at_18', 'q-conflict', 86, 'War experience hardens perception and judgement.'),
    ('qm_at_19', 'q-important-choices', 94, 'The line captures responsibility after irreversible action.'),
    ('qm_at_19', 'q-hope', 90, 'The adversative nevertheless keeps repair possible but limited.'),
    ('qm_at_20', 'q-hope', 96, 'The final self-defence is central to hope versus evasion.'),
    ('qm_at_20', 'q-love', 82, 'It frames invented happiness for Robbie and Cecilia as kindness.')
)
insert into public.quote_question_links (quote_id, question_id, relevance_score, rationale)
select m.quote_id, m.question_id, m.relevance_score, m.rationale
from mappings m
join public.quote_methods qm on qm.id = m.quote_id
join public.questions q on q.id = m.question_id
on conflict (quote_id, question_id) do update set
  relevance_score = excluded.relevance_score,
  rationale = excluded.rationale,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Learning pipeline: modules, lessons, resources for /learn
-- ---------------------------------------------------------------------------

insert into public.modules (slug, title, summary, position, published)
values
  ('component-2-exam-method', 'Component 2 Exam Method', 'Core habits for Pearson Edexcel comparative prose essays: argument, method, context, comparison, and judgement.', 10, true),
  ('hard-times-core-knowledge', 'Hard Times Core Knowledge', 'High-utility Dickens knowledge for education, class, industrial systems, gender, and moral repair.', 20, true),
  ('atonement-core-knowledge', 'Atonement Core Knowledge', 'High-utility McEwan knowledge for narrative authority, guilt, class, war, memory, and authorship.', 30, true),
  ('comparative-essay-construction', 'Comparative Essay Construction', 'Practical planning and paragraph building for Hard Times and Atonement comparison routes.', 40, true)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  position = excluded.position,
  published = excluded.published,
  updated_at = now();

with lesson_seed(module_slug, slug, title, body, estimated_minutes, position) as (
  values
    ('component-2-exam-method', 'what-the-paper-rewards', 'What the Paper Rewards', 'Build a comparative argument that answers the wording directly. Every paragraph should connect AO1 argument, AO2 method, AO3 context, and AO4 comparison rather than treating them as separate checklist items.', 8, 10),
    ('component-2-exam-method', 'ao-balance-without-bolting-on', 'AO Balance Without Bolting On', 'Start with the question focus, choose one precise method from each text, add context only where it changes interpretation, then finish with a comparative judgement.', 10, 20),
    ('component-2-exam-method', 'timed-planning-routine', 'Timed Planning Routine', 'Spend five minutes choosing a route, three evidence pairs, and a final judgement. Avoid long introductions: the thesis should create the comparison immediately.', 7, 30),
    ('component-2-exam-method', 'examiner-risk-checks', 'Examiner Risk Checks', 'Check for plot retelling, context dumping, one-text paragraphs, vague comparison, and method labels that are not tied to meaning.', 6, 40),
    ('hard-times-core-knowledge', 'facts-fancy-education', 'Facts, Fancy, and Education', 'Track how Gradgrind''s school, Sissy, Bitzer, Tom, and Louisa turn education into a moral test of what counts as knowledge.', 10, 10),
    ('hard-times-core-knowledge', 'coketown-class-systems', 'Coketown, Class, and Systems', 'Use Coketown, Hands, Bounderby, and Stephen to show class as an industrial system rather than a background theme.', 10, 20),
    ('hard-times-core-knowledge', 'louisa-feeling-family', 'Louisa, Feeling, and Family', 'Use Louisa''s crisis to connect gender, marriage, emotional repression, and Gradgrind''s partial reform.', 9, 30),
    ('hard-times-core-knowledge', 'sissy-circus-humane-values', 'Sissy, Circus, and Humane Values', 'The circus is not only comic relief: it provides a counter-education based on fancy, care, and practical wisdom.', 8, 40),
    ('atonement-core-knowledge', 'briony-perception-guilt', 'Briony, Perception, and Guilt', 'Read Briony as child witness, author, and later confessor. The key is not only that she is wrong, but how narrative makes wrongness feel certain.', 10, 10),
    ('atonement-core-knowledge', 'vase-fountain-letter', 'Vase, Fountain, and Letter', 'Use the vase, fountain scene, and letter to connect desire, class, written language, and misinterpretation.', 9, 20),
    ('atonement-core-knowledge', 'robbie-class-war', 'Robbie, Class, and War', 'Robbie''s story moves from class prejudice to wartime bodily damage, making social and institutional violence continuous.', 10, 30),
    ('atonement-core-knowledge', 'coda-fiction-repair', 'Coda, Fiction, and Repair', 'The coda tests whether fiction can witness, repair, or control harm. Keep the judgement balanced and precise.', 8, 40),
    ('comparative-essay-construction', 'building-a-comparative-thesis', 'Building a Comparative Thesis', 'A strong thesis names the shared concern and the difference in treatment: for example, Dickens externalises harm through institutions while McEwan internalises it through perception and memory.', 9, 10),
    ('comparative-essay-construction', 'quote-pair-selection', 'Quote Pair Selection', 'Pair evidence by conceptual function, not theme label alone. Ask what each quote does in the argument.', 8, 20),
    ('comparative-essay-construction', 'paragraph-sequence', 'Paragraph Sequence', 'Plan three paragraphs as a route: origin of harm, method of presentation, and final judgement about repair or consequence.', 9, 30),
    ('comparative-essay-construction', 'closing-judgements', 'Closing Judgements', 'End by judging the difference between the novels, not by repeating the question. The best conclusions explain why the comparison matters.', 7, 40)
)
insert into public.lessons (module_id, slug, title, body, estimated_minutes, position, published)
select m.id, ls.slug, ls.title, ls.body, ls.estimated_minutes, ls.position, true
from lesson_seed ls
join public.modules m on m.slug = ls.module_slug
on conflict (module_id, slug) do update set
  title = excluded.title,
  body = excluded.body,
  estimated_minutes = excluded.estimated_minutes,
  position = excluded.position,
  published = excluded.published,
  updated_at = now();

with resource_seed(module_slug, lesson_slug, title, description, resource_type, position) as (
  values
    ('component-2-exam-method', 'what-the-paper-rewards', 'AO1-AO4 answer checklist', 'Before writing, check that your plan has an argument, two methods, one context link, and a clear comparison.', 'checklist', 10),
    ('component-2-exam-method', 'ao-balance-without-bolting-on', 'Context integration mini-guide', 'Use context only when it changes the meaning of a quote or comparison.', 'mini-guide', 20),
    ('component-2-exam-method', 'timed-planning-routine', 'Five-minute route drill', 'Choose a question, route, three quote pairs, and a final judgement in five minutes.', 'recall drill', 30),
    ('component-2-exam-method', 'examiner-risk-checks', 'Risk removal task', 'Rewrite one paragraph to remove plot summary, bolted-on context, and vague comparison.', 'timed practice task', 40),
    ('hard-times-core-knowledge', 'facts-fancy-education', 'Facts versus fancy recall drill', 'Recall three quotes and one context point for education and imagination.', 'recall drill', 10),
    ('hard-times-core-knowledge', 'coketown-class-systems', 'Coketown systems checklist', 'Check whether your paragraph links setting, class, labour, and Dickens''s social critique.', 'checklist', 20),
    ('hard-times-core-knowledge', 'louisa-feeling-family', 'Louisa model paragraph prompt', 'Write a paragraph on Louisa as evidence of emotional damage caused by utilitarian family life.', 'model paragraph prompt', 30),
    ('hard-times-core-knowledge', 'sissy-circus-humane-values', 'Circus mini-guide', 'Use Sleary and Sissy as counter-education, not as simple comic relief.', 'mini-guide', 40),
    ('atonement-core-knowledge', 'briony-perception-guilt', 'Briony certainty drill', 'Recall two moments where certainty becomes morally dangerous.', 'recall drill', 10),
    ('atonement-core-knowledge', 'vase-fountain-letter', 'Object motif checklist', 'Connect vase, fountain, and letter to class, desire, misreading, and written evidence.', 'checklist', 20),
    ('atonement-core-knowledge', 'robbie-class-war', 'Robbie timed practice task', 'Plan a paragraph linking class prejudice to wartime institutional damage.', 'timed practice task', 30),
    ('atonement-core-knowledge', 'coda-fiction-repair', 'Coda judgement mini-guide', 'Balance repair, kindness, evasion, and authorial control in one final judgement.', 'mini-guide', 40),
    ('comparative-essay-construction', 'building-a-comparative-thesis', 'Thesis upgrade drill', 'Turn a theme statement into a comparative argument with a clear divergence.', 'recall drill', 10),
    ('comparative-essay-construction', 'quote-pair-selection', 'Quote pair selection checklist', 'Pair quotes because they perform comparable work in the essay, not because they share a broad topic.', 'checklist', 20),
    ('comparative-essay-construction', 'paragraph-sequence', 'Three-paragraph route planner', 'Sequence origin, method, and judgement so the essay develops rather than repeats.', 'mini-guide', 30),
    ('comparative-essay-construction', 'closing-judgements', 'Closing sentence prompt', 'Write a final sentence explaining why Dickens and McEwan differ over repair, truth, or social damage.', 'model paragraph prompt', 40)
)
insert into public.resources (module_id, lesson_id, title, description, resource_type, position, published)
select m.id, l.id, rs.title, rs.description, rs.resource_type, rs.position, true
from resource_seed rs
join public.modules m on m.slug = rs.module_slug
join public.lessons l on l.module_id = m.id and l.slug = rs.lesson_slug
where not exists (
  select 1
  from public.resources r
  where r.lesson_id = l.id
    and r.title = rs.title
);

-- ---------------------------------------------------------------------------
-- Optional low-risk support tables
-- ---------------------------------------------------------------------------

insert into public.paragraph_templates (template_name, template_body, paragraph_function, grade_level, published)
values
  ('Comparative method paragraph', 'Topic judgement. Hard Times method evidence and analysis. Atonement method evidence and analysis. Context only where it shifts meaning. Final comparative judgement.', 'comparative analysis', 'A/A*', true),
  ('Context-integrated paragraph', 'Claim about the question focus. Quote from text one. Context that changes interpretation. Quote from text two. Comparative context link. Judgement.', 'AO3 integration', 'A/A*', true),
  ('Counter-reading paragraph', 'Main reading. Evidence. Alternative reading. Weigh which reading is more persuasive for the question. Link back to the comparison.', 'counter-reading', 'A*', true),
  ('Ending judgement paragraph', 'Compare what each ending can repair. Analyse one method from each ending. Add literary context. Finish by judging the limits of closure.', 'conclusion support', 'A*', true),
  ('Quote-pair close analysis paragraph', 'Introduce why the pair matters. Analyse key word or image in quote one. Analyse key word or image in quote two. Explain convergence and divergence.', 'AO2 comparison', 'A/A*', true),
  ('Class systems paragraph', 'Claim about class as structure. Dickens evidence. McEwan evidence. Historical context. Judgement about belief, power, and social harm.', 'theme route', 'A/A*', true),
  ('Narrative truth paragraph', 'Claim about truth. Narration/focalisation evidence. Metafiction or narrator evidence. Context on form. Judgement about certainty and repair.', 'theme route', 'A*', true),
  ('Timed essay body paragraph', 'One-sentence claim. Two short quote analyses. One integrated context sentence. One comparative judgement sentence.', 'timed practice', 'B/A', true)
on conflict do nothing;

insert into public.library_paragraph_frames (
  frame_title, frame_text, source_text, opening_stem, comparison_stem, ao2_stem, ao3_stem, ao4_stem,
  interpretive_stem, theme_tags, ao_tags, grade_band, use_case, notes, content_hash, source_dataset
)
values
  ('Systems and harm frame', 'Both novels present harm as systemic, but they locate the system differently: Dickens in public institutions and industrial routines, McEwan in class perception, war, and narrative control.', 'Comparative', 'Both novels present harm as systemic, but they locate the system differently...', 'Where Dickens externalises the pressure, McEwan internalises it through perception and memory.', 'The method turns private suffering into a wider argument.', 'Context matters because each system belongs to a different historical pressure.', 'The comparison shows shared concern but different explanatory models.', 'A sophisticated reading weighs system against individual responsibility.', array['systems', 'class', 'guilt'], array['AO1', 'AO2', 'AO3', 'AO4'], 'A/A*', 'opening/body paragraph', null, md5('frame|Systems and harm frame'), 'codex_audit_seed_20260518'),
  ('Education and childhood frame', 'Dickens and McEwan both present childhood as formation rather than innocence: Gradgrind trains children into facts, while Briony trains perception into story.', 'Comparative', 'Childhood is not simply innocence in either novel...', 'Both texts show young minds being shaped, but the forms of training differ.', 'Close analysis should focus on declaratives, focalisation, and repeated motifs.', 'Use utilitarian education and interwar class/gender assumptions as context.', 'Dickens makes formation institutional; McEwan makes it interpretive.', 'The best judgement asks how far children are victims or agents of later harm.', array['childhood', 'education', 'truth and perception'], array['AO1', 'AO2', 'AO3', 'AO4'], 'A/A*', 'education/children questions', null, md5('frame|Education and childhood frame'), 'codex_audit_seed_20260518'),
  ('Narrative truth frame', 'The two novels ask what counts as truth: Dickens trusts moral narration to expose false systems, while McEwan makes narration itself ethically suspect.', 'Comparative', 'The question of truth is formal as well as thematic...', 'Dickens clarifies moral error; McEwan dramatises the danger of constructed certainty.', 'Analyse narrator intrusion, focalisation, or metafiction as method.', 'Bring in realism and postmodern uncertainty only where they affect judgement.', 'The divergence lies in how much authority narration can claim.', 'A strong reading admits that fiction can reveal truth while also controlling it.', array['truth and fiction', 'narrative authority', 'guilt'], array['AO1', 'AO2', 'AO3', 'AO4'], 'A*', 'truth/narrative questions', null, md5('frame|Narrative truth frame'), 'codex_audit_seed_20260518'),
  ('Class and belief frame', 'Class shapes not only wealth but credibility: Dickens shows workers reduced to function, while McEwan shows Robbie made vulnerable to convenient misreading.', 'Comparative', 'Class in both novels is a structure of belief...', 'The comparison should track who is trusted, named, and socially legible.', 'Analyse labels, speech, and focalised judgement.', 'Use Victorian industrial class and interwar hierarchy as context.', 'Both novels expose class as violence, though one is industrial and the other perceptual.', 'The key judgement is that class can make injustice appear natural.', array['class', 'social injustice', 'truth and perception'], array['AO1', 'AO2', 'AO3', 'AO4'], 'A/A*', 'class/social critique questions', null, md5('frame|Class and belief frame'), 'codex_audit_seed_20260518'),
  ('Endings and repair frame', 'Both endings are concerned with repair, but Dickens allows moral reshaping while McEwan leaves repair trapped inside belated fiction.', 'Comparative', 'The endings should be read as arguments about repair...', 'Dickens offers guarded moral correction, whereas McEwan tests whether invented consolation is ethically enough.', 'Analyse qualification, repetition, and final structural revelations.', 'Use serial moral didacticism and metafictional context to sharpen the contrast.', 'The comparison turns on what each novel believes narrative can do after harm.', 'A sophisticated conclusion should avoid calling either ending simply happy or hopeless.', array['hope', 'guilt', 'truth and fiction'], array['AO1', 'AO2', 'AO3', 'AO4'], 'A*', 'conclusion/endings questions', null, md5('frame|Endings and repair frame'), 'codex_audit_seed_20260518'),
  ('Setting as pressure frame', 'Settings in both novels act as pressures on consciousness: Coketown disciplines bodies and routines, while the Tallis estate and Dunkirk shape acts of seeing and surviving.', 'Comparative', 'Setting is not background in either text...', 'Both writers turn place into pressure, though Dickens is more openly symbolic and McEwan more perspectival.', 'Analyse atmosphere, spatial framing, or violent imagery.', 'Industrialisation and wartime history make place historically specific.', 'AO4 should show how each setting produces different forms of damage.', 'The best judgement links physical environment to moral perception.', array['settings', 'systems', 'war and its consequences'], array['AO1', 'AO2', 'AO3', 'AO4'], 'A/A*', 'settings/conflict questions', null, md5('frame|Setting as pressure frame'), 'codex_audit_seed_20260518'),
  ('Love and constraint frame', 'Love is presented as real but constrained: Dickens shows feeling damaged by utilitarian family structures, while McEwan shows love threatened by class judgement, war, and authorship.', 'Comparative', 'Love matters in both texts because it is tested by structures beyond the lovers...', 'Dickens connects love to emotional education; McEwan connects it to belief and separation.', 'Analyse repeated emotional language, imperatives, or symbolic objects.', 'Gender, marriage, and class context should be tied to agency.', 'The comparison should avoid romantic summary and focus on constraint.', 'A nuanced reading sees love as both resistance and vulnerability.', array['love', 'gender', 'class'], array['AO1', 'AO2', 'AO3', 'AO4'], 'A/A*', 'love/marriage questions', null, md5('frame|Love and constraint frame'), 'codex_audit_seed_20260518'),
  ('Counter-reading frame', 'A counter-reading complicates the paragraph by showing that the same method can support a second judgement, then weighing which interpretation best answers the question.', 'Comparative', 'A possible counter-reading is...', 'However, the comparison is stronger if this alternative is weighed rather than merely mentioned.', 'Tie the alternative reading to a specific word, image, or structural choice.', 'Context can explain why the alternative reading is plausible.', 'The final sentence must return to the cross-text judgement.', 'This move creates AO1 sophistication without importing irrelevant assessment objectives.', array['argument', 'judgement', 'comparison'], array['AO1', 'AO2', 'AO4'], 'A*', 'extension paragraph', null, md5('frame|Counter-reading frame'), 'codex_audit_seed_20260518')
on conflict do nothing;

insert into public.thesis_routes (
  route_code, theme_label, route_title, exam_question_family, grade_level, core_argument, thesis_sentence,
  conceptual_upgrade, ao3_context_frame, interpretive_tension, paragraph_sequence, recommended_quote_pairs,
  common_risk, examiner_value, route_status, published
)
values
  ('tr_education_childhood', 'education and childhood', 'Education as Moral Formation', 'education', 'A*', 'Both novels show education as the making of moral perception, not just the transfer of knowledge.', 'Dickens attacks fact-based schooling as emotional deformation, while McEwan shows Briony''s narrative self-education becoming ethically dangerous.', 'Upgrade by arguing that childhood is formative but not innocent.', 'Use utilitarian schooling beside interwar class/gender training and authorship.', 'Children are both shaped by systems and capable of extending their damage.', '{"steps":["Facts and schoolroom discipline","Briony and constructed certainty","Judgement on formation and responsibility"]}'::jsonb, array['qp_education_childhood_01', 'qp_narrative_truth_02'], 'Writing about education as school scenes only.', 'Clear route for AO1/AO2/AO3/AO4 integration.', 'secure', true),
  ('tr_class_social_injustice', 'class and social injustice', 'Class as Structural Violence', 'critique_of_society', 'A*', 'Class structures what characters can do, say, and be believed about.', 'Hard Times externalises class through industrial labour and capitalist myth, whereas Atonement internalises class through misrecognition and narrative credibility.', 'Upgrade by treating class as epistemic as well as economic.', 'Use Victorian industrial hierarchy and interwar class assumptions.', 'Class can be visible as labour or invisible as judgement.', '{"steps":["Coketown and Hands","Robbie and credibility","Comparison of economic and perceptual violence"]}'::jsonb, array['qp_class_injustice_01', 'qp_class_injustice_02'], 'Only describing rich and poor.', 'Shows a conceptual grasp of power and belief.', 'secure', true),
  ('tr_guilt_repair', 'guilt and repair', 'Guilt, Confession, and Repair', 'important_choices', 'A*', 'Both novels present guilt as belated knowledge, but disagree about the possibility of repair.', 'Dickens allows remorse to reshape moral life, while McEwan makes confession necessary yet unable to undo damage.', 'Upgrade by separating recognition, confession, and restitution.', 'Use Dickensian moral didacticism and McEwan''s metafictional confession.', 'Confession may be ethical, self-protective, or both.', '{"steps":["Origin of harm","Belated recognition","Limits of repair"]}'::jsonb, array['qp_moral_responsibility_01', 'qp_endings_resolution_02'], 'Calling confession the same as atonement.', 'Strong route for nuanced final judgement.', 'secure', true),
  ('tr_settings_pressure', 'settings', 'Setting as Social and Historical Pressure', 'settings', 'A*', 'Settings in both novels create pressure rather than scenery.', 'Dickens makes Coketown a moral and industrial atmosphere, while McEwan uses the Tallis estate and Dunkirk to frame misreading, class, and trauma.', 'Upgrade by linking place to consciousness.', 'Use industrialisation and war/Dunkirk context.', 'Place can reveal system before plot explains it.', '{"steps":["Coketown atmosphere","Tallis estate/fountain or Dunkirk","Comparison of place as pressure"]}'::jsonb, array['qp_violence_cost_01', 'qp_violence_cost_02'], 'Listing setting details without analysis.', 'Helps students produce AO2-rich settings answers.', 'secure', true),
  ('tr_narrative_truth', 'truth and fiction', 'Narrative Truth and False Certainty', 'important_choices', 'A*', 'Both novels test how certainty is made, but Dickens attacks narrow fact while McEwan attacks confident interpretation.', 'Hard Times shows factual precision without wisdom, whereas Atonement shows imaginative certainty becoming moral catastrophe.', 'Upgrade by arguing that truth requires ethical interpretation.', 'Use realism, authorial intrusion, focalisation, and metafiction.', 'Truth can be clarified by narrative or compromised by it.', '{"steps":["Fact and definition","Briony''s certainty","Coda and final judgement"]}'::jsonb, array['qp_narrative_truth_01', 'qp_narrative_truth_02'], 'Treating truth as only plot accuracy.', 'Excellent route for A* conceptual comparison.', 'secure', true),
  ('tr_gender_love_constraint', 'gender, love, and constraint', 'Love Under Social Constraint', 'love', 'A*', 'Love is meaningful in both texts because it is pressured by social systems that define what characters may feel or choose.', 'Dickens links love to emotional deprivation and patriarchal training, while McEwan links it to class judgement, war separation, and narrative control.', 'Upgrade by treating love as resistance and vulnerability.', 'Use separate spheres, marriage norms, interwar class, and wartime separation.', 'Love resists systems but cannot simply escape them.', '{"steps":["Louisa and emotional training","Cecilia/Robbie and class or war","Judgement on resistance and vulnerability"]}'::jsonb, array['qp_gender_constraint_02', 'qp_love_choice_01'], 'Retelling romance rather than analysing constraint.', 'Keeps love essays analytical and comparative.', 'secure', true)
on conflict (route_code) do update set
  theme_label = excluded.theme_label,
  route_title = excluded.route_title,
  exam_question_family = excluded.exam_question_family,
  grade_level = excluded.grade_level,
  core_argument = excluded.core_argument,
  thesis_sentence = excluded.thesis_sentence,
  conceptual_upgrade = excluded.conceptual_upgrade,
  ao3_context_frame = excluded.ao3_context_frame,
  interpretive_tension = excluded.interpretive_tension,
  paragraph_sequence = excluded.paragraph_sequence,
  recommended_quote_pairs = excluded.recommended_quote_pairs,
  common_risk = excluded.common_risk,
  examiner_value = excluded.examiner_value,
  route_status = excluded.route_status,
  published = excluded.published,
  updated_at = now();

commit;
