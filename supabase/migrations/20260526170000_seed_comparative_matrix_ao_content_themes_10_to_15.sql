-- Comparative Matrix AO-content consolidation: Themes 10-15.
-- Axes: Conflict, Marriage, Independence, Important choices, Roles of children, Relationships between female characters.
-- Repo-side reconciliation for SQL already applied successfully to staging.
-- Pearson Edexcel A-Level English Literature Component 2: Prose, Paper 2, 9ET0/02.
-- AO1, AO2, AO3 and AO4 apply; interpretive sophistication is described as
-- interpretive nuance, critical perspective, or evaluative judgement.
--
-- This migration is intentionally data-only and idempotent by row id.
-- It targets public.comparative_matrix and updates only:
-- ao2, ao3, ao4, thesis, character, narrative, structure, exam_fit, updated_at.
-- It is not a schema, trigger, policy, persistent routine, or table change.

update public.comparative_matrix
set
  ao2 = $cm0$Dickens dramatises conflict through public confrontation, dialect contrast, and institutional setting: Stephen's plain, restrained idiom is set against Bounderby's bombastic self-mythologising, while the union meeting turns collective grievance into coercive crowd pressure. McEwan dramatises Robbie's conflict with the Tallis family through focalised misreading, evidential objects, and legal silence: the letter, the fountain, the library scene, and Briony's testimony are structurally converted into a case against him. In both texts, conflict is not merely interpersonal but produced through narrative framing and social language.$cm0$,
  ao3 = $cm0$Dickens: mid-Victorian industrial relations, anxieties about trade unionism, factory capitalism, and the doctrine of self-help that Bounderby parodies. The novel reflects the difficulty of representing working-class grievance without turning either masters or unions into simple heroes. McEwan: 1930s class deference, the authority granted to upper-middle-class testimony, inter-war assumptions about sexuality and servant-class masculinity, and the pre-war legal culture that can absorb prejudice as evidence.$cm0$,
  ao4 = $cm0$Both function as individual-versus-system conflicts that reveal structural injustice operating under the guise of order. Dickens uses Stephen's conflict with Bounderby and the union to expose a worker trapped between capitalist power and collective rigidity. McEwan uses Robbie's conflict with the Tallis household and class system to show how social order can manufacture guilt before law has properly judged it.$cm0$,
  thesis = $cm0$Both novels present conflict as the moment when a supposedly orderly society exposes its coercive machinery: Stephen is crushed because neither employer nor union can recognise moral individuality, while Robbie is destroyed because the Tallis world reads class difference as criminality. The comparison is sharp because Dickens makes conflict socially visible, whereas McEwan makes it epistemological — a battle over what others think they have seen.$cm0$,
  character = $cm0$Stephen functions as the morally isolated worker whose decency has no institutional protection; Bounderby functions as the capitalist voice that turns conflict into evidence of working-class ingratitude. Robbie functions as the vulnerable outsider-insider — educated enough to cross class boundaries but dependent enough to be punished for doing so. Briony and the Tallises become agents of system conflict because their class assumptions convert misreading into accusation.$cm0$,
  narrative = $cm0$Dickens uses omniscient narration and satirical naming to make the conflict legible as social critique; the reader is positioned to see the unfairness even when characters misrecognise it. McEwan uses restricted focalisation and delayed revelation so that conflict emerges through corrupted perception; the reader experiences the danger of partial knowledge before the full injustice is confirmed.$cm0$,
  structure = $cm0$Stephen's conflict develops through the industrial plot: refusal, exclusion, departure from Coketown, and fatal return through the Old Hell Shaft. Robbie's conflict is structurally triggered in Part One, punished between Parts One and Two, and reprocessed through memory, war, and Briony's late confession. Dickens structures conflict as social entrapment; McEwan structures it as an accusation whose consequences radiate across the whole novel.$cm0$,
  exam_fit = $cm0$Conflict — direct fit, Pair 1. Also: 2017 Q1 (Difficult circumstances — Stephen and Robbie as system-crushed men); 2018 Q1 (Criticising aspects of society — employer/class/legal power); 2023 Q1 (Important choices — Stephen's refusal and Briony's accusation); 2024 Q2 (Relationships between female characters — Briony's testimony as conflict catalyst).$cm0$,
  updated_at = now()
where id = 'cm-conflict-01';

update public.comparative_matrix
set
  ao2 = $cm0$Dickens stages the conflict between imagination and Fact through antithetical imagery, caricatured pedagogical dialogue, and symbolic spaces: the square, hard geometry of Gradgrind's school is set against the colour and movement of Sleary's circus. McEwan stages the conflict between art and truth through metafiction, multiple focalisations, and recursive acts of narration: Briony's play-writing, genre expectations, and final authorship expose how fiction can both distort and attempt repair. In both texts, method makes the conflict formal as well as thematic.$cm0$,
  ao3 = $cm0$Dickens: Victorian utilitarian education, industrial rationalism, the reaction against Benthamite measurement, and the social-purpose novel's defence of imaginative sympathy. McEwan: late-twentieth-century metafiction, postmodern scepticism about narrative authority, modernist inheritance through Woolf-like focalisation, and post-war ethical anxiety about whether art can represent suffering without falsifying it.$cm0$,
  ao4 = $cm0$Both function as ideological conflicts about how human beings should know and represent the world, and what authority narrative holds over truth. Dickens opposes Gradgrindian Fact with Sissy's imaginative sympathy, finally privileging moral imagination. McEwan complicates the equivalent opposition because Briony's imagination first falsifies truth and later tries to repair it through art.$cm0$,
  thesis = $cm0$Both texts turn conflict into a contest between systems of knowledge: Dickens attacks a culture that knows by measurement and therefore fails to understand feeling, while McEwan attacks a literary imagination that knows by pattern and therefore risks imposing false coherence on reality. Dickens largely vindicates imagination; McEwan both needs and indicts it.$cm0$,
  character = $cm0$Sissy embodies humane imagination without intellectual vanity, while Gradgrind embodies fact-based abstraction until his late collapse. Briony embodies the more dangerous version of imagination: her creative intelligence is powerful enough to invent motives before she understands people. Older Briony becomes the conflicted figure who tries to turn the same faculty that caused harm into a belated ethical instrument.$cm0$,
  narrative = $cm0$Dickens's narrator argues openly against Fact through satire, repetition, and moral commentary, teaching the reader how to judge Gradgrind's philosophy. McEwan's narration withholds that security: the novel allows Briony's story-making to seem artistically persuasive before disclosing its ethical cost. The narrative contrast is therefore didactic certainty against metafictional instability.$cm0$,
  structure = $cm0$Hard Times is structured as the consequence of a false philosophy — Sowing, Reaping, Garnering — so the conflict moves from educational premise to moral harvest. Atonement is structured as the consequence of a false story — Part One's misreading, Part Two's historical punishment, Part Three's attempted reparation, and Part Four's exposure. In both, the opening method of knowing determines the ending.$cm0$,
  exam_fit = $cm0$Conflict — direct fit, Pair 2. Also: 2018 Q2 (Education — dangerous formation and corrective education); 2021 Q1 (Hope — imagination as possible repair); 2023 Q2 (Roles of children — child perception and adult damage); 2019 Q1 (Settings — school/circus and Tallis house as ideological spaces).$cm0$,
  updated_at = now()
where id = 'cm-conflict-02';

update public.comparative_matrix
set
  ao2 = $cm0$Dickens uses proposal dialogue, emotional understatement, and surveillance imagery to present the Louisa-Bounderby marriage as contract rather than union: Gradgrind's language of calculation, Louisa's exhausted question "What does it matter?", and Mrs Sparsit's staircase fantasy all make marriage a structure of social control. McEwan uses compression, tonal flatness, and coda revelation to present the Marshall-Lola marriage as institutional laundering: the baronetcy, philanthropy, and public respectability conceal the crime the narrative has taught us to recognise.$cm0$,
  ao3 = $cm0$Dickens: Victorian marriage as economic alliance, the limited legal and emotional agency of women under coverture, and the social acceptability of age- and wealth-imbalanced marriage. McEwan: inter-war and post-war class consolidation, the ability of wealth to purchase respectability, wartime profiteering, and the legal/social difficulty of naming sexual violence when class power protects the perpetrator.$cm0$,
  ao4 = $cm0$Both function as marriages that legitimise injustice, showing the institution as a tool of power rather than affection. Dickens uses Louisa's marriage to Bounderby to expose how utilitarian and capitalist logic turns a daughter into exchangeable property. McEwan uses Marshall's marriage to Lola to expose how class respectability can transform violation into social alliance and public honour.$cm0$,
  thesis = $cm0$Both writers present marriage not as romantic fulfilment but as the social form through which power protects itself. Louisa's marriage reveals the moral bankruptcy of a system that calls emotional coercion prudence; Lola's marriage reveals a more chilling system in which marriage helps erase the crime it follows. Dickens makes marriage oppressive; McEwan makes it evidentially obscene.$cm0$,
  character = $cm0$Louisa is the emotionally under-educated daughter whose consent has been prepared by years of repression; Bounderby is the self-made fraud whose marriage confirms his desire to possess class status and female obedience. Lola remains troublingly silent and socially absorbed, while Marshall becomes the unpunished predator whose later public benevolence intensifies the corruption of the marriage plot.$cm0$,
  narrative = $cm0$Dickens narrates the marriage through external pressure and delayed interior release: Louisa's real suffering becomes fully legible only at the crisis with Gradgrind. McEwan narrates Marshall and Lola's marriage obliquely through Briony's late knowledge, forcing the reader to infer the violence of what respectable narrative refuses to say directly.$cm0$,
  structure = $cm0$Louisa's marriage is central to Book Two, "Reaping": it is the structural harvest of Gradgrind's education and Bounderby's capitalism. Marshall and Lola's marriage is structurally delayed until the coda, where it retroactively confirms the novel's deepest social corruption. Dickens places marriage at the centre of collapse; McEwan places it as the final sign of impunity.$cm0$,
  exam_fit = $cm0$2022 Q1 (Marriage) — direct fit, Pair 1. Also: 2020 Q2 (Love — corrupted love and transactional marriage); 2018 Q1 (Criticising aspects of society — marriage as social hypocrisy); 2024 Q1 (Relationships between female characters — Louisa/Sparsit and Lola/Briony/Cecilia); 2019 Q2 (Changing relationships — marriage breakdown and permanent damage).$cm0$,
  updated_at = now()
where id = 'cm-marriage-01';

update public.comparative_matrix
set
  ao2 = $cm0$Dickens uses the chapter title "No Way Out", Stephen's dialect, and the contrast between legal marriage and moral love to make marriage a trap: the law's abstraction is felt through Stephen's broken speech and Rachael's restraint. McEwan presents Robbie and Cecilia's unrealised marriage through letters, memory, and counterfactual structure: their relationship is given emotional and erotic force, then denied social completion by accusation, imprisonment, and war. In both, absence becomes a method of critique.$cm0$,
  ao3 = $cm0$Dickens: before the 1857 Matrimonial Causes Act, divorce was effectively inaccessible to the working poor, and coverture treated marriage as a legal status rather than an emotional covenant. Stephen's case exposes the class basis of marital freedom. McEwan: 1930s class prejudice, wartime separation, and the literary tradition of interrupted lovers; marriage is possible in principle but made impossible by social accusation and historical catastrophe.$cm0$,
  ao4 = $cm0$Both function to show how law and circumstance can deny morally right unions, amplifying the critique of social injustice. Dickens makes Stephen legally bound to a destructive marriage while morally bonded to Rachael. McEwan makes Robbie and Cecilia emotionally committed but historically prevented from any legitimate future together.$cm0$,
  thesis = $cm0$Both texts use blocked marriage to distinguish moral rightness from social permission. Dickens's tragedy is that the wrong marriage legally exists and the right one cannot; McEwan's tragedy is that the right union exists only as memory, letter, and Briony's later fiction. The institution that should formalise love instead reveals the limits of justice.$cm0$,
  character = $cm0$Stephen is the decent man whose marital status makes his virtue painful rather than socially rewarded; Rachael is the moral partner who can be loved but not lawfully possessed. Robbie and Cecilia are presented as lovers who achieve emotional independence from class expectation but are denied any civic future. Their unrealised marriage becomes an index of what Briony's accusation and war have stolen.$cm0$,
  narrative = $cm0$Dickens's narrator treats Stephen and Rachael with solemn restraint, allowing silence and renunciation to carry the moral weight of their bond. McEwan uses shifting focalisation and later authorial exposure: Robbie and Cecilia's future is narrated first as sustaining hope, then revealed as an artefact of Briony's compensatory authorship.$cm0$,
  structure = $cm0$Stephen's existing marriage repeatedly blocks forward movement, making the plot circle around impossibility until his death. Robbie and Cecilia's unrealised marriage is structurally projected rather than enacted: Part One initiates love, Part Two sustains it through memory, Part Three appears to restore it, and Part Four withdraws that restoration. Dickens traps marriage in law; McEwan traps it in fiction.$cm0$,
  exam_fit = $cm0$2022 Q1 (Marriage) — direct fit, Pair 2. Also: 2020 Q2 (Love — morally right love blocked); 2021 Q1 (Hope — future union imagined against evidence); 2017 Q1 (Difficult circumstances — law/class/war as barriers); 2019 Q2 (Changing relationships — impossible reconciliation and blocked futures).$cm0$,
  updated_at = now()
where id = 'cm-marriage-02';

update public.comparative_matrix
set
  ao2 = $cm0$Dickens presents Louisa's independence through crisis dialogue, direct confrontation, and symbolic movement away from Bounderby's house back to Stone Lodge, where she exposes the failure of Gradgrind's system in language more emotional than anything her education allowed. McEwan presents Cecilia's independence through decisive focalisation, social defiance, and epistolary commitment: she rejects family loyalty, chooses Robbie, and writes against the version of events her class wants to preserve. Both writers make female independence a break in the grammar of obedience.$cm0$,
  ao3 = $cm0$Dickens: Victorian gender ideology, filial obedience, patriarchal marriage, and the limited acceptable forms of female self-assertion. Louisa's leaving is radical emotionally even if socially contained. McEwan: 1930s upper-middle-class family hierarchy, class endogamy, and the social cost of a woman choosing a lower-status man against family testimony; Cecilia's independence is sharpened by pre-war respectability codes.$cm0$,
  ao4 = $cm0$Both function as acts of female independence against family and class expectations, though with very different outcomes. Dickens allows Louisa's rebellion to correct Gradgrind and separate her from Bounderby, but not to give her romantic fulfilment. McEwan allows Cecilia's independence to be morally lucid yet historically futile, because standing by Robbie cannot undo conviction, separation, and death.$cm0$,
  thesis = $cm0$Both novels treat female independence as ethically necessary but structurally constrained. Louisa's leaving is the first truthful act produced by a damaged education; Cecilia's departure is the first fully moral act inside a corrupt family system. Yet neither text offers simple liberation: Dickens domesticates independence into chastened reform, while McEwan turns it into loyalty without rescue.$cm0$,
  character = $cm0$Louisa becomes independent when she stops performing the emotional vacancy her father created and names the damage done to her. Cecilia becomes independent when she chooses moral perception over family allegiance, making herself the anti-Briony: she sees Robbie truly while Briony misreads him. Both women gain ethical clarity by refusing the household scripts assigned to them.$cm0$,
  narrative = $cm0$Dickens uses omniscient moral pressure and a climactic father-daughter scene to make Louisa's independence pedagogic: her speech educates Gradgrind. McEwan uses Cecilia's focalisation and Briony's retrospective reconstruction to make independence precarious: Cecilia's truth reaches us through a narrative controlled by the sister who once destroyed it.$cm0$,
  structure = $cm0$Louisa's departure from Bounderby marks the collapse of Book Two's social arrangements and opens Book Three's limited reparation. Cecilia's break from the Tallis family occurs after the accusation and becomes structurally permanent, shaping the absent reconciliation that Briony later invents. Dickens uses independence as a turning point; McEwan uses it as an irreversible fracture.$cm0$,
  exam_fit = $cm0$2019 Q2 (Independence) — direct fit, Pair 1. Also: 2024 Q1 (Relationships between female characters — female bonds and ruptures); 2019 Q2/Changing relationships where applicable — family fracture and partial repair; 2022 Q1 (Marriage — refusal of coercive or class-sanctioned structures); 2018 Q1 (Criticising society — female resistance to class/patriarchal systems).$cm0$,
  updated_at = now()
where id = 'cm-indep-01';

update public.comparative_matrix
set
  ao2 = $cm0$Dickens presents Stephen's independence through moral plainness, dialect, and isolation: his refusal to join the union is linguistically modest but structurally costly, separating him from both workers and masters. McEwan presents Robbie's independence through aspirational memory, medical imagery, and disciplined interiority: his ambition to study medicine and rebuild his life after prison survives as a future-image during the retreat to Dunkirk. Both writers use restrained language to make independence a form of endurance rather than display.$cm0$,
  ao3 = $cm0$Dickens: Victorian debates around trade unionism, individual conscience, working-class respectability, and the limits of liberal individualism in an industrial economy. McEwan: inter-war meritocracy, grammar-school mobility, medicine as professional respectability, wartime conscription, and the way class barriers can frustrate educational promise even before war intervenes.$cm0$,
  ao4 = $cm0$Both function as attempts at moral or professional independence that collide with larger forces — industry, war, and class. Stephen refuses collective pressure because his conscience will not fit institutional slogans. Robbie attempts to claim a professional future beyond servant-class dependency, but class prejudice and war repeatedly seize control of his life.$cm0$,
  thesis = $cm0$Both texts expose the fragility of independence when moral will meets structural power. Stephen's independence is ethically admirable but socially disastrous because Coketown has no space for isolated conscience. Robbie's independence is aspirational and educated, but the Tallis accusation and war reveal how easily class systems repossess a self-made future.$cm0$,
  character = $cm0$Stephen is defined by negative independence: he refuses what he cannot morally endorse, even when refusal leaves him vulnerable. Robbie is defined by prospective independence: he imagines medicine, Cecilia, and a repaired future as forms of self-authorship. Both characters are decent, self-disciplined men whose independence makes them more exposed, not more protected.$cm0$,
  narrative = $cm0$Dickens frames Stephen's independence through sympathetic omniscience, but also through the public misreadings of Coketown, so that moral integrity is visible to the reader and illegible to society. McEwan frames Robbie's independence through focalised consciousness during war, making his hopes intensely present while the novel's later structure reveals their historical impossibility.$cm0$,
  structure = $cm0$Stephen's refusal triggers exclusion, suspicion, and eventual death, so independence becomes a plot mechanism of isolation. Robbie's professional ambition is established before the accusation, suspended by prison, and almost extinguished by war; its survival in memory becomes part of the novel's tragic counterfactual. Dickens makes independence fatal in the social present; McEwan makes it a future denied.$cm0$,
  exam_fit = $cm0$2019 Q2 (Independence) — direct fit, Pair 2. Also: 2017 Q1 (Difficult circumstances — principled men under pressure); 2018 Q1 (Criticising aspects of society — union, class, legal and military systems); 2023 Q1 (Important choices — refusal, duty, self-definition); 2021 Q1 (Hope — future-oriented independence).$cm0$,
  updated_at = now()
where id = 'cm-indep-02';

update public.comparative_matrix
set
  ao2 = $cm0$Dickens presents important choices through structural causality and repeated abstract diction: Gradgrind's choice to raise children on Fact becomes the "Sowing" from which Louisa's later consent to Bounderby is reaped. Louisa's choice is written as depleted agency, marked by passivity and emotional blankness. McEwan presents Briony's choices through focalisation, genre-misreading, and metafiction: the accusation is shaped by a child's narrative certainty, while nursing and authorship are later attempts to choose responsibility after irreversible harm.$cm0$,
  ao3 = $cm0$Dickens: utilitarian pedagogy, patriarchal authority, Victorian marriage economics, and the moral logic of the social-problem novel, where private choices reveal public ideology. McEwan: 1930s class/gender assumptions, child witness testimony, wartime nursing as disciplined service, and late-twentieth-century ethical fiction concerned with responsibility, memory, and the insufficiency of confession.$cm0$,
  ao4 = $cm0$Both function as choices that set entire plots and lives on their course, illustrating how personal decisions intersect with ideology and historical context. Dickens makes Gradgrind's educational choice and Louisa's coerced marital consent the originating errors of domestic collapse. McEwan makes Briony's accusation the central destructive choice, then complicates it through later choices to nurse and to write.$cm0$,
  thesis = $cm0$Both novels resist the idea that important choices are purely individual. Gradgrind and Louisa choose inside an ideology that has already narrowed feeling into calculation; Briony chooses inside a classed and literary imagination that has already trained her to mistake narrative pattern for truth. The tragedy in both is that choices are personal enough to incur guilt but social enough to expose a system.$cm0$,
  character = $cm0$Gradgrind is the chooser who mistakes doctrine for parental care; Louisa is the child of that choice, so her consent to Bounderby is both decision and symptom. Briony is the child-author whose first catastrophic choice becomes the origin of her adult identity. Older Briony, unlike Louisa, turns later life into an extended attempt to choose acknowledgement, though the novel questions its adequacy.$cm0$,
  narrative = $cm0$Dickens uses narrator-led moral sequencing to make choices legible as cause and effect; the tripartite structure itself judges the original decisions. McEwan uses retrospective narration to make choice unstable: Briony's adult narrative re-enters the scene of childhood decision, but can never fully separate memory, guilt, and self-exculpating artistry.$cm0$,
  structure = $cm0$Hard Times is built around consequences: educational Sowing, marital and emotional Reaping, then partial Garnering. Atonement is built around one decisive misrecognition, followed by decades of attempted reparation. Dickens distributes choice across system and family; McEwan concentrates choice in Briony's accusation and then expands its aftermath across the whole novel.$cm0$,
  exam_fit = $cm0$2023 Q1 (Important choices) — direct fit, Pair 1. Also: 2018 Q2 (Education — Gradgrind's educational choice and Briony's literary formation); 2022 Q1 (Marriage — Louisa's consent); 2017 Q1 (Difficult circumstances — choices under ideological pressure); 2021 Q1 (Hope — later choices toward reparation).$cm0$,
  updated_at = now()
where id = 'cm-choice-01';

update public.comparative_matrix
set
  ao2 = $cm0$Dickens presents Stephen's choice to leave Coketown through movement imagery, pathos, and fatal irony: the railway walk appears to offer a route towards justice but leads him towards the landscape in which he will be lost and misread. McEwan presents Robbie's return to war through fragmented memory, bodily exhaustion, and disciplined forward movement during the Dunkirk retreat; his choice to serve after prison carries dignity but no real freedom. Both writers make principled movement structurally tragic.$cm0$,
  ao3 = $cm0$Dickens: working-class precarity, industrial suspicion, and the narrow routes available to a worker seeking justice against employers and social gossip. McEwan: wartime service after penal release, the British Expeditionary Force's retreat to Dunkirk, class mobility interrupted by national crisis, and the soldier's duty narrative complicated by personal injustice.$cm0$,
  ao4 = $cm0$Both function as costly but principled choices that place moral integrity above personal safety. Stephen leaves Coketown because staying would mean remaining trapped in false accusation and industrial hostility. Robbie returns to military duty because survival, service, and the hope of Cecilia become the only remaining forms of dignity after wrongful conviction.$cm0$,
  thesis = $cm0$Both texts show that morally serious choices do not guarantee morally just outcomes. Stephen and Robbie choose movement, duty, and integrity, yet each is destroyed by the conditions through which he moves. Dickens makes the road out of Coketown an ironic path to death; McEwan makes the road to Dunkirk a historical corridor in which private hope is almost extinguished.$cm0$,
  character = $cm0$Stephen's choice confirms his integrity and isolation: he will not lie, submit, or retaliate, but he also lacks the protection that would make integrity survivable. Robbie's choice confirms his disciplined intelligence and emotional loyalty: he carries Cecilia's love as a future to move towards. Both men are morally active even when structurally powerless.$cm0$,
  narrative = $cm0$Dickens's narration surrounds Stephen's choice with sympathy and ominous irony, allowing the reader to feel the injustice before society corrects its judgement too late. McEwan's narration embeds Robbie's choice within embodied wartime focalisation, so that memory and physical suffering merge. The reader experiences choice as endurance under historical pressure.$cm0$,
  structure = $cm0$Stephen's departure becomes the hinge between accusation and fatal discovery at the Old Hell Shaft. Robbie's return to war structures Part Two as a movement towards evacuation, memory, and death, though Part Four later reveals the full extent of that denial. In both, the plot turns a principled choice into a terminal journey.$cm0$,
  exam_fit = $cm0$2023 Q1 (Important choices) — direct fit, Pair 2. Also: 2017 Q1 (Difficult circumstances — constrained choices under pressure); 2018 Q1 (Criticising society — institutions that punish integrity); 2019 Q2 (Independence — moral/professional self-direction); 2021 Q1 (Hope — movement sustained by future belief).$cm0$,
  updated_at = now()
where id = 'cm-choice-02';

update public.comparative_matrix
set
  ao2 = $cm0$Dickens uses the classroom scene, numbering, definition-drills, and grotesque educational dialogue to turn children into evidence of an adult system's violence: "girl number twenty" and Bitzer's factual horse-definition show childhood stripped of personality and wonder. McEwan uses child focalisation, misrecognition, and withheld adult knowledge to show how children both misread and are harmed by adult worlds; Briony's genre-trained certainty, the twins' vulnerability, and Lola's victimisation all expose the danger of partial understanding.$cm0$,
  ao3 = $cm0$Dickens: Victorian education reform, utilitarian pedagogy, debates over rote learning, and the industrial desire to produce disciplined, useful subjects. McEwan: inter-war childhood within upper-middle-class households, the cultural authority of children's literature and melodrama, assumptions about innocence, and the failures of adults and institutions to protect children from sexual and social violence.$cm0$,
  ao4 = $cm0$Both function as lenses through which to judge adult ideologies — utilitarianism for Dickens; class and sexual violence for McEwan. Dickens uses children to show the damage caused when adults impose Fact as a complete moral system. McEwan uses children to show how adult secrecy, class power, and literary simplification produce disastrous misreadings and unprotected vulnerability.$cm0$,
  thesis = $cm0$Both novels use children less as sentimental innocents than as diagnostic instruments. In Hard Times, children reveal what utilitarian adults want society to become; in Atonement, children reveal what adult society refuses to acknowledge clearly. Dickens condemns a system that deforms children; McEwan condemns a world in which children's limited perception can be weaponised by adult power.$cm0$,
  character = $cm0$Louisa and Tom are the long-term products of Gradgrind's childhood regime; Sissy and Bitzer operate as contrasting outcomes of humane imagination and factual reduction. Briony is both child and future narrator, making childhood perception morally consequential. Lola and the twins expose the vulnerability of children inside a household more concerned with class appearance than clear protection.$cm0$,
  narrative = $cm0$Dickens's narrator stands outside the classroom and satirises its absurdity, guiding the reader to reject the adult ideology imposed on children. McEwan moves closer to child consciousness, making Briony's mistake psychologically plausible before judging it retrospectively. Dickens exposes adult error from above; McEwan lets the reader inhabit the mechanism of error before condemning its effects.$cm0$,
  structure = $cm0$The classroom opening plants the educational premise from which the rest of Hard Times grows: damaged children become damaged adults. Atonement places childhood misreading at the structural origin of the whole plot: Part One's child perspective determines Part Two's punishment and Part Four's lifelong reckoning. Both novels make childhood the beginning of consequence.$cm0$,
  exam_fit = $cm0$2023 Q2 (Roles of children) — direct fit, Pair 1. Also: 2018 Q2 (Education — formal and informal formation); 2023 Q1 (Important choices — Briony's accusation and Gradgrind's schooling); 2017 Q1 (Difficult circumstances — children shaped by hostile environments); 2018 Q1 (Criticising society — adult systems judged through children).$cm0$,
  updated_at = now()
where id = 'cm-child-01';

update public.comparative_matrix
set
  ao2 = $cm0$Dickens presents Sissy's development through continuity of warmth, affective language, and symbolic contrast: even when she enters Stone Lodge, her circus formation remains an alternative grammar of care. McEwan presents Briony across ages through structural time-shifts, retrospective narration, and metafictional self-revision; the child who misreads becomes the adult who writes, but the writing never fully escapes the original damage. Both writers make development a test of whether childhood formation can be transformed.$cm0$,
  ao3 = $cm0$Dickens: Victorian beliefs in moral nurture, the ideal of feminine compassion, and the contrast between domestic/circus community and mechanised schooling. McEwan: twentieth-century developmental psychology, the modernist interest in consciousness and memory, wartime moral education, and late-century scepticism about autobiographical confession as sufficient atonement.$cm0$,
  ao4 = $cm0$Both function as figures whose development exposes the long-term effects of childhood environment and the stories through which the self is formed. Dickens uses Sissy to show that humane childhood nurture can preserve moral clarity. McEwan uses Briony to show that childhood fantasy can harden into lifelong guilt, and that adult self-knowledge may arrive too late to repair the lives affected.$cm0$,
  thesis = $cm0$Both novels ask what childhood makes possible in later life. Sissy's childhood, though materially insecure, equips her with the sympathy Gradgrind's system lacks; Briony's privileged childhood equips her with imaginative confidence before moral understanding. Dickens imagines development as the preservation of goodness; McEwan imagines it as a lifetime of compromised revision.$cm0$,
  character = $cm0$Sissy moves from abandoned circus child to moral centre without losing the values of her first community, making her development a stabilising arc. Briony moves from precocious child-author to nurse and elderly novelist, but each stage is haunted by the first. Sissy is formed by care and gives care; Briony is formed by story and must confront story's damage.$cm0$,
  narrative = $cm0$Dickens's narrator consistently endorses Sissy, so her development is presented as reliable moral growth. McEwan makes Briony's development narratively unstable because the older Briony controls the account of the younger Briony; growth is inseparable from self-narration, selection, and possible self-defence.$cm0$,
  structure = $cm0$Sissy's development is structurally continuous: she enters early, remains present, and helps enable the novel's partial moral repair. Briony's development is structurally staged across 1935, wartime nursing, and 1999; each temporal layer revises the last. Dickens structures childhood as lasting moral resource; McEwan structures it as lasting moral wound.$cm0$,
  exam_fit = $cm0$2023 Q2 (Roles of children) — direct fit, Pair 2. Also: 2021 Q1 (Hope — Sissy's optimism and Briony's attempted repair); 2020 Q1 (Role models — Sissy and older Briony); 2018 Q2 (Education — alternative formation and later re-education); 2023 Q1 (Important choices — child formation leading to adult action).$cm0$,
  updated_at = now()
where id = 'cm-child-02';

update public.comparative_matrix
set
  ao2 = $cm0$Dickens presents Louisa and Sissy through contrastive characterisation, fire imagery, and emotional dialogue: Sissy's warmth exposes Louisa's repression, while their gradual intimacy turns female relationship into moral education. McEwan presents Briony and Cecilia through focalised misunderstanding, sibling distance, and retrospective guilt: Briony's perception of Cecilia is charged by envy, fascination, and genre-misreading, and the sisterly bond becomes permanently fractured by the accusation. Both writers make female perception transformative, but in opposite directions.$cm0$,
  ao3 = $cm0$Dickens: Victorian ideology of female moral influence, domestic femininity, and the possibility that women's emotional labour might repair damage caused by masculine systems. McEwan: 1930s upper-middle-class sisterhood, female sexuality policed by family/class expectation, and late-twentieth-century feminist interest in how women's voices can be silenced, misread, or mediated by another woman's narrative.$cm0$,
  ao4 = $cm0$Both function as sister-like relationships where one woman's perspective and imaginative power profoundly alters another's fate. Dickens uses Sissy's perception and care to help Louisa recover from the emotional damage of Fact. McEwan uses Briony's perception and imagination to destroy Cecilia's future with Robbie, then to reconstruct that future fictionally without being able to restore it.$cm0$,
  thesis = $cm0$Both novels present relationships between female characters as routes through which imagination enters another woman's life. Sissy's imaginative sympathy rescues Louisa from emotional starvation; Briony's imaginative certainty ruins Cecilia by converting adult desire into melodramatic threat. Dickens makes female influence redemptive; McEwan makes it both destructive and belatedly reparative.$cm0$,
  character = $cm0$Louisa is initially emotionally closed, while Sissy embodies the affective vocabulary Louisa has been denied. Their relationship turns difference into rescue. Cecilia is independent, desiring, and socially lucid; Briony is imaginative but immature, reading Cecilia's adulthood through childish plot categories. The female relationship in Atonement is therefore not merely familial but epistemological: one sister fails to know the other.$cm0$,
  narrative = $cm0$Dickens's omniscient narrator validates Sissy's influence and frames Louisa's response as moral awakening. McEwan filters Cecilia through Briony's misreading and later through Briony's authorial reconstruction, so the female relationship is always mediated by the very consciousness that damaged it. Narrative control becomes part of the ethical problem.$cm0$,
  structure = $cm0$Louisa and Sissy's relationship grows across the novel, moving from contrast to dependence and helping enable Book Three's limited repair. Briony and Cecilia's relationship moves from childhood admiration and adolescent tension to permanent rupture after Part One; Part Three appears to offer confrontation, while Part Four reveals that even this was authored. Dickens develops repair; McEwan exposes irreparability.$cm0$,
  exam_fit = $cm0$2024 Q1 (Relationships between female characters) — direct fit, Pair 1. Also: 2017 Q2 (Friendship — Sissy/Louisa and female bonds); 2019 Q2 (Changing relationships — repair versus estrangement); 2023 Q2 (Roles of children — Briony's child perspective affecting Cecilia); 2021 Q1 (Hope — repair imagined or denied).$cm0$,
  updated_at = now()
where id = 'cm-female-01';

update public.comparative_matrix
set
  ao2 = $cm0$Dickens presents Mrs Sparsit and Louisa through surveillance imagery, grotesque comedy, and the staircase fantasy: the older woman's apparently genteel concern becomes voyeuristic judgement, exposing class resentment disguised as morality. McEwan presents Emily Tallis's relationships with Cecilia and Briony through distant focalisation, bodily withdrawal, and domestic inertia: her migraines, bedroom perspective, and reliance on class instinct make maternal authority passive but damaging. Both writers use older women to show how female power can reproduce social control.$cm0$,
  ao3 = $cm0$Dickens: Victorian class hierarchy, fallen gentility, conduct-book morality, and the role of older women as guardians of respectability within patriarchal households. McEwan: upper-middle-class inter-war domestic structures, maternal distance in large houses staffed by servants, class snobbery, and gendered silence around sexuality and violence. Both contexts show women operating inside systems they did not create but may help preserve.$cm0$,
  ao4 = $cm0$Both function as female relationships shaped by class and generational power, showing women upholding or failing to challenge patriarchal structures. Dickens uses Mrs Sparsit's surveillance of Louisa to satirise moral policing and class spite. McEwan uses Emily Tallis's failure to intervene clearly with Cecilia, Briony, and Lola to expose maternal absence and class prejudice as enabling conditions of injustice.$cm0$,
  thesis = $cm0$Both novels complicate any simple view of female solidarity. Mrs Sparsit and Emily Tallis show that women may become enforcers, spectators, or negligent custodians of the very structures that harm younger women. Dickens makes this dynamic satirically visible through Sparsit's active surveillance; McEwan makes it morally chilling through Emily's passivity and class-shaped assumptions.$cm0$,
  character = $cm0$Mrs Sparsit is a displaced gentlewoman whose relationship with Louisa is driven by envy, class resentment, and appetite for scandal; Louisa becomes the younger woman she wishes to see fall. Emily Tallis is not malicious in the same theatrical sense, but her maternal detachment and snobbery leave Cecilia misunderstood and Briony unchecked. Both older women fail the younger women under their gaze.$cm0$,
  narrative = $cm0$Dickens uses comic-satirical narration to expose Mrs Sparsit's inner melodrama, turning her judgement of Louisa into self-incriminating spectacle. McEwan uses limited access to Emily's bodily and domestic consciousness to show how passivity can be ethically active: not seeing, not asking, and not challenging become narrative forms of complicity.$cm0$,
  structure = $cm0$Mrs Sparsit's relationship with Louisa intensifies through Book Two and peaks in the imagined staircase descent, helping dramatise the public misreading of Louisa's private crisis. Emily Tallis's failure is structurally earlier and quieter: her absence from decisive moral action in Part One allows the accusation to consolidate. Dickens makes surveillance an episode; McEwan makes absence a condition.$cm0$,
  exam_fit = $cm0$2024 Q1 (Relationships between female characters) — direct fit, Pair 2. Also: 2018 Q1 (Criticising aspects of society — class and respectability policed by women); 2020 Q2 (Love — Louisa's marriage and Cecilia's relationship judged by others); 2019 Q2 (Changing relationships — family breakdown and social surveillance); 2023 Q2 (Roles of children — adult female failure around Briony/Lola).$cm0$,
  updated_at = now()
where id = 'cm-female-02';

-- Verification: all expected rows must exist.
do $$
declare
  missing_rows integer;
begin
  select count(*)
  into missing_rows
  from (values
    ('cm-conflict-01'),
    ('cm-conflict-02'),
    ('cm-marriage-01'),
    ('cm-marriage-02'),
    ('cm-indep-01'),
    ('cm-indep-02'),
    ('cm-choice-01'),
    ('cm-choice-02'),
    ('cm-child-01'),
    ('cm-child-02'),
    ('cm-female-01'),
    ('cm-female-02')
  ) as expected(id)
  left join public.comparative_matrix cm on cm.id = expected.id
  where cm.id is null;

  if missing_rows > 0 then
    raise exception 'Themes 10-15 comparative_matrix AO-content seed expected % row(s) that were not present', missing_rows;
  end if;
end $$;

-- Verification: the AO-content contract fields are populated for this batch.
do $$
declare
  incomplete_rows integer;
begin
  select count(*)
  into incomplete_rows
  from public.comparative_matrix
  where id in (
    'cm-conflict-01',
    'cm-conflict-02',
    'cm-marriage-01',
    'cm-marriage-02',
    'cm-indep-01',
    'cm-indep-02',
    'cm-choice-01',
    'cm-choice-02',
    'cm-child-01',
    'cm-child-02',
    'cm-female-01',
    'cm-female-02'
  )
    and (
      ao2 is null
      or ao3 is null
      or ao4 is null
      or thesis is null
      or character is null
      or narrative is null
      or structure is null
      or exam_fit is null
    );

  if incomplete_rows > 0 then
    raise exception 'Themes 10-15 comparative_matrix AO-content seed left % incomplete row(s)', incomplete_rows;
  end if;
end $$;
