-- Stage 0.9: Seed second verified A* model essay on the 2024 Q1 (female
-- relationships) past paper, and add the 2024 Q1 row to essay_questions so the
-- FK lands cleanly.
--
-- Schema reality (verified live before writing):
--   * essay_questions required-no-default cols: id, question_text, theme,
--     difficulty_level, question_family. year is TEXT (quoted '2024').
--     CHECK constraints: ao_requirements ⊆ {AO1..AO4} (default OK),
--                        marks = 40 (default OK),
--                        verification_status ∈ {draft, teacher review required,
--                        reviewed, approved, needs correction, retired}.
--   * annotated_essays required-no-default cols: id, question_id, title,
--     essay_type, target_band, word_count_band, thesis, full_essay_text,
--     examiner_summary. strengths/risks/upgrade_targets are text[].
--
-- Inline AO sentence-tags and the AO distribution table at the foot of the
-- essay body are verbatim from the source Google Doc; they are the essay's
-- distinctive teaching feature and are preserved intentionally.
--
-- Source: Tawi Google Doc 10s4TrgA3ZeRwFfq77QFwoijKOKQ3uwD6l6deSe3T9eQ,
-- section 2024_claude_q1. Authored by Claude in a prior session, not a fresh
-- pass. Several quotations paraphrased — flagged in the row's risks array.

-- ---------------------------------------------------------------------------
-- 1) 2024 Q1 (Childhood theme, "relationships between female characters")
-- ---------------------------------------------------------------------------

INSERT INTO essay_questions (
  id,
  year,
  question_text,
  theme,
  difficulty_level,
  question_family,
  review_notes
) VALUES (
  'eq_ht_at_female_relationships_20260525',
  '2024',
  'Compare the ways in which the writers of your two chosen texts present relationships between female characters. You must relate your discussion to relevant contextual factors.',
  'female relationships',
  'top_band',
  'female relationships',
  E'[2026-05-25] year=2024 verified against official Pearson 9ET0/02 June 2024 paper, Childhood Q1 — verbatim. New theme/family value introduced; rename if Tawi''s 2017-25 matrix uses a different canonical label.'
);

