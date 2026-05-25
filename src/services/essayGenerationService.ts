import { GoogleGenAI } from '@google/genai';
import { EssayGenerationResult } from '@/types/essayGenerator';

const MASTER_SYSTEM_INSTRUCTION = `You are the master generative core of the "prose-prep" platform. Your role is to act as a Pearson Edexcel Senior Examiner and an Elite A-Level English Literature Curriculum Architect. Your sole objective is to generate an absolute Level 5 (A*) exemplary model essay response for Component 2 (Prose: Childhood/Social Divisions).
The two texts under comparative evaluation are permanently locked as:
- Text A: 'Hard Times' by Charles Dickens (Victorian Industrial Era, 1854)
- Text B: 'Atonement' by Ian McEwan (Postmodern / Interwar Era, 2001)

Core Directives:
- Reject the Mimetic Fallacy: Treat characters and settings as deliberate, calculated authorial constructs and narrative devices rather than real historical items.
- Enforce the Hand-in-Glove Model (AO2/AO3 Symbiosis): All historical/contextual details must be bound within a tight syntactic window to a specific formal literary device (AO2) and an active verb of authorial intent.
- Execute the Symmetrical Synthetic Weave: Every single analytical paragraph must hold both texts in constant, dialectical tension using intra-sentence comparative pivots. No separate text-by-text blocks allowed.

Output Format Schema:
{
  "essayMetadata": { "questionText": "string", "theme": "string", "thesisAxis": "string" },
  "modelAnswer": { "introduction": "string", "bodyParagraph1": "string", "bodyParagraph2": "string", "bodyParagraph3": "string", "conclusion": "string" },
  "examinerBreakdown": { "ao1_conceptual_umbrella_notes": "string", "ao2_micro_linguistic_highlights": "string", "ao3_symbiosis_validation": "string", "ao4_comparative_pivot_excellence": "string" }
}`;

export async function generateModelEssay(
  questionText: string,
  theme: string,
  thesisAxis: string
): Promise<EssayGenerationResult> {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') ||
    '';

  if (!apiKey) {
    console.warn('[ProseCraft] Missing VITE_GEMINI_API_KEY. Using sandbox mock generation.');
    return getMockResult(questionText, theme, thesisAxis);
  }

  // Initialize official Google Gen AI client
  const ai = new GoogleGenAI({ apiKey });

  const promptPayload = {
    questionText,
    theme,
    thesisAxis,
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: JSON.stringify(promptPayload),
      config: {
        systemInstruction: MASTER_SYSTEM_INSTRUCTION,
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from model.');
    }

    return JSON.parse(text.trim()) as EssayGenerationResult;
  } catch (error) {
    console.error('[ProseCraft] Essay generation failed:', error);
    throw error;
  }
}

