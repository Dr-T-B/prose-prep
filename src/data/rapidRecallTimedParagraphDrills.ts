import type {
  Component2AO,
  RapidRecallTheme,
  RapidRecallTimedParagraphDrill,
  RapidRecallWorkbookItem,
  TimedParagraphDrillStage,
  TimedParagraphDrillStageLabel,
  TimedParagraphDrillStemOption,
} from "@/types/rapidRecall";

const STAGE_ORDER: TimedParagraphDrillStageLabel[] = [
  "Thesis opening",
  "Hard Times paragraph opening",
  "Atonement paragraph opening",
  "Comparative judgement opening",
];

const STAGE_AO_FOCUS: Record<TimedParagraphDrillStageLabel, Component2AO[]> = {
  "Thesis opening": ["AO1", "AO3", "AO4"],
  "Hard Times paragraph opening": ["AO1", "AO2", "AO3"],
  "Atonement paragraph opening": ["AO1", "AO2", "AO3"],
  "Comparative judgement opening": ["AO1", "AO4"],
};

const STAGE_TIME_SECONDS: Record<TimedParagraphDrillStageLabel, number> = {
  "Thesis opening": 90,
  "Hard Times paragraph opening": 120,
  "Atonement paragraph opening": 120,
  "Comparative judgement opening": 90,
};

type TimedParagraphDrillSeed = {
  itemId: string;
  theme: RapidRecallTheme;
  focusPhrase: string;
  questionFocus: string;
  hardTimesTopic: string;
  atonementTopic: string;
  bestStems: Record<TimedParagraphDrillStageLabel, string>;
};