-- ---------------------------------------------------------------------------
-- 2) Seed second Claude-authored A* model essay (pairs with the row above)
-- ---------------------------------------------------------------------------

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
  reviewed,
  review_notes
) VALUES (
  'essay_female_relationships_level5_20260525',
  'eq_ht_at_female_relationships_20260525',
  'The Moral Seismograph: Female Relationships, Surveillance, and the Limits of Repair in Hard Times and Atonement',
  'comparative_full_essay',
  'Level 5',
  '36-40',
  75,
  '950-1050',
  $thesis$Relationships between female characters function as the moral seismograph of each novel's wider world: where they hold, society is shown to be capable of redemption; where they fracture, the cost is catastrophic. Dickens uses the bond between Louisa Gradgrind and Sissy Jupe to dramatise the rescue of feeling from a desiccated rationalism; McEwan dramatises the inverse — the destruction of the sisterly bond between Cecilia and Briony Tallis by an act of childish misreading from which there is no real return, only the simulacrum of return offered by Briony's fiction.$thesis$,
  $essay$Each sentence below is tagged with the AO(s) it primarily serves. For Component 2, AO1-AO4 only (AO5 not assessed).

---

1. Introduction

In both Hard Times and Atonement, relationships between female characters function as the moral seismograph of each novel's wider world: where they hold, society is shown to be capable of redemption; where they fracture, the cost is catastrophic. [AO1, AO4] Dickens, writing in 1854 under the cultural pressure of the "Angel in the House" ideology and the utilitarian doctrine of "Fact," uses the bond between Louisa Gradgrind and Sissy Jupe to dramatise the rescue of feeling from a desiccated rationalism. [AO3, AO2] McEwan, writing in 2001 about a 1935 country house, dramatises the inverse: the destruction of the sisterly bond between Cecilia and Briony Tallis by an act of childish misreading from which there is no real return — only the simulacrum of return offered by Briony's fiction. [AO3, AO4, AO2] Read together, the two novels expose how female relationships are conditioned by class, by maternal absence, and by the act of looking — and how easily that looking curdles into surveillance. [AO4, AO1, AO3]

2. Sister-figures as moral test

Both writers establish sister-figures whose intimacy is the moral test of the novel. [AO4, AO1] Sissy and Louisa are not biological sisters, but Dickens's tripartite structure ("Sowing," "Reaping," "Garnering") quietly tracks Sissy's slow infiltration of the Gradgrind household until she becomes Louisa's true kin. [AO2, AO1] When Louisa returns home in crisis, broken by the affective starvation of her childhood, it is Sissy whose intuitive sympathy catches her: the wisdom of the Heart, in the novel's repeated antithesis, redeems the wisdom of the Head. [AO2, AO1] Crucially, Sissy's circus background — scorned by Gradgrindian "Fact" — becomes the source of the imaginative life Louisa was systematically denied as a girl. [AO3, AO2] By contrast, McEwan's sisters are torn apart at the very moment Briony glimpses Cecilia undressing at the fountain. [AO4, AO2] The third-person free indirect discourse that filters Cecilia through a thirteen-year-old's literary self-importance flattens her sister into a "character" in the play Briony is mentally drafting. [AO2, AO1] Where Dickens's sister-bond rescues a child from her father's system, McEwan's is destroyed precisely because one sister cannot stop narrating the other. [AO4, AO2]

3. The female gaze as premature authorship

This act of looking is, in both novels, gendered and dangerous. [AO4, AO1] Mrs Sparsit's "Staircase" — the metaphorical descent Louisa must, in Sparsit's malicious imagination, complete by falling into adultery with Harthouse — is the clearest figure in Hard Times of female surveillance turned weaponised envy. [AO2, AO1] Sparsit, a widow déclassée, watches Louisa with the particular venom of a woman whose social authority has been compromised by economic dependence on Bounderby; her gaze is a tool of class resentment dressed as moral concern. [AO3, AO2] Briony at the nursery window performs the same operation: she sees Cecilia stripping at the fountain and instantly translates the image into a narrative of male violence, a translation which will, hours later, calcify into the false accusation against Robbie. [AO4, AO2] Both novels suggest that the female gaze, when uncoupled from sympathy, becomes a kind of premature authorship that overwrites the looked-at woman. [AO4, AO1] Dickens contains this danger by humiliating Sparsit; McEwan refuses to contain it — Briony's authorship is the novel itself. [AO4, AO2]

4. The failed mother

Behind both pairings stands the failed mother. [AO4, AO1] Mrs Gradgrind, a "bundle of shawls" whose dying gesture towards "something — not an Ology at all — that your father has missed" finally registers the affective gap her husband's system has carved into her children, is functionally absent throughout Louisa's girlhood. [AO1, AO2] Emily Tallis is her uncanny twentieth-century counterpart: bedridden with migraines, retreating into a darkened room while her daughters drift unsupervised through the heat of a single afternoon. [AO4, AO2] The contextual frames differ — Mrs Gradgrind is a casualty of the separate-spheres ideology that hollowed Victorian wives into ornamental invalids, while Emily belongs to the interwar gentry whose declining domestic authority McEwan registers with cool irony — but the effect is the same. [AO3, AO4] Without functioning mothers, the daughters are forced to mother each other, and the relationships they form (Louisa/Sissy, Cecilia/Briony, Briony/Lola) are weighted with responsibility they are not yet equipped to bear. [AO4, AO1] Dickens, characteristically, allows Sissy to become a surrogate maternal presence for Louisa; McEwan denies this consolation, since Briony's attempt to mother Lola after the rape collapses into the deeper failure of misnaming her cousin's rapist. [AO4, AO2]

5. Class inflection

Class inflects these female relationships in ways that reflect each novel's historical moment. [AO3, AO4] Sissy's circus origins make her, for Gradgrind, an experimental subject — "girl number twenty" — but Dickens's whole moral argument rests on Sissy's irreducible humanity overflowing the utilitarian frame. [AO1, AO3, AO2] Her friendship with Louisa is a quiet rebuke to the rigid class boundaries Bounderby polices through his fabricated self-made-man narrative; female alliance, in Hard Times, crosses class to heal. [AO3, AO2] Lola Quincey, by contrast, sits within Briony's own class but as the slightly older, more sexually knowing cousin whose presence destabilises Briony's narrative authority. [AO4, AO2, AO3] The eventual revelation that Lola has married Paul Marshall — her rapist — exposes the upper-middle-class closing of ranks that McEwan diagnoses as the real moral catastrophe of his 1930s setting. [AO3, AO2] Female alliance, in Atonement, collapses along class lines to conceal. [AO4, AO3]

6. Conclusion: the question of repair

What ultimately separates the two novels is the question of repair. [AO4, AO1] Dickens, working within a Victorian providential frame still hospitable to redemption, allows Sissy to "garner" what Gradgrindism has wasted: her relationship with Louisa is the novel's emotional resolution, even as Louisa's own marriage cannot be salvaged. [AO3, AO2, AO1] McEwan, writing after the twentieth century's catastrophes and within a postmodern scepticism about narrative consolation, denies his sisters their reunion. [AO3, AO4] The "atonement" of his title is exposed in the coda as Briony's fiction — Cecilia and Robbie reunited only on the page Briony herself has authored. [AO2, AO1] The female relationship at the novel's centre is never actually repaired; it is merely re-written. [AO2, AO1] In this sense, the two novels stand as opposed arguments about what prose can do for fractured female bonds: Dickens believes fiction can mend them; McEwan suspects fiction is what broke them in the first place. [AO4, AO2, AO1]

---

AO distribution (sentence-level tally, primary + secondary hits)

Paragraph        AO1   AO2   AO3   AO4
1 Intro          2     2     3     3
2 Sisters        4     6     1     3
3 Gaze           2     4     1     4
4 Mothers        2     3     1     5
5 Class          1     4     6     4
6 Repair         4     4     2     3
Total            15    23    14    22

What the distribution reveals (Edexcel banding terms):

- AO2 (23) and AO4 (22) lead — exactly the right weighting for a top-band Component 2 answer. AO4 is the historical L4→L5 discriminator, and integrating it sentence-by-sentence (rather than text-by-text) is what lifts the response.
- AO3 (14) is well-distributed — context appears in every paragraph, and is interpretive (separate spheres, postmodern scepticism, interwar gentry decline) rather than biographical bolt-on, which is the L5 marker.
- AO1 (15) is the lowest count but appropriately so — AO1 is the substrate (terminology, expression, argument) rather than a discrete strand to hammer; under-counting here is normal in a sophisticated answer.
- Paragraph 5 is the strongest on AO3 weighting; 2 and 3 are the strongest on AO2 (close textual method).
- Watch-point for Neha: paragraph 4 has only one AO3 sentence but it is doing heavy lifting (separate spheres + interwar gentry in a single sentence). Under exam pressure that AO3 sentence could collapse — worth drilling as a memorised phrase.$essay$,
  $summary$A convincing Level 5 response demonstrating sentence-level AO integration — the distinguishing feature of top-band Component 2 answers. The AO distribution (AO2=23, AO4=22, AO3=14, AO1=15) is exactly the weighting Edexcel rewards: AO2 and AO4 lead, AO3 is interpretive (separate spheres, postmodern scepticism, interwar gentry decline) rather than biographical, and AO1 is the substrate carrying the others. The argument moves through a sustained conceptual sequence — moral seismograph, premature authorship as female gaze, the failed mother, class as the line along which alliance heals (Dickens) or conceals (McEwan), and the question of repair as the deepest comparative axis. The essay's distinctive teaching feature is the inline AO sentence-tags + the quantitative distribution table at the foot, which allow a student to see precisely how the marks are accumulated.$summary$,
  ARRAY[
    $$Sentence-level AO integration throughout — each sentence tagged with primary and secondary AO hits, demonstrating the L4→L5 discriminator move of weaving AO4 into every paragraph rather than treating it as a separate strand.$$,
    $$Quantitative AO distribution table at the foot of the essay (AO2=23, AO4=22, AO3=14, AO1=15) makes the marking model explicit and teachable — a student can see exactly which sentences carry which mark.$$,
    $$Six-paragraph structure with named conceptual anchors (moral seismograph, premature authorship, failed mother, class inflection, question of repair) rather than chronological or text-by-text walkthrough.$$,
    $$AO3 is interpretive throughout — "Angel in the House" doctrine, separate-spheres ideology, postmodern scepticism, interwar gentry decline — rather than biographical bolt-on, which is the L5 marker.$$,
    $$The Mrs Sparsit / Briony parallel in paragraph 3 — gaze as premature authorship — is genuinely original critical move that sustains AO4 at the conceptual level rather than the surface level.$$,
    $$Conclusion does the highest-band move: uses the comparison to argue about narrative form itself ("Dickens believes fiction can mend them; McEwan suspects fiction is what broke them in the first place").$$
  ]::text[],
  ARRAY[
    $$Paragraph 4 has only one AO3 sentence carrying heavy load (separate spheres + interwar gentry in a single sentence). Under timed exam pressure that single AO3 sentence is the most likely point of collapse — drill it as a memorised phrase.$$,
    $$The conceptual register (gaze as authorship, repair as fiction) is genuinely demanding. A student attempting this register without preparation will not produce it under time pressure — it has to be rehearsed.$$,
    $$Several quotations are paraphrased or partial: Mrs Gradgrind's "bundle of shawls" and her "Ology" gesture are recognisable but the surrounding phrasing is reconstructed from memory; "girl number twenty" is genuine; Mrs Sparsit's "Staircase" is a real motif but quoted phrasing should be verified. Verify all quotations against Neha's editions before memorising.$$,
    $$The Lola Quincey / Sissy class pairing in paragraph 5 is dense — readers need to hold both characters' class positions actively. Under pressure a student could blur Lola's class status with Robbie's, weakening the AO3 point.$$
  ]::text[],
  ARRAY[
    $$Replace all paraphrased quotations (Mrs Gradgrind death scene, Mrs Sparsit Staircase phrasing) with verbatim text from Neha's editions of Hard Times and Atonement.$$,
    $$Drill the paragraph 4 AO3 sentence ("Mrs Gradgrind is a casualty of the separate-spheres ideology... while Emily belongs to the interwar gentry...") as a single memorised phrase to ensure the AO3 weight in paragraph 4 holds under exam pressure.$$,
    $$Pair this essay with a deliberately Level-4 version of the same question (offered in the source Google Doc) to make the AO distribution difference visible as a teaching artefact — the L4 version would show fewer AO4 sentence-tags and more text-by-text rather than sentence-by-sentence comparison.$$
  ]::text[],
  $realism$Achievable in 75 minutes by a student with strong preparation — specifically: memorised verbatim quotations covering the Sister-figures, Gaze, Mother, Class, and Repair conceptual anchors; working knowledge of the "Angel in the House" doctrine, separate-spheres ideology, Gradgrindian "Fact" pedagogy, postmodern metafictional coda, and 1930s class structure; and rehearsed comparative pivots that work at sentence-level rather than paragraph-level. The AO distribution table at the foot is a learning artefact (not part of a real exam answer) but the underlying discipline it represents — AO4 integrated sentence-by-sentence, AO3 interpretive in every paragraph — is the operational habit Neha needs to drill. Pitched at her A/A* target with concrete steps to convincing Level-5.$realism$,
  'Authored by Claude (Anthropic) prior session; verbatim copy from Tawi Google Doc 2024_q1 (section 2024_claude_q1), 25 May 2026; pending Tawi review',
  'model_essay',
  'teacher review required',
  false,
  E'[2026-05-25] Source Google Doc states "Time: 1 hour" but Edexcel 9ET0/02 is 1h15m. timed_condition_minutes set to 75 (Edexcel reality), not 60. Source claim noted for transparency. Several quotations paraphrased — flagged in risks array.'
);
