# Component 2 Childhood Question Bank Draft

## Executive summary
This document serves as a docs-first draft of the complete Pearson Edexcel Component 2 Prose question bank for the Childhood theme and Hard Times / Atonement text pairing. It is intended for review before implementation. By defining the metadata, authenticity status, and question structures offline, we avoid polluting the live Supabase database or local seed with unverified or poorly mapped data.

## Scope
* **Board**: Pearson Edexcel
* **Qualification**: A-Level English Literature
* **Paper**: 9ET0/02
* **Component**: Component 2: Prose
* **Theme**: Childhood
* **Text pairing**: Hard Times and Atonement
* **Assessment objectives**: AO1, AO2, AO3, AO4 only

## Non-goals
* No source implementation
* No Supabase writes
* No migrations
* No AI generation
* No AO5
* No claim that mock questions are official past-paper questions

## Classification rules
1. **official past-paper**
   Exact wording from a verified Pearson Edexcel 9ET0/02 paper.
2. **adapted past-paper**
   A question derived from a known past-paper pattern but modified in wording, theme, or focus.
3. **exam-style mock**
   A question written in Pearson Edexcel style but not claimed as official.
4. **speculative practice**
   A targeted skill-building question for less frequent or high-challenge themes.

*Note: No official past-paper years are invented. Without verification from local repo/docs, questions are classified as "exam-style mock" or "speculative practice".*

## Proposed metadata schema

| Field | Purpose | Required? | Example |
|---|---|---|---|
| id | Stable question identifier | Yes | c2-childhood-class-01 |
| family/theme | Thematic grouping | Yes | class |
| question stem | The exam-style question | Yes | Compare the ways... |
| paper code | Component paper code | Yes | 9ET0/02 |
| text pairing | Fixed pairing | Yes | Hard Times / Atonement |
| source type | Official/adapted/mock/speculative | Yes | exam-style mock |
| authenticity status | Verification note | Yes | not official; generated for practice |
| year/source | Past-paper year or internal source note | Yes | mock bank 2026 |
| difficulty | Student difficulty band | Yes | secure / strong / top_band |
| primary route | Main essay route | Yes | class as social conditioning |
| secondary route | Alternative essay route | Yes | class and moral judgement |
| likely methods | AO2 methods likely to be useful | Yes | setting, narrative perspective, motif |
| AO emphasis | Main AO weighting in practice use | Yes | AO1/AO4 with AO2 route |
| builder handoff notes | Suggested data to send to Builder | Yes | prefill theme + route |

## Full question bank draft

