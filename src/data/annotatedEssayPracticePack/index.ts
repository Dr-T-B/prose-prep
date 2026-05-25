export type Component2AO = "AO1" | "AO2" | "AO3" | "AO4";

export type AnnotationType =
  | "thesis"
  | "topic sentence"
  | "AO2 method"
  | "AO3 context"
  | "AO4 comparison"
  | "evidence use"
  | "evaluative comment"
  | "structural link"
  | "conclusion";

export type ContentReviewStatus =
  | "teacher review required"
  | "reviewed"
  | "approved"
  | "draft"
  | "incomplete draft"
  | string;

export type AnnotatedContentProvenance = {
  source: string;
  content_type: string;
  exam_board: string;
  component: string;
  verification_status: ContentReviewStatus;
  reviewed: boolean;
};

export type EssayQuestion = {
  id: string;
  paper_code: string;
  component: string;
  exam_board: string;
  year: string | null;
  question_text: string;
  theme: string;
  marks: number;
  text_pair: string;
  pre_1900_text: string;
  post_1900_text: string;
  ao_requirements: Component2AO[];
  difficulty_level: string;
  question_family: string;
  likely_routes: string[];
  linked_quote_cluster_ids: string[];
  linked_paragraph_stem_ids: string[];
  pitfalls: string[];
  level_5_upgrade_moves: string[];
  created_at: string;
  updated_at: string;
  provenance: AnnotatedContentProvenance;
};

export type AnnotatedEssay = {
  id: string;
  question_id: string;
  title: string;
  essay_type: string;
  target_band: string;
  estimated_mark_range: string;
  timed_condition_minutes: number;
  word_count_band: string;
  thesis: string;
  full_essay_text: string;
  examiner_summary: string;
  strengths: string[];
  risks: string[];
  upgrade_targets: string[];
  student_realism_note: string;
  created_at: string;
  updated_at: string;
  provenance: AnnotatedContentProvenance;
};

export type EssayParagraph = {
  id: string;
  essay_id: string;
  paragraph_number: number;
  paragraph_function: string;
  comparative_focus: string;
  main_argument: string;
  hard_times_focus: string;
  atonement_focus: string;
  key_methods: string[];
  key_contexts: string[];
  paragraph_text: string;
  ao_coverage: Component2AO[];
  examiner_comment: string;
  upgrade_target: string;
};

export type AOAnnotation = {
  id: string;
  essay_id: string;
  paragraph_id: string;
  annotation_order: number;
  text_span: string;
  ao_tags: Component2AO[];
  explanation: string;
  why_it_scores: string;
  improvement_note: string;
  annotation_type: AnnotationType;
};

export type ParagraphStem = {
  id: string;
  stem_text: string;
  theme: string;
  question_family: string;
  ao_focus: Component2AO[];
  compatible_characters: string[];
  compatible_quotes: string[];
  method_triggers: string[];
  context_route: string;
  comparison_route: string;
  difficulty_level: string;
  drill_instruction: string;
  timed_target_minutes: number;
  provenance: AnnotatedContentProvenance;
};

export type QuoteMethodLink = {
  id: string;
  quotation: string;
  speaker_or_narrative_location: string;
  text: string;
  character: string;
  method: string;
  theme: string;
  essay_question_id: string;
  paragraph_stem_id: string;
  ao2_explanation: string;
  ao4_comparative_partner: string;
  quote_type: string;
  verification_status: ContentReviewStatus;
  provenance: AnnotatedContentProvenance;
};

export type MisconceptionUpgrade = {
  id: string;
  weakness: string;
  diagnosis: string;
  example_problem_sentence: string;
  improved_level_5_version: string;
  linked_drill_id: string;
};

export type AnnotatedEssayPracticePack = {
  id: string;
  title: string;
  description: string;
  provenance: AnnotatedContentProvenance;
  ao_policy_note: string;
  essay_questions: EssayQuestion[];
  annotated_essays: AnnotatedEssay[];
  essay_paragraphs: EssayParagraph[];
  ao_annotations: AOAnnotation[];
  paragraph_stems: ParagraphStem[];
  quote_method_links: QuoteMethodLink[];
  misconception_upgrades: MisconceptionUpgrade[];
};

export const PACK_PROVENANCE: AnnotatedContentProvenance = {
  source: "ChatGPT session, 24 May 2026",
  content_type: "annotated essay practice",
  exam_board: "Pearson Edexcel",
  component: "Component 2 Prose",
  verification_status: "teacher review required",
  reviewed: false,
};

const createdAt = "2026-05-24T00:00:00.000Z";

