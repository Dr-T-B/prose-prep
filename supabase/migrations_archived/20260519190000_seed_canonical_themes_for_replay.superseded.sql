-- Capture canonical theme rows already present on the linked remote project.
-- This local replay seed runs after 20260519181413 adds themes.synthesis and
-- before 20260519192443 validates quote_pairs.theme_label against themes(id).
-- The morality row is intentionally excluded because 20260519192443 inserts it.

INSERT INTO public.themes (
  id,
  label,
  short,
  ht_angle,
  at_angle,
  ao2,
  ao3,
  ao4,
  sort_order,
  synthesis
)
VALUES
  (
    'education',
    'Education & Utilitarianism',
    'Education',
    $$Gradgrind's 'Facts' system suppresses imagination; Sissy resists, Louisa breaks down.$$,
    $$Briony's literary education shapes (and distorts) her reading of events; writing as both crime and penance.$$,
    $$Imperative syntax, mechanical lexis (Dickens); metafiction & embedded drafts (McEwan).$$,
    $$Benthamite utilitarianism; mid-Victorian education debates; Hard Times serialised in Household Words, 1854.$$,
    $$Both expose how systems of knowledge — factual or fictional — deform young minds.$$,
    1,
    $$Dickens attacks mechanised education that suppresses imagination; McEwan exposes the danger of imagination when severed from humility, evidence and moral responsibility$$
  ),
  (
    'imagination',
    'Imagination & Fiction',
    'Imagination',
    $$Sleary's circus = fancy as moral oxygen; suppression of fancy causes Louisa's collapse.$$,
    $$Briony's imagination misreads the fountain & library; fiction later becomes the only available reparation.$$,
    $$Symbol (circus, fountain), free indirect style, embedded narrative.$$,
    $$Romantic vs Utilitarian debate (1850s); late twentieth-century doubt about narrative truth.$$,
    $$Imagination redeems in Dickens but incriminates in McEwan — inverse moral charge.$$,
    2,
    $$Dickens defends imagination as a humane corrective to social mechanisation; McEwan shows imagination as both the source of injustice and the medium of attempted atonement$$
  ),
  (
    'class',
    'Class & Social Hierarchy',
    'Class',
    $$Coketown's Hands vs masters; Bounderby's self-made myth exposed as fraud.$$,
    $$Robbie's Cambridge education cannot outrun his class; Tallis family closes ranks.$$,
    $$Synecdoche & industrial register (Dickens); free indirect discourse / interiority (McEwan).$$,
    $$1850s industrial capitalism; 1930s English class anxiety pre-war.$$,
    $$Both texts show class as a sentence passed before the trial begins.$$,
    3,
    $$Dickens foregrounds class injustice as economic exploitation; McEwan reframes it as epistemic power — the power to be believed, disbelieved, protected or sacrificed$$
  ),
  (
    'childhood',
    'Childhood & Moral Formation',
    'Childhood',
    $$Children processed as 'little vessels'; Tom corrupted, Louisa numbed, Sissy alone retains feeling.$$,
    $$Briony at 13 — neither child nor adult — commits the crime that defines her life.$$,
    $$Extended metaphor of containers (Dickens); shifting focalisation through Briony (McEwan).$$,
    $$Victorian pedagogy; 1930s upper-middle-class childhood and the cultural figure of the precocious girl-author.$$,
    $$Both interrogate whether children can be held morally responsible for adult systems.$$,
    4,
    $$Dickens shows childhood shaped by ideology and coercion; McEwan shows it shaped by imagination, class ignorance and the dangerous authority of immature perception$$
  ),
  (
    'family',
    'Family & Emotional Neglect',
    'Family',
    $$Gradgrind home = emotional vacuum; Louisa married off transactionally to Bounderby.$$,
    $$Tallis parents absent (migraine, London); children left to misread adult worlds.$$,
    $$Domestic interior as symbol; absence as structural device (McEwan).$$,
    $$Victorian patriarchal household; declining inter-war upper-middle-class family.$$,
    $$Both link emotional neglect to catastrophic moral error in the next generation.$$,
    5,
    $$Dickens presents failed parenting as the domestic expression of utilitarian ideology; McEwan presents parental absence as part of a wider class system that leaves children morally unsupervised$$
  ),
  (
    'guilt',
    'Guilt & Responsibility',
    'Guilt',
    $$Gradgrind's late recognition of harm; Tom's guilt evaded by flight.$$,
    $$Briony's lifelong project of atonement through writing; guilt as narrative engine.$$,
    $$Direct moral statement (Dickens) vs unreliable retrospective narration (McEwan).$$,
    $$Christian frameworks of repentance; secular post-war ethics of testimony.$$,
    $$Both ask whether acknowledgement without restitution is enough.$$,
    6,
    $$Dickens tends to locate guilt within social systems that deform individuals; McEwan intensifies personal guilt by showing how one child's misreading becomes irreversible adult tragedy$$
  ),
  (
    'memory',
    'Memory & Narrative Reconstruction',
    'Memory',
    $$Linear, omniscient narration — memory subordinated to moral verdict.$$,
    $$Whole novel revealed as Briony's reconstruction; memory as authored artefact.$$,
    $$Stable third-person omniscience vs metafictional frame collapse.$$,
    $$Victorian faith in narrative authority; post-war retrospective fiction; late twentieth-century metafiction; the modernist inheritance of memory and interiority (Woolf, Bowen).$$,
    $$Dickens trusts the narrator; McEwan dismantles that trust.$$,
    7,
    $$Dickens subordinates memory to a stable moral verdict delivered by an omniscient narrator; McEwan exposes memory itself as authored artefact, dismantling the very narrative authority on which retrospective truth depends.$$
  ),
  (
    'war',
    'Systems that Consume the Body',
    'Systems',
    $$Industrial capitalism consumes bodies through labour, smoke, machinery and social abstraction; Stephen's death at the Old Hell Shaft is emblematic.$$,
    $$War consumes bodies through military systems, retreat, injury and failed care; St Thomas's ward becomes a second front.$$,
    $$Industrial sublime imagery (Dickens); fragmented sensory realism (McEwan, Pt2).$$,
    $$1854 industrial conditions and factory legislation debates; May–June 1940 Dunkirk retreat and London wartime nursing.$$,
    $$The comparison is not that the factory equals the war; it is that both novels expose systems — industrial capitalism in Dickens, military mobilisation in McEwan — that turn persons into damaged bodies.$$,
    8,
    $$Dickens presents industrial capitalism as a machine that dehumanises the poor; McEwan presents war as a later historical machine that crushes individual lives beyond narrative repair$$
  ),
  (
    'gender',
    'Gender & Power',
    'Gender',
    $$Louisa & Sissy as constrained female intelligences; marriage as economic transaction.$$,
    $$Cecilia's intellect curtailed by class & gender; Lola's assault silenced by marriage to her attacker.$$,
    $$Symbolic clothing & water imagery; dialogue power dynamics.$$,
    $$Victorian 'separate spheres'; inter-war shifts in female autonomy.$$,
    $$Both show female speech criminalised, silenced or commodified.$$,
    9,
    $$Dickens presents female development damaged by patriarchal-utilitarian control; McEwan presents female agency as mediated through sexuality, authorship, class and retrospective guilt$$
  ),
  (
    'justice',
    'Justice, Punishment & Atonement',
    'Justice',
    $$Stephen wrongly suspected; Tom escapes formal justice; moral verdict left to narrator.$$,
    $$Robbie convicted on false testimony; Briony's writing as substitute, inadequate justice.$$,
    $$Courtroom-style narrative judgement (Dickens); deferred & destabilised verdict (McEwan).$$,
    $$Victorian legal reform debates; 20thC questioning of testimony & truth.$$,
    $$Both stage miscarriages of justice that the formal system cannot repair.$$,
    10,
    $$Both novels expose societies in which the vulnerable are punished not because they are guilty but because existing structures make their guilt convenient and the powerful inconspicuous$$
  ),
  (
    'authorship',
    'Authorship & Narrative Control',
    'Authorship',
    $$Dickens's intrusive narrator organises moral judgement, addressing the reader directly and arbitrating who is condemned and who is forgiven.$$,
    $$Briony's authorship is both crime and attempted atonement: 'The Trials of Arabella', her witness statement, and the novel-within-the-novel revealed in the coda all expose narrative control as ethically loaded.$$,
    $$Intrusive narration (Dickens); free indirect discourse, mise en abyme and metafiction (McEwan).$$,
    $$Victorian conventions of the omniscient moral narrator; late twentieth-century self-conscious fiction and the post-war crisis of authorial authority.$$,
    $$Both writers expose narrative control as ethically powerful, but Dickens uses it to clarify moral judgement whereas McEwan makes it ethically unstable.$$,
    11,
    $$Dickens attacks the false authority of empirical "fact" when detached from humanity; McEwan attacks the false authority of narrative certainty when detached from ethical responsibility$$
  ),
  (
    'endings',
    'Time, Retrospection & Endings',
    'Endings',
    $$Hard Times closes with a projective tableau that rebalances the moral economy: Gradgrind humbled, Sissy vindicated, Louisa denied conventional consolation.$$,
    $$Atonement uses retrospective narration and the 1999 coda to destabilise everything that has gone before, making closure itself the ethical question.$$,
    $$Prolepsis and projective closure (Dickens); retrospective narration, coda and structural reversal (McEwan).$$,
    $$Victorian conventions of providential closure; late twentieth-century scepticism about narrative resolution after 1945.$$,
    $$Dickens offers conditional moral repair through projected futures; McEwan questions whether narrative repair is possible at all.$$,
    12,
    $$Dickens structures time morally, showing how social principles produce inevitable consequences; McEwan structures time retrospectively, showing how narrative can revisit the past without being able to change it$$
  )
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  short = EXCLUDED.short,
  ht_angle = EXCLUDED.ht_angle,
  at_angle = EXCLUDED.at_angle,
  ao2 = EXCLUDED.ao2,
  ao3 = EXCLUDED.ao3,
  ao4 = EXCLUDED.ao4,
  sort_order = EXCLUDED.sort_order,
  synthesis = EXCLUDED.synthesis;