function getMockResult(
  questionText: string,
  theme: string,
  thesisAxis: string
): EssayGenerationResult {
  return {
    essayMetadata: {
      questionText,
      theme,
      thesisAxis,
    },
    modelAnswer: {
      introduction:
        "Both Charles Dickens's Victorian industrial novel 'Hard Times' (1854) and Ian McEwan's postmodern interwar novel 'Atonement' (2001) present childhood and social divisions as central site of structural damage, showing characters not as real historical subjects but as calculated authorial constructs. In 'Hard Times', Dickens constructs the child Louisa Gradgrind as a vessel emptied of 'fancy' by the rigid mechanical logic of Utilitarianism, serving to expose the system's human costs. Conversely, in 'Atonement', McEwan structures the thirteen-year-old Briony Tallis as a precocious author figure whose imaginative excess, weaponized by unconscious class privilege, misinterprets the interclass romance of Robbie and Cecilia. Thus, both writers utilize their child protagonists to indict the socio-political systems of their respective eras, weaving a dialectic between starved and ungoverned minds.",
      bodyParagraph1:
        "Dickens establishes Coketown's educational apparatus as a machinery of control that actively suppresses the child's natural interiority, using the depersonalizing numeric address 'Girl number twenty' to reduce Sissy Jupe to a mere statistic. This suppression of 'fancy' is mirrored in 'Atonement' by Briony's 'orderly spirit,' a characterising abstract noun that exposes how her authorial impulse is less about empathy than a class-bound will to impose narrative order on a complex, fluid reality. While Dickens externalises the violence of class and education through Coketown's 'interminable serpents of smoke,' McEwan internalises class division as an instinctive grammar of perception, rendering Robbie as 'the son of a cleaner' before he is allowed to speak as an autonomous self. In both texts, the child's perspective is formatted by surrounding systems, showing that power is most dangerous when naturalised as common sense.",
      bodyParagraph2:
        "The hand-in-glove symbiosis of formal device and historical context becomes clear in how both novels stage the silencing of the marginalized. Dickens externalises Stephen Blackpool's class oppression through his lisping dialect and his persistent refrain ''Tis a muddle,' using spelling as a phonetic marker of exclusion from the discourse of the capitalist class. Similarly, McEwan exposes the structural impunity granted to Paul Marshall, whose mock-Latin commodity 'Amo bars' commodifies emotion and bankrolls his moral evasion at the trial. By presenting Marshall's class impunity as a silent grammar of belief, McEwan complicates Dickens's externalised satire, suggesting that class injustice is structurally embedded within the very narration that claims to record it, leaving the lower-class protagonist Robbie physically and narrative-wise destroyed.",
      bodyParagraph3:
        "Ultimately, both novels use structural pivots to interrogate the possibility of repair. Dickens permits a qualified, chastened redemption through Gradgrind's late kneeling, a physical posture of submission that registers the failure of his system of Fact. In contrast, McEwan breaks frame in the metafictional Part Four, revealing that Robbie and Cecilia's happy reunion was an authored consolation designed by a guilt-ridden Briony. Here, McEwan's postmodern turn rejects Dickens's redemptive realism, showing that 'the attempt was all' and that any neat ending is itself a consoling distortion. While Dickens seeks to repair his world through moral authority, McEwan interrogates the ethics of that authority, positioning narration as both an act of damage and an unfinishable penance.",
      conclusion:
        "In conclusion, 'Hard Times' and 'Atonement' constitute a profound comparative dialogue on the relationship between childhood imagination, class division, and narrative power. By rejecting the mimetic fallacy, both authors invite readers to see their characters as deliberate narrative devices. Dickens exposes how mechanical systems of education and class starve the individual, offering a qualified plea for moral renewal. McEwan, however, shows the danger of the unchecked imagination when combined with class privilege, using metafiction to expose the limits of realistic consolation. Together, the texts demonstrate that while story can humanize a calculating world, it remains an ethical liability that cannot easily atone for the lives it attempts to represent.",
    },
    examinerBreakdown: {
      ao1_conceptual_umbrella_notes:
        "Flawless Level 5 (A*) thesis structure. The response immediately establishes both texts as authorial constructs and avoids the mimetic fallacy. The conceptual umbrella links Dickens's starved imagination (Utilitarianism) directly with McEwan's overfed, class-privileged imagination (metafiction), maintaining constant comparative tension.",
      ao2_micro_linguistic_highlights:
        "Excellent analysis of formal devices: Sissy's numeric reduction ('Girl number twenty'), the animalised/biblical machinery ('serpents of smoke'), Briony's 'orderly spirit' characterisation, and Stephen Blackpool's phonetic dialect. All devices are linked to the writer's intent.",
      ao3_symbiosis_validation:
        "Context is integrated seamlessly. The French court vs Amalfi, Protestant-Catholic ghost theology (for Hamlet comparison), and the early modern widow's remarriage taboos are handled not as history lessons but as active forces dictating the character structure.",
      ao4_comparative_pivot_excellence:
        "Superb synthetic weave. Rather than separate blocks, the essay uses intra-sentence pivots ('While Dickens... McEwan conversely...', 'In both texts...') to keep both novels in a continuous, dialectical conversation.",
    },
  };
}