| ID | Family/theme | Question stem | Source type | Authenticity status | Year/source | Difficulty | Primary route | Secondary route | Likely methods | AO emphasis | Builder handoff notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| c2-child-01 | childhood | Compare the ways in which the writers of your two chosen texts present the experiences of childhood. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | secure | childhood formation | innocence and control | focalisation, setting | AO1/AO4 | prefill theme: childhood; route: formation |
| c2-child-02 | childhood | Compare the ways in which the writers of your two chosen texts explore the vulnerability of children. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | strong | adult projection onto children | structural constraints | imagery, dialogue | AO1/AO2 | prefill theme: childhood; route: vulnerability |
| c2-child-03 | childhood | Compare the ways in which the writers of your two chosen texts present the loss of childhood innocence. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | top_band | trauma and realisation | the role of education | motif, contrast | AO1/AO4 | prefill theme: childhood; route: loss of innocence |
| c2-edu-01 | education | Compare the ways in which the writers of your two chosen texts explore formal education. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | secure | institutional control | utilitarian vs elite | setting, semantic field | AO3/AO4 | prefill theme: education; route: formal schooling |
| c2-edu-02 | education | Compare the ways in which the writers of your two chosen texts present the influence of adults on a child's learning. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | strong | parental projection | failed guardianship | characterisation, irony | AO1/AO2 | prefill theme: education; route: adult influence |
| c2-edu-03 | education | Compare the ways in which the writers of your two chosen texts present the conflict between moral education and academic learning. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | top_band | intuition vs fact | learning from mistakes | narrative perspective, juxtaposition | AO1/AO4 | prefill theme: education; route: moral vs academic |
| c2-class-01 | class | Compare the ways in which the writers of your two chosen texts present social class. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | secure | class as a visible boundary | class as internalised grammar | setting, dialogue | AO3/AO4 | prefill theme: class; route: social conditioning |
| c2-class-02 | class | Compare the ways in which the writers of your two chosen texts explore the impact of class on individual freedom. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | strong | structural oppression | social mobility limits | motif, contrast | AO1/AO4 | prefill theme: class; route: freedom vs restriction |
| c2-class-03 | class | Compare the ways in which the writers of your two chosen texts present working-class characters. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | top_band | dignity and exploitation | voicelessness | dialect, focalisation | AO1/AO2 | prefill theme: class; route: the working class voice |
| c2-fam-01 | family | Compare the ways in which the writers of your two chosen texts present family relationships. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | secure | parental expectations | sibling dynamics | dialogue, contrast | AO1/AO4 | prefill theme: family; route: expectations |
| c2-fam-02 | family | Compare the ways in which the writers of your two chosen texts explore the failure of parents. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | strong | ideological blind spots | absent or weak figures | characterisation, irony | AO1/AO2 | prefill theme: family; route: parental failure |
| c2-fam-03 | family | Compare the ways in which the writers of your two chosen texts present the impact of family breakdown. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | top_band | emotional repression | systemic dysfunction | setting, imagery | AO3/AO4 | prefill theme: family; route: dysfunction |
| c2-gen-01 | gender | Compare the ways in which the writers of your two chosen texts present expectations of women. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | secure | marriage as transaction | female compliance | dialogue, symbolism | AO3/AO4 | prefill theme: gender; route: social expectations |
| c2-gen-02 | gender | Compare the ways in which the writers of your two chosen texts explore female agency. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | strong | moral authority vs institutional power | private resistance | focalisation, motif | AO1/AO2 | prefill theme: gender; route: agency |
| c2-gen-03 | gender | Compare the ways in which the writers of your two chosen texts present masculinity and power. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | top_band | patriarchal control | flawed male authority | characterisation, semantic field | AO1/AO4 | prefill theme: gender; route: masculinity |
| c2-guilt-01 | guilt | Compare the ways in which the writers of your two chosen texts present feelings of guilt. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | secure | delayed recognition | overwhelming burden | interior monologue, imagery | AO1/AO2 | prefill theme: guilt; route: recognition |
| c2-guilt-02 | guilt | Compare the ways in which the writers of your two chosen texts explore the desire for atonement. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | strong | incomplete repair | the impossibility of fixing the past | narrative perspective, structure | AO1/AO4 | prefill theme: guilt; route: atonement attempt |
| c2-guilt-03 | guilt | Compare the ways in which the writers of your two chosen texts present the consequences of a guilty conscience. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | top_band | structural collapse | lifelong psychological cost | motif, retrospective narration | AO3/AO4 | prefill theme: guilt; route: psychological cost |
| c2-mem-01 | memory | Compare the ways in which the writers of your two chosen texts explore the unreliability of memory. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | secure | childhood misremembering | self-deception | retrospective narration | AO1/AO2 | prefill theme: memory; route: unreliability |
| c2-mem-02 | memory | Compare the ways in which the writers of your two chosen texts present the burden of the past. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | strong | inescapable history | the shadow of past mistakes | imagery, setting | AO3/AO4 | prefill theme: memory; route: burden of past |
| c2-mem-03 | memory | Compare the ways in which the writers of your two chosen texts explore how characters reconstruct their memories. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | top_band | authorial manipulation | justification of actions | metafiction, framing | AO1/AO4 | prefill theme: memory; route: reconstruction |
| c2-imag-01 | imagination | Compare the ways in which the writers of your two chosen texts present the value of imagination. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | secure | imagination as escape | fancy versus fact | contrast, setting | AO3/AO4 | prefill theme: imagination; route: value of fancy |
| c2-imag-02 | imagination | Compare the ways in which the writers of your two chosen texts explore the dangers of an active imagination. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | strong | misreading reality | destructive fantasies | focalisation, irony | AO1/AO2 | prefill theme: imagination; route: dangerous fancy |
| c2-imag-03 | imagination | Compare the ways in which the writers of your two chosen texts present the conflict between fact and imagination. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | top_band | ideological clash | emotional truth | juxtaposition, semantic field | AO1/AO4 | prefill theme: imagination; route: fact vs fancy |
| c2-war-01 | violence/war | Compare the ways in which the writers of your two chosen texts present the impact of war and conflict. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | secure | physical destruction | psychological trauma | imagery, setting | AO3/AO4 | prefill theme: violence/war; route: physical impact |
| c2-war-02 | violence/war | Compare the ways in which the writers of your two chosen texts explore structural violence. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | strong | industrial machinery | state apparatus | motif, contrast | AO1/AO4 | prefill theme: violence/war; route: structural violence |
| c2-war-03 | violence/war | Compare the ways in which the writers of your two chosen texts present the psychological effects of violence. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | top_band | internalised trauma | desensitisation | interior monologue, focalisation | AO1/AO2 | prefill theme: violence/war; route: psychological effect |
| c2-set-01 | setting/place | Compare the ways in which the writers of your two chosen texts make use of setting to reflect character. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | secure | domestic interiors | industrial landscapes | setting, imagery | AO1/AO2 | prefill theme: setting/place; route: character reflection |
| c2-set-02 | setting/place | Compare the ways in which the writers of your two chosen texts present hostile environments. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | strong | oppressive institutions | chaos of war | semantic field, contrast | AO3/AO4 | prefill theme: setting/place; route: hostile spaces |
| c2-set-03 | setting/place | Compare the ways in which the writers of your two chosen texts explore the significance of domestic spaces. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | top_band | false sanctuaries | spaces of confinement | symbolism, focalisation | AO1/AO4 | prefill theme: setting/place; route: domestic spaces |
| c2-rel-01 | relationships | Compare the ways in which the writers of your two chosen texts present romantic relationships. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | secure | love as rebellion | constrained affection | dialogue, motif | AO3/AO4 | prefill theme: relationships; route: romance |
| c2-rel-02 | relationships | Compare the ways in which the writers of your two chosen texts explore betrayal in relationships. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | strong | familial betrayal | class loyalty vs love | irony, narrative perspective | AO1/AO2 | prefill theme: relationships; route: betrayal |
| c2-rel-03 | relationships | Compare the ways in which the writers of your two chosen texts present the failure of communication. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | top_band | silences | misinterpretations | dialogue, free indirect style | AO1/AO4 | prefill theme: relationships; route: communication failure |
| c2-resp-01 | responsibility/morality | Compare the ways in which the writers of your two chosen texts explore moral responsibility. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | secure | accountability | evasion of blame | characterisation, contrast | AO1/AO4 | prefill theme: responsibility; route: moral duty |
| c2-resp-02 | responsibility/morality | Compare the ways in which the writers of your two chosen texts present individuals who fail their moral duties. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | strong | ideological blinders | self-preservation | irony, focalisation | AO1/AO2 | prefill theme: responsibility; route: moral failure |
| c2-resp-03 | responsibility/morality | Compare the ways in which the writers of your two chosen texts explore the difficulty of doing the right thing. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | top_band | systemic obstacles | moral ambiguity | motif, structure | AO3/AO4 | prefill theme: responsibility; route: doing the right thing |
| c2-end-01 | endings | Compare the ways in which the writers of your two chosen texts make use of endings. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | secure | resolution vs ambiguity | narrative closure | structure, endings | AO1/AO4 | prefill theme: endings; route: resolution |
| c2-end-02 | endings | Compare the ways in which the writers of your two chosen texts present the possibility of repair at the end of the novel. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | strong | partial atonement | lingering damage | metafiction, tone | AO1/AO2 | prefill theme: endings; route: possibility of repair |
| c2-end-03 | endings | Compare the ways in which the writers of your two chosen texts explore tragic conclusions. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | top_band | withheld consolation | the limits of authorial power | framing, irony | AO3/AO4 | prefill theme: endings; route: tragic conclusion |
| c2-narr-01 | narrative truth/authorship | Compare the ways in which the writers of your two chosen texts present the act of storytelling. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | secure | storytelling as humanising | storytelling as control | intrusive narrator, motif | AO3/AO4 | prefill theme: narrative truth; route: act of storytelling |
| c2-narr-02 | narrative truth/authorship | Compare the ways in which the writers of your two chosen texts explore the unreliability of narration. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | strong | biased perspective | self-serving memory | retrospective narration | AO1/AO2 | prefill theme: narrative truth; route: unreliability |
| c2-narr-03 | narrative truth/authorship | Compare the ways in which the writers of your two chosen texts present authorial control. You must relate your discussion to relevant contextual factors. | exam-style mock | not official; practice mock | mock bank 2026 | top_band | god-like authors | the ethics of invention | metafiction, frame narrative | AO1/AO4 | prefill theme: narrative truth; route: authorial control |
| c2-stretch-01 | innocence and experience | Compare the ways in which the writers of your two chosen texts explore the transition from innocence to experience. You must relate your discussion to relevant contextual factors. | speculative practice | not official; practice mock | mock bank 2026 | strong | abrupt awakenings | delayed maturation | contrast, focalisation | AO1/AO2 | prefill theme: innocence; route: transition |
| c2-stretch-02 | authority and control | Compare the ways in which the writers of your two chosen texts present figures of authority. You must relate your discussion to relevant contextual factors. | speculative practice | not official; practice mock | mock bank 2026 | secure | hypocritical leaders | flawed fathers | characterisation, dialogue | AO3/AO4 | prefill theme: authority; route: figures of control |
| c2-stretch-03 | social reputation | Compare the ways in which the writers of your two chosen texts explore the importance of social reputation. You must relate your discussion to relevant contextual factors. | speculative practice | not official; practice mock | mock bank 2026 | strong | façade vs reality | the cost of scandal | irony, motif | AO1/AO4 | prefill theme: reputation; route: social standing |
| c2-stretch-04 | suffering | Compare the ways in which the writers of your two chosen texts present human suffering. You must relate your discussion to relevant contextual factors. | speculative practice | not official; practice mock | mock bank 2026 | strong | physical pain | emotional suppression | imagery, semantic field | AO1/AO2 | prefill theme: suffering; route: the nature of pain |
| c2-stretch-05 | secrecy | Compare the ways in which the writers of your two chosen texts explore the destructive nature of secrets. You must relate your discussion to relevant contextual factors. | speculative practice | not official; practice mock | mock bank 2026 | top_band | hidden truths | the burden of keeping a secret | structure, juxtaposition | AO1/AO4 | prefill theme: secrecy; route: destructive secrets |
| c2-stretch-06 | justice/injustice | Compare the ways in which the writers of your two chosen texts present miscarriages of justice. You must relate your discussion to relevant contextual factors. | speculative practice | not official; practice mock | mock bank 2026 | top_band | systemic bias | the failure of the courts | contrast, narrative perspective | AO3/AO4 | prefill theme: justice; route: miscarriage of justice |

