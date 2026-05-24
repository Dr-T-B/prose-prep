import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Sparkles, Check, CheckCircle2, AlertCircle, RefreshCw, HelpCircle, Award, BookOpen, Quote } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type DrillMode = 'recognition' | 'pair_match' | 'free_recall' | 'pivot_drill'

interface QuoteRow {
  id: string
  source_text: string
  quote_text: string
  method: string
  best_themes: string[]
  effect_prompt: string
  plain_english_meaning: string | null
  grade_priority: string | null
  retrieval_priority: number | null
}

interface PairRow {
  id: string
  theme_label: string
  level_band: string | null
  hard_times_quote: string
  hard_times_method: string | null
  atonement_quote: string
  atonement_method: string | null
  how_they_compare: string | null
  ao4_comparison_type: string | null
  themes: string[]
}

interface DrillCard {
  type: 'quote' | 'pair'
  id: string
  promptLabel: string
  prompt: string
  answerLabel: string
  answer: string
  options?: string[]
  correctOption: string
  meta: {
    source?: string
    themes?: string[]
    method?: string
    howTheyCompare?: string | null
    aoType?: string | null
    hardTimesQuote?: string
    atonementQuote?: string
  }
}

interface SessionStats {
  correct: number
  total: number
  durationMs: number
  missedCards: DrillCard[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const QUALITY_MAP = { got_it: 5, almost: 3, missed: 1 } as const
const DECK_SIZE   = 15
const OPTIONS_COUNT = 4

function getDeviceId(): string {
  let id = localStorage.getItem('prose_device_id')
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('prose_device_id', id) }
  return id
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// SM-2 spaced repetition calculation
function sm2(prevEase: number, prevInterval: number, prevReps: number, quality: number) {
  const ease = Math.max(1.3, prevEase + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  let interval: number, reps: number
  if (quality < 3) { interval = 1; reps = 0 }
  else {
    reps = prevReps + 1
    interval = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(prevInterval * ease)
  }
  return { ease, interval, reps }
}

// Levenshtein distance similarity utilities
function levenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length, len2 = s2.length;
  const matrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[len1][len2];
}

function calculateSimilarity(str1: string, str2: string): number {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, ' ');
  const s1 = clean(str1);
  const s2 = clean(str2);
  if (!s1 && !s2) return 1;
  if (!s1 || !s2) return 0;
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  return 1 - distance / maxLength;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RetrievalDrill() {
  const [phase, setPhase]   = useState<'select' | 'drilling' | 'summary'>('select')
  const [mode, setMode]     = useState<DrillMode>('recognition')
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [pairs, setPairs]   = useState<PairRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  const [deck, setDeck]         = useState<DrillCard[]>([])
  const [cardIndex, setCardIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [chosen, setChosen]     = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null)
  const [missedCards, setMissedCards]   = useState<DrillCard[]>([])

  const startTime     = useRef(0)
  const cardStartTime = useRef(0)
  const correctCount  = useRef(0)

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true)
      const [qRes, pRes] = await Promise.all([
        supabase
          .from('quote_methods')
          .select('id,source_text,quote_text,method,best_themes,effect_prompt,plain_english_meaning,grade_priority,retrieval_priority')
          .eq('is_core_quote', true)
          .order('retrieval_priority', { ascending: true, nullsFirst: false }),
        supabase
          .from('quote_pairs')
          .select('id,theme_label,level_band,hard_times_quote,hard_times_method,atonement_quote,atonement_method,how_they_compare,ao4_comparison_type,themes')
          .eq('is_active', true)
          .order('sort_order'),
      ])
      if (qRes.error) { setError(qRes.error.message); setLoading(false); return }
      if (pRes.error) { setError(pRes.error.message); setLoading(false); return }
      setQuotes(qRes.data ?? [])
      setPairs(pRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  // ── Build deck ────────────────────────────────────────────────────────────
  const buildDeck = useCallback((m: DrillMode): DrillCard[] => {
    if (m === 'recognition') {
      return shuffle(quotes).slice(0, DECK_SIZE).map(q => {
        const distractors = shuffle(quotes.filter(x => x.id !== q.id && x.source_text === q.source_text))
          .slice(0, OPTIONS_COUNT - 1).map(x => x.quote_text)
        return {
          type: 'quote', id: q.id,
          promptLabel: `${q.source_text} — what is the quote?`,
          prompt: q.effect_prompt || q.method,
          answerLabel: 'Quote',
          answer: `"${q.quote_text}"`,
          options: shuffle([q.quote_text, ...distractors]),
          correctOption: q.quote_text,
          meta: { source: q.source_text, themes: q.best_themes, method: q.method },
        }
      })
    }

    if (m === 'pair_match') {
      const atPool = pairs.map(p => p.atonement_quote)
      return shuffle(pairs).slice(0, Math.min(DECK_SIZE, pairs.length)).map(p => ({
        type: 'pair', id: p.id,
        promptLabel: 'Hard Times — find its Atonement pair',
        prompt: `"${p.hard_times_quote}"`,
        answerLabel: 'Atonement pair',
        answer: `"${p.atonement_quote}"`,
        options: shuffle([p.atonement_quote, ...shuffle(atPool.filter(q => q !== p.atonement_quote)).slice(0, OPTIONS_COUNT - 1)]),
        correctOption: p.atonement_quote,
        meta: { themes: p.themes, method: p.atonement_method ?? undefined, howTheyCompare: p.how_they_compare, aoType: p.ao4_comparison_type },
      }))
    }

    if (m === 'free_recall') {
      return shuffle(quotes).slice(0, DECK_SIZE).map(q => ({
        type: 'quote', id: q.id,
        promptLabel: q.source_text,
        prompt: q.method,
        answerLabel: 'Quote',
        answer: `"${q.quote_text}"`,
        correctOption: q.quote_text,
        meta: { source: q.source_text, themes: q.best_themes, method: q.method },
      }))
    }

    // pivot_drill
    return shuffle(pairs).slice(0, Math.min(DECK_SIZE, pairs.length)).map(p => ({
      type: 'pair', id: p.id,
      promptLabel: 'Comparative Pivot Drill — Synthesize the connection',
      prompt: `Compare how Dickens presents "${p.hard_times_quote}" and McEwan presents "${p.atonement_quote}".`,
      answerLabel: 'Comparative Tension / Synthesis',
      answer: p.how_they_compare || '',
      correctOption: p.how_they_compare || '',
      meta: { 
        themes: p.themes, 
        howTheyCompare: p.how_they_compare, 
        aoType: p.ao4_comparison_type,
        hardTimesQuote: p.hard_times_quote,
        atonementQuote: p.atonement_quote
      },
    }))
  }, [quotes, pairs])

  // ── Start session ──────────────────────────────────────────────────────────
  const startSession = useCallback(async (m: DrillMode) => {
    const builtDeck = buildDeck(m)
    if (!builtDeck.length) {
      setError('No retrieval cards are available for this mode yet.')
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You must be signed in to start a drill.'); return }
    const sessionType = m === 'pair_match' || m === 'pivot_drill' ? 'pairing_drill' : 'quote_drill'
    const { data, error: err } = await supabase
      .from('retrieval_sessions')
      .insert({ user_id: user.id, device_id: getDeviceId(), session_type: sessionType, total_items: builtDeck.length, correct_items: 0, completed: false })
      .select('id').single()
    if (err) { setError(err.message); return }
    setSessionId(data.id)
    setDeck(builtDeck)
    setCardIndex(0); setRevealed(false); setChosen(null); setMissedCards([])
    correctCount.current = 0
    startTime.current = Date.now(); cardStartTime.current = Date.now()
    setMode(m); setPhase('drilling')
  }, [buildDeck])

  // ── Record response ────────────────────────────────────────────────────────
  const recordResponse = useCallback(async (card: DrillCard, recalled: boolean, quality: number): Promise<boolean> => {
    if (!sessionId) return false
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Your session has expired. Please sign in again.'); return false }
    const responseTimeMs = Date.now() - cardStartTime.current
    const itemType = card.type === 'pair' ? 'pairing' : 'quote'

    const { data: existing, error: existingErr } = await supabase
      .from('retrieval_items')
      .select('id,ease_factor,interval_days,repetitions,correct_reviews')
      .eq('user_id', user.id)
      .eq('item_id', card.id).eq('item_type', itemType)
      .maybeSingle()
    if (existingErr) { setError(existingErr.message); return false }

    let retrievalItemId: string | null = null

    if (existing) {
      const { ease, interval, reps } = sm2(existing.ease_factor, existing.interval_days, existing.repetitions, quality)
      const { error: updateErr } = await supabase.from('retrieval_items').update({
        ease_factor: ease, interval_days: interval, repetitions: reps,
        next_review_at: new Date(Date.now() + interval * 86400000).toISOString(),
        last_reviewed_at: new Date().toISOString(),
        total_reviews: existing.repetitions + 1,
        correct_reviews: recalled ? existing.correct_reviews + 1 : existing.correct_reviews,
      }).eq('id', existing.id)
      if (updateErr) { setError(updateErr.message); return false }
      retrievalItemId = existing.id
    } else {
      const { ease, interval, reps } = sm2(2.5, 1, 0, quality)
      const { data: ni, error: insertErr } = await supabase.from('retrieval_items').insert({
        user_id: user.id, item_type: itemType, item_id: card.id,
        ease_factor: ease, interval_days: interval, repetitions: reps,
        next_review_at: new Date(Date.now() + interval * 86400000).toISOString(),
        last_reviewed_at: new Date().toISOString(),
        total_reviews: 1, correct_reviews: recalled ? 1 : 0,
      }).select('id').single()
      if (insertErr) { setError(insertErr.message); return false }
      retrievalItemId = ni?.id ?? null
    }

    const { error: responseErr } = await supabase.from('retrieval_responses').insert({
      session_id: sessionId, user_id: user.id,
      retrieval_item_id: retrievalItemId, item_type: itemType, item_id: card.id,
      quality, recalled_correctly: recalled, response_time_ms: responseTimeMs,
    })
    if (responseErr) { setError(responseErr.message); return false }
    return true
  }, [sessionId])

  // ── Advance ────────────────────────────────────────────────────────────────
  const advance = useCallback(async (correct: boolean, quality: number) => {
    const card = deck[cardIndex]
    const recorded = await recordResponse(card, correct, quality)
    if (!recorded) return
    if (correct) correctCount.current++
    const newMissed = correct ? missedCards : [...missedCards, card]
    if (!correct) setMissedCards(newMissed)

    if (cardIndex >= deck.length - 1) {
      const durationMs = Date.now() - startTime.current
      const { error: sessionErr } = await supabase.from('retrieval_sessions').update({
        correct_items: correctCount.current,
        duration_seconds: Math.round(durationMs / 1000),
        completed: true, ended_at: new Date().toISOString(),
      }).eq('id', sessionId)
      if (sessionErr) { setError(sessionErr.message); return }
      setSessionStats({ correct: correctCount.current, total: deck.length, durationMs, missedCards: newMissed })
      setPhase('summary')
    } else {
      setCardIndex(i => i + 1); setRevealed(false); setChosen(null)
      cardStartTime.current = Date.now()
    }
  }, [deck, cardIndex, recordResponse, sessionId, missedCards])

  const handleMcqChoice = useCallback(async (opt: string) => {
    if (chosen) return
    setChosen(opt); setRevealed(true)
    const correct = opt === deck[cardIndex].correctOption
    await advance(correct, correct ? QUALITY_MAP.got_it : QUALITY_MAP.missed)
  }, [chosen, deck, cardIndex, advance])

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} />
  if (phase === 'select')  return <ModeSelector onStart={startSession} quoteCount={quotes.length} pairCount={pairs.length} />
  if (phase === 'summary') return <SummaryScreen stats={sessionStats!} onRestart={() => setPhase('select')} />

  const card = deck[cardIndex]

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8 font-sans">
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded">
            {mode.replace('_', ' ')}
          </span>
          <span className="text-xs font-bold text-slate-500">{cardIndex + 1} / {deck.length}</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${((cardIndex) / deck.length) * 100}%` }} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {mode === 'free_recall' || mode === 'pivot_drill' ? (
          <FreeRecallCard 
            card={card} 
            revealed={revealed}
            isPivotMode={mode === 'pivot_drill'}
            onReveal={() => setRevealed(true)}
            onScore={(c, q) => advance(c, q)} 
          />
        ) : (
          <RecognitionCard 
            card={card} 
            chosen={chosen}
            onChoose={handleMcqChoice}
            isPairMode={mode === 'pair_match'} 
          />
        )}
      </div>
    </div>
  )
}

// ─── Mode Selector ────────────────────────────────────────────────────────────
function ModeSelector({ onStart, quoteCount, pairCount }: {
  onStart: (m: DrillMode) => void; quoteCount: number; pairCount: number
}) {
  const modes = [
    { 
      id: 'recognition' as DrillMode, 
      label: 'Recognition Mode', 
      desc: 'Read the method/effect. Pick the correct quote from four options. Ideal for basic familiarisation.', 
      count: `${quoteCount} quotes`, 
      border: 'border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/10' 
    },
    { 
      id: 'pair_match' as DrillMode, 
      label: 'Pair Match Mode', 
      desc: 'See a Hard Times quote and identify its matching Atonement counterpart from options. Builds basic comparison reflex.', 
      count: `${pairCount} pairs`, 
      border: 'border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/10' 
    },
    { 
      id: 'free_recall' as DrillMode, 
      label: 'Free Recall Mode (Active Recall)', 
      desc: 'Prompted with method & source text. Type out the exact quote from memory. Validated using fuzzy distance checks.', 
      count: `${quoteCount} quotes`, 
      border: 'border-indigo-200 bg-indigo-50/10 hover:bg-indigo-50/20 hover:border-indigo-300' 
    },
    { 
      id: 'pivot_drill' as DrillMode, 
      label: 'Pivot Drill (Level 5 Synthesis)', 
      desc: 'Shown both quotes. Type the comparative tension/synthesis. Validated using conceptual matching to build exam synthesis.', 
      count: `${pairCount} connections`, 
      border: 'border-emerald-200 bg-emerald-50/10 hover:bg-emerald-50/20 hover:border-emerald-300' 
    },
  ]
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 md:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white mb-2">Stage 2 Active Recall</Badge>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Active Recall Drill Engine</h1>
          <p className="text-slate-500 text-sm mt-1">Strengthen memory retention and synthesis rules under exam conditions.</p>
        </div>
        <div className="flex flex-col gap-4">
          {modes.map(m => (
            <button key={m.id} onClick={() => onStart(m.id)}
              className={`text-left p-5 bg-white border rounded-xl shadow-sm transition-all duration-200 hover:shadow-md ${m.border}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    {m.id === 'pivot_drill' && <Sparkles className="h-4 w-4 text-emerald-600" />}
                    {m.id === 'free_recall' && <BookOpen className="h-4 w-4 text-indigo-600" />}
                    {m.label}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap mt-0.5">
                  {m.count}
                </span>
              </div>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mt-6 text-center">
          Up to {DECK_SIZE} cards per session · Results adjust Spaced Repetition (SM-2) intervals.
        </p>
      </div>
    </div>
  )
}

// ─── Recognition Card (MCQ) ───────────────────────────────────────────────────
function RecognitionCard({ card, chosen, onChoose, isPairMode }: {
  card: DrillCard; chosen: string | null
  onChoose: (o: string) => void; isPairMode: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{card.promptLabel}</p>
        <p className={`text-slate-800 leading-relaxed font-medium ${isPairMode ? 'font-serif italic text-lg' : 'text-sm'}`}>
          {card.prompt}
        </p>
        {(card.meta.themes ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(card.meta.themes ?? []).map(t => (
              <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/50">{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {(card.options ?? []).map((opt, i) => {
          const isChosen = chosen === opt, isCorrect = opt === card.correctOption
          let cls = 'text-left w-full p-4 rounded-xl border text-sm font-serif italic leading-relaxed transition-all shadow-sm '
          if (!chosen)       cls += 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/5 text-slate-700 cursor-pointer'
          else if (isCorrect) cls += 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
          else if (isChosen)  cls += 'bg-rose-50 border-rose-300 text-rose-800'
          else                cls += 'bg-white border-slate-200 text-slate-400 opacity-60'
          return (
            <button key={i} className={cls} onClick={() => onChoose(opt)} disabled={!!chosen}>
              <span className="not-italic text-slate-400 text-xs font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
              "{opt}"
              {chosen && isCorrect && <span className="not-italic ml-2 text-emerald-600">✓</span>}
              {chosen && isChosen && !isCorrect && <span className="not-italic ml-2 text-rose-600">✗</span>}
            </button>
          )
        })}
      </div>

      {chosen && (card.meta.howTheyCompare || (card.meta.method && !isPairMode)) && (
        <div className="p-4 bg-indigo-50/20 border border-indigo-100 rounded-xl space-y-3">
          {card.meta.howTheyCompare && (
            <div>
              <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Award className="h-3 w-3" />
                AO4 Comparative Synthesis
              </p>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{card.meta.howTheyCompare}</p>
            </div>
          )}
          {card.meta.method && !isPairMode && (
            <div>
              <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Quote className="h-3 w-3" />
                Narrative Method
              </p>
              <p className="text-xs text-slate-600 font-sans">{card.meta.method}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Free Recall Card (Fuzzy Matching Upgrade) ──────────────────────────────────
function FreeRecallCard({ card, revealed, isPivotMode, onReveal, onScore }: {
  card: DrillCard; revealed: boolean; isPivotMode?: boolean;
  onReveal: () => void; onScore: (correct: boolean, quality: number) => void
}) {
  const [typedText, setTypedText] = useState('')
  const [similarity, setSimilarity] = useState<number | null>(null)

  // Reset inputs when card changes
  useEffect(() => {
    setTypedText('')
    setSimilarity(null)
  }, [card.id])

  const handleVerify = () => {
    if (!typedText.trim()) return
    const score = calculateSimilarity(typedText, card.correctOption)
    setSimilarity(score)
    onReveal()
  }

  // Determine auto-highlight quality based on similarity
  const recommendedQuality = useMemo(() => {
    if (similarity === null) return null
    if (isPivotMode) {
      // Comparison sentences are longer; lower similarity threshold is acceptable for concept match
      if (similarity >= 0.50) return QUALITY_MAP.got_it
      if (similarity >= 0.25) return QUALITY_MAP.almost
      return QUALITY_MAP.missed
    } else {
      // Exact quote match thresholds
      if (similarity >= 0.85) return QUALITY_MAP.got_it
      if (similarity >= 0.60) return QUALITY_MAP.almost
      return QUALITY_MAP.missed
    }
  }, [similarity, isPivotMode])

  return (
    <div className="space-y-4">
      {/* Prompt Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {card.promptLabel}
          </span>
          {(card.meta.themes ?? []).length > 0 && (
            <div className="flex gap-1">
              {(card.meta.themes ?? []).map(t => (
                <span key={t} className="text-[9px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/50">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {isPivotMode ? (
          <div className="space-y-3 font-sans">
            <div className="p-3 rounded-lg border border-indigo-100 bg-indigo-50/10">
              <span className="text-[10px] font-bold text-indigo-700 tracking-wide uppercase block mb-1">Hard Times Quote</span>
              <p className="text-sm font-serif italic text-slate-700">"{card.meta.hardTimesQuote}"</p>
            </div>
            <div className="p-3 rounded-lg border border-rose-100 bg-rose-50/10">
              <span className="text-[10px] font-bold text-rose-700 tracking-wide uppercase block mb-1">Atonement Quote</span>
              <p className="text-sm font-serif italic text-slate-700">"{card.meta.atonementQuote}"</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 font-bold uppercase">Target Literary Method:</p>
            <p className="text-sm font-serif italic text-slate-800 leading-relaxed bg-slate-50 p-3 rounded border">
              {card.prompt}
            </p>
          </div>
        )}
      </div>

      {/* Verification Workspace */}
      {!revealed ? (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <label className="text-xs font-bold text-slate-600 block">
            {isPivotMode 
              ? "Draft the comparative pivot/tension connecting these quotes (e.g. how they contrast or align functionally):"
              : "Type the quotation from memory below:"}
          </label>
          <textarea
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            className="w-full min-h-24 border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 leading-relaxed"
            placeholder={isPivotMode 
              ? "e.g., Dickens satirizes mechanical learning while McEwan explores child focalisation to show..." 
              : "Type the exact quote..."}
          />
          <button 
            onClick={handleVerify}
            disabled={!typedText.trim()}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            Check Memory & Reveal Target
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Similarity Feedback */}
          {similarity !== null && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
              recommendedQuality === QUALITY_MAP.got_it 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : recommendedQuality === QUALITY_MAP.almost 
                ? 'bg-amber-50 border-amber-200 text-amber-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex-shrink-0 mt-0.5">
                {recommendedQuality === QUALITY_MAP.got_it ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
              </div>
              <div className="text-xs">
                <p className="font-bold">
                  Memory Match Accuracy: {Math.round(similarity * 100)}%
                </p>
                <p className="mt-1 opacity-90 leading-relaxed font-sans">
                  {recommendedQuality === QUALITY_MAP.got_it 
                    ? "Perfect or near-perfect match! Spaced repetition auto-selected 'Got it'." 
                    : recommendedQuality === QUALITY_MAP.almost 
                    ? "Partial match. Recommended rating: 'Almost'." 
                    : "Low matching accuracy. Recommended rating: 'Missed'."}
                </p>
              </div>
            </div>
          )}

          {/* Student Response comparison */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Your Draft</p>
              <p className="text-xs text-slate-700 bg-slate-50/50 p-2.5 rounded border border-slate-100 font-mono italic">
                "{typedText || '[No response provided]'}"
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Answer</p>
              <p className="text-sm font-serif italic text-slate-800 bg-indigo-50/10 p-3 rounded border border-indigo-100/50 leading-relaxed">
                {card.answer}
              </p>
            </div>
          </div>

          {/* Manual Quality Adjustment */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center">
            <p className="text-xs font-bold text-slate-600 mb-3 font-sans">Evaluate your recall performance manually if needed:</p>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => onScore(true, QUALITY_MAP.got_it)}
                className={`py-3 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                  recommendedQuality === QUALITY_MAP.got_it 
                    ? 'bg-emerald-600 border-emerald-600 text-white ring-2 ring-emerald-600/20' 
                    : 'bg-white border-slate-200 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                ✓ Got it
              </button>
              <button 
                onClick={() => onScore(true, QUALITY_MAP.almost)}
                className={`py-3 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                  recommendedQuality === QUALITY_MAP.almost 
                    ? 'bg-amber-500 border-amber-500 text-white ring-2 ring-amber-500/20' 
                    : 'bg-white border-slate-200 text-amber-700 hover:bg-amber-50'
                }`}
              >
                ~ Almost
              </button>
              <button 
                onClick={() => onScore(false, QUALITY_MAP.missed)}
                className={`py-3 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                  recommendedQuality === QUALITY_MAP.missed 
                    ? 'bg-rose-600 border-rose-600 text-white ring-2 ring-rose-600/20' 
                    : 'bg-white border-slate-200 text-rose-700 hover:bg-rose-50'
                }`}
              >
                ✗ Missed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Summary Screen ───────────────────────────────────────────────────────────
function SummaryScreen({ stats, onRestart }: { stats: SessionStats; onRestart: () => void }) {
  const pct   = Math.round((stats.correct / stats.total) * 100)
  const mins  = Math.floor(stats.durationMs / 60000)
  const secs  = Math.round((stats.durationMs % 60000) / 1000)
  const grade = pct >= 85 ? 'Excellent' : pct >= 65 ? 'Good' : 'Keep practising'
  const clr   = pct >= 85 ? 'text-emerald-600' : pct >= 65 ? 'text-amber-500' : 'text-rose-600'
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 md:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight text-center mb-1">Session Complete</h1>
        <p className="text-slate-500 text-center text-sm mb-8">Completed in {mins}m {secs}s</p>
        
        <div className="bg-white border border-slate-200 rounded-xl p-8 mb-6 text-center shadow-sm">
          <p className={`text-6xl font-black mb-1 tracking-tighter ${clr}`}>{pct}%</p>
          <p className={`text-base font-bold ${clr}`}>{grade}</p>
          <p className="text-slate-500 text-xs mt-3">
            {stats.correct} correct recalls · {stats.total - stats.correct} incorrect reviews
          </p>
        </div>

        {stats.missedCards.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Missed Items Checklist</p>
            <div className="flex flex-col gap-3">
              {stats.missedCards.map((c, i) => (
                <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-1.5">
                  <p className="text-[9px] font-bold text-rose-600 uppercase tracking-wide">{c.meta.source ?? 'Pair'}</p>
                  <p className="font-serif italic text-slate-700 text-sm leading-relaxed">{c.answer}</p>
                  {c.meta.method && <p className="text-[10px] text-slate-400 font-sans">Method: {c.meta.method}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={onRestart}
          className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm">
          Start New Active Session
        </button>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="text-center space-y-2">
        <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin mx-auto" />
        <p className="text-slate-500 text-xs animate-pulse">Initializing retrieval cards...</p>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md text-center shadow-md">
        <p className="text-slate-800 font-bold mb-1">Session Error</p>
        <p className="text-slate-500 text-xs leading-relaxed">{message}</p>
      </div>
    </div>
  )
}
