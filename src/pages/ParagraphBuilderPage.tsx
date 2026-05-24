import { useMemo, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import type { ParagraphBuilderContext } from '@/types/thesisRoutes';
import { useGradeBMode } from '@/contexts/GradeBModeContext';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  BookOpen, 
  Quote, 
  History, 
  Award,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

const PIVOT_STEMS = [
  {
    stem: "While Dickens employs satirical caricature to [HT method]..., McEwan, by contrast, utilizes...",
    label: "Contrastive Method"
  },
  {
    stem: "Underneath Dickens's satirical presentation of [theme] lies a critique of..., whereas McEwan constructs a more introspective exploration of...",
    label: "Theme Contrast"
  },
  {
    stem: "In both texts, the presentation of [theme] is mediated by narrative voice; however, while Dickens uses an intrusive narrator to..., McEwan relies on focalisation to...",
    label: "Narrative Voice Pivot"
  },
  {
    stem: "Whereas Dickens externalises this conflict in the industrial landscape of Coketown, McEwan internalises the tension within...",
    label: "Setting vs. Internalisation"
  }
];

const GRADE_B_STEMS = [
  {
    stem: "Both Hard Times and Atonement explore [theme] in order to show...",
    label: "Basic Topic Sentence"
  },
  {
    stem: "Dickens uses [method] in [quote] to suggest...",
    label: "Basic Dickens Analysis"
  },
  {
    stem: "McEwan, by contrast, uses [method] in [quote] to show...",
    label: "Basic McEwan Analysis"
  },
  {
    stem: "This reflects the historical context of [context] because...",
    label: "Basic Context Connection"
  }
];

async function fetchContext(params: { quotePairId: string | null }) {
  const { quotePairId } = params;

  if (!quotePairId) return null;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(quotePairId);
  const query = supabase.from('quote_pairs').select('*');
  const { data, error } = isUuid
    ? await query.eq('id', quotePairId).maybeSingle()
    : await query.eq('quote_pair_code', quotePairId).maybeSingle();

  if (error) throw error;
  return data as ParagraphBuilderContext | null;
}

export default function ParagraphBuilderPage() {
  const { gradeBMode } = useGradeBMode();
  const [searchParams] = useSearchParams();
  const quotePairId = searchParams.get('quotePairId');

  const { data: context, error: contextError, isLoading } = useQuery({
    queryKey: ['context', quotePairId],
    queryFn: () => fetchContext({ quotePairId }),
    enabled: !!quotePairId,
  });

  const [paragraphText, setParagraphText] = useState('');
  const [saving, setSaving] = useState(false);
  const [showStems, setShowStems] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setParagraphText(prev => prev + textToInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    const newText = currentText.substring(0, start) + textToInsert + currentText.substring(end);
    setParagraphText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  // Real-time AO Coverage Calculator
  const aoStatus = useMemo(() => {
    const normalized = paragraphText.toLowerCase();

    // AO1: Thesis / Academic Arg verbs
    const ao1Verbs = [
      'suggest', 'demonstrate', 'expose', 'critique', 'present', 
      'argue', 'illustrate', 'reflect', 'embody', 'signify', 
      'delineate', 'portray', 'juxtapose', 'subvert', 'reinforce'
    ];
    const hasAo1Verb = ao1Verbs.some(v => normalized.includes(v));
    const hasAo1MinLength = paragraphText.trim().length >= 35;
    const ao1 = hasAo1Verb && hasAo1MinLength;

    // AO2: Close Reading & Quotation snippet + method keyword
    const htQuotePart = context?.hard_times_quote 
      ? context.hard_times_quote.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).slice(0, 3).join(' ') 
      : '';
    const atQuotePart = context?.atonement_quote 
      ? context.atonement_quote.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).slice(0, 3).join(' ') 
      : '';

    const cleanText = normalized.replace(/[^a-z0-9\s]/g, '');
    const hasHtQuote = htQuotePart ? cleanText.includes(htQuotePart) : false;
    const hasAtQuote = atQuotePart ? cleanText.includes(atQuotePart) : false;

    const literaryMethods = [
      'metaphor', 'satire', 'focalisation', 'narrative', 'symbol', 
      'imagery', 'diction', 'motif', 'allegory', 'irony', 
      'characterisation', 'focalizer', 'narrator', 'dialogue', 
      'syntax', 'free indirect', 'voice', 'focalised'
    ];
    const hasMethodKeyword = literaryMethods.some(m => normalized.includes(m));

    const ao2 = (hasHtQuote || hasAtQuote) && hasMethodKeyword;

    // AO3: Socio-political Context integration
    const contextKeywords = [
      'industrial', 'utilitarian', 'victorian', 'war', 'class', 
      '1854', '1935', 'social', 'historical', 'context', 
      'society', 'ideology', 'gender', 'bourgeois', 'proletariat', 
      'dunkirk', 'england', 'education', 'twenties', 'thirties', 
      'modernism', 'realism', 'socio-political', 'laissez-faire'
    ];
    const hasContextKeyword = contextKeywords.some(c => normalized.includes(c));
    const ao3 = hasContextKeyword;

    // AO4: Comparative Synthesis
    const comparativeTransitions = [
      'whereas', 'while', 'by contrast', 'however', 'conversely', 
      'similarly', 'on the other hand', 'contrasts', 'parallel', 
      'unlike', 'comparatively', 'in contrast', 'diverges', 'echoes'
    ];
    const hasComparativeTransition = comparativeTransitions.some(c => normalized.includes(c));
    const ao4 = hasComparativeTransition;

    return {
      ao1: { 
        satisfied: ao1, 
        details: ao1 
          ? "Academic argument verb detected" 
          : "Write at least 35 characters and include analytical verbs (e.g., 'critiques', 'subverts')" 
      },
      ao2: { 
        satisfied: ao2, 
        details: ao2 
          ? "Target quote snippet & literary method keyword detected" 
          : "Include a quote from Hard Times or Atonement and describe narrative methods (e.g. 'focalisation', 'satire')" 
      },
      ao3: { 
        satisfied: ao3, 
        details: ao3 
          ? "Historical context keywords detected" 
          : "Integrate socio-political context terms (e.g., 'utilitarian', 'industrial', 'war', 'class')" 
      },
      ao4: { 
        satisfied: ao4, 
        details: ao4 
          ? "Comparative pivot transition detected" 
          : "Use comparative transitions (e.g., 'whereas', 'by contrast', 'conversely')" 
      },
      hasHtQuote,
      hasAtQuote
    };
  }, [paragraphText, context]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const studentId = userData.user?.id;

      if (userError) throw userError;
      if (!studentId) throw new Error('You must be signed in to save paragraph progress.');
      if (!context?.id) throw new Error('Choose a quote pair before saving paragraph progress.');

      // Save complete paragraph into final_paragraph
      const { error: attemptError } = await supabase.from('paragraph_attempts').insert({
        student_id: studentId,
        quote_pair_id: context.id,
        topic_sentence: paragraphText.split(/[.!?]/)[0] || '', // Extract first sentence as topic sentence
        hard_times_analysis: aoStatus.hasHtQuote ? 'Included quote in woven paragraph' : '',
        atonement_analysis: aoStatus.hasAtQuote ? 'Included quote in woven paragraph' : '',
        ao4_comparison: aoStatus.ao4.satisfied ? 'Woven comparative transitions used' : '',
        ao3_context_integration: aoStatus.ao3.satisfied ? 'Context terms integrated' : '',
        interpretive_judgement: 'Level 5 Woven synthesis draft',
        final_paragraph: paragraphText,
        draft_status: 'complete',
      });

      if (attemptError) throw attemptError;

      // Update mastery statistics
      const { data: existing, error: existingError } = await supabase
        .from('student_quote_pair_mastery')
        .select('*')
        .eq('student_id', studentId)
        .eq('quote_pair_id', context.id)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existing) {
        const { error: updateError } = await supabase.from('student_quote_pair_mastery').update({
          used_in_paragraph_count: (existing.used_in_paragraph_count || 0) + 1,
          mastery_status: 'paragraph_ready',
          last_practised_at: new Date().toISOString(),
          needs_review: false,
        }).eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('student_quote_pair_mastery').insert({
          student_id: studentId,
          quote_pair_id: context.id,
          used_in_paragraph_count: 1,
          mastery_status: 'paragraph_ready',
          last_practised_at: new Date().toISOString(),
        });

        if (insertError) throw insertError;
      }

      toast.success('Woven paragraph saved and progress tracked.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save paragraph progress.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const contextErrorMessage = contextError instanceof Error ? contextError.message : null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center border-b pb-4 border-slate-200">
        <div>
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
            Paragraph Workspace (Woven Synthesized Model)
          </Badge>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">Comparative Paragraph Builder</h1>
          <p className="text-slate-500 text-sm">Draft dynamic, woven Level 5 (A*) paragraphs instead of history sandwiches.</p>
        </div>
        <Button onClick={handleSave} disabled={saving || !context} className="bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm transition-all duration-200">
          {saving ? 'Saving...' : 'Save & Track Progress'}
        </Button>
      </div>

      {!quotePairId && (
        <Card className="border-amber-300 bg-amber-50/50">
          <CardContent className="pt-6 text-sm text-amber-800 flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            Open this builder from a dashboard recommendation or quote-pair route so progress can be tracked.
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card className="animate-pulse">
          <CardContent className="pt-6 text-sm text-slate-400">Loading quote pair context...</CardContent>
        </Card>
      )}

      {contextErrorMessage && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="pt-6 text-sm text-destructive-foreground">{contextErrorMessage}</CardContent>
        </Card>
      )}

      {quotePairId && !isLoading && !contextErrorMessage && !context && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="pt-6 text-sm text-destructive-foreground">
            This quote pair could not be found.
          </CardContent>
        </Card>
      )}

      {context && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Reference panel */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-slate-500 tracking-wider">
                    PAIR CODE: {context.quote_pair_code}
                  </span>
                  <Badge variant="outline" className="border-slate-300 text-slate-600">
                    {context.theme_label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Quotes */}
                <div className="space-y-3">
                  <div className="rounded-lg border border-indigo-100 bg-indigo-50/20 p-3 relative group">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-indigo-700 tracking-wide uppercase">Hard Times (Dickens)</span>
                      <span className="text-[11px] font-medium text-slate-500 italic">{context.hard_times_method}</span>
                    </div>
                    <blockquote className="text-sm font-serif text-slate-700 italic border-l-2 border-indigo-400 pl-2">
                      "{context.hard_times_quote}"
                    </blockquote>
                    <Button 
                      onClick={() => insertAtCursor(`"${context.hard_times_quote}"`)}
                      variant="ghost" 
                      size="sm"
                      className="mt-2 w-full justify-start text-[11px] text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 font-medium py-1 h-7 border border-indigo-100"
                    >
                      <Quote className="h-3.5 w-3.5 mr-1" /> Use Dickens Quote
                    </Button>
                  </div>

                  <div className="rounded-lg border border-rose-100 bg-rose-50/20 p-3 relative group">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-rose-700 tracking-wide uppercase">Atonement (McEwan)</span>
                      <span className="text-[11px] font-medium text-slate-500 italic">{context.atonement_method}</span>
                    </div>
                    <blockquote className="text-sm font-serif text-slate-700 italic border-l-2 border-rose-400 pl-2">
                      "{context.atonement_quote}"
                    </blockquote>
                    <Button 
                      onClick={() => insertAtCursor(`"${context.atonement_quote}"`)}
                      variant="ghost" 
                      size="sm"
                      className="mt-2 w-full justify-start text-[11px] text-rose-700 hover:text-rose-800 hover:bg-rose-50 font-medium py-1 h-7 border border-rose-100"
                    >
                      <Quote className="h-3.5 w-3.5 mr-1" /> Use McEwan Quote
                    </Button>
                  </div>
                </div>

                {/* Synthesis and Context */}
                {context.how_they_compare && (
                  <div className="pt-2 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                      <Award className="h-3.5 w-3.5 text-amber-500" />
                      AO4 Comparative Pivot (Synthesis)
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                      {context.how_they_compare}
                    </p>
                  </div>
                )}

                {context.ao3_historical_context && (
                  <div className="pt-2 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                      <History className="h-3.5 w-3.5 text-indigo-500" />
                      AO3 Contextual Landscape
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {context.ao3_historical_context}
                    </p>
                  </div>
                )}

                {context.interpretive_tension && (
                  <div className="pt-2 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                      Interpretive Tension
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed italic bg-emerald-50/30 p-2.5 rounded border border-emerald-100/50">
                      {context.interpretive_tension}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assessment Objectives Guidelines */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="py-3 bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-emerald-600" />
                  AO Target Progress Check
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="space-y-2.5">
                  {/* AO1 */}
                  <div className="flex items-start gap-2.5 text-xs">
                    {aoStatus.ao1.satisfied ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-semibold ${aoStatus.ao1.satisfied ? 'text-emerald-700' : 'text-slate-600'}`}>
                        AO1: Formulate Sophisticated Thesis
                      </p>
                      <p className="text-slate-500 leading-tight text-[11px]">{aoStatus.ao1.details}</p>
                    </div>
                  </div>

                  {/* AO2 */}
                  <div className="flex items-start gap-2.5 text-xs">
                    {aoStatus.ao2.satisfied ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-semibold ${aoStatus.ao2.satisfied ? 'text-emerald-700' : 'text-slate-600'}`}>
                        AO2: Analyze Narrative Methods
                      </p>
                      <p className="text-slate-500 leading-tight text-[11px]">{aoStatus.ao2.details}</p>
                    </div>
                  </div>

                  {/* AO3 */}
                  <div className="flex items-start gap-2.5 text-xs">
                    {aoStatus.ao3.satisfied ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-semibold ${aoStatus.ao3.satisfied ? 'text-emerald-700' : 'text-slate-600'}`}>
                        AO3: Hand-in-Glove Context
                      </p>
                      <p className="text-slate-500 leading-tight text-[11px]">{aoStatus.ao3.details}</p>
                    </div>
                  </div>

                  {/* AO4 */}
                  <div className="flex items-start gap-2.5 text-xs">
                    {aoStatus.ao4.satisfied ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-semibold ${aoStatus.ao4.satisfied ? 'text-emerald-700' : 'text-slate-600'}`}>
                        AO4: Continuous Comparative Weave
                      </p>
                      <p className="text-slate-500 leading-tight text-[11px]">{aoStatus.ao4.details}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Writing Workspace */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="py-4 bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-1.5 text-slate-800">
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                    Woven Analysis Workspace
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Weave comparisons continuously between Dickens and McEwan. Avoid the standard sequential "sandwich".
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <textarea
                  ref={textareaRef}
                  value={paragraphText}
                  onChange={(e) => setParagraphText(e.target.value)}
                  className="min-h-[300px] w-full border border-slate-200 rounded-md p-4 text-sm font-sans text-slate-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                  placeholder="Draft your synthesized comparative paragraph here..."
                />

                {/* Stems Toggle */}
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setShowStems(!showStems)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      Comparative Pivot Starters
                    </span>
                    <ChevronRight className={`h-4 w-4 transform transition-transform ${showStems ? 'rotate-90' : ''}`} />
                  </button>

                  {showStems && (
                    <div className="p-3 bg-white border-t border-slate-100 grid grid-cols-1 gap-2">
                      {(gradeBMode ? GRADE_B_STEMS : PIVOT_STEMS).map((item, i) => (
                        <button
                          key={i}
                          onClick={() => insertAtCursor(item.stem)}
                          className="text-left p-2.5 rounded border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 text-xs leading-relaxed transition-all group"
                        >
                          <span className="font-semibold text-indigo-700 block mb-0.5 group-hover:text-indigo-800">
                            {item.label}
                          </span>
                          <span className="text-slate-600 font-serif italic">"{item.stem}"</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Assembled preview */}
            <Card className="border-slate-200 shadow-sm bg-slate-50/50">
              <CardHeader className="py-3 border-b border-slate-100">
                <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Live Assembled Paragraph Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {paragraphText ? (
                  <p className="text-sm text-slate-700 font-sans leading-relaxed whitespace-pre-wrap">
                    {paragraphText}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic font-sans">
                    Start drafting in the workspace above to see your final comparative weave preview.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
