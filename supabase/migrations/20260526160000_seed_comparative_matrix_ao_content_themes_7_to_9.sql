-- Comparative Matrix AO-content consolidation: Themes 7-9.
-- Axes: Role models, Love, Hope.
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
  ao2 = $cm0$Dickens uses Sissy's "girl number twenty" labelling moment, her failure to define a horse (Book One Chapter 2), and the recurrent imagery of warmth and fire associated with her against the cold geometry of the Gradgrind household — methods of characterisation through positional and lexical contrast. McEwan uses sharp imperative dialogue from the matron and senior nurses, procedural detail of bed-making and dressings, and the deliberate erasure of Briony's individual name in favour of "Nurse Tallis" — methods of institutional levelling that strip her of the authorial self-importance Part One showed.$cm0$,
  ao3 = $cm0$Dickens: Victorian doctrine of female moral influence (Sarah Stickney Ellis's The Women of England, 1839); the working-class moral exemplum tradition (Hannah More's tracts); the circus as alternative pedagogical community. McEwan: the inter-war and wartime nursing profession (Florence Nightingale's influence still operative; Vera Brittain's Testament of Youth as antecedent); the matron tradition as a class-levelling institution that pre-dates the NHS.$cm0$,
  ao4 = $cm0$Both function as female figures who model responsibility and care, offering alternatives to their societies' harsher values. Dickens uses Sissy as the stable moral counter-presence to Gradgrindian Fact — her presence in the household is the alternative pedagogy made flesh. McEwan uses the senior nurses and matron as the institutional embodiment of professional ethics that Briony must accept in place of her literary self-fashioning — discipline as moral re-education.$cm0$,
  thesis = $cm0$Both texts use the alternative-female role model to register a form of moral authority the protagonist's own class formation has refused them — Sissy's compassion is what Louisa was educated against; the matron's discipline is what Briony was indulged out of. In both cases the role model functions less as imitative ideal than as structural correction.$cm0$,
  character = $cm0$Sissy as "Embodiment of imagination/empathy", "Alternative educational/human model" (WP2). The senior nurses and matron as institutional types — no individual character pages, because their function depends on their role rather than their individuality. This is itself a method comparison: Dickens individuates the alternative (Sissy as person); McEwan institutionalises it (the nurses as role).$cm0$,
  narrative = $cm0$Dickens uses third-person omniscience to grant Sissy explicit moral approval — the narrator endorses her against the system she opposes. McEwan filters the nurses through Briony's retrospective consciousness — the role models are visible to us only as Briony later judges her younger self for needing them.$cm0$,
  structure = $cm0$Sissy is structurally constant — introduced in Book One Chapter 2, present at Stone Lodge in Book the Third's recovery. The senior nurses occupy Part Three's nursing arc — structurally bounded by Briony's wartime training; once Part Four reveals Part Three was authored, their role-model function is itself recast as Briony's projection.$cm0$,
  exam_fit = $cm0$2020 Q1 (Role models) — direct fit, Pair 1. Also: 2017 Q2 (Friendship — Sissy/Louisa; the nurses' bond); 2018 Q2 (Education — Sissy's alternative pedagogy; the matron tradition as practical re-education); 2024 Q1 (Relationships between female characters — Sissy/Louisa; the nurses as female community).$cm0$,
  updated_at = now()
where id = 'cm-rolemodel-01';

