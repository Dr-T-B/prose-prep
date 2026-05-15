import { useMemo, useState } from "react";

/* ---------------- Mock data ---------------- */

type QuoteEntry = {
  text: string;
  location: string;
  verified: boolean;
  quoteType: "verbatim" | "anchor";
};

type Theme = {
  id: string;
  label: string;
  short: string;
  hardTimes: {
    angle: string;
    quotes: QuoteEntry[];
  };
  atonement: {
    angle: string;
    quotes: QuoteEntry[];
  };
  ao2: string;
  ao3: string;
  ao4: string;
  ao5: string;
};

const THEMES: Theme[] = [
  {
    id: "education",
    label: "Education & Utilitarianism",
    short: "Education",
    hardTimes: {
      angle:
        "Gradgrind's 'Facts' system suppresses imagination; Sissy resists, Louisa breaks down.",
      quotes: [
        {
          text: "Now, what I want is, Facts.",
          location: "Bk1 Ch1",
          verified: true,
          quoteType: "verbatim",
        },
        {
          text: "Anchor: Louisa stares into the fire — imagination starved by Gradgrindian schooling — verify exact wording before citing.",
          location: "Bk1 Ch8",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    atonement: {
      angle:
        "Briony's literary education shapes (and distorts) her reading of events; writing as both crime and penance.",
      quotes: [
        {
          text: "Anchor: Briony drafts 'The Trials of Arabella' — juvenile authorship imposing order on reality — verify exact wording before citing.",
          location: "Pt1 Ch1",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: the coda's question of how a novelist with absolute power over outcomes can ever achieve atonement — verify exact wording before citing.",
          location: "Coda (London, 1999)",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    ao2: "Imperative syntax, mechanical lexis (Dickens); metafiction & embedded drafts (McEwan).",
    ao3: "Benthamite utilitarianism; mid-Victorian education debates; Hard Times serialised in Household Words, 1854.",
    ao4: "Both expose how systems of knowledge — factual or fictional — deform young minds.",
    ao5: "Leavis (The Great Tradition, 1948) singles out Hard Times as Dickens's most fully serious novel; postmodern critics read McEwan as epistemic critique.",
  },
  {
    id: "imagination",
    label: "Imagination & Fiction",
    short: "Imagination",
    hardTimes: {
      angle:
        "Sleary's circus = fancy as moral oxygen; suppression of fancy causes Louisa's collapse.",
      quotes: [
        {
          text: "People mutht be amuthed.",
          location: "Bk3 Ch8",
          verified: true,
          quoteType: "verbatim",
        },
        {
          text: "Anchor: Louisa confesses she has nothing inside herself to hold by — verify exact wording before citing.",
          location: "Bk2 Ch12",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    atonement: {
      angle:
        "Briony's imagination misreads the fountain & library; fiction later becomes the only available reparation.",
      quotes: [
        {
          text: "Anchor: Briony misreads the fountain scene as an assault, projecting genre onto event — verify exact wording before citing.",
          location: "Pt1 Ch3",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: Briony's coda reveals her retrospective control over narrative closure — verify exact wording before citing.",
          location: "Coda (London, 1999)",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    ao2: "Symbol (circus, fountain), free indirect style, embedded narrative.",
    ao3: "Romantic vs Utilitarian debate (1850s); late twentieth-century doubt about narrative truth.",
    ao4: "Imagination redeems in Dickens but incriminates in McEwan — inverse moral charge.",
    ao5: "Feminist readings of Briony's authorship; debate over Dickensian moral fancy vs McEwan's metafictional irony.",
  },
  {
    id: "class",
    label: "Class & Social Hierarchy",
    short: "Class",
    hardTimes: {
      angle:
        "Coketown's Hands vs masters; Bounderby's self-made myth exposed as fraud.",
      quotes: [
        {
          text: "Anchor: workers reduced to 'Hands' — synecdochic dehumanisation by industrial register — verify exact wording before citing.",
          location: "Bk1 Ch10",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: Mrs Pegler revealed as Bounderby's mother and his self-made myth collapses — verify exact wording before citing.",
          location: "Bk3 Ch5",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    atonement: {
      angle:
        "Robbie's Cambridge education cannot outrun his class; Tallis family closes ranks.",
      quotes: [
        {
          text: "Anchor: Robbie framed as 'a charlady's son' — class as pre-judgement — verify exact wording and speaker before citing.",
          location: "Pt1 (Tallis household)",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: Robbie arrested at the Tallis house; class verdict precedes evidence — verify exact wording before citing.",
          location: "Pt1 Ch14",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    ao2: "Synecdoche & industrial register (Dickens); free indirect discourse / interiority (McEwan).",
    ao3: "1850s industrial capitalism; 1930s English class anxiety pre-war.",
    ao4: "Both texts show class as a sentence passed before the trial begins.",
    ao5: "Marxist readings foreground both; liberal-humanist readings stress individual moral failure.",
  },
  {
    id: "childhood",
    label: "Childhood & Moral Formation",
    short: "Childhood",
    hardTimes: {
      angle:
        "Children processed as 'little vessels'; Tom corrupted, Louisa numbed, Sissy alone retains feeling.",
      quotes: [
        {
          text: "Anchor: children as 'little vessels' to be filled with 'imperial gallons' of facts — verify exact wording before citing.",
          location: "Bk1 Ch2",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: Tom robs Bounderby's bank — moral void produced by Fact-based upbringing — verify exact wording before citing.",
          location: "Bk2 Ch12",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    atonement: {
      angle:
        "Briony at 13 — neither child nor adult — commits the crime that defines her life.",
      quotes: [
        {
          text: "Anchor: Briony introduced as a child obsessed with order, secrets and miniature worlds — verify exact wording before citing.",
          location: "Pt1 Ch1",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: Briony's false certainty in identifying Robbie as the attacker — verify exact wording before citing.",
          location: "Pt1 Ch13",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    ao2: "Extended metaphor of containers (Dickens); shifting focalisation through Briony (McEwan).",
    ao3: "Victorian pedagogy; 1930s upper-middle-class childhood and the cultural figure of the precocious girl-author.",
    ao4: "Both interrogate whether children can be held morally responsible for adult systems.",
    ao5: "Psychoanalytic readings of Briony; moral-didactic readings of Dickens's children.",
  },
  {
    id: "family",
    label: "Family & Emotional Neglect",
    short: "Family",
    hardTimes: {
      angle:
        "Gradgrind home = emotional vacuum; Louisa married off transactionally to Bounderby.",
      quotes: [
        {
          text: "Anchor: Louisa asks her father what she can possibly know of tastes and fancies given her upbringing — verify exact wording before citing.",
          location: "Bk1 Ch15",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: Louisa returns to her father, broken by the marriage he arranged — verify exact wording before citing.",
          location: "Bk2 Ch12",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    atonement: {
      angle:
        "Tallis parents absent (migraine, London); children left to misread adult worlds.",
      quotes: [
        {
          text: "Anchor: Emily Tallis is upstairs with migraine across the long Part One day, structurally absent from supervision.",
          location: "Pt1 (passim)",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: Jack Tallis is in London and reachable only by telephone, never physically present at the crisis.",
          location: "Pt1 Ch12",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    ao2: "Domestic interior as symbol; absence as structural device (McEwan).",
    ao3: "Victorian patriarchal household; declining inter-war upper-middle-class family.",
    ao4: "Both link emotional neglect to catastrophic moral error in the next generation.",
    ao5: "Feminist critics on Louisa & Cecilia as commodified daughters.",
  },
  {
    id: "guilt",
    label: "Guilt & Responsibility",
    short: "Guilt",
    hardTimes: {
      angle:
        "Gradgrind's late recognition of harm; Tom's guilt evaded by flight.",
      quotes: [
        {
          text: "Anchor: Gradgrind's recognition that the ground of his certainties has given way under him — verify exact wording before citing.",
          location: "Bk3 Ch1",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: Tom in blackface as a circus performer, fleeing England — guilt evaded rather than answered — verify exact wording before citing.",
          location: "Bk3 Ch7",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    atonement: {
      angle:
        "Briony's lifelong project of atonement through writing; guilt as narrative engine.",
      quotes: [
        {
          text: "Anchor: the coda's question of how a novelist with absolute narrative power can ever achieve atonement — verify exact wording before citing.",
          location: "Coda (London, 1999)",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: Briony frames atonement as an ethically impossible but necessary attempt — verify exact wording before citing.",
          location: "Coda (London, 1999)",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    ao2: "Direct moral statement (Dickens) vs unreliable retrospective narration (McEwan).",
    ao3: "Christian frameworks of repentance; secular post-war ethics of testimony.",
    ao4: "Both ask whether acknowledgement without restitution is enough.",
    ao5: "Ethical criticism (Nussbaum-style) productive on both texts.",
  },
  {
    id: "memory",
    label: "Memory & Narrative Reconstruction",
    short: "Memory",
    hardTimes: {
      angle:
        "Linear, omniscient narration — memory subordinated to moral verdict.",
      quotes: [
        {
          text: "Anchor: the narrator's direct address to the reader, asserting moral authority over the chronicle — verify exact wording before citing.",
          location: "Bk2 Ch6",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: the closing tableau projects the destinies of the surviving characters into the future — verify exact wording before citing.",
          location: "Bk3 Ch9",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    atonement: {
      angle:
        "Whole novel revealed as Briony's reconstruction; memory as authored artefact.",
      quotes: [
        {
          text: "Anchor: the coda destabilises the reader's certainty about truth, memory and invention — verify exact wording before citing.",
          location: "Coda (London, 1999)",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: Cecilia and Robbie's reunion is revealed to be Briony's invented consolation rather than historical fact — verify exact wording before citing.",
          location: "Coda (London, 1999)",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    ao2: "Stable third-person omniscience vs metafictional frame collapse.",
    ao3: "Victorian faith in narrative authority; post-war retrospective fiction; late twentieth-century metafiction; the modernist inheritance of memory and interiority (Woolf, Bowen).",
    ao4: "Dickens trusts the narrator; McEwan dismantles that trust.",
    ao5: "Critical lens — Hutcheon's 'historiographic metafiction' frames the coda as a deliberate destabilisation of historical truth; trauma/memory theory (Caruth, LaCapra) reads memory as belated and ethically unstable.",
  },
  {
    id: "war",
    label: "Systems that Consume the Body",
    short: "Systems",
    hardTimes: {
      angle:
        "Industrial capitalism consumes bodies through labour, smoke, machinery and social abstraction; Stephen's death at the Old Hell Shaft is emblematic.",
      quotes: [
        {
          text: "Anchor: Coketown's chimneys depicted as 'serpents of smoke' — industrial sublime as bodily threat — verify exact wording before citing.",
          location: "Bk1 Ch5",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: Stephen Blackpool falls into the disused Old Hell Shaft — abandoned industrial infrastructure as killer — verify exact wording before citing.",
          location: "Bk3 Ch6",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    atonement: {
      angle:
        "War consumes bodies through military systems, retreat, injury and failed care; St Thomas's ward becomes a second front.",
      quotes: [
        {
          text: "Anchor: the Part Two Dunkirk image of bodily fragmentation and wartime atrocity — verify exact wording before citing.",
          location: "Pt2 (Dunkirk retreat)",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: Briony tends Luc Cornet, the dying French soldier, in the St Thomas's ward — euphemism of care as substitute atonement — verify exact wording before citing.",
          location: "Pt3 (St Thomas's, 1940)",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    ao2: "Industrial sublime imagery (Dickens); fragmented sensory realism (McEwan, Pt2).",
    ao3: "1854 industrial conditions and factory legislation debates; May–June 1940 Dunkirk retreat and London wartime nursing.",
    ao4: "The comparison is not that the factory equals the war; it is that both novels expose systems — industrial capitalism in Dickens, military mobilisation in McEwan — that turn persons into damaged bodies.",
    ao5: "New Historicist readings of both as critiques of state-sanctioned suffering.",
  },
  {
    id: "gender",
    label: "Gender & Power",
    short: "Gender",
    hardTimes: {
      angle:
        "Louisa & Sissy as constrained female intelligences; marriage as economic transaction.",
      quotes: [
        {
          text: "Anchor: Louisa tells her father that life is very short, registering quiet despair before her arranged marriage — verify exact wording before citing.",
          location: "Bk1 Ch15",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: Sissy faces down Harthouse and forces him to leave Coketown — moral authority without social power — verify exact wording before citing.",
          location: "Bk3 Ch2",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    atonement: {
      angle:
        "Cecilia's intellect curtailed by class & gender; Lola's assault silenced by marriage to her attacker.",
      quotes: [
        {
          text: "Anchor: Cecilia at the fountain — female sexual agency exposed and punished by misreading — verify exact wording before citing.",
          location: "Pt1 Ch2",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: Lola marries Paul Marshall, the man who assaulted her, sealing her silence — verify exact wording before citing.",
          location: "Pt3 / Coda",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    ao2: "Symbolic clothing & water imagery; dialogue power dynamics.",
    ao3: "Victorian 'separate spheres'; inter-war shifts in female autonomy.",
    ao4: "Both show female speech criminalised, silenced or commodified.",
    ao5: "For Hard Times, Showalter and Gilbert & Gubar remain productive on the constrained Victorian heroine; for Atonement, trauma-informed and post-1970s feminist readings of Lola's silenced testimony are sharper than nineteenth-century-focused frameworks.",
  },
  {
    id: "justice",
    label: "Justice, Punishment & Atonement",
    short: "Justice",
    hardTimes: {
      angle:
        "Stephen wrongly suspected; Tom escapes formal justice; moral verdict left to narrator.",
      quotes: [
        {
          text: "Anchor: Stephen Blackpool's dying vindication after being pulled from the shaft — verify exact wording before citing.",
          location: "Bk3 Ch6",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: Tom dies abroad; remorse is mediated through Sleary's report rather than dramatised directly — verify exact wording before citing.",
          location: "Bk3 Ch9",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    atonement: {
      angle:
        "Robbie convicted on false testimony; Briony's writing as substitute, inadequate justice.",
      quotes: [
        {
          text: "Anchor: Robbie taken from the Tallis house under arrest — class verdict enacted as legal verdict — verify exact wording before citing.",
          location: "Pt1 Ch14",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: Briony frames atonement as an ethically impossible but necessary attempt — verify exact wording before citing.",
          location: "Coda (London, 1999)",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    ao2: "Courtroom-style narrative judgement (Dickens); deferred & destabilised verdict (McEwan).",
    ao3: "Victorian legal reform debates; 20thC questioning of testimony & truth.",
    ao4: "Both stage miscarriages of justice that the formal system cannot repair.",
    ao5: "Ethical & legal-critical readings; debate over whether art can constitute reparation.",
  },
  {
    id: "authorship",
    label: "Authorship & Narrative Control",
    short: "Authorship",
    hardTimes: {
      angle:
        "Dickens's intrusive narrator organises moral judgement, addressing the reader directly and arbitrating who is condemned and who is forgiven.",
      quotes: [
        {
          text: "Anchor: the narrator's direct address to the reader, organising moral judgement on Coketown — verify exact wording before citing.",
          location: "Bk2 Ch6",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: Sleary's lisping summation of fancy and human need delivered as the novel's moral coda — verify exact wording before citing.",
          location: "Bk3 Ch8",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    atonement: {
      angle:
        "Briony's authorship is both crime and attempted atonement: 'The Trials of Arabella', her witness statement, and the novel-within-the-novel revealed in the coda all expose narrative control as ethically loaded.",
      quotes: [
        {
          text: "Anchor: Briony's juvenile play 'The Trials of Arabella' as mise en abyme of authorial control — verify exact wording before citing.",
          location: "Pt1 Ch1",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: the coda reveals the preceding narrative as Briony's own novel and questions her authority to grant the lovers a happy ending — verify exact wording before citing.",
          location: "Coda (London, 1999)",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    ao2: "Intrusive narration (Dickens); free indirect discourse, mise en abyme and metafiction (McEwan).",
    ao3: "Victorian conventions of the omniscient moral narrator; late twentieth-century self-conscious fiction and the post-war crisis of authorial authority.",
    ao4: "Both writers expose narrative control as ethically powerful, but Dickens uses it to clarify moral judgement whereas McEwan makes it ethically unstable.",
    ao5: "Critical lens — Booth on the implied author; Hutcheon on historiographic metafiction; debates over whether authorial control consoles or implicates.",
  },
  {
    id: "endings",
    label: "Time, Retrospection & Endings",
    short: "Endings",
    hardTimes: {
      angle:
        "Hard Times closes with a projective tableau that rebalances the moral economy: Gradgrind humbled, Sissy vindicated, Louisa denied conventional consolation.",
      quotes: [
        {
          text: "Anchor: the closing tableau projects the futures of the surviving characters as moral judgement — verify exact wording before citing.",
          location: "Bk3 Ch9",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: the narrator addresses the reader in the final paragraphs, asking what their own future will hold — verify exact wording before citing.",
          location: "Bk3 Ch9",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    atonement: {
      angle:
        "Atonement uses retrospective narration and the 1999 coda to destabilise everything that has gone before, making closure itself the ethical question.",
      quotes: [
        {
          text: "Anchor: the coda dated London, 1999 reframes the preceding narrative as Briony's authored reconstruction — verify exact wording before citing.",
          location: "Coda (London, 1999)",
          verified: false,
          quoteType: "anchor",
        },
        {
          text: "Anchor: Briony's reflection that the impossibility of atonement through fiction is precisely the ethical point — verify exact wording before citing.",
          location: "Coda (London, 1999)",
          verified: false,
          quoteType: "anchor",
        },
      ],
    },
    ao2: "Prolepsis and projective closure (Dickens); retrospective narration, coda and structural reversal (McEwan).",
    ao3: "Victorian conventions of providential closure; late twentieth-century scepticism about narrative resolution after 1945.",
    ao4: "Dickens offers conditional moral repair through projected futures; McEwan questions whether narrative repair is possible at all.",
    ao5: "Critical lens — Kermode's The Sense of an Ending on closure as consolation; postmodern readings of the coda as either redemption or indictment.",
  },
];

/* ---------------- Component ---------------- */

export default function Component2ThemeWheelMock() {
  const [selectedId, setSelectedId] = useState<string>(THEMES[0].id);
  const selected = useMemo(
    () => THEMES.find((t) => t.id === selectedId)!,
    [selectedId],
  );

  const size = 520;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 240;
  const rInner = 90;
  const n = THEMES.length;

  const slice = (i: number) => {
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
    const x0o = cx + rOuter * Math.cos(a0);
    const y0o = cy + rOuter * Math.sin(a0);
    const x1o = cx + rOuter * Math.cos(a1);
    const y1o = cy + rOuter * Math.sin(a1);
    const x0i = cx + rInner * Math.cos(a0);
    const y0i = cy + rInner * Math.sin(a0);
    const x1i = cx + rInner * Math.cos(a1);
    const y1i = cy + rInner * Math.sin(a1);
    const d = [
      `M ${x0o} ${y0o}`,
      `A ${rOuter} ${rOuter} 0 0 1 ${x1o} ${y1o}`,
      `L ${x1i} ${y1i}`,
      `A ${rInner} ${rInner} 0 0 0 ${x0i} ${y0i}`,
      "Z",
    ].join(" ");
    const am = (a0 + a1) / 2;
    const rm = (rOuter + rInner) / 2;
    const lx = cx + rm * Math.cos(am);
    const ly = cy + rm * Math.sin(am);
    const rot = (am * 180) / Math.PI;
    return { d, lx, ly, rot };
  };

  return (
    <div className="min-h-screen bg-paper text-ink relative">
      {/* Preview badge */}
      <span className="absolute top-4 right-4 z-50 bg-ink text-paper text-[10px] font-mono uppercase tracking-[0.2em] px-2 py-1 select-none print:hidden">
        Preview — mock data
      </span>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-block { display: block !important; }
          body { background: white; }
        }
        .print-block { display: none; }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 py-8 print:py-0">
        {/* Header */}
        <header className="flex items-start justify-between border-b border-stone-300 pb-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500">
              Pearson Edexcel A-Level · Component 2: Prose (9ET0/02)
            </p>
            <h1 className="font-serif text-3xl mt-1">
              Theme Wheel — Hard Times &amp; Atonement
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Click a segment to load comparative AO notes. Optimised for
              revision and print.
            </p>
            <p className="text-[11px] text-stone-500 mt-2 max-w-2xl">
              Quote anchors are idea locators, not verbatim quotations. Verify
              exact wording in Penguin Hard Times or Vintage Atonement before
              citing in an essay.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print text-xs uppercase tracking-widest border border-stone-400 px-3 py-2 hover:bg-stone-100"
          >
            Print
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-8 no-print">
          {/* Wheel */}
          <div>
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-auto"
              role="img"
              aria-label="Theme wheel"
            >
              {THEMES.map((t, i) => {
                const { d, lx, ly, rot } = slice(i);
                const active = t.id === selectedId;
                return (
                  <g
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className="cursor-pointer"
                  >
                    <path
                      d={d}
                      fill={active ? "#1c1917" : i % 2 ? "#e7e5e4" : "#f5f5f4"}
                      stroke="#a8a29e"
                      strokeWidth={0.75}
                      className="transition-colors"
                    />
                    <text
                      x={lx}
                      y={ly}
                      transform={`rotate(${
                        rot > 90 || rot < -90 ? rot + 180 : rot
                      } ${lx} ${ly})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={11}
                      fontFamily="ui-sans-serif, system-ui"
                      fill={active ? "#fafaf9" : "#1c1917"}
                      style={{ pointerEvents: "none" }}
                    >
                      {t.short}
                    </text>
                  </g>
                );
              })}
              <circle
                cx={cx}
                cy={cy}
                r={rInner - 2}
                fill="#fafaf9"
                stroke="#a8a29e"
              />
              <text
                x={cx}
                y={cy - 8}
                textAnchor="middle"
                fontSize={12}
                fontFamily="ui-serif, Georgia"
                fill="#44403c"
              >
                Component 2
              </text>
              <text
                x={cx}
                y={cy + 10}
                textAnchor="middle"
                fontSize={11}
                fill="#78716c"
              >
                Prose · Comparative
              </text>
              <text
                x={cx}
                y={cy + 28}
                textAnchor="middle"
                fontSize={10}
                fill="#a8a29e"
              >
                AO1–AO5
              </text>
            </svg>
            <div className="mt-3 grid grid-cols-2 gap-1 text-[11px] text-stone-600">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`text-left px-2 py-1 border ${
                    t.id === selectedId
                      ? "border-stone-900 bg-stone-900 text-stone-50"
                      : "border-stone-300 hover:bg-stone-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <article className="bg-white border border-stone-300 p-6 shadow-sm">
            <ThemeDetail theme={selected} />
          </article>
        </div>

        {/* Printable section: all themes */}
        <section className="print-block mt-8">
          <h2 className="font-serif text-2xl border-b border-stone-400 pb-2 mb-4">
            Revision Summary — All Themes
          </h2>
          <p className="text-[11px] text-stone-600 mb-4">
            Quote anchors are idea locators. Verify exact wording before citing.
          </p>
          <div className="space-y-6">
            {THEMES.map((t) => (
              <div key={t.id} className="break-inside-avoid">
                <ThemeDetail theme={t} compact />
                <hr className="my-4 border-stone-300" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ThemeDetail({ theme, compact = false }: { theme: Theme; compact?: boolean }) {
  return (
    <div>
      <header className="mb-4">
        <p className="text-[11px] uppercase tracking-widest text-stone-500">
          Theme cluster
        </p>
        <h2 className={`font-serif ${compact ? "text-xl" : "text-2xl"} mt-1`}>
          {theme.label}
        </h2>
      </header>

      <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2"} gap-4`}>
        <TextCard
          title="Hard Times — Dickens (1854)"
          angle={theme.hardTimes.angle}
          quotes={theme.hardTimes.quotes}
        />
        <TextCard
          title="Atonement — McEwan (2001)"
          angle={theme.atonement.angle}
          quotes={theme.atonement.quotes}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <AO label="AO2 · Methods" body={theme.ao2} />
        <AO label="AO3 · Context" body={theme.ao3} />
        <AO label="AO4 · Comparison route" body={theme.ao4} highlight />
        <AO label="AO5 · Debate" body={theme.ao5} />
      </div>
    </div>
  );
}

function TextCard({
  title,
  angle,
  quotes,
}: {
  title: string;
  angle: string;
  quotes: QuoteEntry[];
}) {
  return (
    <div className="border border-stone-300 p-3 bg-stone-50">
      <p className="text-[11px] uppercase tracking-widest text-stone-500">
        {title}
      </p>
      <p className="text-sm mt-1 leading-snug">{angle}</p>
      <ul className="mt-2 space-y-2">
        {quotes.map((q, i) => {
          const isVerbatim = q.quoteType === "verbatim" && q.verified;
          return (
            <li
              key={i}
              className={`text-[12px] pl-2 border-l-2 ${
                isVerbatim
                  ? "border-stone-700 text-stone-800"
                  : "border-amber-500 border-dashed text-stone-700"
              }`}
            >
              <p
                className={`text-[9px] uppercase tracking-widest mb-0.5 ${
                  isVerbatim ? "text-stone-500" : "text-amber-700"
                }`}
              >
                {isVerbatim
                  ? "Verified quotation"
                  : "Quote anchor / paraphrase"}
              </p>
              {isVerbatim ? (
                <p className="italic">
                  "{q.text}"{" "}
                  <span className="not-italic text-stone-500">
                    ({q.location})
                  </span>
                </p>
              ) : (
                <p>
                  {q.text}{" "}
                  <span className="text-stone-500">({q.location})</span>
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AO({
  label,
  body,
  highlight,
}: {
  label: string;
  body: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border p-3 ${
        highlight
          ? "border-stone-900 bg-stone-900 text-stone-50"
          : "border-stone-300 bg-white"
      }`}
    >
      <p
        className={`text-[10px] uppercase tracking-widest ${
          highlight ? "text-stone-300" : "text-stone-500"
        }`}
      >
        {label}
      </p>
      <p className="text-sm mt-1 leading-snug">{body}</p>
    </div>
  );
}