export const essayQuestions: EssayQuestion[] = [
  {
    id: "eq_ht_at_children_roles_20260524",
    paper_code: "9ET0/02",
    component: "Component 2 — Prose",
    exam_board: "Pearson Edexcel",
    year: null,
    question_text: "Compare how the writers present the roles of children in Hard Times and Atonement.",
    theme: "childhood",
    marks: 40,
    text_pair: "Hard Times / Atonement",
    pre_1900_text: "Hard Times",
    post_1900_text: "Atonement",
    ao_requirements: ["AO1", "AO2", "AO3", "AO4"],
    difficulty_level: "top_band",
    question_family: "childhood",
    likely_routes: [
      "children as products of adult systems",
      "imagination as moral formation and distortion",
      "child testimony and adult responsibility",
      "narrative control over damaged childhood",
    ],
    linked_quote_cluster_ids: ["qcl_childhood_fact_fancy", "qcl_briony_order_testimony"],
    linked_paragraph_stem_ids: ["stem_childhood_systems_ao1", "stem_childhood_method_ao2", "stem_childhood_context_ao3"],
    pitfalls: [
      "Retelling Briony's plot before establishing a comparative argument.",
      "Treating Dickens as simply pro-child and McEwan as simply anti-child.",
      "Bolting Victorian education context onto the end of the paragraph.",
    ],
    level_5_upgrade_moves: [
      "Use 'role' conceptually: child as victim, witness, author, moral test and social product.",
      "Make every paragraph pivot between formation in Hard Times and misformation in Atonement.",
    ],
    created_at: createdAt,
    updated_at: createdAt,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "eq_ht_at_important_choices_20260524",
    paper_code: "9ET0/02",
    component: "Component 2 — Prose",
    exam_board: "Pearson Edexcel",
    year: null,
    question_text: "Compare how the writers present characters making important choices in Hard Times and Atonement.",
    theme: "important choices",
    marks: 40,
    text_pair: "Hard Times / Atonement",
    pre_1900_text: "Hard Times",
    post_1900_text: "Atonement",
    ao_requirements: ["AO1", "AO2", "AO3", "AO4"],
    difficulty_level: "strong",
    question_family: "important choices",
    likely_routes: ["choice under social pressure", "speech as action", "choice and later guilt"],
    linked_quote_cluster_ids: ["qcl_louisa_collapse", "qcl_briony_testimony"],
    linked_paragraph_stem_ids: ["stem_choice_pressure_ao1", "stem_knowledge_guilt_ao4"],
    pitfalls: ["Listing choices without judging how free they are."],
    level_5_upgrade_moves: ["Separate action, agency and consequence within the topic sentence."],
    created_at: createdAt,
    updated_at: createdAt,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "eq_ht_at_restrictions_20260524",
    paper_code: "9ET0/02",
    component: "Component 2 — Prose",
    exam_board: "Pearson Edexcel",
    year: null,
    question_text: "Compare how the writers present restrictions placed on individuals within society.",
    theme: "restriction",
    marks: 40,
    text_pair: "Hard Times / Atonement",
    pre_1900_text: "Hard Times",
    post_1900_text: "Atonement",
    ao_requirements: ["AO1", "AO2", "AO3", "AO4"],
    difficulty_level: "top_band",
    question_family: "restriction",
    likely_routes: ["class restriction", "gendered restriction", "narrative restriction"],
    linked_quote_cluster_ids: ["qcl_coketown_system", "qcl_robbie_class"],
    linked_paragraph_stem_ids: ["stem_restriction_systems_ao4", "stem_class_social_criticism_ao3"],
    pitfalls: ["Using society as vague background rather than an active pressure."],
    level_5_upgrade_moves: ["Name the institution doing the restricting before moving to evidence."],
    created_at: createdAt,
    updated_at: createdAt,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "eq_ht_at_education_20260524",
    paper_code: "9ET0/02",
    component: "Component 2 — Prose",
    exam_board: "Pearson Edexcel",
    year: null,
    question_text: "Compare the significance of education, formal or informal, in Hard Times and Atonement.",
    theme: "education",
    marks: 40,
    text_pair: "Hard Times / Atonement",
    pre_1900_text: "Hard Times",
    post_1900_text: "Atonement",
    ao_requirements: ["AO1", "AO2", "AO3", "AO4"],
    difficulty_level: "top_band",
    question_family: "education",
    likely_routes: ["formal schooling", "reading and misreading", "moral education after harm"],
    linked_quote_cluster_ids: ["qcl_fact_schoolroom", "qcl_briony_library"],
    linked_paragraph_stem_ids: ["stem_education_formal_informal_ao2", "stem_childhood_context_ao3"],
    pitfalls: ["Assuming education only means school scenes."],
    level_5_upgrade_moves: ["Use informal education to compare Briony's reading habits with Louisa's emotional deprivation."],
    created_at: createdAt,
    updated_at: createdAt,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "eq_ht_at_friendship_20260524",
    paper_code: "9ET0/02",
    component: "Component 2 — Prose",
    exam_board: "Pearson Edexcel",
    year: null,
    question_text: "Compare how the writers present friendship in Hard Times and Atonement.",
    theme: "friendship",
    marks: 40,
    text_pair: "Hard Times / Atonement",
    pre_1900_text: "Hard Times",
    post_1900_text: "Atonement",
    ao_requirements: ["AO1", "AO2", "AO3", "AO4"],
    difficulty_level: "secure",
    question_family: "friendship",
    likely_routes: ["Sissy's loyal care", "Robbie and Cecilia's intimacy", "friendship as trust against systems"],
    linked_quote_cluster_ids: ["qcl_sissy_care", "qcl_robbie_cecilia_letters"],
    linked_paragraph_stem_ids: ["stem_friendship_trust_ao1"],
    pitfalls: ["Letting friendship become a love-only essay."],
    level_5_upgrade_moves: ["Define friendship as moral attention, not just affection."],
    created_at: createdAt,
    updated_at: createdAt,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "eq_ht_at_marriage_20260524",
    paper_code: "9ET0/02",
    component: "Component 2 — Prose",
    exam_board: "Pearson Edexcel",
    year: null,
    question_text: "Compare the presentation of marriage in Hard Times and Atonement.",
    theme: "marriage",
    marks: 40,
    text_pair: "Hard Times / Atonement",
    pre_1900_text: "Hard Times",
    post_1900_text: "Atonement",
    ao_requirements: ["AO1", "AO2", "AO3", "AO4"],
    difficulty_level: "strong",
    question_family: "marriage",
    likely_routes: ["marriage as transaction", "marriage as social cover", "unmarried intimacy and consequence"],
    linked_quote_cluster_ids: ["qcl_louisa_bounderby", "qcl_lola_marriage"],
    linked_paragraph_stem_ids: ["stem_marriage_transaction_ao3"],
    pitfalls: ["Forgetting Lola and Paul Marshall as a structural aftershock."],
    level_5_upgrade_moves: ["Compare marriage as economic enclosure with marriage as reputational concealment."],
    created_at: createdAt,
    updated_at: createdAt,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "eq_ht_at_knowledge_20260524",
    paper_code: "9ET0/02",
    component: "Component 2 — Prose",
    exam_board: "Pearson Edexcel",
    year: null,
    question_text: "Compare the effects of knowledge on characters in Hard Times and Atonement.",
    theme: "knowledge",
    marks: 40,
    text_pair: "Hard Times / Atonement",
    pre_1900_text: "Hard Times",
    post_1900_text: "Atonement",
    ao_requirements: ["AO1", "AO2", "AO3", "AO4"],
    difficulty_level: "top_band",
    question_family: "knowledge",
    likely_routes: ["facts without wisdom", "knowledge too late", "misread knowledge"],
    linked_quote_cluster_ids: ["qcl_fact_vs_wisdom", "qcl_old_briony_coda"],
    linked_paragraph_stem_ids: ["stem_knowledge_guilt_ao4", "stem_memory_reconstruction_ao2"],
    pitfalls: ["Equating knowledge with truth."],
    level_5_upgrade_moves: ["Distinguish information, interpretation and moral knowledge."],
    created_at: createdAt,
    updated_at: createdAt,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "eq_ht_at_settings_20260524",
    paper_code: "9ET0/02",
    component: "Component 2 — Prose",
    exam_board: "Pearson Edexcel",
    year: null,
    question_text: "Compare the significance of settings in Hard Times and Atonement.",
    theme: "place",
    marks: 40,
    text_pair: "Hard Times / Atonement",
    pre_1900_text: "Hard Times",
    post_1900_text: "Atonement",
    ao_requirements: ["AO1", "AO2", "AO3", "AO4"],
    difficulty_level: "strong",
    question_family: "place",
    likely_routes: ["Coketown as social machine", "Tallis estate as insulated stage", "Dunkirk as exposed system"],
    linked_quote_cluster_ids: ["qcl_coketown_system", "qcl_tallis_estate_heat"],
    linked_paragraph_stem_ids: ["stem_place_system_stage_ao2"],
    pitfalls: ["Describing setting without making it do analytical work."],
    level_5_upgrade_moves: ["Treat place as an argument about power and perception."],
    created_at: createdAt,
    updated_at: createdAt,
    provenance: PACK_PROVENANCE,
  },
];