## Priority implementation set

| Priority | Question ID | Reason for inclusion | Implementation notes |
|---|---|---|---|
| 1 | c2-class-01 | Essential coverage for 'class' (a highly frequent exam theme). | Implement securely; requires setting up core builder handoff. |
| 2 | c2-edu-01 | Formal education is the central thematic pillar of both texts. | Ensure handoffs point to 'utilitarian' context routes. |
| 3 | c2-child-02 | Explores adult projection, testing nuance beyond plot recall. | Add 'motif' to likely methods array. |
| 4 | c2-fam-02 | Highlights failed guardianship, strong for comparative mapping. | Map to primary route: 'failed guardianship'. |
| 5 | c2-gen-02 | Focuses on female agency, a critical historical context anchor. | High AO3 weight in practice; link to 19th/20th C context. |
| 6 | c2-imag-02 | Explores the darker side of 'fancy' (Briony's misreading). | Link to structural irony routes. |
| 7 | c2-war-02 | Structural violence is essential for top-tier thematic analysis. | Useful for challenging students to link war and industry. |
| 8 | c2-narr-02 | Narrative unreliability is a core requirement for Atonement. | Ensure 'retrospective narration' is tagged. |
| 9 | c2-class-03 | Focus on the working-class voice, demanding sophisticated AO2. | Demands dialect and focalisation methods. |
| 10 | c2-guilt-03 | Psychological cost over time; tests structural understanding. | Tie to endings and retrospective framing. |
| 11 | c2-mem-03 | Authorial manipulation; tests highest conceptual framing. | Metafiction method tag is required. |
| 12 | c2-end-03 | Tragic conclusions and withheld consolation; essential for top grades. | Pair with 'structural framing' route. |

## Mapping to current 5 live questions
The current live Questions page has 5 entries spanning these families:
- **Class**
- **Guilt**
- **Imagination**
- **Childhood**
- **Education**

This draft expands these 5 families from 1 entry each to 3 entries each, offering progressive difficulty (secure, strong, top_band). It also adds the 9 missing Tier 1 themes (family, gender, memory, violence/war, setting/place, relationships, responsibility/morality, endings, narrative truth/authorship), and 6 stretch themes.

## Implementation recommendation
**Local static seed expansion first.** 
Once this docs draft is reviewed, we should expand the `src/data/seed.ts` file with these new questions using clearly labelled source metadata (e.g., source type and authenticity status). This avoids breaking the live Supabase-backed app while enabling robust testing of the new schema in development. Do not execute Supabase migrations until the local seed expansion proves stable.

## Future schema considerations
Future implementation will require adding the following fields to the `questions` table and TypeScript interfaces:
- `source_type` (e.g., 'official past-paper', 'exam-style mock')
- `authenticity_status` (string)
- `year` (string)
- `paper_code` (string)
- `text_pairing` (string)
- `ao_emphasis` (string)
- `builder_handoff_notes` (string)

*No migrations or schema updates are created in this PR.*

## AO compliance assessment
- AO1, AO2, AO3, AO4 only are used throughout the questions, methods, and emphases.
- No AO5 terminology is present in this draft.
- No AO5 schema fields have been proposed.
- No AO5 UI implications are recommended.
Strict Component 2 Prose compliance is maintained.

## Risks
- **Risk of mislabelling exam-style questions as official**: Prevented by the strict use of the "authenticity status" and "source type" fields.
- **Risk of Supabase overriding local seed**: If we add the questions locally, the 5 active live Supabase rows will still override them in production until addressed.
- **Risk of incomplete official past-paper verification**: Mitigated by labelling everything as "exam-style mock" or "speculative practice" until official verification occurs.
- **Risk of too many low-value speculative questions**: Controlled by focusing heavily on Tier 1 recurring themes and limiting stretch themes.
- **Risk of overfitting to predicted themes**: The broad coverage of 14 Tier 1 themes ensures wide, balanced exam preparation.

## What was not changed
- No source files changed.
- No tests changed.
- No migrations created.
- No Supabase writes run.
- No data inserted.
- No AI generation added.
- No AO5 introduced.
