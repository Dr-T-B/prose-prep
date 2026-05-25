import { describe, it, expect } from 'vitest';
import { evaluateParagraph } from './essayValidationEngine';
import { ParagraphValidationErrorCode } from '../types/essayEngine';

describe('essayValidationEngine', () => {
  it('should validate a compliant Level 5 woven paragraph with no errors', () => {
    const validParagraph = 
      'While Dickens employs satirical caricature to codifies the mechanization of Sissy Jupe, McEwan, by contrast, utilizes free indirect discourse to internalize Robbie’s trauma. ' +
      'In Hard Times, the rigid Victorian industrial classroom strips Sissy of her name, symbolising the cold utilitarianism of the era. ' +
      'Conversely, McEwan’s interwar setting presents Dunkirk as a chaotic space where class hegemony is shattered by war, demonstrating how class pre-determines guilt. ' +
      'Both authors construct their narratives to show that a society governed by pure fact or ego collapses under its own pressure.';

    const result = evaluateParagraph({ text: validParagraph });
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.activeFlags.filter(f => f.type !== 'AO2_AO3_SYMBIOSIS_MISSING').length).toBe(0);
    expect(result.structuralScores.overall).toBe(5);
  });

  it('should flag ERR_01 if the opening Umbrella sentence is not comparative', () => {
    const weakUmbrella = 
      'Dickens presents Coketown as an industrial hellscape. ' +
      'In Hard Times, the rigid Victorian industrial classroom strips Sissy of her name, symbolising the cold utilitarianism of the era. ' +
      'Conversely, McEwan, by contrast, utilizes free indirect discourse to internalize Robbie’s trauma. ' +
      'Both authors construct their narratives to show that a society collapses under its own pressure.';

    const result = evaluateParagraph({ text: weakUmbrella });
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === ParagraphValidationErrorCode.ERR_01)).toBe(true);
  });

  it('should flag HISTORY_DUMP if a sentence starts directly with a historical date', () => {
    const historyDump = 
      'While Dickens employs satirical caricature to codifies the mechanization of Sissy Jupe, McEwan, by contrast, utilizes free indirect discourse to internalize Robbie’s trauma. ' +
      'In 1854, the Industrial Revolution was happening. ' +
      'This reflects how the Victorian class system worked.';

    const result = evaluateParagraph({ text: historyDump });
    expect(result.activeFlags.some(f => f.type === 'HISTORY_DUMP')).toBe(true);
  });

  it('should flag HISTORY_SANDWICH if Text A and Text B analysis are in sequential blocks', () => {
    const historySandwich = 
      'While Dickens employs satirical caricature to codifies the mechanization of Sissy Jupe, McEwan, by contrast, utilizes free indirect discourse to internalize Robbie’s trauma. ' +
      'Dickens presents Coketown as a mechanistic hell. Sissy Jupe is victim of Gradgrind. ' +
      'Atonement shows Robbie suffering in the war. Briony Tallis is guilty of lying.';

    const result = evaluateParagraph({ text: historySandwich });
    expect(result.activeFlags.some(f => f.type === 'HISTORY_SANDWICH')).toBe(true);
  });

  it('should flag MIMETIC_FALLACY if context is described as direct mirror without literary method', () => {
    const mimeticFallacy = 
      'While Dickens employs satirical caricature to codifies the mechanization of Sissy Jupe, McEwan, by contrast, utilizes free indirect discourse to internalize Robbie’s trauma. ' +
      'Dickens shows Victorian class structure because Coketown reflects the utilitarian education. ' +
      'This mirrors the historical context of industrial England.';

    const result = evaluateParagraph({ text: mimeticFallacy });
    expect(result.activeFlags.some(f => f.type === 'MIMETIC_FALLACY')).toBe(true);
  });

  it('should flag ERR_03 on sequential connectives or missing comparative pivot', () => {
    const weakConnective = 
      'While Dickens employs satirical caricature to codifies the mechanization of Sissy Jupe, McEwan, by contrast, utilizes free indirect discourse to internalize Robbie’s trauma. ' +
      'Firstly, Dickens presents Coketown as a hellscape. ' +
      'Secondly, McEwan presents France as a war zone.';

    const result = evaluateParagraph({ text: weakConnective });
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === ParagraphValidationErrorCode.ERR_03)).toBe(true);
    expect(result.errors.find(e => e.code === ParagraphValidationErrorCode.ERR_03)?.message).toContain('Weak sequential connective');
  });

  it('should flag ERR_05 on speculative hedges', () => {
    const speculativeHedge = 
      'While Dickens employs satirical caricature to codifies the mechanization of Sissy Jupe, McEwan, by contrast, utilizes free indirect discourse to internalize Robbie’s trauma. ' +
      'This might suggest that Dickens is criticizing Utilitarianism, which could possibly be true.';

    const result = evaluateParagraph({ text: speculativeHedge });
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === ParagraphValidationErrorCode.ERR_05)).toBe(true);
  });

  it('should flag ERR_02 and ERR_04 if Text A or Text B are completely missing', () => {
    const missingTextA = 
      'While McEwan utilizes free indirect discourse to internalize Robbie’s trauma, the narrative is constructed to show class guilt. ' +
      'McEwan’s interwar setting presents Dunkirk as a chaotic space where class hegemony is shattered by war.';

    const result = evaluateParagraph({ text: missingTextA });
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === ParagraphValidationErrorCode.ERR_02)).toBe(true);
  });
});
