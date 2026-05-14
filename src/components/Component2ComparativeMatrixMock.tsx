import { useMemo, useState } from "react";

type Row = {
  id: string;
  theme: string;
  hardTimes: string;
  atonement: string;
  ao2: string;
  ao3: string;
  ao4: string;
  ao5: string;
  thesis: string;
  character: string;
  narrative: string;
  structure: string;
  examFit: string;
};

const ROWS: Row[] = [
  {
    id: "imagination",
    theme: "Imagination vs rationality",
    hardTimes: "Dickens stages Coketown's utilitarian schoolroom as a moral wasteland: Gradgrind's 'facts' starve Louisa and Tom of inner life, and Sissy's 'fancy' becomes the novel's ethical corrective.",
    atonement: "McEwan dramatises imagination as both gift and weapon: thirteen-year-old Briony's novelistic mind constructs a 'crime' from fragments she does not understand, exposing how fiction-making can over-write reality.",
    ao2: "Set Dickens's antithetical syntax and accumulative catalogue ('Fact, fact, fact') against McEwan's anaphoric free indirect drift through Briony; both weaponise rhythm and voice to expose a worldview.",
    ao3: "1854 Benthamite utilitarianism and the post-1846 debate over rote schooling vs late-twentieth-century scepticism about narrative authority and the reliability of memory and testimony.",
    ao4: "Both novels dramatise the cost of a single dominant epistemology — empirical fact in Dickens, imaginative inference in McEwan — and route redemption through a different way of knowing.",
    ao5: "Marxist readings (Eagleton) read Gradgrind's facts as ideology serving capital; Brian Finney ('Briony's Stand Against Oblivion', 2004) reads Briony's imagination as the only form of justice the novel allows.",
    thesis: "Whereas Dickens condemns the suppression of imagination as a social violence, McEwan interrogates imagination itself as a morally ambiguous instrument of harm and repair.",
    character: "Sissy / Louisa vs Briony / Cecilia",
    narrative: "Omniscient moralising narrator vs free indirect + retrospective first-person frame",
    structure: "Tripartite 'Sowing / Reaping / Garnering' agricultural arc vs four-part novel-within-a-novel with London 1999 coda",
    examFit: "Strong for questions on imagination, education, narrative ethics, or 'ways of seeing'.",
  },
  {
    id: "social-responsibility",
    theme: "Social responsibility",
    hardTimes: "Stephen Blackpool's 'muddle' and death indict a society that abandons the labouring poor; Bounderby's self-mythology exposes the lie of self-help.",
    atonement: "Robbie Turner — the housekeeper Grace Turner's son, sponsored through Cambridge by Jack Tallis — is wrongfully convicted of assaulting Lola; class privilege shields the Tallises and Marshall while the working-class outsider absorbs the cost through prison and the Dunkirk retreat.",
    ao2: "Set Dickens's symbolic naming ('Bounderby', 'Gradgrind') and pathos-laden Lancashire dialect against McEwan's clinical, sensory war prose ('a leg in a tree') that refuses redemptive closure.",
    ao3: "1840s–50s Condition-of-England debate, Manchester industrialism and factory legislation vs 1935 country-house England, the 1940 Dunkirk evacuation and Britain's class-stratified army.",
    ao4: "Both texts trace how institutional structures (factory, courtroom, army) convert private cruelty into public catastrophe.",
    ao5: "Liberal-humanist readings foreground individual moral failure; Marxist and post-colonial readings stress structural class violence and imperial decline.",
    thesis: "Both writers indict a propertied class that outsources moral responsibility, but Dickens demands reform while McEwan denies even the consolation of justice.",
    character: "Stephen Blackpool / Rachael vs Robbie Turner / Cecilia",
    narrative: "Sentimental third-person advocacy vs ironised, withheld first-person authorship",
    structure: "Public death scene as climactic indictment vs deferred revelation in coda",
    examFit: "Use for class, justice, suffering, or 'the individual and society' prompts.",
  },
  {
    id: "guilt",
    theme: "Guilt and atonement",
    hardTimes: "Gradgrind's late recognition of Louisa's ruin and Tom's crime stages a partial, private repentance the novel both grants and questions: the system that produced him is not undone.",
    atonement: "Briony's lifelong novel-writing is framed as her only available 'atonement' — yet the 1999 coda admits the act of fiction cannot undo what was done and may itself be self-serving.",
    ao2: "Dickens's tearful tableau and direct narratorial address vs McEwan's metafictional confession in the coda that retroactively destabilises the reader's trust in everything prior.",
    ao3: "Victorian Christian frameworks of repentance and providential justice vs late-twentieth-century secular, psychoanalytic and post-Holocaust models of trauma and reparation.",
    ao4: "Each novel asks whether private remorse can repair public harm; both refuse the easy 'yes'.",
    ao5: "Religious-providential readings vs Elke D'hoker's ('Confession and Atonement in Contemporary Fiction', 2006) reading of atonement as endlessly deferred within the text itself.",
    thesis: "Where Dickens permits a chastened patriarch a measure of grace, McEwan refuses his narrator absolution and exposes atonement as a fiction the guilty tell themselves.",
    character: "Gradgrind vs Briony",
    narrative: "Authoritative narratorial judgement vs self-incriminating authorial confession",
    structure: "Moral arc resolved within the narrative vs resolution undone by the coda",
    examFit: "Central for any guilt, redemption, or 'endings' question.",
  },
  {
    id: "childhood",
    theme: "Childhood",
    hardTimes: "Children are 'little pitchers' to be filled with fact (Ch. 2); Louisa's emotional malformation and Tom's corruption are direct products of Gradgrindian pedagogy.",
    atonement: "Thirteen-year-old Briony's half-formed grasp of adult sexuality and class produces a catastrophic misreading of the library and fountain scenes that the novel treats as developmental, not exculpatory.",
    ao2: "Dickens's mechanical imagery of pouring, filling and grinding vs McEwan's careful free-indirect rendering of adolescent cognition and the gap between perception and meaning.",
    ao3: "Victorian debates on rote learning, the Lancasterian / monitorial system and Newcastle Commission anxieties about mass schooling vs twentieth-century developmental psychology and the problem of the unreliable child witness.",
    ao4: "Both novels stage childhood as a site where adult ideologies (utilitarianism, class) inscribe themselves with lifelong consequence.",
    ao5: "Feminist readings emphasise how girls in particular are mis-educated; psychoanalytic readings centre the unconscious work of fantasy.",
    thesis: "Both novelists locate the origin of adult catastrophe in a mis-shaped childhood, but Dickens blames a system while McEwan implicates the child's own imagination.",
    character: "Louisa / Tom / Sissy vs Briony / Lola",
    narrative: "Narratorial pity for the child vs immersive child-focalisation",
    structure: "Childhood as 'Sowing' that determines later 'Reaping' vs childhood as Part One whose meaning is rewritten by Part Four",
    examFit: "Use for childhood, education, formation, or innocence prompts.",
  },
  {
    id: "class",
    theme: "Class and power",
    hardTimes: "Bounderby's fraudulent rags-to-riches myth and the Coketown 'Hands' expose industrial capitalism's dehumanisation of labour.",
    atonement: "The Tallis family's casual assumption of authority over Robbie — the cleaner's son they 'sponsored' — shows interwar class hierarchy operating as quiet violence.",
    ao2: "Dickens's grotesque caricature and industrial similes ('elephants in melancholy madness') vs McEwan's understated free indirect register that lets class assumptions speak themselves.",
    ao3: "Mid-Victorian industrial capitalism, the Factory Acts and post-1834 Poor Law settlement vs the 1930s English class system on the eve of war and imperial decline.",
    ao4: "Both novels show class as a structure that disguises itself as nature or merit.",
    ao5: "Marxist (Williams, Eagleton) vs liberal-individualist readings; in Atonement also post-imperial readings of decline.",
    thesis: "Each novel exposes how the dominant class narrates itself into innocence, though Dickens satirises this openly while McEwan lets it indict itself in silence.",
    character: "Bounderby / Stephen vs the Tallises / Robbie",
    narrative: "Satirical caricature vs ironic free indirect style",
    structure: "Public confrontation and exposure vs private misreading with public consequences",
    examFit: "Strong for class, power, hypocrisy, or 'social structures' questions.",
  },
  {
    id: "war",
    theme: "War and industrial systems",
    hardTimes: "Coketown is a war on the body: smoke 'serpents', mechanical pistons, and the workers reduced to 'Hands' frame industry as a slow violence.",
    atonement: "Part Two's Dunkirk sequence, focalised through Robbie as a private in the BEF, renders modern war as bureaucratic, sensory chaos — bodies in trees, a child's leg, a parataxis of detail that strips away patriotic myth.",
    ao2: "Dickens's animating metaphors that make machines monstrous ('serpents of smoke', 'elephants in melancholy madness') vs McEwan's paratactic, documentary-realist accumulation of detail that resists symbolism.",
    ao3: "Industrial Revolution and the 'Condition of England' vs the Second World War, Dunkirk myth, and post-war reckoning.",
    ao4: "Both treat large-scale systems — factory and army — as machines that grind down individual bodies and meanings.",
    ao5: "Eco-critical readings of Coketown's pollution; revisionist war historiography (Calder) reading McEwan against the Dunkirk myth.",
    thesis: "Both writers expose the human cost of impersonal systems, but Dickens still believes in moral protest where McEwan registers only survival and witness.",
    character: "Coketown 'Hands' vs Robbie and the retreating soldiers",
    narrative: "Symbolic, moralising panorama vs immersive, fragmented sensory realism",
    structure: "Industrial setting as continuous backdrop vs war as discrete, central Part Two",
    examFit: "Use for setting, violence, systems, or environment-of-the-novel questions.",
  },
  {
    id: "family",
    theme: "Family failure",
    hardTimes: "The Gradgrind household substitutes statistics for affection; Mrs Gradgrind's deathbed inability to name what is 'missing' is the novel's diagnosis.",
    atonement: "The Tallis family's absent father, ailing mother and rivalrous siblings produce the conditions for Briony's accusation and Cecilia's exile.",
    ao2: "Dickens's pathetic, near-comic deathbed scene vs McEwan's slow accumulation of domestic small-talk that conceals catastrophe.",
    ao3: "Victorian ideology of the 'angel in the house' vs interwar erosion of the country-house family.",
    ao4: "Both novels treat the family as the first and most damaging social institution.",
    ao5: "Feminist readings of maternal absence and silenced women in both texts; psychoanalytic readings of sibling rivalry.",
    thesis: "Both writers root public harm in private familial failure, but where Dickens offers Sissy as a redemptive surrogate, McEwan denies any reparative figure.",
    character: "The Gradgrinds vs the Tallises",
    narrative: "Narratorial diagnosis of the family vs immersion within its silences",
    structure: "Family as moral microcosm of society vs family as the engine of the plot's central error",
    examFit: "Use for family, women, domestic space, or 'the home' prompts.",
  },
  {
    id: "narrative-truth",
    theme: "Narrative truth and unreliability",
    hardTimes: "The omniscient narrator polices truth openly, exposing Bounderby's self-mythology and Harthouse's seductive cynicism.",
    atonement: "The London 1999 coda reveals Briony as the author of all that came before, retroactively destabilising every prior 'fact' the reader has been given.",
    ao2: "Dickens's intrusive moralising voice vs McEwan's framed, recursive metafictional structure that turns the novel against itself.",
    ao3: "Victorian confidence in the moral narrator vs postmodern scepticism about narrative authority and historical testimony.",
    ao4: "Both novels are deeply concerned with who has the right to tell the story — but reach opposite conclusions about the narrator's reliability.",
    ao5: "Set structuralist accounts of Dickens's moral narrator (against newer readings such as Hilary Schor's that recover irony in the omniscient voice) against post-structuralist and metafictional readings of Atonement (Brian Finney, 2004).",
    thesis: "Whereas Dickens uses an authoritative narrator to enforce moral clarity, McEwan uses an unreliable one to expose narrative itself as a form of power.",
    character: "Dickens-as-narrator vs Briony-as-author",
    narrative: "Intrusive Victorian omniscience vs recursive metafictional first-person",
    structure: "Linear moral arc vs frame that rewrites the whole",
    examFit: "Essential for narrative method, truth, or 'storytelling' questions.",
  },
  {
    id: "endings",
    theme: "Endings and closure",
    hardTimes: "The 'Garnering' final book distributes a measured, moralised closure: Tom dies abroad in remorse, Louisa is denied remarriage and motherhood, Sissy inherits a domestic future — closure is partial and pointedly unequal.",
    atonement: "The 1999 'London' coda detonates closure: the lovers' reunion is revealed as Briony's invention, and the novel ends not with resolution but with the dying author's confession of authorial power.",
    ao2: "Dickens's apostrophic direct address to the reader ('Dear reader! It rests with you and me…') vs McEwan's first-person metafictional turn that names itself as fiction.",
    ao3: "Victorian generic expectation of distributed poetic justice vs late-twentieth-century postmodern suspicion of consoling endings (Kermode, 'The Sense of an Ending').",
    ao4: "Both novels use their endings to interrogate what fiction owes its readers — moral instruction in Dickens, honest disclosure of its own limits in McEwan.",
    ao5: "Formalist readings of Dickens's tripartite providential structure vs metafictional readings (Finney, Hidalgo) of the coda as ethical self-exposure rather than aesthetic trick.",
    thesis: "Both novels stage their endings as moral arguments, but where Dickens distributes a chastened justice, McEwan withholds even the consolation of a stable narrative.",
    character: "Louisa / Tom / Sissy in 'Garnering' vs Briony as 1999 author-narrator",
    narrative: "Direct address from a moralising narrator vs first-person revelation that reframes everything prior",
    structure: "Tripartite agricultural close vs framed coda that rewrites the whole",
    examFit: "Essential for endings, closure, form, or 'how the novel resolves' questions.",
  },
  {
    id: "time-memory",
    theme: "Time and memory",
    hardTimes: "Dickens's narrator polices time providentially: the 'Sowing / Reaping / Garnering' arc enforces a causal, almost biblical chronology in which earlier choices determine later harvests.",
    atonement: "McEwan's structure is recursive and revisionary: the 1935 events of Part One are continually rewritten by Parts Two, Three and the 1999 coda, so memory becomes the form of the novel itself.",
    ao2: "Dickens's seasonal and agricultural metaphor structuring whole sections vs McEwan's analeptic, palimpsestic narration that overlays remembered, imagined and 'final' versions.",
    ao3: "Victorian providential historiography and a faith in legible cause-and-effect vs late-twentieth-century post-Holocaust scepticism about memory, testimony and the historical record.",
    ao4: "Both novels treat time as moral architecture, but reach opposing conclusions: in Dickens time discloses truth, in McEwan time reveals only further versions of it.",
    ao5: "Bakhtinian readings of Dickens's chronotope vs trauma-theory readings (Caruth, LaCapra) of Atonement's recursive temporality as the form of unresolved guilt.",
    thesis: "Where Dickens uses time as a providential mechanism that exposes moral truth, McEwan uses recursive memory to show that truth itself is rewritten by the act of remembering.",
    character: "Gradgrind across the three books vs Briony across 1935, 1940, 1999",
    narrative: "Linear, chaptered omniscience vs analepsis, revision and framed retrospection",
    structure: "Tripartite providential arc vs four-part recursive structure with coda",
    examFit: "Use for time, memory, structure, or 'how the form shapes meaning' questions.",
  },
];