const essayParagraphTexts = [
  `Both Dickens and McEwan make children central to their social criticism, but they give childhood almost opposite dramatic functions. In Hard Times, children expose the violence of an adult system that mistakes measurable knowledge for human formation; in Atonement, Briony exposes the danger of a child who has imaginative power before she has moral judgement. The comparison is therefore not simply between innocent and guilty children. Dickens presents childhood as something adults deform, while McEwan presents childhood as a stage where adult structures, especially class and gender, can be misread and then brutally enforced. In both novels, the child becomes a test of society's ethics: what a culture teaches children to see determines what they later damage.`,
  `Dickens establishes this critique through the theatrical harshness of the schoolroom. Gradgrind's opening demand for "Facts" turns education into command, and the capitalised abstraction makes fact sound less like knowledge than a false religion. The children are addressed collectively, as if individuality is an error to be corrected. Sissy Jupe's reduction to "girl number twenty" is especially useful because Dickens compresses a whole pedagogy into a label: the child is counted before she is known. This method is satirical but also structural, because the novel's adult disasters grow from this opening scene. Louisa's later emotional blankness and Tom's selfishness are not sudden moral failures; they are the results of a childhood trained to distrust feeling. By contrast, Briony Tallis is not starved of imagination. McEwan's free indirect style places the reader inside a child's craving for aesthetic order, especially in the early description of her wish to make the world "just so". Where Dickens uses caricature and repeated imperatives to show adults pressing children into shape, McEwan uses focalisation to show a child pressing the world into story. Both methods make childhood unstable, but Dickens locates the danger in institutional reduction whereas McEwan locates it in interpretive excess.`,
  `The writers also differ in how far children understand the social worlds they inhabit. Sissy's apparent ignorance repeatedly proves morally intelligent because she recognises feeling, loyalty and dependency where Gradgrind's system sees only utility. Her circus background matters contextually: Dickens uses Sleary's world of performance and fancy to resist mid-Victorian utilitarian education, especially the belief that facts alone could produce social improvement. Sissy is a child of informal education, and her role is to preserve human sympathy inside Coketown's industrial logic. Briony, however, has been informally educated by books, country-house manners and class assumptions. Her mistake over Robbie is not only childish confusion; it is a socially authorised misreading. Because Robbie is vulnerable as an educated servant's son, her confident testimony is believed. McEwan's interwar setting therefore makes childhood part of a class system that decides whose story sounds plausible. Dickens asks what happens when adults deny children fancy; McEwan asks what happens when a child inherits the wrong social scripts for interpreting evidence.`,
  `This contrast becomes sharper when the child takes on the role of witness. In Hard Times, Bitzer is perhaps Gradgrind's most successful pupil, and that success is morally chilling. His literalism in the later bank episode shows that the system can produce a child who obeys its logic perfectly and yet lacks pity. Dickens structures Bitzer almost as a warning from the first schoolroom to the final crisis: a child educated by fact becomes an adult who can use fact against his teacher. Briony's witnessing is more formally complex. McEwan makes the reader experience uncertainty through restricted perception and delayed correction, so the child's statement becomes a narrative event as well as a plot event. The damage comes from language acquiring legal force before understanding catches up. In both novels, children do not merely observe adult society; they reproduce it. Bitzer reproduces utilitarian calculation, while Briony reproduces class prejudice in the grammar of certainty. That sustained comparison is important because it prevents the essay from treating Briony as uniquely monstrous. She is culpable, but her culpability is enabled by the adult world that believes her.`,
  `Gender also shapes the role children are allowed to play. Louisa is trained into repression and then exchanged into marriage with Bounderby, so Dickens connects girlhood to economic and patriarchal control. Her childhood has prepared her to consent without understanding the emotional cost of consent. The famous collapse before Gradgrind is therefore not only a daughter's complaint but an indictment of a father who has confused obedience with education. McEwan's Briony has a different kind of power: she is a girl whose story controls other people's lives, yet the novel also shows how Lola's suffering is absorbed into silence and later social respectability. Childhood in Atonement is therefore split between authorial power and victimhood. Dickens tends to imagine the damaged child as recoverable through sympathy, especially through Sissy's influence, whereas McEwan is more sceptical: once Briony's childhood error enters legal and family history, it cannot be undone by later knowledge. The AO4 hinge is that both writers link girlhood to restricted agency, but Dickens emphasises emotional deprivation while McEwan emphasises the dangerous authority of narrative interpretation.`,
  `Finally, both endings return to childhood as an ethical measure of the novel's world. Dickens allows a partial correction: Gradgrind learns too late that his children needed fancy, affection and moral imagination. This is not a complete social revolution, but it does allow the novel to imagine education being revised. McEwan refuses that comfort. Briony's old-age authorship can stage Robbie and Cecilia's survival, but it cannot make that survival historically true. Her art has "absolute power" only inside fiction, and this makes childhood error permanently tragic. The Level 5 argument, then, is that children in these novels are not decorative symbols of innocence. They are the places where systems become visible. Dickens shows a society failing children by narrowing their minds; McEwan shows a society failing through the stories it lets a child tell and the stories it refuses to question. Both writers make childhood a moral origin, but only Dickens leaves open the possibility that formation can be repaired.`,
];

export const annotatedEssays: AnnotatedEssay[] = [
  {
    id: "essay_children_roles_level5_20260524",
    question_id: "eq_ht_at_children_roles_20260524",
    title: "Level 5 Timed Model: Roles of Children",
    essay_type: "timed-condition model",
    target_band: "Level 5",
    estimated_mark_range: "34-38 / 40 after teacher review",
    timed_condition_minutes: 60,
    word_count_band: "900-1100",
    thesis: "Dickens presents childhood as something adult systems deform, while McEwan presents childhood as a point where adult class scripts and narrative habits become dangerously active.",
    full_essay_text: essayParagraphTexts.join("\n\n"),
    examiner_summary:
      "A thesis-led comparative essay with sustained AO4, precise AO2 on satire/focalisation/structure, and AO3 integrated into the argument rather than attached as background.",
    strengths: [
      "Argument precedes evidence in every paragraph.",
      "Comparison is continuous rather than alternating isolated text blocks.",
      "Context is precise: utilitarian schooling, industrial Coketown, interwar class credibility and gendered agency.",
      "Timed register feels student-achievable: ambitious but not over-polished.",
    ],
    risks: [
      "A real exam answer would need exact edition-checked wording for some Atonement anchors.",
      "Paragraph four could quote the testimony scene more precisely after text review.",
    ],
    upgrade_targets: [
      "Add one exact short Robbie/Briony testimony phrase after teacher verification.",
      "Sharpen the conclusion by naming one final method contrast: Dickensian moral narration versus McEwan's metafictional coda.",
    ],
    student_realism_note:
      "This is a realistic 60-minute high Level 5 model: six controlled paragraphs, selective evidence, and no dependency on lengthy memorised quotations.",
    created_at: createdAt,
    updated_at: createdAt,
    provenance: PACK_PROVENANCE,
  },
];