function capitalise(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function stageId(label: TimedParagraphDrillStageLabel) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function promptFor(label: TimedParagraphDrillStageLabel, focusPhrase: string) {
  if (label === "Thesis opening") {
    return `Choose the strongest thesis opening for a question on ${focusPhrase}.`;
  }
  if (label === "Hard Times paragraph opening") {
    return `Choose the fastest Hard Times paragraph opening for ${focusPhrase}.`;
  }
  if (label === "Atonement paragraph opening") {
    return `Choose the fastest Atonement paragraph opening for ${focusPhrase}.`;
  }
  return `Choose the strongest comparative judgement opening for ${focusPhrase}.`;
}

function bestExplanation(label: TimedParagraphDrillStageLabel, aoFocus: Component2AO[]) {
  const aoList = aoFocus.join("/");
  if (label === "Thesis opening") {
    return `This is strongest because it creates a comparative argument immediately, names each writer's distinct treatment, opens ${aoList}, and avoids plot retelling.`;
  }
  if (label === "Hard Times paragraph opening") {
    return `This works because it turns the Dickens route into a precise opening claim, keeps method or context active for ${aoList}, and is short enough for timed planning.`;
  }
  if (label === "Atonement paragraph opening") {
    return `This works because it starts with interpretation rather than plot, makes McEwan's method or context purposeful, and leaves room for ${aoList} evidence.`;
  }
  return `This is strongest because it weighs the two writers rather than listing them, sharpens AO4 comparison, and gives a timed closing direction without becoming an essay.`;
}

function weakerExplanation(label: TimedParagraphDrillStageLabel) {
  if (label === "Thesis opening") {
    return "This is plausible but too broad: it names the topic without a clear comparative argument, writer-specific route, or exam-ready decision.";
  }
  if (label === "Comparative judgement opening") {
    return "This is plausible but weak because it says the texts are similar or important without judging how the writers differ.";
  }
  return "This is plausible but too plot-led or general; it does not quickly convert the route plan into an AO-focused opening claim.";
}

function weakOptions(
  seed: TimedParagraphDrillSeed,
  label: TimedParagraphDrillStageLabel,
): TimedParagraphDrillStemOption[] {
  if (label === "Thesis opening") {
    return [
      {
        id: "broad-comparison",
        text: `Both Dickens and McEwan explore ${seed.focusPhrase} in their novels.`,
        explanation: weakerExplanation(label),
      },
      {
        id: "topic-importance",
        text: `${capitalise(seed.focusPhrase)} is important because characters experience problems linked to it.`,
        explanation: weakerExplanation(label),
      },
    ];
  }

  if (label === "Hard Times paragraph opening") {
    return [
      {
        id: "hard-times-topic",
        text: `In Hard Times, Dickens shows ${seed.focusPhrase} through ${seed.hardTimesTopic}.`,
        explanation: weakerExplanation(label),
      },
      {
        id: "hard-times-society",
        text: `Dickens uses this part of the novel to show that society is difficult.`,
        explanation: weakerExplanation(label),
      },
    ];
  }

  if (label === "Atonement paragraph opening") {
    return [
      {
        id: "atonement-topic",
        text: `In Atonement, McEwan shows ${seed.focusPhrase} through ${seed.atonementTopic}.`,
        explanation: weakerExplanation(label),
      },
      {
        id: "atonement-events",
        text: `McEwan includes several events that make this theme clear to the reader.`,
        explanation: weakerExplanation(label),
      },
    ];
  }

  return [
    {
      id: "similar-different",
      text: `Overall, the novels are similar and different in how they present ${seed.focusPhrase}.`,
      explanation: weakerExplanation(label),
    },
    {
      id: "theme-important",
      text: `In conclusion, both writers show that ${seed.focusPhrase} is important.`,
      explanation: weakerExplanation(label),
    },
  ];
}

function makeStage(
  seed: TimedParagraphDrillSeed,
  label: TimedParagraphDrillStageLabel,
): TimedParagraphDrillStage {
  const aoFocus = STAGE_AO_FOCUS[label];
  return {
    id: stageId(label),
    label,
    suggestedTimeSeconds: STAGE_TIME_SECONDS[label],
    prompt: promptFor(label, seed.focusPhrase),
    aoFocus,
    stemOptions: [
      {
        id: "best",
        text: seed.bestStems[label],
        isBest: true,
        explanation: bestExplanation(label, aoFocus),
      },
      ...weakOptions(seed, label),
    ],
  };
}

function makeTimedParagraphDrill(seed: TimedParagraphDrillSeed): RapidRecallTimedParagraphDrill {
  return {
    itemId: seed.itemId,
    theme: seed.theme,
    questionFocus: seed.questionFocus,
    stages: STAGE_ORDER.map((label) => makeStage(seed, label)),
    examWarning: "Use selected stems as short openings only. Do not expand them into a full paragraph or full essay here.",
  };
}

const TIMED_PARAGRAPH_DRILL_SEEDS: TimedParagraphDrillSeed[] = [
  {
    itemId: "mc-childhood-route",
    theme: "childhood",
    focusPhrase: "childhood",
    questionFocus: "childhood as shaped by adult systems and imagination",
    hardTimesTopic: "Gradgrind, Sissy and Facts",
    atonementTopic: "Briony's imaginative misreading",
    bestStems: {
      "Thesis opening": "Dickens presents childhood as damaged by utilitarian control, while McEwan presents childhood imagination as morally dangerous when it becomes detached from evidence.",
      "Hard Times paragraph opening": "In Hard Times, Dickens makes Gradgrind's language of Facts a method of shrinking childhood into obedience.",
      "Atonement paragraph opening": "By contrast, McEwan presents Briony's childhood imagination as powerful because it mistakes theatrical certainty for moral knowledge.",
      "Comparative judgement opening": "The key difference is that Dickens attacks adults who suppress imagination, while McEwan warns against imagination without responsibility.",
    },
  },
  {
    itemId: "mc-gender-reputation",
    theme: "gender",
    focusPhrase: "gender and reputation",
    questionFocus: "gendered reputation, marriage pressure and belief",
    hardTimesTopic: "Louisa's marriage and Mrs Sparsit's surveillance",
    atonementTopic: "Cecilia, Briony and social judgement",
    bestStems: {
      "Thesis opening": "Both writers show gender as a system of judgement, but Dickens stresses marriage training while McEwan stresses reputation and who gets believed.",
      "Hard Times paragraph opening": "Dickens opens Louisa's gendered constraint through marriage logic, making emotional training visible in her limited choices.",
      "Atonement paragraph opening": "McEwan shifts the pressure onto reputation, as Cecilia's desire is interpreted through classed and gendered suspicion.",
      "Comparative judgement opening": "Dickens makes gender pressure institutional and satirical, whereas McEwan makes it perceptual and narratively unstable.",
    },
  },
  {
    itemId: "mc-class-power",
    theme: "class",
    focusPhrase: "class and power",
    questionFocus: "class deciding who is heard and who is reduced to a function",
    hardTimesTopic: "Stephen and the label Hands",
    atonementTopic: "Robbie's place in the Tallis household",
    bestStems: {
      "Thesis opening": "Both novels show class controlling credibility and freedom: Dickens exposes industrial reduction, while McEwan exposes class prejudice inside accusation.",
      "Hard Times paragraph opening": "Dickens begins class critique by reducing workers to Hands, turning social position into dehumanising language.",
      "Atonement paragraph opening": "McEwan presents Robbie's class position as unstable, because education cannot fully protect him from household suspicion.",
      "Comparative judgement opening": "Dickens foregrounds economic exploitation, while McEwan shows class power operating through trust, suspicion and domestic hierarchy.",
    },
  },
  {
    itemId: "mc-violence-scale",
    theme: "violence",
    focusPhrase: "violence",
    questionFocus: "social, emotional and bodily harm across different historical scales",
    hardTimesTopic: "Stephen, Coketown and industrial pressure",
    atonementTopic: "Robbie's accusation and Dunkirk",
    bestStems: {
      "Thesis opening": "Both writers widen violence beyond injury, with Dickens exposing industrial harm and McEwan linking private accusation to wartime trauma.",
      "Hard Times paragraph opening": "Dickens presents violence through Coketown's atmosphere, making social damage feel embedded in industrial routine.",
      "Atonement paragraph opening": "McEwan escalates violence from misreading to prison and Dunkirk, so private error becomes historical suffering.",
      "Comparative judgement opening": "Dickens makes violence systemic through labour, while McEwan makes it cumulative through narrative consequence and war.",
    },
  },
  {
    itemId: "mc-place-control",
    theme: "place",
    focusPhrase: "place and control",
    questionFocus: "settings as social architecture",
    hardTimesTopic: "Coketown's repeated sameness",
    atonementTopic: "the Tallis estate and ordered rooms",
    bestStems: {
      "Thesis opening": "Both writers make place a structure of power, but Dickens uses industrial repetition while McEwan uses domestic space and class staging.",
      "Hard Times paragraph opening": "Dickens turns Coketown's repeated sameness into an opening image of industrial discipline.",
      "Atonement paragraph opening": "McEwan makes the Tallis estate an ordered stage where class, desire and misreading are arranged spatially.",
      "Comparative judgement opening": "Dickens makes place openly oppressive, while McEwan makes place elegant but equally controlling.",
    },
  },
  {
    itemId: "route-relationships-misunderstanding",
    theme: "relationships",
    focusPhrase: "relationships damaged by misunderstanding",
    questionFocus: "relationships damaged by misunderstanding",
    hardTimesTopic: "Louisa, Bounderby and emotional miseducation",
    atonementTopic: "Briony's misreading of Robbie and Cecilia",
    bestStems: {
      "Thesis opening": "Both writers present relationships as damaged by misunderstanding, but Dickens roots the damage in emotional training while McEwan roots it in perception.",
      "Hard Times paragraph opening": "Dickens first makes misunderstanding social, as Louisa's relationship with Bounderby grows from emotional miseducation.",
      "Atonement paragraph opening": "McEwan makes misunderstanding narratively dangerous, as Briony's limited focalisation reshapes Robbie and Cecilia's relationship.",
      "Comparative judgement opening": "Dickens shows feeling misread because it has been repressed, while McEwan shows desire misread because perception is overconfident.",
    },
  },
  {
    itemId: "route-childhood-roles",
    theme: "roles of children",
    focusPhrase: "roles of children",
    questionFocus: "children exposing adult systems",
    hardTimesTopic: "Sissy against Gradgrind's Facts",
    atonementTopic: "Briony's storytelling and judgement",
    bestStems: {
      "Thesis opening": "Both writers use children to expose adult systems, but Dickens makes Sissy corrective while McEwan makes Briony ethically unstable.",
      "Hard Times paragraph opening": "Dickens opens the child route through Sissy, whose feeling challenges the authority of Gradgrind's facts.",
      "Atonement paragraph opening": "McEwan complicates the child role through Briony, whose storytelling repeats adult authority without adult understanding.",
      "Comparative judgement opening": "Sissy reveals the value of feeling, whereas Briony reveals the danger of imaginative certainty.",
    },
  },
  {
    itemId: "route-childhood-adult-systems",
    theme: "childhood",
    focusPhrase: "childhood shaped by adult systems",
    questionFocus: "childhood shaped by adult systems",
    hardTimesTopic: "Gradgrind, Louisa and utilitarian education",
    atonementTopic: "Briony's play-making and confident interpretation",
    bestStems: {
      "Thesis opening": "Both writers present childhood as shaped by adult systems, but Dickens attacks utilitarian education while McEwan shows childhood imagination becoming dangerous when authority confirms it.",
      "Hard Times paragraph opening": "Dickens makes Gradgrind's factual education a system that narrows childhood feeling and trains Louisa into emotional restraint.",
      "Atonement paragraph opening": "McEwan presents Briony's childhood imagination as consequential because her confident interpretation is accepted by adult structures.",
      "Comparative judgement opening": "Dickens shows adult systems suppressing childhood, while McEwan shows adult systems giving childish certainty destructive force.",
    },
  },
  {
    itemId: "route-class-credibility",
    theme: "class",
    focusPhrase: "class and credibility",
    questionFocus: "class controlling whose suffering is believed",
    hardTimesTopic: "Stephen and industrial class language",
    atonementTopic: "Robbie as the servant's son",
    bestStems: {
      "Thesis opening": "Both novels show class shaping whose voice is believed, with Dickens exposing labour hierarchy and McEwan exposing domestic prejudice.",
      "Hard Times paragraph opening": "Dickens begins by making Stephen's class position audible through the reducing label Hands.",
      "Atonement paragraph opening": "McEwan makes Robbie's credibility fragile because his education does not erase his status as the servant's son.",
      "Comparative judgement opening": "Dickens attacks class through public economic systems, while McEwan shows class prejudice deciding private belief.",
    },
  },
  {
    itemId: "route-place-settings",
    theme: "settings",
    focusPhrase: "place and settings",
    questionFocus: "settings disciplining characters and revealing power",
    hardTimesTopic: "Coketown and Gradgrind's schoolroom",
    atonementTopic: "the Tallis house, fountain and rooms",
    bestStems: {
      "Thesis opening": "Both writers use setting to organise power: Dickens disciplines through industrial uniformity, while McEwan disciplines through class-coded space.",
      "Hard Times paragraph opening": "Dickens makes Coketown more than background by turning its uniformity into social pressure.",
      "Atonement paragraph opening": "McEwan makes the Tallis house a staged space where movement, class and desire are interpreted.",
      "Comparative judgement opening": "Dickens uses repetition to expose control, while McEwan uses perspective to make setting unstable.",
    },
  },
  {
    itemId: "route-memory-guilt",
    theme: "memory",
    focusPhrase: "memory and responsibility",
    questionFocus: "memory, narrative judgement and responsibility",
    hardTimesTopic: "Dickens's satiric moral patterning",
    atonementTopic: "Briony's retrospective authorship",
    bestStems: {
      "Thesis opening": "Both novels use narrative to judge the past, but Dickens directs memory towards reform while McEwan makes authorship ethically unstable.",
      "Hard Times paragraph opening": "Dickens's narrative patterning turns past choices into moral evidence for social critique.",
      "Atonement paragraph opening": "McEwan opens memory as attempted repair, because Briony's retrospective authorship cannot undo harm.",
      "Comparative judgement opening": "Dickens trusts narrative judgement more openly, while McEwan questions whether storytelling can atone.",
    },
  },
  {
    itemId: "route-violence-damage",
    theme: "violence",
    focusPhrase: "violence and damage",
    questionFocus: "violence as structural harm rather than isolated injury",
    hardTimesTopic: "Stephen, Coketown and industrial capitalism",
    atonementTopic: "Robbie, accusation and Dunkirk",
    bestStems: {
      "Thesis opening": "Both writers present violence as structural, but Dickens stresses industrial social harm while McEwan links accusation to legal and wartime damage.",
      "Hard Times paragraph opening": "Dickens presents violence indirectly through Stephen's suffering inside the pressures of industrial capitalism.",
      "Atonement paragraph opening": "McEwan makes violence cumulative as Briony's accusation moves Robbie towards bodily and wartime suffering.",
      "Comparative judgement opening": "Dickens implies harm through social atmosphere, while McEwan embodies harm through consequence and trauma.",
    },
  },
  {
    itemId: "route-gender-choices",
    theme: "gender",
    focusPhrase: "gender and important choices",
    questionFocus: "female choice under social pressure",
    hardTimesTopic: "Louisa's marriage choice",
    atonementTopic: "Cecilia's desire and reputation",
    bestStems: {
      "Thesis opening": "Both novels present female choice as constrained, with Dickens emphasising emotional education and McEwan emphasising reputation, class and perception.",
      "Hard Times paragraph opening": "Dickens presents Louisa's marriage as a choice shaped by training rather than free emotional knowledge.",
      "Atonement paragraph opening": "McEwan presents Cecilia's choice of Robbie as socially risky because desire is read through reputation.",
      "Comparative judgement opening": "Dickens critiques patriarchal training, while McEwan critiques the social reading of female desire.",
    },
  },
  {
    itemId: "route-important-choices",
    theme: "important choices",
    focusPhrase: "important choices",
    questionFocus: "choices shaped by systems, perception and consequence",
    hardTimesTopic: "Louisa's constrained marriage decision",
    atonementTopic: "Briony's accusation and later narration",
    bestStems: {
      "Thesis opening": "Both novels challenge simple free choice: Dickens shows decisions shaped by upbringing, while McEwan shows decisions distorted by perception and guilt.",
      "Hard Times paragraph opening": "Dickens opens choice through Louisa's marriage, where decision-making has already been narrowed by utilitarian education.",
      "Atonement paragraph opening": "McEwan presents Briony's accusation as a decisive choice formed by misreading and social codes.",
      "Comparative judgement opening": "Dickens stresses conditioning before the choice, whereas McEwan stresses consequence after the choice.",
    },
  },
  {
    itemId: "route-memory-guilt-accountability",
    theme: "memory",
    focusPhrase: "memory and guilt",
    questionFocus: "memory and guilt as judgement of earlier error",
    hardTimesTopic: "Gradgrind's recognition and Louisa's crisis",
    atonementTopic: "Briony's retrospective authorship",
    bestStems: {
      "Thesis opening": "Both novels use memory and guilt to judge earlier error, but Dickens makes recognition reformist while McEwan makes guilt formally unresolved.",
      "Hard Times paragraph opening": "Dickens makes Gradgrind's recognition a turning point where memory of error begins to redirect moral judgement.",
      "Atonement paragraph opening": "McEwan makes Briony's later narration an act of memory that confesses guilt without fully repairing harm.",
      "Comparative judgement opening": "Dickens gives guilt a clearer reformist direction, whereas McEwan makes guilt persist through the act of storytelling.",
    },
  },
  {
    itemId: "route-comparison-planning-pressure",
    theme: "important choices",
    focusPhrase: "comparison route planning",
    questionFocus: "planning pressure and consequence across both novels",
    hardTimesTopic: "Louisa's constrained marriage decision",
    atonementTopic: "Briony's accusation and Robbie's consequences",
    bestStems: {
      "Thesis opening": "A strong comparison weighs pressure and consequence: Dickens stresses social training before choice, while McEwan stresses damage after misjudgement.",
      "Hard Times paragraph opening": "Dickens gives the planning route a clear pressure point through Louisa's marriage, where education has already narrowed choice.",
      "Atonement paragraph opening": "McEwan shifts the route towards consequence, because Briony's accusation turns misreading into lasting damage for Robbie and Cecilia.",
      "Comparative judgement opening": "The strongest judgement compares pressure before the choice in Dickens with consequence after the choice in McEwan.",
    },
  },
];

export const rapidRecallTimedParagraphDrills: RapidRecallTimedParagraphDrill[] =
  TIMED_PARAGRAPH_DRILL_SEEDS.map(makeTimedParagraphDrill);

const timedParagraphDrillsByItemId = new Map(
  rapidRecallTimedParagraphDrills.map((drill) => [drill.itemId, drill]),
);

export function getRapidRecallTimedParagraphDrillForItemId(itemId: string) {
  return timedParagraphDrillsByItemId.get(itemId);
}

export function hasRapidRecallTimedParagraphDrill(itemId: string) {
  return timedParagraphDrillsByItemId.has(itemId);
}

export function getRapidRecallTimedParagraphDrillCount() {
  return rapidRecallTimedParagraphDrills.length;
}

function selectedStemText(
  drill: RapidRecallTimedParagraphDrill,
  label: TimedParagraphDrillStageLabel,
  selectedOptionIds: Record<string, string>,
) {
  const stage = drill.stages.find((candidate) => candidate.label === label);
  if (!stage) return "Not selected";

  const selected = stage.stemOptions.find((option) => option.id === selectedOptionIds[stage.id]);
  return selected?.text ?? "Not selected";
}

export function formatTimedParagraphDrillText({
  item,
  drill,
  selectedOptionIds,
}: {
  item: RapidRecallWorkbookItem;
  drill: RapidRecallTimedParagraphDrill;
  selectedOptionIds: Record<string, string>;
}) {
  const aoFocusOrder: Component2AO[] = ["AO1", "AO2", "AO3", "AO4"];
  const selectedAos = new Set(drill.stages.flatMap((stage) => stage.aoFocus));
  const aoFocus = aoFocusOrder.filter((ao) => selectedAos.has(ao)).join(", ");

  return [
    "Timed Paragraph Drill",
    "",
    `Theme: ${drill.theme}`,
    `Question focus: ${drill.questionFocus || item.prompt}`,
    `Thesis opening: ${selectedStemText(drill, "Thesis opening", selectedOptionIds)}`,
    `Hard Times opening: ${selectedStemText(drill, "Hard Times paragraph opening", selectedOptionIds)}`,
    `Atonement opening: ${selectedStemText(drill, "Atonement paragraph opening", selectedOptionIds)}`,
    `Comparative judgement opening: ${selectedStemText(drill, "Comparative judgement opening", selectedOptionIds)}`,
    `AO focus: ${aoFocus}`,
    `Exam warning: ${drill.examWarning}`,
    "",
    "Selected stems only - not a full paragraph or essay.",
  ].join("\n");
}
