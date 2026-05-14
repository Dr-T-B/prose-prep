import { useMemo, useState } from "react";

type Quote = {
  id: string;
  text: "Hard Times" | "Atonement";
  quote: string;
  speaker: string;
  location: string;
  theme: string;
  character: string;
  method: string;
  ao: ("AO1" | "AO2" | "AO3" | "AO4" | "AO5")[];
  examUse: string[];
  wordAnalysis: string;
  effect: string;
  context: string;
  comparativeLink: string;
  comparativeAnchor?: string;
  insight: string;
  paragraphFunction: string;
  verified: boolean;
  quoteType: "verbatim" | "anchor";
};

const QUOTES: Quote[] = [
  {
    id: "ht-1",
    text: "Hard Times",
    quote: "Now, what I want is, Facts. Teach these boys and girls nothing but Facts.",
    speaker: "Thomas Gradgrind",
    location: "Book I, Ch. 1 — opening",
    theme: "Education and utilitarianism",
    character: "Gradgrind",
    method: "Anaphora / capitalised abstract noun ('Facts')",
    ao: ["AO1", "AO2"],
    examUse: ["Opening paragraph", "Thesis evidence"],
    wordAnalysis: "Capitalising the single word 'Facts' reifies an abstraction into a creed; the imperative 'Teach' is monologic.",
    effect: "Constructs Gradgrind as doctrinaire; reduces children to vessels.",
    context: "1854 industrial Coketown; utilitarian pedagogy (Bentham, the M'Choakumchild model).",
    comparativeLink: "Mirrors the controlling rationality Briony imposes through her authorial god-position in Atonement.",
    comparativeAnchor: "at-1",
    insight: "A* readers note Dickens performs the very didacticism he critiques — narrator and Gradgrind share a register.",
    paragraphFunction: "Topic sentence anchor for AO2 on doctrinal language.",
    verified: true,
    quoteType: "verbatim",
  },
  {
    id: "ht-2",
    text: "Hard Times",
    quote: "It was a town of red brick, or of brick that would have been red if the smoke and ashes had allowed it.",
    speaker: "Narrator",
    location: "Book I, Ch. 5 — Coketown",
    theme: "War and industrial systems",
    character: "Coketown (setting)",
    method: "Counterfactual conditional / qualifying clause",
    ao: ["AO2", "AO3"],
    examUse: ["Setting paragraph", "Context bridge"],
    wordAnalysis: "The counterfactual 'would have been' suspends the word 'red' — industry has erased the natural state before it can be named.",
    effect: "Coketown is rendered as palimpsest; industrial violence is environmental, not episodic.",
    context: "Manchester 1840s; Engels's Condition of the Working Class (1845).",
    comparativeLink: "Compare McEwan's Dunkirk: bureaucratic chaos as another systemic violence on bodies.",
    comparativeAnchor: "at-5",
    insight: "A* candidates argue Dickens's grammar enacts erasure — the sentence withdraws the colour it offers.",
    paragraphFunction: "Bridge from method to AO3 industrial context.",
    verified: true,
    quoteType: "verbatim",
  },
  {
    id: "ht-3",
    text: "Hard Times",
    quote: "'Tis aw a muddle! Fro' first to last, a muddle!",
    speaker: "Stephen Blackpool",
    location: "Book II, Ch. 5/6 — industrial relations chapters",
    theme: "Class and power",
    character: "Stephen Blackpool",
    method: "Eye-dialect / epizeuxis ('muddle')",
    ao: ["AO2", "AO5"],
    examUse: ["Working-class voice paragraph", "AO5 critical reading"],
    wordAnalysis: "Eye-dialect 'aw' and 'Fro'' marks Stephen as outside standard discourse; the epizeuxis on 'muddle' refuses analytic clarity.",
    effect: "His incomprehension is structural — he cannot name the system that crushes him.",
    context: "The Preston strike of 1853–54, observed by Dickens shortly before composition; not Chartism.",
    comparativeLink: "Robbie's wrongful arrest in Atonement is a parallel inarticulable class injustice — neither character is granted the language of his own oppression.",
    comparativeAnchor: "at-3",
    insight: "Marxist readings (AO5): Stephen is denied the diagnostic language of his own oppression; sentimental critics see saintly martyrdom.",
    paragraphFunction: "Counterweight to Bounderby — class as silencing.",
    verified: true,
    quoteType: "verbatim",
  },
  {
    id: "ht-4",
    text: "Hard Times",
    quote: "No little Gradgrind had ever seen a face in the moon...",
    speaker: "Narrator (of the Gradgrind children)",
    location: "Book I, Ch. 3",
    theme: "Childhood and moral formation",
    character: "Louisa & the Gradgrind children",
    method: "Negation / catalogue of imaginative absence",
    ao: ["AO2", "AO4"],
    examUse: ["Childhood paragraph", "Comparative pivot"],
    wordAnalysis: "The diminutive 'little' rubs against the surname 'Gradgrind' — the system has already named the child as its product.",
    effect: "Imaginative deprivation is figured as inherited; the system has subtracted, not formed.",
    context: "Victorian girlhood and the monitorial classroom; Newcastle Commission concerns about rote learning.",
    comparativeLink: "Briony at thirteen has too much imaginative agency; the little Gradgrinds have none — opposite failures of formation.",
    comparativeAnchor: "at-1",
    insight: "A* point: Dickens uses negation to dramatise psychological withdrawal — the absent moon-face stands in for the absent inner life.",
    paragraphFunction: "Pivot into AO4 comparison on childhood.",
    verified: false,
    quoteType: "anchor",
  },
  {
    id: "ht-5",
    text: "Hard Times",
    quote: "Coketown lay shrouded in a haze of its own.",
    speaker: "Narrator",
    location: "Book II, Ch. 1",
    theme: "Imagination vs rationality",
    character: "Coketown",
    method: "Personification / pathetic fallacy",
    ao: ["AO2", "AO3"],
    examUse: ["Atmosphere paragraph"],
    wordAnalysis: "'Shrouded' carries funereal weight; 'its own' makes the haze self-generated, complicit.",
    effect: "The town breathes its own death; industrial logic is autotoxic.",
    context: "Smog as Victorian industrial signifier; 1848 Public Health Act.",
    comparativeLink: "Compare McEwan's Bray Dunes atmospherics — both texts use atmospheric obscurity to figure systemic blindness.",
    comparativeAnchor: "at-5",
    insight: "A* readers connect the haze to Gradgrind's epistemological fog — fact-worship blinds.",
    paragraphFunction: "Setting → method → theme transition.",
    verified: false,
    quoteType: "anchor",
  },
  {
    id: "at-1",
    text: "Atonement",
    quote: "She was one of those children possessed by a desire to have the world just so.",
    speaker: "Free indirect (Briony)",
    location: "Part One, Ch. 1",
    theme: "Imagination vs rationality",
    character: "Briony Tallis",
    method: "Free indirect discourse / passive construction ('possessed')",
    ao: ["AO2", "AO5"],
    examUse: ["Opening character paragraph", "AO5 narrative ethics"],
    wordAnalysis: "The single word 'possessed' is ambivalent — gifted or haunted; 'just so' fuses aesthetic order with moral control.",
    effect: "Briony's authorial impulse is pathologised before it harms.",
    context: "1935 country-house England; modernist/interwar narrative inheritance (Woolf, Forster, Bowen).",
    comparativeLink: "Gradgrind also wants the world 'just so' — both impose schemas on living material.",
    comparativeAnchor: "ht-1",
    insight: "A* point: McEwan plants the novel's metafictional thesis in its first character description.",
    paragraphFunction: "Thesis quotation for narrative-authority argument.",
    verified: true,
    quoteType: "verbatim",
  },
  {
    id: "at-2",
    text: "Atonement",
    quote: "The cost of oblivious daydreaming was always this moment of return, the realignment with what had been before.",
    speaker: "Free indirect (Briony)",
    location: "Part One, Ch. 3",
    theme: "Memory and narrative reconstruction",
    character: "Briony Tallis",
    method: "Nominalisation / financial register ('cost', 'realignment')",
    ao: ["AO2", "AO5"],
    examUse: ["Memory paragraph"],
    wordAnalysis: "The nominalised 'realignment' is clinical and distancing; the word 'cost' financialises consciousness.",
    effect: "Imagination is framed as transactional debt — foreshadowing the lifelong reparation of writing.",
    context: "Post-war retrospective fiction and the modernist inheritance of the unreliable interior (Woolf, Bowen); narrative memory as belated reconstruction.",
    comparativeLink: "Louisa's lost girlhood is also a 'cost' the narrative tallies retrospectively.",
    insight: "A* / critical lens: trauma theory (associated with Caruth and LaCapra) frames memory as belated, fractured and ethically unstable — useful AO5 framing for the word 'realignment', which anticipates the novel's recursive structure as Briony keeps re-aligning.",
    paragraphFunction: "Bridge from method to AO5 metafictional reading.",
    verified: true,
    quoteType: "verbatim",
  },
  {
    id: "at-3",
    text: "Atonement",
    quote: "Briony's testimony scene — her insistence that she has seen what she has only inferred (Briony's testimony anchor; verify exact wording before citing).",
    speaker: "Briony (testimony)",
    location: "Part One, Ch. 13",
    theme: "Justice, punishment and atonement",
    character: "Briony Tallis",
    method: "Asyndetic parataxis / repetition of 'I saw'",
    ao: ["AO2", "AO5"],
    examUse: ["Pivotal evidence", "AO5 truth/perception"],
    wordAnalysis: "Clipped clauses in the scene perform certainty; the repeated verb 'saw' fetishises witness over fact.",
    effect: "Syntax mimics testimony's force while exposing its hollowness.",
    context: "Class- and gender-inflected credibility in 1935 — Briony's social position underwrites her word; Robbie's does not.",
    comparativeLink: "Bounderby's self-mythologising in Hard Times — both characters speak themselves into authority.",
    comparativeAnchor: "ht-3",
    insight: "A*: McEwan stages perjury as performative grammar, not lie — language constitutes the wrong.",
    paragraphFunction: "Climax evidence for guilt/responsibility paragraph.",
    verified: false,
    quoteType: "anchor",
  },
  {
    id: "at-4",
    text: "Atonement",
    quote: "How can a novelist achieve atonement when, with her absolute power of deciding outcomes, she is also God?",
    speaker: "Briony (London, 1999)",
    location: "Part Four — coda",
    theme: "Justice, punishment and atonement",
    character: "Briony Tallis",
    method: "Rhetorical question / theological metaphor",
    ao: ["AO2", "AO5"],
    examUse: ["Conclusion quotation", "AO5 thesis evidence"],
    wordAnalysis: "'Absolute power' is doubly ironic — fictional omnipotence cannot redeem real harm.",
    effect: "Atonement is exposed as structurally impossible within the form attempting it.",
    context: "Postmodern metafiction; theological residues in secular form (Eagleton).",
    comparativeLink: "Gradgrind's late repentance is similarly partial — both texts question whether realisation undoes harm, and both expose authority over moral systems as fragile.",
    comparativeAnchor: "ht-1",
    insight: "A*: the question is unanswerable by design — the novel's form IS its argument about atonement.",
    paragraphFunction: "Conclusion paragraph anchor.",
    verified: true,
    quoteType: "verbatim",
  },
  {
    id: "at-5",
    text: "Atonement",
    quote: "The leg in the tree — Robbie encounters a child's severed leg lodged in a tree on the road to Bray Dunes (Part Two atrocity image; verify exact wording before citing).",
    speaker: "Free indirect (Robbie)",
    location: "Part Two — road to Bray Dunes",
    theme: "War and industrial systems",
    character: "Robbie Turner",
    method: "Synecdoche / fragmentary image / understatement",
    ao: ["AO2", "AO3"],
    examUse: ["War paragraph", "Context bridge"],
    wordAnalysis: "The isolated body part — 'leg' — substitutes for the whole child; quiet noun-phrase syntax displaces moral commentary onto the reader.",
    effect: "Calm syntax contradicts atrocity; reader supplies the horror.",
    context: "Dunkirk withdrawal, May–June 1940; McEwan's acknowledged debt to Lucilla Andrews (No Time for Romance) and the bleak registers of Keith Douglas and Henry Reed rather than Owen/Sassoon.",
    comparativeLink: "Compare Coketown's 'haze' and 'shrouded' diction — both authors use restrained imagery to register systemic violence.",
    comparativeAnchor: "ht-5",
    insight: "A*: McEwan's restraint here is itself a method — synecdoche as ethical refusal of spectacle.",
    paragraphFunction: "Method paragraph on understatement.",
    verified: false,
    quoteType: "anchor",
  },
  // ----- Six additional anchors -----
  {
    id: "ht-6",
    text: "Hard Times",
    quote: "Girl number twenty",
    speaker: "M'Choakumchild / Gradgrind (of Sissy Jupe)",
    location: "Book I, Ch. 2",
    theme: "Education and utilitarianism",
    character: "Sissy Jupe",
    method: "Numerical depersonification / institutional address",
    ao: ["AO2", "AO3"],
    examUse: ["Education paragraph"],
    wordAnalysis: "'Number' substitutes a numeral for a name; 'girl' is a category, not a person.",
    effect: "Bureaucratic naming enacts the very dehumanisation Gradgrind preaches.",
    context: "Monitorial classroom; Newcastle Commission anxieties about rote schooling.",
    comparativeLink: "Briony's catalogue-mind — naming and numbering as authorial control.",
    comparativeAnchor: "at-1",
    insight: "A*: a two-word phrase carries the novel's whole pedagogical critique.",
    paragraphFunction: "Short anchor for AO2 micro-analysis.",
    verified: true,
    quoteType: "verbatim",
  },
  {
    id: "ht-7",
    text: "Hard Times",
    quote: "little pitchers",
    speaker: "Narrator (of the schoolroom children)",
    location: "Book I, Ch. 2",
    theme: "Childhood and moral formation",
    character: "Schoolroom children",
    method: "Metaphor / diminutive",
    ao: ["AO2", "AO5"],
    examUse: ["Childhood paragraph"],
    wordAnalysis: "'Pitchers' figures children as empty vessels to be filled with fact; 'little' infantilises and objectifies in the same breath.",
    effect: "Education is reframed as decanting — pedagogy as pouring.",
    context: "Mid-Victorian debates on rote learning vs imaginative formation.",
    comparativeLink: "Briony as over-full pitcher; the Gradgrind children as empty ones.",
    comparativeAnchor: "at-1",
    insight: "A*: the metaphor exposes utilitarian pedagogy's category error — minds are not containers.",
    paragraphFunction: "Micro-anchor for childhood paragraph.",
    verified: true,
    quoteType: "verbatim",
  },
  {
    id: "ht-8",
    text: "Hard Times",
    quote: "interminable serpents of smoke",
    speaker: "Narrator",
    location: "Book I, Ch. 5 — Coketown",
    theme: "War and industrial systems",
    character: "Coketown",
    method: "Zoomorphic metaphor / biblical allusion",
    ao: ["AO2", "AO3"],
    examUse: ["Setting paragraph"],
    wordAnalysis: "The single noun 'serpents' loads industrial smoke with Edenic guilt; 'interminable' refuses temporal escape.",
    effect: "Industry is figured as fallen, endless, and sentient.",
    context: "Mid-century environmental degradation in Lancashire mill towns.",
    comparativeLink: "Bray Dunes smoke and chaos in Atonement Part Two.",
    comparativeAnchor: "at-5",
    insight: "A*: the biblical register quietly moralises industrial ecology.",
    paragraphFunction: "Method anchor for Coketown atmospherics.",
    verified: true,
    quoteType: "verbatim",
  },
  {
    id: "ht-9",
    text: "Hard Times",
    quote: "the piston of the steam-engine worked monotonously up and down, like the head of an elephant in a state of melancholy madness.",
    speaker: "Narrator",
    location: "Book I, Ch. 5 — Coketown",
    theme: "War and industrial systems",
    character: "Coketown",
    method: "Extended simile / personification",
    ao: ["AO2", "AO5"],
    examUse: ["Setting paragraph"],
    wordAnalysis: "'Monotonously' enacts the rhythm it describes; 'melancholy madness' grants the machine an inner life it should not have.",
    effect: "Mechanisation is figured as pathologised, sentient, trapped.",
    context: "Cotton mill mechanisation; mid-Victorian anxiety about the moral status of machines.",
    comparativeLink: "Robbie's road to Dunkirk — bodies reduced to mechanical movement.",
    comparativeAnchor: "at-5",
    insight: "A*: Dickens imports madness into the machine to extract it from the worker.",
    paragraphFunction: "Extended-quotation anchor for industrial reading.",
    verified: true,
    quoteType: "verbatim",
  },
  {
    id: "ht-10",
    text: "Hard Times",
    quote: "What do I know, father, of tastes and fancies; of aspirations and affections; of all that part of my nature in which such light things might have been nourished?",
    speaker: "Louisa Gradgrind (to her father)",
    location: "Book II, Ch. 12",
    theme: "Childhood and moral formation",
    character: "Louisa Gradgrind",
    method: "Rhetorical question / triadic catalogue",
    ao: ["AO2", "AO4"],
    examUse: ["Character paragraph", "Comparative pivot"],
    wordAnalysis: "The triad 'tastes... aspirations... affections' inventories what was withheld; the conditional 'might have been' marks the loss as structural.",
    effect: "Louisa diagnoses her own deformation in her father's vocabulary — she can only audit the void.",
    context: "Mid-Victorian interest in the moral consequences of pedagogy.",
    comparativeLink: "Briony in 1999 also auditing what her younger self could not feel.",
    comparativeAnchor: "at-4",
    insight: "A*: Louisa's confrontation indicts utilitarian pedagogy in its own register — the system is rebuked by its product.",
    paragraphFunction: "Climax evidence for childhood/formation paragraph.",
    verified: false,
    quoteType: "anchor",
  },
  {
    id: "ht-11",
    text: "Hard Times",
    quote: "People mutht be amuthed.",
    speaker: "Mr Sleary",
    location: "Book III, Ch. 8 — close",
    theme: "Imagination vs rationality",
    character: "Mr Sleary",
    method: "Eye-dialect (lisp) / sententious closure",
    ao: ["AO2", "AO5"],
    examUse: ["Conclusion quotation"],
    wordAnalysis: "The lisped sibilants ('mutht', 'amuthed') refuse Gradgrindian propriety; the modal 'must' delivers a counter-creed.",
    effect: "The novel's moral is given to its least 'rational' speaker — form rebukes Gradgrind.",
    context: "Victorian debate over leisure, popular entertainment, and the circus as moral space.",
    comparativeLink: "McEwan's coda likewise lets the 'unreliable' figure speak the thesis.",
    comparativeAnchor: "at-4",
    insight: "A*: the sentence's broken phonetics enact what it argues — pleasure exceeds standard form.",
    paragraphFunction: "Conclusion anchor.",
    verified: true,
    quoteType: "verbatim",
  },
  // ----- Six additional Atonement anchors -----
  {
    id: "at-6",
    text: "Atonement",
    quote: "The Trials of Arabella — Briony's homemade play, written, cast and directed by her for her brother Leon's homecoming (Part One opening anchor; verify exact wording before citing).",
    speaker: "Free indirect (Briony) / narrator",
    location: "Part One, Ch. 1",
    theme: "Imagination vs rationality",
    character: "Briony Tallis",
    method: "Mise en abyme / juvenile pastiche / paratext (title as artefact)",
    ao: ["AO2", "AO5"],
    examUse: ["Opening character paragraph", "Metafiction paragraph"],
    wordAnalysis: "The mock-archaic title 'Trials' doubles as judicial test and dramatic ordeal; Arabella's tidy moral arc previews Briony's lifelong wish to script consequence.",
    effect: "Childhood authorship is staged as control — order imposed on unruly material before any harm is done.",
    context: "1935 country-house leisure; inherited Edwardian theatricals and the moralising children's-story tradition.",
    comparativeLink: "Mirrors Gradgrind's pedagogic ordering — both impose schemas on living material; Briony scripts her family as Gradgrind drills his pupils.",
    comparativeAnchor: "ht-1",
    insight: "A*: the play is the novel in miniature — Briony is already rehearsing the authorial god-position the coda will indict.",
    paragraphFunction: "Opening anchor for authorship/control argument.",
    verified: false,
    quoteType: "anchor",
  },
  {
    id: "at-7",
    text: "Atonement",
    quote: "Robbie's misdelivered letter to Cecilia — the obscene draft sent in error in place of the formal apology (Part One letter-scene anchor; explicit wording withheld; verify before citing).",
    speaker: "Free indirect (Robbie / Briony as reader)",
    location: "Part One, Ch. 8–10",
    theme: "Justice, punishment and atonement",
    character: "Robbie Turner / Briony Tallis",
    method: "Material textuality / dramatic irony / register clash (formal vs obscene)",
    ao: ["AO2", "AO3", "AO5"],
    examUse: ["Pivotal evidence", "Class/repression paragraph"],
    wordAnalysis: "The letter as physical object carries the plot; the collision of registers — Cambridge formality against a single transgressive lexeme — is what Briony reads as evidence.",
    effect: "Writing becomes weaponised by its own materiality; a private slip is publicly criminalised through a child's misreading.",
    context: "1935 class codes around sexuality, servants and Cambridge-educated sons of charladies; pre-war propriety policing female adolescence.",
    comparativeLink: "Stephen Blackpool is similarly criminalised by a discourse he cannot control; both men are convicted by registers belonging to others.",
    comparativeAnchor: "ht-3",
    insight: "A*: McEwan makes the novel's catastrophe turn on a textual artefact — the form indicts the act of reading itself.",
    paragraphFunction: "Pivot evidence for misreading / class paragraph.",
    verified: false,
    quoteType: "anchor",
  },
  {
    id: "at-8",
    text: "Atonement",
    quote: "Briony's library scene — she enters, sees Cecilia and Robbie in the half-dark, and reads the encounter as assault (Part One library anchor; verify exact wording before citing).",
    speaker: "Free indirect (Briony)",
    location: "Part One, Ch. 10",
    theme: "Memory and narrative reconstruction",
    character: "Briony Tallis",
    method: "Theatrical staging / focalisation / chiaroscuro framing",
    ao: ["AO2", "AO5"],
    examUse: ["Perception paragraph", "AO5 narrative ethics"],
    wordAnalysis: "The library is staged as proscenium — doorway, low light, two figures — so that Briony reads bodies as tableau; perception is pre-scripted by the genres she already writes in.",
    effect: "Misinterpretation is shown as aesthetic before it becomes moral; Briony sees melodrama, not adults.",
    context: "Inter-war anxieties about female adolescent imagination; the gothic-melodramatic grammar of the children's library.",
    comparativeLink: "Gradgrind cannot read Louisa's interior because his system has no genre for it; Briony over-reads because hers has too many.",
    comparativeAnchor: "ht-10",
    insight: "A*: the misreading is generic, not perceptual — Briony has the wrong literary frame, not bad eyes.",
    paragraphFunction: "Anchor for perception / misreading argument.",
    verified: false,
    quoteType: "anchor",
  },
  {
    id: "at-9",
    text: "Atonement",
    quote: "Luc Cornet at St Thomas's — the dying French soldier whom Briony, as student nurse, attends and to whom she gives a name and a promise she cannot keep (Part Three anchor; verify exact wording before citing).",
    speaker: "Free indirect (Briony) / Luc Cornet",
    location: "Part Three — St Thomas's Hospital, wartime London",
    theme: "Justice, punishment and atonement",
    character: "Briony Tallis / Luc Cornet",
    method: "Bilingual dialogue / substitution / euphemism of care",
    ao: ["AO2", "AO5"],
    examUse: ["Atonement paragraph", "Care/guilt paragraph"],
    wordAnalysis: "The proper name 'Luc' is offered as the only thing Briony can give; clinical noun-phrases of nursing displace the impossibility of consolation.",
    effect: "Nursing labour is staged as substitute atonement — care directed at the wrong recipient because the right one (Robbie) is unreachable.",
    context: "Wartime nurse training at St Thomas's; McEwan's acknowledged debt to Lucilla Andrews's No Time for Romance for procedural detail.",
    comparativeLink: "Stephen Blackpool's death-bed clarity is similarly a moral scene where language fails the system that produced the suffering; both novels stage care as inadequate reparation.",
    comparativeAnchor: "ht-3",
    insight: "A*: the scene rehearses the coda's question — atonement is offered to a substitute because the real addressee has been foreclosed.",
    paragraphFunction: "Anchor for substitute-atonement argument.",
    verified: false,
    quoteType: "anchor",
  },
  {
    id: "at-10",
    text: "Atonement",
    quote: "Anchor: Briony's final reflection in the 1999 coda that atonement through fiction is an impossible task, and that this impossibility is precisely the ethical point — verify exact wording before citing.",
    speaker: "Briony (London, 1999)",
    location: "Part Four — coda, London 1999",
    theme: "Justice, punishment and atonement",
    character: "Briony Tallis",
    method: "Aphoristic closure / metafictional self-commentary",
    ao: ["AO2", "AO4", "AO5"],
    examUse: ["Conclusion quotation", "AO5 thesis evidence", "Comparative pivot"],
    wordAnalysis: "The locator turns on a universalising adverb ('always') paired with an analytic intensifier ('precisely') — atonement is redefined as a structural condition, not an event.",
    effect: "Atonement is redefined as the ethical effort of an impossible form, not its accomplishment.",
    context: "Late-1990s metafiction; secularised theology of authorship in postmodern fiction (cf. Eagleton).",
    comparativeLink: "Pairs cross-text with Sleary's 'People mutht be amuthed' — both novels close by handing the moral to a marginal voice that the dominant rational system cannot accommodate; pairs intra-textually with Briony's earlier 'God' question, framing authorship as Gradgrind's late repentance frames pedagogy.",
    comparativeAnchor: "ht-11",
    insight: "A*: the sentence is the novel's thesis in miniature — impossibility is not a failure of atonement but its definition.",
    paragraphFunction: "Conclusion paragraph anchor.",
    verified: false,
    quoteType: "anchor",
  },
  {
    id: "at-11",
    text: "Atonement",
    quote: "The cottage at Bray Dunes — Robbie finds the bodies of two children, the twins, killed by bombing on the road north (Part Two atrocity anchor; verify exact wording before citing).",
    speaker: "Free indirect (Robbie)",
    location: "Part Two — retreat to Dunkirk",
    theme: "War and industrial systems",
    character: "Robbie Turner",
    method: "Synecdoche / paratactic listing / restrained focalisation",
    ao: ["AO2", "AO3"],
    examUse: ["War paragraph", "Witness paragraph"],
    wordAnalysis: "Short noun-phrases catalogue the scene without subordination; the children are named only by relation ('twins'), refusing biographical consolation.",
    effect: "Witness is staged as helpless inventory — the soldier's only act is to look and move on.",
    context: "May–June 1940 retreat to Dunkirk; civilian casualties on the northern French roads; McEwan's procedural debts to Lucilla Andrews and the cool registers of Keith Douglas and Henry Reed.",
    comparativeLink: "Coketown's bodies in 'haze' and the 'serpents of smoke' figure systemic violence in restrained imagery; both texts use understatement to register what their characters cannot name.",
    comparativeAnchor: "ht-9",
    insight: "A*: McEwan refuses elegy — the parataxis is the ethics; pathos would falsify the witness.",
    paragraphFunction: "Anchor for war / witness paragraph.",
    verified: false,
    quoteType: "anchor",
  },
];