export const essayParagraphs: EssayParagraph[] = essayParagraphTexts.map((paragraph_text, index) => {
  const base = {
    essay_id: "essay_children_roles_level5_20260524",
    paragraph_text,
    ao_coverage: ["AO1", "AO2", "AO3", "AO4"] as Component2AO[],
  };
  const paragraphNumber = index + 1;
  const data: Omit<EssayParagraph, "id" | "paragraph_number" | "essay_id" | "paragraph_text" | "ao_coverage">[] = [
    {
      paragraph_function: "comparative thesis and route",
      comparative_focus: "Childhood as social test in both novels",
      main_argument: "Children reveal the moral failures of the societies that form them.",
      hard_times_focus: "Children deformed by factual utilitarian education.",
      atonement_focus: "Briony as imaginative child shaped by class scripts.",
      key_methods: ["conceptual antithesis", "comparative framing"],
      key_contexts: ["Victorian utilitarian education", "interwar class and gender hierarchy"],
      examiner_comment: "Strong AO1 because it defines 'roles of children' conceptually before evidence.",
      upgrade_target: "Could foreshadow the final form contrast more explicitly.",
    },
    {
      paragraph_function: "schoolroom and focalisation method paragraph",
      comparative_focus: "Suppressed imagination versus excessive imaginative ordering",
      main_argument: "Dickens and McEwan both make childhood unstable through contrasting methods.",
      hard_times_focus: "Gradgrind's schoolroom and Sissy's numerical label.",
      atonement_focus: "Briony's desire for aesthetic order.",
      key_methods: ["satire", "capitalised abstraction", "free indirect discourse", "focalisation"],
      key_contexts: ["utilitarian pedagogy", "country-house literary childhood"],
      examiner_comment: "High AO2: method is named and linked to effect, not merely spotted.",
      upgrade_target: "Use one more precise Briony phrase after verification.",
    },
    {
      paragraph_function: "context-integrated comparative paragraph",
      comparative_focus: "Formal and informal education",
      main_argument: "The novels test whether children can read their societies morally.",
      hard_times_focus: "Sissy as morally intelligent because she resists fact-only education.",
      atonement_focus: "Briony as reader of class-coded evidence.",
      key_methods: ["foil", "social scripting", "contrast"],
      key_contexts: ["mid-Victorian education debates", "interwar class credibility"],
      examiner_comment: "AO3 is integrated through how education and class shape perception.",
      upgrade_target: "Link the word 'informal' back to the question in the final sentence.",
    },
    {
      paragraph_function: "witness and structural consequence",
      comparative_focus: "Children reproducing adult systems",
      main_argument: "Children do not just observe society; they enact its values.",
      hard_times_focus: "Bitzer as Gradgrindian success turned moral failure.",
      atonement_focus: "Briony's restricted perception becoming legal testimony.",
      key_methods: ["structural foreshadowing", "restricted perception", "delayed correction"],
      key_contexts: ["utilitarian calculation", "legal/class credibility"],
      examiner_comment: "Strong AO4 because Bitzer and Briony are compared as products of social logic.",
      upgrade_target: "Add one sentence on reader response to the delayed revelation.",
    },
    {
      paragraph_function: "gendered childhood and agency",
      comparative_focus: "Girlhood as repression, power and silence",
      main_argument: "Girlhood is restricted in both novels, but the restriction takes different forms.",
      hard_times_focus: "Louisa's repressed childhood and transactional marriage.",
      atonement_focus: "Briony's authorial force and Lola's silencing.",
      key_methods: ["collapse scene", "character contrast", "narrative authority"],
      key_contexts: ["Victorian patriarchy", "interwar respectability and gender"],
      examiner_comment: "Excellent conceptual control over gender without drifting from childhood.",
      upgrade_target: "Avoid over-expanding Lola; keep her as a comparative pressure point.",
    },
    {
      paragraph_function: "conclusion and judgement",
      comparative_focus: "Repairable formation versus irreversible narrative harm",
      main_argument: "Childhood is a moral origin in both novels, but only Dickens imagines partial repair.",
      hard_times_focus: "Gradgrind's late recognition.",
      atonement_focus: "Briony's old-age authorship cannot undo childhood error.",
      key_methods: ["ending", "metafictional coda", "final judgement"],
      key_contexts: ["Victorian reform logic", "postmodern ethics of fiction"],
      examiner_comment: "The conclusion sharpens rather than repeats the thesis.",
      upgrade_target: "Name Dickens's moral narrator as the formal counterpart to McEwan's coda.",
    },
  ];
  return {
    id: `para_children_roles_${paragraphNumber}`,
    paragraph_number: paragraphNumber,
    ...base,
    ...data[index],
  };
});