update public.comparative_matrix
set
  ao2 = $cm0$Dickens uses Gradgrind's late dialogue — chastened diction, the dropping of the abstract-noun lists that characterised his earlier speech, the physical gesture of kneeling beside Louisa (Book the Third Chapter 1) — to mark moral change through linguistic register. McEwan uses Briony's 1999 first-person coda — the shift to direct authorial voice after three Parts of third-person retrospective — to expose her authorship and force the reader to judge whether her late confession constitutes reparation or self-exoneration.$cm0$,
  ao3 = $cm0$Dickens: Victorian narrative of belated moral conversion (the religious tract tradition; Carlyle's "natural supernaturalism"); the doctrine of repentance as moral capital. McEwan: post-Holocaust questions about whether literary reparation can ever be adequate (Adorno on poetry after Auschwitz as a structural antecedent); postmodern scepticism about confessional authority; the metafictional novel's interrogation of its own moral seriousness.$cm0$,
  ao4 = $cm0$Both function as problematic role models who try to correct earlier errors, raising questions about the limits of moral change. Dickens uses Gradgrind's belated reform to test whether the author of damage can become its remedy — and answers yes, qualifiedly. McEwan uses older Briony's confession-through-fiction to test the same question and answers, finally, no — the fictional reparation is exposed as part of the moral problem rather than its solution.$cm0$,
  thesis = $cm0$Both novels stage the role-model arc as a question rather than an answer — whether the author of harm can become its corrective. Dickens's Gradgrind, kneeling and chastened, suggests qualified yes. McEwan's older Briony, writing the reunion she never permitted, suggests structured no — and uses the form of the novel itself to deliver that verdict.$cm0$,
  character = $cm0$Gradgrind as "less villain than failed ideologue" (WP2); arc = "Ideological certainty → Moral collapse → Partial reform". Older Briony as the only character in either novel whose authorship is the moral arc — the writer is the character, the writing is the recognition. The A* concept of "the attempt was all": "Briony's moral worth derives from attempted reparation rather than completed forgiveness."$cm0$,
  narrative = $cm0$Dickens narrates Gradgrind's change through intrusive third-person commentary — the narrator validates the reform explicitly. McEwan narrates older Briony's "reform" through her own first-person voice in the coda — the validation must come from the reader, not the narrator, because the narrator is the one needing judgement.$cm0$,
  structure = $cm0$Gradgrind's reform occupies Book the Third ("Garnering") — structural reward for prior consequence. Older Briony's "reform" is the structural premise of the entire novel — Parts One through Three are her acts of authorship; Part Four exposes that authorship; the structure is itself the moral question.$cm0$,
  exam_fit = $cm0$2020 Q1 (Role models) — direct fit, Pair 2. Also: 2017 Q1 (Difficult circumstances — Louisa and older Briony as figures whose inner damage demands moral correction); 2019 Q2 (Changing relationships — Gradgrind/Louisa repaired; Briony/Cecilia not); 2023 Q1 (Important choices — Gradgrind's choice to reform; Briony's choice to write).$cm0$,
  updated_at = now()
where id = 'cm-rolemodel-02';

update public.comparative_matrix
set
  ao2 = $cm0$Dickens uses restrained idiom and conditional grammar around Stephen and Rachael ("if I had but knowed it") — the love registered through what is not said. The chapter "No Way Out" (Book One Chapter 11) externalises the legal impossibility. McEwan uses extended descriptive prose around the library scene (Part One Chapter 11) — sustained sensory detail, the eroticism of withheld speech, then explicit physical encounter as the suspension of class register. The fountain scene as misread visual, the letter as material misdirection, the library as eventual fulfilment, then the war as structural interruption.$cm0$,
  ao3 = $cm0$Dickens: Victorian marriage law (the 1857 Matrimonial Causes Act post-dating Hard Times by three years); coverture and the impossibility of working-class divorce; the Wesleyan tradition of "moral marriage" that gives Stephen / Rachael their ethical legitimacy. McEwan: 1930s class-coded romance (Forster's Howards End and A Room with a View as antecedents); the wartime separation of lovers as a literary structure (Vera Brittain's Testament of Youth; Sebastian Faulks's Birdsong); post-Lawrentian explicitness in the literary representation of sex.$cm0$,
  ao4 = $cm0$Both function as "right" loves blocked by external forces, intensifying the critique of the societies that deny them. Dickens uses Stephen and Rachael to dramatise love thwarted by Victorian marriage law and class — a moral relationship rendered impossible by legal and economic structures. McEwan uses Robbie and Cecilia to dramatise love thwarted by class prejudice, wrongful conviction, and war — a fully realised relationship rendered briefly possible and then violently terminated by external history.$cm0$,
  thesis = $cm0$Both writers stage "right" love as the love that the social structures of their period make impossible — Stephen and Rachael by Victorian marriage law, Robbie and Cecilia by class prejudice and wartime catastrophe. In both cases the love's rightness is registered precisely through its inability to be socially completed, making the obstruction the proof of value.$cm0$,
  character = $cm0$Rachael as Stephen's moral co-witness (treated under Friendship Theme 2) — here the woman whose love is constituted by what it cannot become. Cecilia as the Tallis daughter whose love crosses the class she was born into — the breaking-with-family is the love's enabling condition, the structural inverse of Briony who remains within the family.$cm0$,
  narrative = $cm0$Dickens narrates Stephen / Rachael through restrained free indirect — the narrator withholds intrusion as the characters withhold speech, modelling the relationship's discipline at the level of style. McEwan narrates Robbie / Cecilia through alternating focalisation in Part One (his consciousness, her consciousness, the moments of misreading between them) and through Robbie's wartime memory in Part Two (the recollected library scene as sustaining vision).$cm0$,
  structure = $cm0$Stephen / Rachael's love is structurally constant but unconsummated — present throughout all three books; the relationship's structural function is to outlive Stephen and pass his moral inheritance to Rachael. Robbie / Cecilia's love is structurally fragmented — Part One sets it up, Part Two destroys it through wartime separation, Part Three offers fictional reunion, Part Four reveals the fiction. The fragmentation is the love story.$cm0$,
  exam_fit = $cm0$2020 Q2 (Love) — direct fit, Pair 1. Also: 2017 Q2 (Friendship — Stephen/Rachael as restrained love/friendship; the MATRIX explicitly cites this pair); 2022 Q1 (Marriage — Stephen's existing marriage as legal constraint; Robbie/Cecilia's unrealised marriage as the structural counter-fact); 2017 Q1 (Difficult circumstances — both relationships destroyed by the systems they exist within).$cm0$,
  updated_at = now()
where id = 'cm-love-01';

update public.comparative_matrix
set
  ao2 = $cm0$Dickens uses the proposal scene (Book One Chapter 15 — Gradgrind's catechistic delivery of Bounderby's offer; Louisa's "What does it matter?") and the marriage's slow unravelling through Mrs Sparsit's surveillance staircase (Book Two Chapter 10) — methods that render the marriage as both private failure and public ideology breaking. McEwan uses the Part Four coda's bureaucratic registration of the Marshall marriage — the brief mention of the baronetcy, the Marshall Foundation, the funding of medical research — and the studied flatness of tone to render this marriage as the system's structural endorsement of impunity.$cm0$,
  ao3 = $cm0$Dickens: Victorian marriage as economic contract and class consolidation; the doctrine of coverture; the figure of the "respectable" marriage as ideological cover for emotional or economic violence. McEwan: WWII profiteering and post-war respectability (the actual Cadbury/Rowntree families as historical analogues); the 1947 New Year Honours list as historical referent; the post-war legitimation of inter-war wealth through marriage and philanthropy.$cm0$,
  ao4 = $cm0$Both function as marriages that expose love's corruption by power, class, and self-interest. Dickens uses Louisa's marriage to Bounderby to dramatise marriage as economic contract — a transaction Louisa enters under paternal pressure that her education denied her the resources to refuse. McEwan uses the Marshall / Lola marriage to dramatise marriage as alibi — a union that legitimises the perpetrator and silences the victim under the cover of social respectability, with the resulting baronetcy as the system's structural reward for the cover-up.$cm0$,
  thesis = $cm0$Both writers stage the corrupted marriage as the structural register of social hypocrisy — Louisa's marriage to Bounderby exposes Victorian capitalism's reduction of women to property; Marshall's marriage to Lola exposes the inter-war class system's protection of the powerful through institutional silence. In both cases the marriage is not the failure of love but the success of the system that prevents love from mattering.$cm0$,
  character = $cm0$Louisa as "victim of repression" whose marriage exposes utilitarianism's human cost (WP2). Marshall as the satirical target previously discussed (Theme 3) — the unpunished perpetrator whose marriage to Lola transforms his crime into his social capital. Lola as the silenced victim whose silence the novel's structure makes audible through what is not said about her.$cm0$,
  narrative = $cm0$Dickens narrates Louisa's marriage through omniscience that withholds her interiority strategically — the marriage is shown from outside (Mrs Sparsit's view) until the breaking-point lets us in. McEwan narrates the Marshall marriage through Briony's late-coda recognition — the marriage is registered, not dramatised, because the novel's structure makes the silence about Lola the central moral fact.$cm0$,
  structure = $cm0$Louisa's marriage occupies Book Two ("Reaping") — its breakdown is the structural midpoint. The Marshall marriage is the novel's structural shadow — barely shown, but its existence in the coda is the institutional confirmation of everything Briony has been writing against.$cm0$,
  exam_fit = $cm0$2020 Q2 (Love) — direct fit, Pair 2. Also: 2022 Q1 (Marriage — both as central cases); 2018 Q1 (Criticising society — both marriages as the structural register of class hypocrisy); 2024 Q1 (Relationships between female characters — Louisa silenced by Bounderby's authority; Lola silenced by Marshall's).$cm0$,
  updated_at = now()
where id = 'cm-love-02';

update public.comparative_matrix
set
  ao2 = $cm0$Dickens uses Sissy's optimistic dialogue (her conviction that Louisa will be repaired in time) and the recurrent fire imagery transferred from Louisa to Sissy as the carrier of imagined future — methods of characterisation through tonal contrast against the prevailing satirical voice. McEwan uses the wartime letters (Part Two) as documents of future-orientation — Robbie's repeated invocation of the cottage, Cecilia's "Come back. Come back to me" — and the Part Three reunion scene's tentative realism, before Part Four exposes the entire reunion as fiction.$cm0$,
  ao3 = $cm0$Dickens: Victorian faith in moral reform (Carlyle's "natural supernaturalism"; the social-purpose novel's commitment to amelioration); the doctrine of grace and the redemptive ending. McEwan: post-WWII disillusionment with optimistic narrative resolution (Adorno; the Holocaust's effect on the consolatory power of fiction); the wartime letter as historical document (the published correspondence of WWII soldiers); the metafictional novel's interrogation of consolation.$cm0$,
  ao4 = $cm0$Both function as fragile threads of hope that resist overwhelming social and historical darkness. Dickens uses Sissy's persistent optimism about the Gradgrind family — her belief in repair even after damage — as the hope sustained against utilitarian determinism. McEwan uses Robbie and Cecilia's planned reunion — their epistolary exchanges, the imagined cottage, the future-oriented passages — as the hope sustained against wartime statistical likelihood, only for Part Four to expose that hope as authorial projection.$cm0$,
  thesis = $cm0$Both writers stage hope as the human capacity to sustain a future-image against current evidence — but Dickens permits the hope to be qualifiedly fulfilled (Sissy's optimism vindicated in the partial reform of Book the Third), while McEwan permits the hope to be fully imagined and then exposes the imagining as the novel's central act of authorial dishonesty.$cm0$,
  character = $cm0$Sissy as the carrier of imagination and empathy whose function is precisely to sustain the hope no one else has the resources to hold (WP2). Robbie and Cecilia as the lovers whose hope is constituted by their separation — what they hope for IS the proof that the system has prevented it.$cm0$,
  narrative = $cm0$Dickens narrates Sissy's optimism through endorsed dialogue — the narrator does not undercut her hope. McEwan narrates Robbie and Cecilia's hope through their own focalised consciousness in Part Two (Robbie's memory) and through Part Three's reunion scene, then retracts both through Part Four's coda — the narrator does undercut the hope, and the undercutting is the point.$cm0$,
  structure = $cm0$Sissy's hope is structurally distributed — sustained across all three books, vindicated qualifiedly in Book the Third. The lovers' hope is structurally concentrated — Parts Two and Three carry it; Part Four destroys it. Dickens permits hope a structural payoff; McEwan permits it a structural retraction.$cm0$,
  exam_fit = $cm0$2021 Q1 (Hope) — direct fit, Pair 1. Also: 2017 Q2 (Friendship — Sissy as friend-as-hope; the lovers as bond-as-hope); 2019 Q2 (Changing relationships — Sissy's effect on the Gradgrinds; the lovers' impossible reconciliation); 2023 Q1 (Important choices — Sissy's choice to stay; Robbie's choice to enlist for Cecilia).$cm0$,
  updated_at = now()
where id = 'cm-hope-01';

update public.comparative_matrix
set
  ao2 = $cm0$Dickens uses the final-chapter narratorial address ("Dear Reader!") and the conditional future tense to render the "Garnering" ending as moral projection — what may yet be, on conditions. McEwan uses the metafictional first-person of Part Four — Briony's direct address to the reader, the explicit confession that the reunion was written, the rhetorical question about whether the novelist who is also God can achieve atonement — to render the ending as authorial act being judged in real time.$cm0$,
  ao3 = $cm0$Dickens: Victorian belief in the social-purpose novel's improving function (Ruskin, Carlyle, Dickens's own journalism); the closing chapter as moral testament. McEwan: post-WWII scepticism about the consolatory novel; postmodern metafiction's tradition of self-implicating endings (John Fowles's The French Lieutenant's Woman as direct antecedent); the "author as God" trope from Genesis through Sartre to McEwan.$cm0$,
  ao4 = $cm0$Both function as imaginative projections of a better future, though Atonement exposes its own hope as invented and ethically compromised. Dickens uses Gradgrind's reformed self and Louisa's projected influence on future children to imagine moral improvement extending beyond the novel's frame. McEwan uses Briony's fictional reunion of Robbie and Cecilia to imagine the same kind of moral improvement, and then uses Part Four's metafictional revelation to expose the imagining as itself the act being judged.$cm0$,
  thesis = $cm0$Both novels close on imaginative projections of moral repair, but Dickens uses the projection to extend his didactic purpose beyond the novel's frame while McEwan uses the projection to interrogate whether such repair can ever be more than authorial wish. The structural difference is decisive: Dickens's hope is offered; McEwan's hope is offered and then withdrawn, with the withdrawal as the novel's moral act.$cm0$,
  character = $cm0$Gradgrind's reformed self as the projected future of his earlier ideology — the role-model arc completed in narrative time. Older Briony as the projected future of her younger self — but the projection is shown to be the act of projection itself, not its completion.$cm0$,
  narrative = $cm0$Dickens's narrator directly addresses the reader in the closing chapter, asserting moral continuity beyond the text. McEwan's narrator (Briony) directly addresses the reader in the closing pages, asserting the limits of moral continuity — the reunion she wrote is the only one that exists.$cm0$,
  structure = $cm0$Dickens's hope-ending is structurally consequent — the "Garnering" distributes the consequences of "Sowing" and "Reaping"; the moral projection is structurally earned. McEwan's hope-ending is structurally retracted — Part Four undoes Part Three; the moral projection is structurally exposed as authorial wish.$cm0$,
  exam_fit = $cm0$2021 Q1 (Hope) — direct fit, Pair 2. Also: 2020 Q1 (Role models — Gradgrind's reform; older Briony's confession); 2019 Q2 (Changing relationships — qualified vs impossible reconciliation); 2023 Q1 (Important choices — Gradgrind's choice to reform; Briony's choice to write the alternative).$cm0$,
  updated_at = now()
where id = 'cm-hope-02';

-- Verification: all expected rows must exist.
do $$
declare
  missing_rows integer;
begin
  select count(*)
  into missing_rows
  from (values
    ('cm-rolemodel-01'),
    ('cm-rolemodel-02'),
    ('cm-love-01'),
    ('cm-love-02'),
    ('cm-hope-01'),
    ('cm-hope-02')
  ) as expected(id)
  left join public.comparative_matrix cm on cm.id = expected.id
  where cm.id is null;

  if missing_rows > 0 then
    raise exception 'Themes 7-9 comparative_matrix AO-content seed expected % row(s) that were not present', missing_rows;
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
    'cm-rolemodel-01',
    'cm-rolemodel-02',
    'cm-love-01',
    'cm-love-02',
    'cm-hope-01',
    'cm-hope-02'
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
    raise exception 'Themes 7-9 comparative_matrix AO-content seed left % incomplete row(s)', incomplete_rows;
  end if;
end $$;