const COLS: { key: keyof Row; label: string; ao?: string }[] = [
  { key: "hardTimes", label: "Hard Times argument" },
  { key: "atonement", label: "Atonement argument" },
  { key: "ao2", label: "AO2 method trigger", ao: "AO2" },
  { key: "ao3", label: "AO3 context", ao: "AO3" },
  { key: "ao4", label: "AO4 comparative link", ao: "AO4" },
  { key: "ao5", label: "AO5 alternative interpretation", ao: "AO5" },
  { key: "thesis", label: "Thesis sentence starter" },
];

const LENS_OPTIONS = [
  { key: "all", label: "All AOs" },
  { key: "character", label: "Character / function" },
  { key: "narrative", label: "Narrative method" },
  { key: "structure", label: "Structural method" },
  { key: "examFit", label: "Exam question suitability" },
] as const;

type LensKey = (typeof LENS_OPTIONS)[number]["key"];

export default function Component2ComparativeMatrixMock() {
  const [openId, setOpenId] = useState<string | null>(ROWS[0].id);
  const [lens, setLens] = useState<LensKey>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ROWS;
    return ROWS.filter((r) =>
      Object.values(r).join(" ").toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-10 print:px-0 print:py-0">
        <header className="mb-8 border-b border-border pb-6 print:mb-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Pearson Edexcel A-Level · Component 2 · Prose
          </p>
          <h1 className="mt-2 font-serif text-4xl leading-tight tracking-tight">
            Comparative Revision Matrix
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Hard Times (Dickens, 1854) vs Atonement (McEwan, 2001). Ten
            thematic rows, each with text-specific arguments, AO2–AO5 triggers
            and a thesis sentence starter for the comparative essay.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 print:hidden">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rows (e.g. Briony, Coketown, Dunkirk)…"
              className="w-72 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex flex-wrap gap-1 rounded-md border border-input p-1">
              {LENS_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setLens(opt.key)}
                  className={`rounded px-3 py-1 text-xs font-medium transition ${
                    lens === opt.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => window.print()}
              className="ml-auto rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-muted"
            >
              Print matrix
            </button>
          </div>
        </header>

        {/* Wide-screen matrix */}
        <div className="hidden overflow-x-auto rounded-lg border border-border lg:block print:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="sticky left-0 z-10 w-48 bg-muted/50 p-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Theme
                </th>
                {visibleCols(lens).map((c) => (
                  <th
                    key={c.key as string}
                    className="min-w-[14rem] border-l border-border p-3 font-mono text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    {c.ao && (
                      <span className="mr-1 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                        {c.ao}
                      </span>
                    )}
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr
                  key={row.id}
                  className={idx % 2 ? "bg-muted/20" : "bg-background"}
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 w-48 border-t border-border bg-inherit p-3 align-top font-serif text-base font-semibold"
                  >
                    {row.theme}
                  </th>
                  {visibleCols(lens).map((c) => (
                    <td
                      key={c.key as string}
                      className="min-w-[14rem] border-l border-t border-border p-3 align-top text-sm leading-relaxed"
                    >
                      {row[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile / tablet accordion */}
        <div className="space-y-3 lg:hidden print:hidden">
          {filtered.map((row) => {
            const open = openId === row.id;
            return (
              <article
                key={row.id}
                className="overflow-hidden rounded-lg border border-border"
              >
                <button
                  onClick={() => setOpenId(open ? null : row.id)}
                  className="flex w-full items-center justify-between bg-muted/30 px-4 py-3 text-left"
                >
                  <span className="font-serif text-lg font-semibold">
                    {row.theme}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {open ? "Hide" : "Open"}
                  </span>
                </button>
                {open && (
                  <div className="space-y-4 p-4">
                    <Pair label="Hard Times" body={row.hardTimes} />
                    <Pair label="Atonement" body={row.atonement} />
                    <AO label="AO2 · Method" body={row.ao2} />
                    <AO label="AO3 · Context" body={row.ao3} />
                    <AO label="AO4 · Comparison" body={row.ao4} />
                    <AO label="AO5 · Interpretation" body={row.ao5} />
                    <div className="rounded-md border-l-4 border-primary bg-primary/5 p-3">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                        Thesis starter
                      </p>
                      <p className="mt-1 font-serif text-sm italic">
                        {row.thesis}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <Meta label="Character" body={row.character} />
                      <Meta label="Narrative" body={row.narrative} />
                      <Meta label="Structure" body={row.structure} />
                      <Meta label="Exam fit" body={row.examFit} />
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Printable full dump */}
        <section className="hidden print:block">
          <div className="space-y-6 pt-4">
            {ROWS.map((row) => (
              <div key={row.id} className="break-inside-avoid border-t border-border pt-4">
                <h2 className="font-serif text-xl font-semibold">{row.theme}</h2>
                <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <Print term="Hard Times" def={row.hardTimes} />
                  <Print term="Atonement" def={row.atonement} />
                  <Print term="AO2" def={row.ao2} />
                  <Print term="AO3" def={row.ao3} />
                  <Print term="AO4" def={row.ao4} />
                  <Print term="AO5" def={row.ao5} />
                  <Print term="Thesis" def={row.thesis} />
                  <Print term="Exam fit" def={row.examFit} />
                </dl>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-10 border-t border-border pt-4 text-xs text-muted-foreground print:hidden">
          Sandbox prototype · mock data only · not connected to any database.
        </footer>
      </div>
    </div>
  );
}

function visibleCols(lens: LensKey) {
  if (lens === "all") return COLS;
  // Replace AO columns with the chosen lens column for a different cut
  const extraKey = lens as keyof Row;
  const extraLabel =
    LENS_OPTIONS.find((l) => l.key === lens)?.label ?? "Detail";
  return [
    { key: "hardTimes" as keyof Row, label: "Hard Times argument" },
    { key: "atonement" as keyof Row, label: "Atonement argument" },
    { key: extraKey, label: extraLabel },
    { key: "thesis" as keyof Row, label: "Thesis sentence starter" },
  ];
}

function Pair({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

function AO({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-md bg-muted/40 p-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

function Meta({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded border border-border p-2">
      <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 leading-snug">{body}</p>
    </div>
  );
}

function Print({ term, def }: { term: string; def: string }) {
  return (
    <>
      <dt className="font-mono uppercase tracking-wider text-muted-foreground">
        {term}
      </dt>
      <dd className="leading-snug">{def}</dd>
    </>
  );
}