export const aoAnnotations: AOAnnotation[] = [
  {
    id: "ann_child_001",
    essay_id: "essay_children_roles_level5_20260524",
    paragraph_id: "para_children_roles_1",
    annotation_order: 1,
    text_span: "Both Dickens and McEwan make children central to their social criticism, but they give childhood almost opposite dramatic functions.",
    ao_tags: ["AO1", "AO4"],
    explanation: "Opens with a comparative conceptual claim rather than plot.",
    why_it_scores: "AO1 is controlled and AO4 is immediate.",
    improvement_note: "Could name the exact opposition in the same sentence.",
    annotation_type: "thesis",
  },
  {
    id: "ann_child_002",
    essay_id: "essay_children_roles_level5_20260524",
    paragraph_id: "para_children_roles_1",
    annotation_order: 2,
    text_span: "Dickens presents childhood as something adults deform, while McEwan presents childhood as a stage where adult structures, especially class and gender, can be misread and then brutally enforced.",
    ao_tags: ["AO1", "AO3", "AO4"],
    explanation: "Sets up the essay route and embeds context as an active pressure.",
    why_it_scores: "It compares both texts and turns class/gender into argument, not background.",
    improvement_note: "A concise method pointer could make the thesis even richer.",
    annotation_type: "structural link",
  },
  {
    id: "ann_child_003",
    essay_id: "essay_children_roles_level5_20260524",
    paragraph_id: "para_children_roles_2",
    annotation_order: 3,
    text_span: "Gradgrind's opening demand for \"Facts\" turns education into command, and the capitalised abstraction makes fact sound less like knowledge than a false religion.",
    ao_tags: ["AO2", "AO3"],
    explanation: "Analyses diction and typography while linking to utilitarian education.",
    why_it_scores: "Method is connected to ideological effect.",
    improvement_note: "Add a second micro-word if time allows.",
    annotation_type: "AO2 method",
  },
  {
    id: "ann_child_004",
    essay_id: "essay_children_roles_level5_20260524",
    paragraph_id: "para_children_roles_2",
    annotation_order: 4,
    text_span: "Sissy Jupe's reduction to \"girl number twenty\" is especially useful because Dickens compresses a whole pedagogy into a label: the child is counted before she is known.",
    ao_tags: ["AO2", "AO1"],
    explanation: "Uses a short quotation for precise method-led analysis.",
    why_it_scores: "Explains how naming performs depersonalisation.",
    improvement_note: "Could link the label to the later contrast with Briony faster.",
    annotation_type: "evidence use",
  },
  {
    id: "ann_child_005",
    essay_id: "essay_children_roles_level5_20260524",
    paragraph_id: "para_children_roles_2",
    annotation_order: 5,
    text_span: "Where Dickens uses caricature and repeated imperatives to show adults pressing children into shape, McEwan uses focalisation to show a child pressing the world into story.",
    ao_tags: ["AO2", "AO4"],
    explanation: "A clean comparative method sentence.",
    why_it_scores: "The sentence compares form and effect in both texts.",
    improvement_note: "Strong enough for Level 5; keep this pattern in later paragraphs.",
    annotation_type: "AO4 comparison",
  },
  {
    id: "ann_child_006",
    essay_id: "essay_children_roles_level5_20260524",
    paragraph_id: "para_children_roles_3",
    annotation_order: 6,
    text_span: "Her circus background matters contextually: Dickens uses Sleary's world of performance and fancy to resist mid-Victorian utilitarian education, especially the belief that facts alone could produce social improvement.",
    ao_tags: ["AO3", "AO2"],
    explanation: "Context is woven into the reading of Sissy's function.",
    why_it_scores: "Avoids bolt-on context because the history explains the character role.",
    improvement_note: "Could mention Household Words only if it serves the argument.",
    annotation_type: "AO3 context",
  },
  {
    id: "ann_child_007",
    essay_id: "essay_children_roles_level5_20260524",
    paragraph_id: "para_children_roles_3",
    annotation_order: 7,
    text_span: "Briony's mistake over Robbie is not only childish confusion; it is a socially authorised misreading.",
    ao_tags: ["AO1", "AO3"],
    explanation: "Conceptual refinement: the argument avoids moral simplification.",
    why_it_scores: "Shows Level 5 nuance and precise contextual causation.",
    improvement_note: "Pair with a verified short quotation in final revision.",
    annotation_type: "evaluative comment",
  },
  {
    id: "ann_child_008",
    essay_id: "essay_children_roles_level5_20260524",
    paragraph_id: "para_children_roles_4",
    annotation_order: 8,
    text_span: "Bitzer reproduces utilitarian calculation, while Briony reproduces class prejudice in the grammar of certainty.",
    ao_tags: ["AO1", "AO3", "AO4"],
    explanation: "Compact comparison based on social systems and linguistic action.",
    why_it_scores: "Balances both texts and makes a judgement about causation.",
    improvement_note: "Could add an AO2 phrase explaining 'grammar of certainty'.",
    annotation_type: "topic sentence",
  },
  {
    id: "ann_child_009",
    essay_id: "essay_children_roles_level5_20260524",
    paragraph_id: "para_children_roles_4",
    annotation_order: 9,
    text_span: "McEwan makes the reader experience uncertainty through restricted perception and delayed correction, so the child's statement becomes a narrative event as well as a plot event.",
    ao_tags: ["AO2", "AO1"],
    explanation: "Explains narrative method and its effect on judgement.",
    why_it_scores: "Method is treated as meaning, not decoration.",
    improvement_note: "Excellent sentence to reuse for narrative-authority questions.",
    annotation_type: "AO2 method",
  },
  {
    id: "ann_child_010",
    essay_id: "essay_children_roles_level5_20260524",
    paragraph_id: "para_children_roles_5",
    annotation_order: 10,
    text_span: "The AO4 hinge is that both writers link girlhood to restricted agency, but Dickens emphasises emotional deprivation while McEwan emphasises the dangerous authority of narrative interpretation.",
    ao_tags: ["AO1", "AO4"],
    explanation: "Explicitly names the comparative hinge.",
    why_it_scores: "Prevents sequential discussion and sharpens conceptual contrast.",
    improvement_note: "In the final essay, remove the label 'AO4 hinge' if it feels too meta.",
    annotation_type: "AO4 comparison",
  },
  {
    id: "ann_child_011",
    essay_id: "essay_children_roles_level5_20260524",
    paragraph_id: "para_children_roles_6",
    annotation_order: 11,
    text_span: "Dickens allows a partial correction: Gradgrind learns too late that his children needed fancy, affection and moral imagination.",
    ao_tags: ["AO1", "AO3"],
    explanation: "Concluding judgement stays precise and acknowledges partial repair.",
    why_it_scores: "Shows nuance without drifting into a new paragraph.",
    improvement_note: "Could add 'reformist' if contextual vocabulary is needed.",
    annotation_type: "conclusion",
  },
  {
    id: "ann_child_012",
    essay_id: "essay_children_roles_level5_20260524",
    paragraph_id: "para_children_roles_6",
    annotation_order: 12,
    text_span: "Both writers make childhood a moral origin, but only Dickens leaves open the possibility that formation can be repaired.",
    ao_tags: ["AO1", "AO4"],
    explanation: "Final comparative judgement sharpens the thesis.",
    why_it_scores: "A Level 5 conclusion modifies the opening claim rather than repeats it.",
    improvement_note: "Add one form contrast if time remains.",
    annotation_type: "conclusion",
  },
];