type Filters = {
  text: string;
  theme: string;
  character: string;
  method: string;
  ao: string;
  examUse: string;
  q: string;
};

const ALL = "All";

function unique(values: string[]) {
  return [ALL, ...Array.from(new Set(values)).sort()];
}

export default function Component2QuoteMethodBankMock() {
  const [filters, setFilters] = useState<Filters>({
    text: ALL, theme: ALL, character: ALL, method: ALL, ao: ALL, examUse: ALL, q: "",
  });

  const opts = useMemo(() => ({
    text: [ALL, "Hard Times", "Atonement"],
    theme: unique(QUOTES.map((q) => q.theme)),
    character: unique(QUOTES.map((q) => q.character)),
    method: unique(QUOTES.map((q) => q.method)),
    ao: [ALL, "AO1", "AO2", "AO3", "AO4", "AO5"],
    examUse: unique(QUOTES.flatMap((q) => q.examUse)),
  }), []);

  const filtered = useMemo(() => QUOTES.filter((q) => {
    if (filters.text !== ALL && q.text !== filters.text) return false;
    if (filters.theme !== ALL && q.theme !== filters.theme) return false;
    if (filters.character !== ALL && q.character !== filters.character) return false;
    if (filters.method !== ALL && q.method !== filters.method) return false;
    if (filters.ao !== ALL && !q.ao.includes(filters.ao as Quote["ao"][number])) return false;
    if (filters.examUse !== ALL && !q.examUse.includes(filters.examUse)) return false;
    if (filters.q.trim()) {
      const needle = filters.q.toLowerCase();
      const hay = `${q.quote} ${q.speaker} ${q.wordAnalysis} ${q.effect} ${q.insight}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  }), [filters]);

  const reset = () => setFilters({ text: ALL, theme: ALL, character: ALL, method: ALL, ao: ALL, examUse: ALL, q: "" });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 print:px-0 print:py-0">
      <header className="mb-6 border-b border-border pb-4 print:mb-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Component 2 · Prose · Sandbox</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-foreground">Quote &amp; Method Bank</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Retrieval interface for <em>Hard Times</em> and <em>Atonement</em>. Each card follows the formula
          <strong className="mx-1 text-foreground">Method → Word → Effect → Theme</strong>
          for fast paragraph construction.
        </p>
        <p className="mt-2 max-w-3xl text-xs text-muted-foreground">
          Cards are tagged either <strong className="text-foreground">Verified quotation</strong> (verbatim, exact wording checked)
          or <strong className="text-foreground">Quote anchor / paraphrase</strong> (a locator for an idea — verify exact wording in
          the Penguin Classics <em>Hard Times</em> or Vintage <em>Atonement</em> before citing in an exam).
        </p>
      </header>

      <section className="mb-6 grid gap-3 rounded-lg border border-border bg-muted/30 p-4 print:hidden md:grid-cols-4">
        {([
          ["text", "Text"], ["theme", "Theme"], ["character", "Character"],
          ["method", "Method"], ["ao", "AO"], ["examUse", "Exam use"],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex flex-col gap-1 text-xs">
            <span className="font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
            <select
              value={filters[key]}
              onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            >
              {opts[key].map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        ))}
        <label className="flex flex-col gap-1 text-xs md:col-span-3">
          <span className="font-medium uppercase tracking-wide text-muted-foreground">Search quote / analysis</span>
          <input
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="e.g. shroud, muddle, oblivious"
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
          />
        </label>
        <div className="flex items-end gap-2">
          <button onClick={reset} className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted">Reset</button>
          <button onClick={() => window.print()} className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background hover:opacity-90">Print</button>
        </div>
      </section>

      <p className="mb-3 text-xs text-muted-foreground print:mb-2">
        Showing <strong className="text-foreground">{filtered.length}</strong> of {QUOTES.length} quotes.
      </p>

      <div className="grid gap-4 md:grid-cols-2 print:grid-cols-1 print:gap-2">
        {filtered.map((q) => {
          const isVerbatim = q.quoteType === "verbatim" && q.verified;
          return (
            <article
              key={q.id}
              className={
                "break-inside-avoid rounded-lg border bg-background p-4 shadow-sm print:shadow-none " +
                (isVerbatim ? "border-border" : "border-dashed border-amber-500/60")
              }
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider">
                <span className="rounded bg-foreground px-1.5 py-0.5 text-background">{q.text}</span>
                <span className="rounded border border-border px-1.5 py-0.5 text-muted-foreground">{q.theme}</span>
                {q.ao.map((a) => (
                  <span key={a} className="rounded bg-muted px-1.5 py-0.5 text-foreground">{a}</span>
                ))}
                <span
                  className={
                    "rounded px-1.5 py-0.5 " +
                    (isVerbatim
                      ? "bg-emerald-600 text-background"
                      : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40")
                  }
                  title={isVerbatim ? "Exact wording checked" : "Locator for an idea — verify exact wording before citing"}
                >
                  {isVerbatim ? "Verified quotation" : "Quote anchor / paraphrase"}
                </span>
              </div>

              <blockquote
                className={
                  "border-l-2 pl-3 font-serif text-base italic leading-snug text-foreground " +
                  (isVerbatim ? "border-foreground/40" : "border-amber-500/60")
                }
              >
                {isVerbatim ? `"${q.quote}"` : q.quote}
              </blockquote>
              <p className="mt-1 text-xs text-muted-foreground">
                {q.speaker} · {q.location}
              </p>

              <dl className="mt-3 grid grid-cols-1 gap-2 text-sm">
                <Row label="Method (AO2)" value={q.method} />
                <Row label="Word-level" value={q.wordAnalysis} />
                <Row label="Effect" value={q.effect} />
                <Row label="Theme link" value={q.theme} />
                <Row label="Context (AO3)" value={q.context} />
                <Row label="Comparative (AO4)" value={q.comparativeLink} />
                {q.comparativeAnchor && (
                  <Row label="Paired anchor" value={q.comparativeAnchor} />
                )}
                <Row label="A/A* insight (AO5)" value={q.insight} />
                <Row label="Paragraph function" value={q.paragraphFunction} />
                <Row label="Exam use" value={q.examUse.join(" · ")} />
              </dl>
            </article>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No quotes match these filters. Try resetting.
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-2">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}
