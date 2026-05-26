-- Seed the Component 2 route rows required by 20260515202803_seed_questions.sql.
-- These rows were verified against the linked remote project on 2026-05-21.

INSERT INTO public.routes (
  id,
  name,
  core_question,
  hard_times_emphasis,
  atonement_emphasis,
  comparative_insight,
  best_use,
  level_tag,
  created_at,
  updated_at
)
VALUES
  (
    'route-class',
    'Class, Power and Social Structure',
    'How do the novels expose social class as a structure that organises exclusion, injustice and credibility?',
    'Dickens attacks overt industrial hierarchy — the reduction of people to "Hands," the myth of meritocracy embodied by Bounderby, the legal traps that destroy Stephen Blackpool',
    'McEwan reveals quieter class mechanisms — the unequal distribution of credibility, the assumption that Robbie''s word cannot outweigh the Tallis family''s interpretation, Paul Marshall''s immunity from suspicion',
    'Both novels expose class not merely as economic disadvantage but as a structure that determines whose interpretation of reality is credited and whose is dismissed; Dickens operates through industrial fact, McEwan through social epistemology',
    'class, critique_of_society, crime, marriage, independence, difficult_circumstances',
    'A*',
    '2026-05-15 20:05:45.018562+00',
    '2026-05-15 20:05:45.018562+00'
  ),
  (
    'route-gender',
    'Gender, Control and Agency',
    'How do the novels present female development and agency under social and psychological constraint?',
    'Dickens shows female agency stunted by paternal rationalism — Louisa''s "fire with nothing to burn" is the image of inner vitality without available outlet or language',
    'McEwan shows female agency as morally compromised by imaginative authority — Briony possesses interpretive power from the outset, but it is ethically unstable rather than absent',
    'Both novels place female consciousness at the centre of interpretive crisis, but diverge over the form: Louisa is denied freedom, Briony wields it too confidently; together the novels suggest that female agency develops under distorted social conditions whether by repression or by unmoored imaginative power',
    'gender, female_relationships, changing_relationships, love, marriage',
    'A*',
    '2026-05-15 20:05:45.018562+00',
    '2026-05-15 20:05:45.018562+00'
  ),
  (
    'route-guilt',
    'Guilt, Responsibility and Moral Consequence',
    'How do the novels examine what remains after error — can guilt be resolved, and what is the relationship between recognition and repair?',
    'Dickens distributes guilt across social structures of formation — Gradgrind is responsible, but so is the utilitarian system that produced and sustained him; his repentance offers partial moral resolution',
    'McEwan interiorises guilt sharply in Briony but then complicates even that interiorisation — writing "was not forgiveness," and the happy ending of Part 3 is exposed as fiction, denying even narrative repair',
    'Both novels present guilt as enduring, but Dickens frames it within a moral structure that allows consequences and partial redemption, while McEwan renders it as retrospective burden that narrative cannot finally erase, questioning whether atonement can ever transcend imaginative reconstruction',
    'guilt, important_choices, difficult_circumstances, hope',
    'A*',
    '2026-05-15 20:05:45.018562+00',
    '2026-05-15 20:05:45.018562+00'
  ),
  (
    'route-imagination',
    'Imagination vs Rationality',
    'How do the novels test imagination against rational systems, and where does each locate the greater danger?',
    'Dickens defends imagination as a humane corrective to industrial dehumanisation — "Fancy" and the circus represent emotional intelligence excluded by utilitarianism',
    'McEwan interrogates imagination as morally unstable — Briony''s storytelling faculty creates injustice, and the novel itself questions whether fiction can repair what imagination helped destroy',
    'Both novels place imagination at the centre of their moral argument, but Dickens shows its suppression as damaging while McEwan shows its excess as equally dangerous; the combined argument is that imagination is necessary but never innocent',
    'imagination, education, childhood, hope, conflict',
    'A*',
    '2026-05-15 20:05:45.018562+00',
    '2026-05-15 20:05:45.018562+00'
  ),
  (
    'route-narrative',
    'Narrative Authority, Authorship and Truth',
    'How do the novels interrogate who controls reality in language — and is narrative itself trustworthy?',
    'Dickens largely preserves narratorial authority — irony corrects ideology, revelation strips Bounderby''s mask, and the novel''s moral framework remains intact even as it critiques the false epistemologies it dramatises',
    'McEwan destabilises authorship itself — the Epilogue reveals Part 3 as Briony''s fiction, making narration part of the apparatus of harm rather than its correction, so that the very act of writing becomes morally suspect',
    'Together the novels imply that truth may require narrative, yet narrative is never innocent — Dickens trusts irony to restore moral clarity, while McEwan exposes irony''s limits by making the narrator the unreliable perpetrator',
    'truth, roles_of_children, hope, conflict',
    'A*',
    '2026-05-15 20:05:45.018562+00',
    '2026-05-15 20:05:45.018562+00'
  ),
  (
    'route-perception',
    'Reality, Perception and Misreading',
    'How do the novels expose the distortion of reality through imposed or self-generated interpretive frameworks?',
    'Dickens locates error in externally imposed systems — utilitarian doctrine, institutional language, Gradgrind''s "Facts" — that train characters to read the world reductively before experience is encountered',
    'McEwan locates error in imaginative overreading and aesthetic self-deception — Briony''s drive to convert experience into legible narrative pattern',
    'Both novels treat interpretive failure as dangerous, but Dickens attacks pedagogic systems that narrow reading, while McEwan attacks psychological drives that aestheticise it; together they suggest that epistemic damage can originate either in institution or in imagination',
    'difficult_circumstances, truth, education, critique_of_society',
    'A*',
    '2026-05-15 20:05:45.018562+00',
    '2026-05-15 20:05:45.018562+00'
  ),
  (
    'route-systems',
    'War, Industrialism and the Crushing of the Individual',
    'How do the novels show individuals destroyed by large, impersonal historical and social forces?',
    'Dickens figures systematic harm through industrial modernity — Coketown''s "deadly statistical clock," Stephen''s legal entrapment, the reduction of human beings to economic units',
    'McEwan figures it through war and irrecoverable historical loss — Dunkirk''s mass death, Robbie''s destruction, Cecilia''s Balham bombing death, the phrase "our life, no longer available to us"',
    'Both novels present the individual as crushable by forces beyond personal control, but Dickens frames this as industrial-ideological mechanism while McEwan frames it as historical catastrophe; together they span a century of systemic human cost from Victorian capitalism to total war',
    'settings, industrialism, difficult_circumstances, conflict, roles_of_children',
    'A*',
    '2026-05-15 20:05:45.018562+00',
    '2026-05-15 20:05:45.018562+00'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  core_question = EXCLUDED.core_question,
  hard_times_emphasis = EXCLUDED.hard_times_emphasis,
  atonement_emphasis = EXCLUDED.atonement_emphasis,
  comparative_insight = EXCLUDED.comparative_insight,
  best_use = EXCLUDED.best_use,
  level_tag = EXCLUDED.level_tag,
  created_at = EXCLUDED.created_at,
  updated_at = EXCLUDED.updated_at;