export const paragraphStems: ParagraphStem[] = [
  {
    id: "stem_childhood_systems_ao1",
    stem_text: "Both novels present childhood as {concept}, but Dickens locates the damage in {adult system}, whereas McEwan locates it in {misreading or narrative habit}.",
    theme: "childhood",
    question_family: "roles of children",
    ao_focus: ["AO1", "AO4"],
    compatible_characters: ["Louisa Gradgrind", "Tom Gradgrind", "Sissy Jupe", "Briony Tallis"],
    compatible_quotes: ["Facts", "girl number twenty", "world just so"],
    method_triggers: ["comparative thesis", "conceptual contrast"],
    context_route: "Victorian utilitarian formation versus interwar class-coded childhood.",
    comparison_route: "Formation in Hard Times; misformation in Atonement.",
    difficulty_level: "top_band",
    drill_instruction: "Fill the placeholders, then add one method term before any quotation.",
    timed_target_minutes: 6,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "stem_childhood_method_ao2",
    stem_text: "Dickens's use of {method} makes the child seem {effect}, while McEwan's {method} makes childhood perception feel {effect}; this contrast matters because {judgement}.",
    theme: "childhood",
    question_family: "method comparison",
    ao_focus: ["AO2", "AO4"],
    compatible_characters: ["Sissy Jupe", "Bitzer", "Briony Tallis"],
    compatible_quotes: ["girl number twenty", "Facts", "Briony's testimony anchor"],
    method_triggers: ["satire", "capitalisation", "free indirect discourse", "restricted focalisation"],
    context_route: "Link method to educational theory or narrative modernity.",
    comparison_route: "External adult pressure versus internal narrative pressure.",
    difficulty_level: "top_band",
    drill_instruction: "Write three sentences: method, effect, comparative judgement.",
    timed_target_minutes: 5,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "stem_childhood_context_ao3",
    stem_text: "{Context} is not background here: it explains why {child/character} learns to see {object/person/world} as {mistaken value}.",
    theme: "childhood",
    question_family: "context integration",
    ao_focus: ["AO3", "AO1"],
    compatible_characters: ["Sissy Jupe", "Louisa Gradgrind", "Briony Tallis", "Robbie Turner"],
    compatible_quotes: ["Sleary's people anchor", "Robbie class anchor"],
    method_triggers: ["contextual cause", "interpretive verb"],
    context_route: "Utilitarian schooling, circus fancy, interwar estate hierarchy.",
    comparison_route: "Context should cause a reading choice in both texts.",
    difficulty_level: "strong",
    drill_instruction: "Make context explain a character's perception, not just the author's world.",
    timed_target_minutes: 4,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "stem_choice_pressure_ao1",
    stem_text: "The important choice appears personal, but both writers show it is shaped by {social pressure}: {Hard Times character} is constrained by {pressure}, while {Atonement character} acts through {pressure}.",
    theme: "important choices",
    question_family: "choice and agency",
    ao_focus: ["AO1", "AO4"],
    compatible_characters: ["Louisa Gradgrind", "Gradgrind", "Briony Tallis", "Cecilia Tallis"],
    compatible_quotes: ["Louisa collapse anchor", "Briony testimony anchor"],
    method_triggers: ["dialogue", "structural crisis", "focalisation"],
    context_route: "Victorian patriarchy and interwar class credibility.",
    comparison_route: "Constrained consent versus confident misrecognition.",
    difficulty_level: "strong",
    drill_instruction: "Open with agency, then test how free the choice really is.",
    timed_target_minutes: 6,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "stem_restriction_systems_ao4",
    stem_text: "Restriction in both novels is most powerful when it looks normal: Dickens makes {restriction} visible through {image/method}, whereas McEwan makes {restriction} operate through {social assumption/narrative gap}.",
    theme: "restriction",
    question_family: "society and individual",
    ao_focus: ["AO2", "AO4"],
    compatible_characters: ["Stephen Blackpool", "Louisa Gradgrind", "Robbie Turner", "Cecilia Tallis"],
    compatible_quotes: ["muddle", "Coketown smoke", "Robbie class anchor"],
    method_triggers: ["industrial imagery", "dialect", "free indirect discourse", "silence"],
    context_route: "Industrial capitalism and interwar English class hierarchy.",
    comparison_route: "Visible machinery versus invisible assumption.",
    difficulty_level: "top_band",
    drill_instruction: "Use one setting detail and one social detail; compare their pressure.",
    timed_target_minutes: 7,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "stem_education_formal_informal_ao2",
    stem_text: "Education is formal in {Hard Times scene} but informal in {Atonement scene}; the methods differ, yet both teach characters to {moral or interpretive outcome}.",
    theme: "education",
    question_family: "education",
    ao_focus: ["AO1", "AO2", "AO4"],
    compatible_characters: ["Gradgrind", "Sissy Jupe", "Briony Tallis", "Cecilia Tallis"],
    compatible_quotes: ["Facts", "girl number twenty", "Briony's play anchor"],
    method_triggers: ["imperative", "numbering", "free indirect discourse"],
    context_route: "Formal utilitarian schooling versus informal literary/class training.",
    comparison_route: "Education as formation of perception.",
    difficulty_level: "top_band",
    drill_instruction: "Avoid saying 'education is important'; specify what each education teaches.",
    timed_target_minutes: 6,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "stem_friendship_trust_ao1",
    stem_text: "Friendship functions less as simple affection than as {moral function}: in Dickens it {supports/rescues/exposes}, while in McEwan it {resists/is destroyed by/reveals} social suspicion.",
    theme: "friendship",
    question_family: "relationships",
    ao_focus: ["AO1", "AO4"],
    compatible_characters: ["Sissy Jupe", "Louisa Gradgrind", "Robbie Turner", "Cecilia Tallis"],
    compatible_quotes: ["Sissy care anchor", "Robbie Cecilia letter anchor"],
    method_triggers: ["dialogue", "letter", "contrast"],
    context_route: "Victorian domestic sympathy and interwar reputational risk.",
    comparison_route: "Friendship as moral attention versus fragile trust.",
    difficulty_level: "secure",
    drill_instruction: "Define friendship before using character evidence.",
    timed_target_minutes: 5,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "stem_marriage_transaction_ao3",
    stem_text: "Marriage becomes a social technology in both novels: Dickens presents it as {transaction}, while McEwan presents it as {concealment/status repair}, revealing {contextual judgement}.",
    theme: "marriage",
    question_family: "marriage",
    ao_focus: ["AO1", "AO3", "AO4"],
    compatible_characters: ["Louisa Gradgrind", "Bounderby", "Lola Quincey", "Paul Marshall"],
    compatible_quotes: ["Louisa Bounderby proposal anchor", "Lola Marshall marriage anchor"],
    method_triggers: ["structural irony", "social tableau", "narrative omission"],
    context_route: "Victorian marital economics and twentieth-century respectability.",
    comparison_route: "Marriage as exchange versus marriage as cover story.",
    difficulty_level: "strong",
    drill_instruction: "Name the social function of marriage in the topic sentence.",
    timed_target_minutes: 6,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "stem_knowledge_guilt_ao4",
    stem_text: "Knowledge arrives too {late/narrowly/confidently}: Dickens shows {character} learning {truth}, but McEwan shows {character} discovering that knowledge cannot undo {harm}.",
    theme: "knowledge",
    question_family: "knowledge and guilt",
    ao_focus: ["AO1", "AO4"],
    compatible_characters: ["Gradgrind", "Louisa Gradgrind", "Briony Tallis"],
    compatible_quotes: ["Gradgrind late knowledge anchor", "absolute power"],
    method_triggers: ["recognition scene", "metafictional coda", "retrospection"],
    context_route: "Victorian reform possibility versus postmodern limits of repair.",
    comparison_route: "Late moral knowledge versus irreversible historical harm.",
    difficulty_level: "top_band",
    drill_instruction: "Separate knowing, admitting and repairing.",
    timed_target_minutes: 6,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "stem_memory_reconstruction_ao2",
    stem_text: "Memory is not storage but reconstruction: McEwan's {method} makes the past feel {effect}, while Dickens's {method} makes remembered childhood operate as {moral pressure}.",
    theme: "memory",
    question_family: "memory",
    ao_focus: ["AO2", "AO4"],
    compatible_characters: ["Briony Tallis", "Louisa Gradgrind", "Gradgrind"],
    compatible_quotes: ["Briony coda anchor", "Louisa childhood anchor"],
    method_triggers: ["retrospection", "metafiction", "collapse scene"],
    context_route: "Postwar memory ethics and Victorian moral retrospection.",
    comparison_route: "Memory as unstable reconstruction versus moral reckoning.",
    difficulty_level: "strong",
    drill_instruction: "Make form carry the argument about memory.",
    timed_target_minutes: 7,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "stem_place_system_stage_ao2",
    stem_text: "Setting is not a backdrop: {place} acts as {system/stage}, and the writer's {method} makes individual behaviour appear {effect}.",
    theme: "place",
    question_family: "settings",
    ao_focus: ["AO2", "AO1"],
    compatible_characters: ["Coketown", "Tallis household", "Robbie Turner"],
    compatible_quotes: ["Coketown smoke", "Tallis heat anchor", "Dunkirk road anchor"],
    method_triggers: ["industrial imagery", "pathetic fallacy", "spatial symbolism"],
    context_route: "Industrial urbanisation, country-house hierarchy and wartime dislocation.",
    comparison_route: "Place as social machine versus place as interpretive theatre.",
    difficulty_level: "strong",
    drill_instruction: "Use setting to explain behaviour, not just atmosphere.",
    timed_target_minutes: 5,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "stem_class_social_criticism_ao3",
    stem_text: "The social criticism is sharpest when class controls {voice/belief/mobility}: Dickens exposes this through {method}, while McEwan exposes it through {method}.",
    theme: "social criticism",
    question_family: "class",
    ao_focus: ["AO2", "AO3", "AO4"],
    compatible_characters: ["Stephen Blackpool", "Bounderby", "Robbie Turner", "Briony Tallis"],
    compatible_quotes: ["muddle", "Robbie class anchor"],
    method_triggers: ["dialect", "caricature", "restricted focalisation"],
    context_route: "Industrial class hierarchy and interwar class credibility.",
    comparison_route: "Class as external oppression versus internalised assumption.",
    difficulty_level: "top_band",
    drill_instruction: "Make class do something active in your sentence.",
    timed_target_minutes: 6,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "stem_independence_agency_ao1",
    stem_text: "Independence is presented as {possible/impossible/qualified} because {character} can choose {action} but cannot escape {structure}.",
    theme: "independence",
    question_family: "agency",
    ao_focus: ["AO1", "AO3"],
    compatible_characters: ["Louisa Gradgrind", "Cecilia Tallis", "Robbie Turner", "Sissy Jupe"],
    compatible_quotes: ["Louisa collapse anchor", "Cecilia defiance anchor"],
    method_triggers: ["dialogue", "character contrast", "structural constraint"],
    context_route: "Gender, class and family authority.",
    comparison_route: "Private resistance against public structures.",
    difficulty_level: "strong",
    drill_instruction: "Test the limits of independence rather than praising it vaguely.",
    timed_target_minutes: 5,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "stem_violence_visible_invisible_ao4",
    stem_text: "Violence is {visible/invisible} in different ways: Dickens makes harm systemic through {industrial image}, whereas McEwan makes harm narrative through {misreading or withheld truth}.",
    theme: "violence",
    question_family: "violence",
    ao_focus: ["AO2", "AO4"],
    compatible_characters: ["Stephen Blackpool", "Robbie Turner", "Briony Tallis"],
    compatible_quotes: ["Coketown smoke", "Dunkirk body-image anchor", "testimony anchor"],
    method_triggers: ["imagery", "synecdoche", "delayed revelation"],
    context_route: "Industrial violence and wartime/social violence.",
    comparison_route: "Material damage versus epistemic damage.",
    difficulty_level: "top_band",
    drill_instruction: "Compare the form of violence before the example.",
    timed_target_minutes: 7,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "stem_changing_relationships_ao1",
    stem_text: "The relationship changes when {knowledge/pressure/desire} enters it; Dickens structures this as {movement}, while McEwan structures it as {rupture or retrospective revision}.",
    theme: "changing relationships",
    question_family: "relationships",
    ao_focus: ["AO1", "AO2", "AO4"],
    compatible_characters: ["Louisa and Gradgrind", "Cecilia and Robbie", "Briony and Cecilia"],
    compatible_quotes: ["Louisa collapse anchor", "Cecilia Robbie fountain anchor"],
    method_triggers: ["scene structure", "retrospection", "dialogue"],
    context_route: "Family authority and class/gender pressures.",
    comparison_route: "Reformable relationship versus irreparable rupture.",
    difficulty_level: "strong",
    drill_instruction: "Use a before/after structure without retelling the plot.",
    timed_target_minutes: 6,
    provenance: PACK_PROVENANCE,
  },
  {
    id: "stem_difficult_circumstances_ao3",
    stem_text: "Difficult circumstances reveal not only character but system: {Hard Times example} exposes {Victorian pressure}, while {Atonement example} exposes {twentieth-century pressure}.",
    theme: "difficult circumstances",
    question_family: "suffering",
    ao_focus: ["AO1", "AO3", "AO4"],
    compatible_characters: ["Stephen Blackpool", "Louisa Gradgrind", "Robbie Turner", "Cecilia Tallis"],
    compatible_quotes: ["muddle", "factory system anchor", "Dunkirk road anchor"],
    method_triggers: ["pathos", "setting", "free indirect discourse"],
    context_route: "Industrial work, gendered family structures, war and class.",
    comparison_route: "Systemic hardship in both texts, differently embodied.",
    difficulty_level: "strong",
    drill_instruction: "Turn circumstance into cause, then into judgement.",
    timed_target_minutes: 6,
    provenance: PACK_PROVENANCE,
  },
];

