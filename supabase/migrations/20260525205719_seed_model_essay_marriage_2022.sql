-- Stage 0.8: Seed first verified A* model essay on the 2022 Childhood Q1
-- (marriage) past paper. Pairs with Stage 0.7's year=2022 backfill on the
-- same question_id.
--
-- Fixes vs. the original prompt SQL:
--   * strengths / risks / upgrade_targets are text[] arrays, not text -- use ARRAY[...]::text[].
--   * verification_status check constraint disallows 'pending_review'; uses
--     the allowed value 'teacher review required' (matches column default).
--   * id is NOT NULL with no default; supplied explicitly using the existing
--     row's slug pattern (essay_<topic>_<band>_<yyyymmdd>).
--
-- The existing legacy annotated_essays row (children_roles / ChatGPT source)
-- is intentionally left in place; Stage 2 will revisit.

INSERT INTO annotated_essays (
  id,
  question_id,
  title,
  essay_type,
  target_band,
  estimated_mark_range,
  timed_condition_minutes,
  word_count_band,
  thesis,
  full_essay_text,
  examiner_summary,
  strengths,
  risks,
  upgrade_targets,
  student_realism_note,
  source,
  content_type,
  verification_status,
  reviewed
) VALUES (
  'essay_marriage_level5_20260525',
  'eq_ht_at_marriage_20260524',
  'The Arithmetic of Marriage: Calculation, Refusal, and Narrative Form in Hard Times and Atonement',
  'comparative_full_essay',
  'Level 5',
  '36-40',
  75,
  '950-1050',
  $thesis$Although both Dickens and McEwan stage marriage as a contractual transaction that absorbs and rewrites individual desire, Dickens dramatises that rewriting externally through the satirical lexicon of utilitarian arithmetic, while McEwan refuses marriage as a plot resolution altogether, locating its absence in the metafictional form of his novel itself. Both writers finally present marriage less as a private bond than as a structural device that absorbs narrative possibility — but where Dickens grants Louisa a tragic legibility through her collapse, McEwan denies even that consolation, replacing the lovers' ceremony with Briony's authorial substitution of fiction for marriage.$thesis$,
  $essay$Marriage in Dickens and McEwan is never simply a private contract; it is the literary device through which both novelists stage the collision between individual feeling and the systems — utilitarian, patriarchal, narrative — that seek to absorb it. Although both Hard Times and Atonement present marriage as a structure that rewrites desire as transaction, the two writers diverge sharply in form. Dickens dramatises that rewriting externally, through a satirical narrator whose lexicon of utilitarian arithmetic exposes Bounderby's proposal as a calculation; McEwan, working a century and a half later in a postmodern register, refuses marriage as resolution altogether, leaving Cecilia and Robbie's union annulled by Briony's authorial intervention and Lola's marriage to her rapist. Both novelists, finally, present marriage less as an institution than as a structural device that absorbs narrative possibility — but where Dickens grants Louisa a tragic legibility through her collapse, McEwan denies even that consolation, replacing the lovers' ceremony with the metafictional gesture of Briony's substitution of fiction for marriage.

Dickens's most sustained anatomy of marriage as utilitarian transaction occurs in Book One, Chapter Fifteen, when Gradgrind announces Bounderby's proposal to Louisa. The scene is constructed entirely from the vocabulary of statistical arithmetic: Gradgrind frames the question as a "calculated chance" and reminds his daughter to "consider the question, as you have been accustomed to consider every other question, simply as one of tangible Fact." The monosyllabic "Fact," capitalised throughout the novel as the Benthamite shibboleth, performs the very abstraction Dickens denounces — turning Louisa's body and future into a unit of measure. When Louisa, in her famous deflected response, gestures toward the Coketown chimneys and observes that "there seems to be nothing there but languid and monotonous smoke," before adding "Yet when the night comes, Fire bursts out," Dickens's juxtaposition of "languid" stasis and the eruptive monosyllable "Fire" externalises the buried interior life that Gradgrind's pedagogy has tried to extinguish. The narrator allows the image to function as both Louisa's coded confession and the novel's satirical indictment of a system that produces such suppressions. In its 1854 serial publication for Household Words, Dickens's middle-class readers were positioned as witnesses both to Bounderby's bombast and to the omniscient narrator's quiet refusal to share its self-congratulation. Marriage here is not a private space but a publicly legible economic transaction, and Dickens's narratorial form, with its capacity to stand above the action and anatomise it, makes that legibility the novel's critical achievement.

McEwan, by contrast, refuses to give marriage its conventional novelistic centrality. The two would-be central marriages of Atonement — Cecilia's to Robbie, Lola's to Paul Marshall — are both, in different registers, withheld or perverted. The fountain scene that should function as the lovers' implicit engagement collapses instead into the breaking of the family vase, which falls "with a sound that rang out in the silence like a pistol shot." McEwan's simile of warfare, in a novel whose Part Two will render the actual catastrophe of Dunkirk, anticipates the violence that will sever Cecilia and Robbie before any ceremony can take place. The lovers never marry; they never see each other again. McEwan withholds the consolation that Dickens's narrative form, even in its tragedies, still provides — the omniscient settling of accounts. In its place, the novel offers Briony's metafictional admission in the 1999 coda that she has spent her career attempting to give her lovers their happiness, a phrase whose grammar (the lovers possess the happiness she grants) exposes marriage in the novel's fictional world as itself a fictional grant, withdrawable by the same authorial hand that bestowed it. Where Dickens's satirical narrator stands above marriage to anatomise its arithmetic, McEwan's focalised consciousness and metafictional coda render marriage uninhabitable as ending — a closure available only as a confessed fabrication.

The contrasting forms produce contrasting ethics of marriage. In Hard Times, Stephen Blackpool's inability to divorce his alcoholic wife — Bounderby's casual reminder in Book One, Chapter Eleven that the law for the dissolution of marriage is a "luxury" affordable only by the wealthy — registers marriage as the legal mechanism through which class hierarchy reproduces itself. Dickens's narrator, in turning Stephen's confusion into the satirical phrase "tis aw a muddle," gives the novel a categorical clarity even where the law is incoherent: the institution is exposed as a class instrument. McEwan's parallel exposure of class operates more obliquely: Lola Quincey's marriage to Paul Marshall — the chocolate magnate whose Amo bar will feed soldiers and enrich its inventor — functions as the social legitimation of his crime against her. Where Stephen's marriage indicts the law that traps him, Lola's marriage indicts the social order that absolves her abuser. Both novels, in different idioms, present marriage as the apparatus through which power consolidates and rewrites itself; but Dickens delivers that judgment through omniscient satirical commentary, while McEwan embeds it in the very narrative form that withholds the lovers' marriage and gives the rapist his happiness.

The deepest comparison, finally, is one of narrative form itself. Dickens's novel ends with the omniscient narrator's direct address to the reader, locating the consolation of moral clarity outside the story, in the reader's ethical labour: it rests, the closing lines insist, with reader and writer alike. McEwan's novel ends with Briony's revelation that the lovers' reunion at the conclusion of Part Three was her fiction, and that no extra-textual reader can recover what the novel itself has withheld. The arithmetic of marriage in Hard Times is a public ledger that Dickens's satirical narrator audits in plain view; the arithmetic of marriage in Atonement is one that Briony, as both novel's character and its acknowledged author, has performed inside the only space where the calculation could still grant happiness — the page itself. Both novels finally suggest that marriage cannot be presented innocently, that to write a marriage is always to perform an ideological calculation; but where Dickens trusts the reader to see the calculation and judge it, McEwan suggests that the calculation is the novel's substance, and that the comfort of judgment from outside the text is itself the last and most seductive fiction.$essay$,
  $summary$A convincing critical argument (Level 5) that integrates AO1-AO4 with disciplined comparative pivots throughout. The conceptual claim — that marriage in both novels functions as a narrative device that absorbs and rewrites desire — is sustained from thesis to conclusion, with verbatim textual anchoring (the Coketown chimneys passage; the broken vase; Stephen Blackpool's legal trap) and precise method-led analysis (Dickens's capitalised abstractions; McEwan's simile of warfare; the contrast between omniscient satire and focalised consciousness). Contextual frames (Benthamite utilitarianism, 1854 serial publication for Household Words, Dunkirk, postmodern metafiction, Victorian divorce law) are integrated into argument rather than bolted on. The final paragraph elevates the comparison into a question of narrative form itself.$summary$,
  ARRAY[
    $$1. Sustained conceptual thesis that genuinely opens both texts (marriage as narrative device absorbing desire) rather than running them in parallel.$$,
    $$2. Verbatim quotation embedded as the spine of analysis, with method-led commentary at word and syntactic level ("Fire," "Fact," "pistol shot," "luxury," "tis aw a muddle").$$,
    $$3. AO3 context named, dated, and integrated (1854 Household Words serial; Dunkirk; postmodern metafictional coda; Benthamite utilitarianism; class-based Victorian divorce law).$$,
    $$4. AO4 comparison sustained at structural and formal levels, culminating in the contrast between Dickens's omniscient satire and McEwan's focalised metafiction.$$,
    $$5. The final paragraph performs the highest-band move — using the comparison to argue about narrative form itself, rather than merely about character or theme.$$
  ]::text[],
  ARRAY[
    $$1. The level of conceptual abstraction (marriage as "narrative device") risks losing the texture of specific scenes if a student attempted it under time pressure without prior preparation.$$,
    $$2. The Stephen Blackpool / Lola Marshall parallel in the third body paragraph is dense and depends on the reader recognising both moments quickly.$$,
    $$3. Two quotations are paraphrased rather than verbatim and should be verified before being used in revision: Briony's coda phrasing on "happiness" (the model gives the grammatical sense rather than the exact text), and Dickens's closing direct address (the model gives the recognisable allusion rather than the exact wording).$$,
    $$4. The model uses one critic-free framing throughout because Component 2 uses AO1-AO4 only — a student adapting this should resist the urge to drop in critics from Drama habit.$$
  ]::text[],
  ARRAY[
    $$1. Replace the two paraphrased quotations (Briony coda; Dickens direct address) with verbatim text from the editions Neha has at hand.$$,
    $$2. Sharpen one method-led sentence to syntactic level — e.g. analyse the chiasmus in Bounderby's bombast, or the past-perfect tense McEwan uses to mark Briony's retrospective authorship.$$,
    $$3. Introduce one further interpretive tension — e.g. the question of whether Briony's "happiness" gift to her lovers is itself a final ethical failure (substituting authorial generosity for justice).$$
  ]::text[],
  $realism$Achievable in 75 minutes by a student with strong preparation — specifically: a memorised set of 6-8 verbatim quotations from each text covering Marriage, Class, Form, and Narrative Voice; working knowledge of Benthamite utilitarianism, 1854 publication context, Victorian divorce law, and Atonement's metafictional coda; and rehearsed comparative pivots ("by contrast," "where Dickens... McEwan..."). The conceptual register ("marriage as narrative device") should be earned by argument, not asserted. Pitched at Neha's A/A* target with concrete steps to convincing-Level-5.$realism$,
  'Authored by Claude (Anthropic), 25 May 2026; pending Tawi review',
  'model_essay',
  'teacher review required',
  false
);