export const quoteMethodLinks: QuoteMethodLink[] = [
  {
    id: "qml_facts_childhood",
    quotation: "Facts",
    speaker_or_narrative_location: "Gradgrind's opening schoolroom speech",
    text: "Hard Times",
    character: "Thomas Gradgrind",
    method: "capitalised abstract noun and imperative pedagogy",
    theme: "childhood",
    essay_question_id: "eq_ht_at_children_roles_20260524",
    paragraph_stem_id: "stem_childhood_method_ao2",
    ao2_explanation: "Capitalisation makes an abstraction behave like doctrine, reducing education to command.",
    ao4_comparative_partner: "Briony's desire to order the world into story in Atonement.",
    quote_type: "verified quotation",
    verification_status: "teacher review required",
    provenance: PACK_PROVENANCE,
  },
  {
    id: "qml_girl_number_twenty",
    quotation: "girl number twenty",
    speaker_or_narrative_location: "Schoolroom naming of Sissy Jupe",
    text: "Hard Times",
    character: "Sissy Jupe",
    method: "numerical depersonalisation",
    theme: "education",
    essay_question_id: "eq_ht_at_children_roles_20260524",
    paragraph_stem_id: "stem_childhood_method_ao2",
    ao2_explanation: "The label substitutes category and number for identity.",
    ao4_comparative_partner: "Briony's classifying imagination in Atonement.",
    quote_type: "verified quotation",
    verification_status: "teacher review required",
    provenance: PACK_PROVENANCE,
  },
  {
    id: "qml_world_just_so",
    quotation: "world just so",
    speaker_or_narrative_location: "Early Briony focalisation",
    text: "Atonement",
    character: "Briony Tallis",
    method: "free indirect discourse and aesthetic ordering",
    theme: "childhood",
    essay_question_id: "eq_ht_at_children_roles_20260524",
    paragraph_stem_id: "stem_childhood_systems_ao1",
    ao2_explanation: "The phrase makes childish order feel both charming and ominously controlling.",
    ao4_comparative_partner: "Gradgrind's equally controlling fact-world in Hard Times.",
    quote_type: "quote anchor / paraphrase",
    verification_status: "teacher review required",
    provenance: PACK_PROVENANCE,
  },
  {
    id: "qml_muddle_restriction",
    quotation: "muddle",
    speaker_or_narrative_location: "Stephen Blackpool's repeated account of social confusion",
    text: "Hard Times",
    character: "Stephen Blackpool",
    method: "repeated demotic noun",
    theme: "restriction",
    essay_question_id: "eq_ht_at_restrictions_20260524",
    paragraph_stem_id: "stem_class_social_criticism_ao3",
    ao2_explanation: "The simple repeated word conveys structural injustice without elite vocabulary.",
    ao4_comparative_partner: "Robbie's constrained credibility in Atonement.",
    quote_type: "verified quotation",
    verification_status: "teacher review required",
    provenance: PACK_PROVENANCE,
  },
  {
    id: "qml_absolute_power",
    quotation: "absolute power",
    speaker_or_narrative_location: "Briony's late metafictional reflection",
    text: "Atonement",
    character: "Briony Tallis",
    method: "metafictional theological vocabulary",
    theme: "knowledge",
    essay_question_id: "eq_ht_at_knowledge_20260524",
    paragraph_stem_id: "stem_knowledge_guilt_ao4",
    ao2_explanation: "The phrase exposes the gap between fictional control and real moral repair.",
    ao4_comparative_partner: "Gradgrind's late but socially limited recognition.",
    quote_type: "quote anchor / paraphrase",
    verification_status: "teacher review required",
    provenance: PACK_PROVENANCE,
  },
];

export const misconceptionUpgrades: MisconceptionUpgrade[] = [
  {
    id: "mis_implied_comparison",
    weakness: "Comparison is implied but not explicit enough",
    diagnosis: "The paragraph discusses both novels but does not name the hinge between them.",
    example_problem_sentence: "Dickens shows children are badly educated. McEwan also shows Briony making a mistake.",
    improved_level_5_version: "Where Dickens makes childhood damage the product of adult education, McEwan makes childhood error the point at which adult class assumptions become active.",
    linked_drill_id: "stem_childhood_systems_ao1",
  },
  {
    id: "mis_bolted_context",
    weakness: "AO3 is bolted on rather than integrated",
    diagnosis: "Context appears as a historical fact after the analysis instead of explaining the character or method.",
    example_problem_sentence: "This links to Victorian education, which was strict.",
    improved_level_5_version: "Dickens's strict schoolroom matters because mid-Victorian faith in factual instruction is exactly what turns Sissy from a child into a numbered object.",
    linked_drill_id: "stem_childhood_context_ao3",
  },
  {
    id: "mis_method_no_effect",
    weakness: "AO2 identifies a method but does not explain effect",
    diagnosis: "The sentence names a technique but does not say what it makes the reader think.",
    example_problem_sentence: "McEwan uses free indirect discourse for Briony.",
    improved_level_5_version: "McEwan's free indirect discourse traps the reader inside Briony's confident ordering, so the later error feels like a failure of perception rather than a simple lie.",
    linked_drill_id: "stem_childhood_method_ao2",
  },
  {
    id: "mis_plot_opening",
    weakness: "Paragraph begins with plot rather than argument",
    diagnosis: "The first sentence tells the story instead of answering the question.",
    example_problem_sentence: "At the start of Hard Times Gradgrind is in a classroom talking to children.",
    improved_level_5_version: "Dickens begins in a classroom because the novel wants childhood to reveal the violence of a society that mistakes instruction for formation.",
    linked_drill_id: "stem_education_formal_informal_ao2",
  },
  {
    id: "mis_sequential_texts",
    weakness: "Dickens and McEwan are discussed sequentially rather than comparatively",
    diagnosis: "The paragraph has a Hard Times half and an Atonement half with no internal bridge.",
    example_problem_sentence: "In Hard Times children suffer. In Atonement Briony is a child.",
    improved_level_5_version: "Both novels make children agents of social meaning, but Dickens emphasises children suffering under adult systems whereas McEwan emphasises a child reproducing those systems through interpretation.",
    linked_drill_id: "stem_restriction_systems_ao4",
  },
  {
    id: "mis_repeated_conclusion",
    weakness: "Conclusion repeats the thesis without sharpening it",
    diagnosis: "The ending says the same thing again and misses the final judgement.",
    example_problem_sentence: "In conclusion, both writers present children as important.",
    improved_level_5_version: "Ultimately, childhood matters in both novels because it is where society first writes itself into the individual; Dickens imagines revision, but McEwan leaves the damage historically irreversible.",
    linked_drill_id: "stem_knowledge_guilt_ao4",
  },
];

export const annotatedEssayPracticePack: AnnotatedEssayPracticePack = {
  id: "annotated-paper-2-essay-practice-pack-ht-at-20260524",
  title: "Annotated Paper 2 Essay Practice Pack — Hard Times / Atonement",
  description:
    "Structured Pearson Edexcel Component 2 practice content converting today's annotated essay work into questions, model essays, AO annotations, examiner commentary, stems, quote-method links and upgrade drills.",
  provenance: PACK_PROVENANCE,
  ao_policy_note:
    "Pearson Edexcel Component 2 Prose assesses AO1, AO2, AO3 and AO4. This pack does not create AO5 scoring fields; interpretive debate is labelled as interpretive nuance or critical perspective only.",
  essay_questions: essayQuestions,
  annotated_essays: annotatedEssays,
  essay_paragraphs: essayParagraphs,
  ao_annotations: aoAnnotations,
  paragraph_stems: paragraphStems,
  quote_method_links: quoteMethodLinks,
  misconception_upgrades: misconceptionUpgrades,
};
