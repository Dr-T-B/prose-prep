import React, { useState, useMemo } from "react";
import { useContent } from "@/lib/ContentProvider";
import { useParagraphValidation } from "@/hooks/useParagraphValidation";
import { useGradeBMode } from "@/contexts/GradeBModeContext";
import { ParagraphValidationErrorCode, ValidationErrorItem, ActiveFlagItem } from "@/types/essayEngine";
import { AO2_DEVICES, AO3_CONTEXTS } from "@/utils/essayParserRules";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Sparkles,
  Award,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  RotateCcw,
  BookMarked,
  Layers,
  ChevronRight,
  Eye,
  Edit3,
} from "lucide-react";

// Mock exemplars for quick testing
const EXEMPLARS = {
  level5: {
    label: "Level 5 Woven (A*)",
    text: "While Dickens employs satirical caricature to codifies the mechanization of Sissy Jupe, McEwan, by contrast, utilizes free indirect discourse to internalize Robbie’s trauma. In Hard Times, the rigid Victorian industrial classroom strips Sissy of her name, symbolising the cold utilitarianism of the era. Conversely, McEwan’s interwar setting presents Dunkirk as a chaotic space where class hegemony is shattered by war, demonstrating how class pre-determines guilt. Both authors construct their narratives to show that a society governed by pure fact or ego collapses under its own pressure.",
    pairing: {
      hardTimesQuote: "Girl number twenty",
      hardTimesMethod: "depersonalising numeric address",
      atonementQuote: "the son of a cleaner",
      atonementMethod: "class-marked epithet",
      themeLabel: "class",
    },
    theme: "class",
  },
  sandwich: {
    label: "Level 3 Sandwich (Non-Woven)",
    text: "While Dickens employs satirical caricature to codifies the mechanization of Sissy Jupe, McEwan, by contrast, utilizes free indirect discourse to internalize Robbie’s trauma. Dickens presents Coketown as a mechanistic hell. Sissy Jupe is victim of Gradgrind. Atonement shows Robbie suffering in the war. Briony Tallis is guilty of lying.",
    pairing: {
      hardTimesQuote: "interminable serpents of smoke",
      hardTimesMethod: "biblical allusion",
      atonementQuote: "the smell of cordite and rotting flesh",
      atonementMethod: "sensory list",
      themeLabel: "suffering",
    },
    theme: "suffering",
  },
  factDump: {
    label: "Level 2 Fact Dump",
    text: "While Dickens employs satirical caricature to codifies the mechanization of Sissy Jupe, McEwan, by contrast, utilizes free indirect discourse to internalize Robbie’s trauma. In 1854, the Industrial Revolution was happening. This reflects how the Victorian class system worked.",
    pairing: {
      hardTimesQuote: null,
      hardTimesMethod: null,
      atonementQuote: null,
      atonementMethod: null,
      themeLabel: "power",
    },
    theme: "power",
  },
  speculative: {
    label: "Level 3 Speculative",
    text: "While Dickens employs satirical caricature to codifies the mechanization of Sissy Jupe, McEwan, by contrast, utilizes free indirect discourse to internalize Robbie’s trauma. This might suggest that Dickens is criticizing Utilitarianism, which could possibly be true.",
    pairing: {
      hardTimesQuote: null,
      hardTimesMethod: null,
      atonementQuote: null,
      atonementMethod: null,
      themeLabel: "truth",
    },
    theme: "truth",
  },
};

interface HighlightMarker {
  start: number;
  end: number;
  severity: "error" | "warning" | "success";
  label: string;
  message: string;
}

function tokenizeTextWithOffsets(text: string) {
  const tokens: { word: string; index: number; start: number; end: number }[] = [];
  const regex = /[a-zA-Z0-9']+/g;
  let match;
  let index = 0;
  while ((match = regex.exec(text)) !== null) {
    tokens.push({
      word: match[0].toLowerCase(),
      index: index++,
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return tokens;
}

export default function Phase4Workspace() {
  const { comparative_matrix, quote_methods } = useContent();
  const { gradeBMode } = useGradeBMode();
  
  const {
    text,
    setText,
    loading,
    result,
    error,
    targetTextPairing,
    setTargetTextPairing,
    promptParameters,
    setPromptParameters,
    runAudit,
    clearResult,
  } = useParagraphValidation();

  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [selectedAxisId, setSelectedAxisId] = useState<string>("");
  
  // Hovered card code to emphasize highlight
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);

  // Filter quotes based on selected comparative matrix axis
  const selectedAxis = useMemo(() => {
    return comparative_matrix.find((ax) => ax.id === selectedAxisId) || null;
  }, [comparative_matrix, selectedAxisId]);

  const filteredHardTimesQuotes = useMemo(() => {
    if (!selectedAxis) return quote_methods.filter((q) => q.source_text === "Hard Times");
    return quote_methods.filter(
      (q) => q.source_text === "Hard Times" && q.best_themes.some((t) => selectedAxis.themes.includes(t))
    );
  }, [selectedAxis, quote_methods]);

  const filteredAtonementQuotes = useMemo(() => {
    if (!selectedAxis) return quote_methods.filter((q) => q.source_text === "Atonement");
    return quote_methods.filter(
      (q) => q.source_text === "Atonement" && q.best_themes.some((t) => selectedAxis.themes.includes(t))
    );
  }, [selectedAxis, quote_methods]);

  // Handle matrix selection
  const handleAxisChange = (id: string) => {
    setSelectedAxisId(id);
    const axis = comparative_matrix.find((ax) => ax.id === id);
    if (axis) {
      setPromptParameters((prev) => ({
        ...prev,
        theme: axis.themes[0] || null,
      }));
      setTargetTextPairing({
        hardTimesQuote: null,
        hardTimesMethod: null,
        atonementQuote: null,
        atonementMethod: null,
        themeLabel: axis.themes[0] || null,
      });
    } else {
      setTargetTextPairing({
        hardTimesQuote: null,
        hardTimesMethod: null,
        atonementQuote: null,
        atonementMethod: null,
        themeLabel: null,
      });
    }
  };

  // Helper to load exemplar paragraphs
  const handleLoadExemplar = (key: keyof typeof EXEMPLARS) => {
    const ex = EXEMPLARS[key];
    setText(ex.text);
    setTargetTextPairing(ex.pairing);
    setPromptParameters({
      theme: ex.theme,
      targetGrade: "A*",
    });
    // Set appropriate axis id if matches
    const axis = comparative_matrix.find(ax => ax.themes.includes(ex.theme as any));
    if (axis) {
      setSelectedAxisId(axis.id);
    }
    clearResult();
    setActiveTab("write");
  };

  // Determine if a specific flag type is active (AO2/AO3 symbiosis achieved)
  const hasSymbiosis = useMemo(() => {
    return !!(result && !result.activeFlags.some(f => f.type === 'AO2_AO3_SYMBIOSIS_MISSING'));
  }, [result]);

  // Find symbiosis tokens when achieved
  const symbiosisMarkers = useMemo(() => {
    if (!text || !result || !hasSymbiosis) return [];

    const tokens = tokenizeTextWithOffsets(text);
    const ao2Tokens = tokens.filter(t => 
      AO2_DEVICES.some(d => t.word.includes(d)) ||
      (targetTextPairing.hardTimesMethod && targetTextPairing.hardTimesMethod.toLowerCase().includes(t.word)) ||
      (targetTextPairing.atonementMethod && targetTextPairing.atonementMethod.toLowerCase().includes(t.word))
    );
    const ao3Tokens = tokens.filter(t => 
      AO3_CONTEXTS.some(c => t.word.includes(c))
    );

    const matchedTokens = new Set<typeof tokens[0]>();

    for (const a2 of ao2Tokens) {
      for (const a3 of ao3Tokens) {
        if (Math.abs(a2.index - a3.index) <= 15) {
          matchedTokens.add(a2);
          matchedTokens.add(a3);
        }
      }
    }

    return Array.from(matchedTokens).map(t => ({
      start: t.start,
      end: t.end,
      severity: "success" as const,
      label: "AO2_AO3_SYMBIOSIS",
      message: `Symbiosis Token: confidence match ("${t.word}") within 15-word window.`
    }));
  }, [text, result, hasSymbiosis, targetTextPairing]);

  // Compute non-overlapping character segments for highlighting
  const textSegments = useMemo(() => {
    if (!text || !result) return [];

    const markers: HighlightMarker[] = [
      ...result.errors.map((e) => ({
        start: e.startOffset,
        end: e.endOffset,
        severity: "error" as const,
        label: e.code,
        message: e.message,
      })),
      ...result.activeFlags
        .filter((f) => f.type !== "AO2_AO3_SYMBIOSIS_MISSING")
        .map((f) => ({
          start: f.startOffset,
          end: f.endOffset,
          severity: "warning" as const,
          label: f.type,
          message: f.message,
        })),
      ...symbiosisMarkers,
    ];

    // Filter valid range markers
    const valid = markers.filter(
      (m) => m.start >= 0 && m.end > m.start && m.end <= text.length
    );

    // Sort: start offset ascending, size descending
    valid.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

    const segments: { text: string; marker?: HighlightMarker }[] = [];
    let currentIdx = 0;

    for (const marker of valid) {
      // Overlap prevention
      if (marker.start < currentIdx) continue;

      if (marker.start > currentIdx) {
        segments.push({
          text: text.slice(currentIdx, marker.start),
        });
        currentIdx = marker.start;
      }

      segments.push({
        text: text.slice(marker.start, marker.end),
        marker,
      });
      currentIdx = marker.end;
    }

    if (currentIdx < text.length) {
      segments.push({
        text: text.slice(currentIdx),
      });
    }

    return segments;
  }, [text, result, symbiosisMarkers]);

  // Statistics counters
  const wordCount = useMemo(() => {
    return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  }, [text]);

  const charCount = text ? text.length : 0;

  return (
    <div className="min-h-screen bg-[#090b11] text-slate-100 font-sans antialiased selection:bg-primary-soft/30">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
        
        {/* Workspace Header */}
        <header className="mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-primary-soft border-primary-soft/30 bg-primary-soft/5 font-mono text-[10px] tracking-wider uppercase">
                Phase 4 Workspace
              </Badge>
              {gradeBMode && (
                <Badge variant="outline" className="text-amber-400 border-amber-400/20 bg-amber-400/5 font-mono text-[10px]">
                  Grade B Scaffold Active
                </Badge>
              )}
            </div>
            <h1 className="font-serif text-3xl lg:text-4xl text-slate-50 tracking-tight">
              Essay Construction Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Draft and audit comparative paragraph structures. Synthesize analysis of Dickens and McEwan into premium, high-scoring woven paragraphs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-500 mr-2 font-mono">Load Exemplars:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLoadExemplar("level5")}
              className="text-xs bg-slate-900 border-slate-800 text-emerald-400 hover:bg-slate-800 hover:text-emerald-300"
            >
              Level 5 (A*)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLoadExemplar("sandwich")}
              className="text-xs bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800 hover:text-amber-300"
            >
              Sequential Block
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLoadExemplar("factDump")}
              className="text-xs bg-slate-900 border-slate-800 text-red-400 hover:bg-slate-800 hover:text-red-300"
            >
              Fact Dump
            </Button>
          </div>
        </header>

        {error && (
          <div className="bg-red-950/40 border border-red-800/40 text-red-200 p-4 rounded-sm mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">System Error</h4>
              <p className="text-xs mt-0.5 text-red-300">{error.message}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: Editing Workspace (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Target Settings Box */}
            <Card className="bg-slate-900/40 border-slate-800 shadow-xl backdrop-blur-sm">
              <CardHeader className="py-4 border-b border-slate-800/80">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                  <Layers className="h-4 w-4 text-primary-soft" />
                  1. Analysis Targets Configuration
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Select a comparative axis and align specific literary quotes from the syllabus to target in your paragraph.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 grid sm:grid-cols-3 gap-4">
                
                {/* 1. Theme/Axis Select */}
                <div className="space-y-1.5">
                  <label htmlFor="axis-select" className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                    Comparative Axis
                  </label>
                  <select
                    id="axis-select"
                    value={selectedAxisId}
                    onChange={(e) => handleAxisChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-sm py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-primary-soft transition-colors"
                  >
                    <option value="">-- Select Axis --</option>
                    {comparative_matrix.map((ax) => (
                      <option key={ax.id} value={ax.id}>
                        {ax.axis}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Text A (Hard Times) Quote */}
                <div className="space-y-1.5">
                  <label htmlFor="hardtimes-quote" className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                    Text A Quote (Dickens)
                  </label>
                  <select
                    id="hardtimes-quote"
                    value={targetTextPairing.hardTimesQuote || ""}
                    onChange={(e) => {
                      const quoteObj = filteredHardTimesQuotes.find(q => q.quote_text === e.target.value);
                      setTargetTextPairing(prev => ({
                        ...prev,
                        hardTimesQuote: e.target.value || null,
                        hardTimesMethod: quoteObj?.method || null
                      }));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-sm py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-primary-soft transition-colors"
                  >
                    <option value="">-- Select Quote --</option>
                    {filteredHardTimesQuotes.map((q) => (
                      <option key={q.id} value={q.quote_text}>
                        "{q.quote_text.slice(0, 30)}..." ({q.method})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Text B (Atonement) Quote */}
                <div className="space-y-1.5">
                  <label htmlFor="atonement-quote" className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                    Text B Quote (McEwan)
                  </label>
                  <select
                    id="atonement-quote"
                    value={targetTextPairing.atonementQuote || ""}
                    onChange={(e) => {
                      const quoteObj = filteredAtonementQuotes.find(q => q.quote_text === e.target.value);
                      setTargetTextPairing(prev => ({
                        ...prev,
                        atonementQuote: e.target.value || null,
                        atonementMethod: quoteObj?.method || null
                      }));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-sm py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-primary-soft transition-colors"
                  >
                    <option value="">-- Select Quote --</option>
                    {filteredAtonementQuotes.map((q) => (
                      <option key={q.id} value={q.quote_text}>
                        "{q.quote_text.slice(0, 30)}..." ({q.method})
                      </option>
                    ))}
                  </select>
                </div>

              </CardContent>

              {/* Targets Summary Banner */}
              {(targetTextPairing.hardTimesQuote || targetTextPairing.atonementQuote) && (
                <div className="mx-6 mb-4 p-3 bg-slate-950/60 rounded border border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center text-xs">
                  <div className="space-y-1">
                    {targetTextPairing.hardTimesQuote && (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase px-1 bg-red-950/60 text-red-400 border border-red-900/40 rounded-sm">Hard Times Targets</span>
                        <span className="text-slate-300 font-serif italic">"{targetTextPairing.hardTimesQuote}"</span>
                        <span className="text-slate-500 font-mono">[{targetTextPairing.hardTimesMethod}]</span>
                      </div>
                    )}
                    {targetTextPairing.atonementQuote && (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase px-1 bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 rounded-sm">Atonement Targets</span>
                        <span className="text-slate-300 font-serif italic">"{targetTextPairing.atonementQuote}"</span>
                        <span className="text-slate-500 font-mono">[{targetTextPairing.atonementMethod}]</span>
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Theme Focus: <span className="text-primary-soft font-bold uppercase">{targetTextPairing.themeLabel || "None"}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Main Editor Card */}
            <Card className="bg-slate-900/40 border-slate-800 shadow-xl backdrop-blur-sm overflow-hidden">
              <CardHeader className="py-4 bg-slate-900/60 border-b border-slate-800 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                    <BookOpen className="h-4 w-4 text-primary-soft" />
                    2. Synthesized Woven Paragraph
                  </CardTitle>
                </div>
                
                {/* Tabs selection: Write vs Highlight Map */}
                <div className="flex rounded-sm bg-slate-950 p-1 border border-slate-800 shrink-0">
                  <button
                    onClick={() => setActiveTab("write")}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-sm transition-all ${
                      activeTab === "write"
                        ? "bg-slate-800 text-slate-100 shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Edit3 className="h-3 w-3" />
                    Editor
                  </button>
                  <button
                    onClick={() => {
                      if (!result) {
                        alert("Please run the pedagogical audit first to view highlighted analysis.");
                        return;
                      }
                      setActiveTab("preview");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-sm transition-all ${
                      activeTab === "preview"
                        ? "bg-slate-800 text-slate-100 shadow"
                        : "text-slate-400 hover:text-slate-200"
                    } ${!result ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Eye className="h-3 w-3" />
                    Interactive Map
                  </button>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {activeTab === "write" ? (
                  <textarea
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      if (result) clearResult();
                    }}
                    className="min-h-[380px] w-full bg-slate-950 border-0 p-6 text-sm font-sans text-slate-200 focus:outline-none focus:ring-0 leading-relaxed resize-none placeholder-slate-600"
                    placeholder="Draft your synthesized comparative paragraph here..."
                  />
                ) : (
                  <div className="min-h-[380px] w-full bg-slate-950 p-6 text-sm font-sans text-slate-200 leading-relaxed overflow-y-auto whitespace-pre-wrap select-text">
                    {textSegments.length === 0 ? (
                      <span className="text-slate-500 italic">No text provided.</span>
                    ) : (
                      textSegments.map((seg, idx) => {
                        if (!seg.marker) {
                          return <span key={idx}>{seg.text}</span>;
                        }
                        
                        const isErr = seg.marker.severity === "error";
                        const isWarn = seg.marker.severity === "warning";
                        const isHovered = activeHighlightId === seg.marker.label;
                        
                        // Pick underlining style based on severity and hover state
                        let styleClass = "";
                        if (isErr) {
                          styleClass = isHovered 
                            ? "bg-red-500/20 underline decoration-wavy decoration-red-400 cursor-pointer font-medium"
                            : "bg-red-500/5 underline decoration-wavy decoration-red-500/60 hover:bg-red-500/15 hover:decoration-red-400 cursor-pointer";
                        } else if (isWarn) {
                          styleClass = isHovered
                            ? "bg-amber-500/20 underline decoration-solid decoration-amber-400 cursor-pointer font-medium"
                            : "bg-amber-500/5 underline decoration-solid decoration-amber-500/60 hover:bg-amber-500/15 hover:decoration-amber-400 cursor-pointer";
                        } else {
                          // Success (emerald symbiosis matching)
                          styleClass = isHovered
                            ? "bg-emerald-500/35 text-emerald-100 cursor-pointer font-medium rounded px-1"
                            : "bg-emerald-500/25 text-emerald-200 hover:bg-emerald-500/35 cursor-pointer rounded px-1";
                        }

                        return (
                          <span
                            key={idx}
                            onMouseEnter={() => setActiveHighlightId(seg.marker!.label)}
                            onMouseLeave={() => setActiveHighlightId(null)}
                            className={`${styleClass} px-0.5 rounded-sm transition-all duration-200 relative group`}
                          >
                            {seg.text}
                            
                            {/* Premium tooltip */}
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 bg-slate-900 text-slate-100 text-xs rounded border border-slate-700 shadow-2xl p-3 z-50 font-sans pointer-events-none">
                              <span className={`inline-flex items-center gap-1 font-mono font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm mb-1.5 ${
                                isErr ? "bg-red-950 text-red-400 border border-red-900" :
                                isWarn ? "bg-amber-950 text-amber-400 border border-amber-900" :
                                "bg-emerald-950 text-emerald-400 border border-emerald-900"
                              }`}>
                                {seg.marker.label}
                              </span>
                              <span className="block leading-relaxed font-normal text-slate-300">
                                {seg.marker.message}
                              </span>
                            </span>
                          </span>
                        );
                      })
                    )}
                  </div>
                )}
              </CardContent>

              {/* Editor Footer / Info Area */}
              <CardFooter className="py-3 px-6 bg-slate-900/30 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
                <div className="flex gap-4 font-mono text-[11px]">
                  <span>Words: <strong className="text-slate-200">{wordCount}</strong></span>
                  <span>Characters: <strong className="text-slate-200">{charCount}</strong></span>
                </div>
                
                <div className="flex gap-2">
                  {result && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearResult}
                      className="h-8 border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      Clear
                    </Button>
                  )}
                  <Button
                    size="sm"
                    disabled={loading || !text}
                    onClick={runAudit}
                    className="h-8 bg-primary hover:bg-primary-soft text-primary-foreground transition-all duration-200 relative shadow-lg shadow-primary/10 overflow-hidden"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin mr-1.5 block h-3.5 w-3.5 rounded-full border-2 border-slate-100 border-t-transparent" />
                        Auditing...
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
                        Run Pedagogical Audit
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* RIGHT PANEL: Diagnostic Feedback Sidebar (4 Columns) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Scores Overview */}
            <Card className="bg-slate-900/40 border-slate-800 shadow-xl backdrop-blur-sm">
              <CardHeader className="py-4 border-b border-slate-800/80">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                  <Award className="h-4 w-4 text-primary-soft" />
                  Diagnostic Scores
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                
                {/* Overall Rating */}
                <div className="flex items-center justify-between bg-slate-950 p-4 border border-slate-800 rounded">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block tracking-wider">Overall Grade Band</span>
                    <span className="text-xl font-serif text-slate-100 font-bold mt-0.5 block">
                      {result ? (
                        result.structuralScores.overall >= 5 ? "Level 5 (A* Band)" :
                        result.structuralScores.overall >= 4 ? "Level 4 (A Band)" :
                        result.structuralScores.overall >= 3 ? "Level 3 (B/C Band)" :
                        "Level 1-2 (D/E Band)"
                      ) : "Unrated"}
                    </span>
                  </div>
                  
                  {/* Score badge circle */}
                  <div className={`h-12 w-12 rounded-full border flex items-center justify-center font-serif text-lg font-bold shrink-0 ${
                    result ? (
                      result.structuralScores.overall >= 5 ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/40" :
                      result.structuralScores.overall >= 3 ? "bg-amber-950/60 text-amber-400 border-amber-800/40" :
                      "bg-red-950/60 text-red-400 border-red-800/40"
                    ) : "bg-slate-950 text-slate-500 border-slate-800"
                  }`}>
                    {result ? `${result.structuralScores.overall}/5` : "-"}
                  </div>
                </div>

                {/* Individual AOs */}
                <div className="space-y-3 pt-2">
                  
                  {/* AO1 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">AO1: Thesis & Coherence</span>
                      <span className="text-slate-200 font-bold">{result ? `${result.structuralScores.ao1}/5` : "-"}</span>
                    </div>
                    <Progress value={result ? result.structuralScores.ao1 * 20 : 0} className="h-1.5 bg-slate-950" />
                  </div>
                  
                  {/* AO2 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">AO2: Literary Methods</span>
                      <span className="text-slate-200 font-bold">{result ? `${result.structuralScores.ao2}/5` : "-"}</span>
                    </div>
                    <Progress value={result ? result.structuralScores.ao2 * 20 : 0} className="h-1.5 bg-slate-950" />
                  </div>
                  
                  {/* AO3 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">AO3: Context Integration</span>
                      <span className="text-slate-200 font-bold">{result ? `${result.structuralScores.ao3}/5` : "-"}</span>
                    </div>
                    <Progress value={result ? result.structuralScores.ao3 * 20 : 0} className="h-1.5 bg-slate-950" />
                  </div>
                  
                  {/* AO4 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">AO4: Comparative Weave</span>
                      <span className="text-slate-200 font-bold">{result ? `${result.structuralScores.ao4}/5` : "-"}</span>
                    </div>
                    <Progress value={result ? result.structuralScores.ao4 * 20 : 0} className="h-1.5 bg-slate-950" />
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Audit Outputs */}
            <Card className="bg-slate-900/40 border-slate-800 shadow-xl backdrop-blur-sm overflow-hidden">
              <CardHeader className="py-4 bg-slate-900/60 border-b border-slate-800">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                  <Sparkles className="h-4 w-4 text-primary-soft" />
                  Pedagogical Audit Report
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-4 space-y-4 max-h-[480px] overflow-y-auto">
                {!result ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-mono space-y-2">
                    <HelpCircle className="h-8 w-8 text-slate-600 mx-auto" />
                    <p>Enter paragraph prose and trigger "Run Pedagogical Audit" to view diagnostics.</p>
                  </div>
                ) : (
                  <>
                    {/* General result message */}
                    <div className={`p-3 rounded-sm border text-xs leading-relaxed ${
                      result.isValid 
                        ? "bg-emerald-950/30 border-emerald-900/40 text-emerald-300"
                        : "bg-red-950/20 border-red-900/40 text-red-200"
                    }`}>
                      {result.feedback}
                    </div>

                    {/* overallQualitativeSummary */}
                    {result.overallQualitativeSummary && (
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-sm text-xs leading-relaxed space-y-2">
                        <div className="flex items-center gap-1.5 text-primary-soft font-bold">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span className="font-mono text-[9px] uppercase tracking-wider">Examiner Qualitative Summary</span>
                        </div>
                        <p className="text-slate-300 font-sans leading-relaxed">{result.overallQualitativeSummary}</p>
                      </div>
                    )}

                    {/* exemplarPivotSuggestion */}
                    {result.exemplarPivotSuggestion && (
                      <div className="p-4 bg-primary-soft/5 border border-primary-soft/20 rounded-sm text-xs leading-relaxed space-y-2">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span className="font-serif italic text-slate-200">Exemplar Level 5 Comparative Pivot</span>
                        </div>
                        <p className="text-emerald-200/90 font-serif italic">"{result.exemplarPivotSuggestion}"</p>
                      </div>
                    )}

                    {/* Celeb Card if fully valid */}
                    {result.isValid && result.errors.length === 0 && result.activeFlags.filter(f => f.type !== 'AO2_AO3_SYMBIOSIS_MISSING').length === 0 && (
                      <div className="bg-amber-950/30 border border-amber-800/40 p-4 rounded text-center space-y-2">
                        <CheckCircle2 className="h-8 w-8 text-amber-400 mx-auto animate-bounce" />
                        <h4 className="font-serif text-sm text-amber-300 font-bold">Level 5 Confirmed!</h4>
                        <p className="text-xs text-slate-300">Your comparative writing successfully weaves literary structures and complies with advanced academic standards.</p>
                      </div>
                    )}

                    {/* Map errors (Red Severity) */}
                    {result.errors.map((item, index) => {
                      const snippet = text.slice(item.startOffset, item.endOffset);
                      const isHovered = activeHighlightId === item.code;

                      return (
                        <div
                          key={`err-${index}`}
                          onMouseEnter={() => setActiveHighlightId(item.code)}
                          onMouseLeave={() => setActiveHighlightId(null)}
                          className={`bg-red-950/30 border p-3 rounded transition-all duration-200 space-y-3.5 ${
                            isHovered ? "border-red-500 ring-1 ring-red-900/40 scale-[1.01]" : "border-red-900/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-red-400 bg-red-950 border border-red-800 px-1.5 py-0.5 rounded-sm">
                              {item.code}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">Critical</span>
                          </div>
                          
                          <p className="text-xs text-red-200 leading-relaxed font-semibold">
                            {item.message}
                          </p>

                          {item.contextualCritique && (
                            <div className="text-xs text-slate-300 border-t border-red-950/50 pt-2.5 space-y-1">
                              <span className="text-[9px] font-mono uppercase tracking-wider text-red-400 font-bold block">Contextual Critique</span>
                              <p className="leading-relaxed">{item.contextualCritique}</p>
                            </div>
                          )}

                          {item.actionableFix && (
                            <div className="text-xs text-emerald-300 bg-emerald-950/30 border border-emerald-900/30 p-2.5 rounded-sm space-y-1">
                              <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">Actionable Fix</span>
                              <p className="leading-relaxed">{item.actionableFix}</p>
                            </div>
                          )}

                          {snippet && (
                            <div className="mt-2 text-[11px] font-serif bg-slate-950/60 border-l-2 border-red-500/50 p-2 text-slate-300 italic rounded-r-sm">
                              "{snippet.length > 90 ? `${snippet.slice(0, 90)}...` : snippet}"
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Map flags (Amber Severity) */}
                    {result.activeFlags
                      .filter((f) => f.type !== "AO2_AO3_SYMBIOSIS_MISSING")
                      .map((item, index) => {
                        const snippet = text.slice(item.startOffset, item.endOffset);
                        const isHovered = activeHighlightId === item.type;

                        return (
                          <div
                            key={`flag-${index}`}
                            onMouseEnter={() => setActiveHighlightId(item.type)}
                            onMouseLeave={() => setActiveHighlightId(null)}
                            className={`bg-amber-950/20 border p-3 rounded transition-all duration-200 space-y-3.5 ${
                              isHovered ? "border-amber-500 ring-1 ring-amber-900/40 scale-[1.01]" : "border-amber-900/30"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-400 bg-amber-950 border border-amber-900 px-1.5 py-0.5 rounded-sm">
                                {item.type.replace(/_/g, " ")}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">Warning</span>
                            </div>
                            
                            <p className="text-xs text-amber-200 leading-relaxed font-semibold">
                              {item.message}
                            </p>

                            {item.contextualCritique && (
                              <div className="text-xs text-slate-300 border-t border-amber-950/50 pt-2.5 space-y-1">
                                <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400 font-bold block">Contextual Critique</span>
                                <p className="leading-relaxed">{item.contextualCritique}</p>
                              </div>
                            )}

                            {item.actionableFix && (
                              <div className="text-xs text-emerald-300 bg-emerald-950/30 border border-emerald-900/30 p-2.5 rounded-sm space-y-1">
                                <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">Actionable Fix</span>
                                <p className="leading-relaxed">{item.actionableFix}</p>
                              </div>
                            )}

                            {snippet && (
                              <div className="mt-2 text-[11px] font-serif bg-slate-950/60 border-l-2 border-amber-500/50 p-2 text-slate-300 italic rounded-r-sm">
                                "{snippet.length > 90 ? `${snippet.slice(0, 90)}...` : snippet}"
                              </div>
                            )}
                          </div>
                        );
                      })}

                    {/* Successful Symbiosis match (Emerald Severity) */}
                    {hasSymbiosis && (
                      <div className="bg-emerald-950/20 border border-emerald-900/30 p-3 rounded">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-400 bg-emerald-950 border border-emerald-900 px-1.5 py-0.5 rounded-sm">
                            AO2 / AO3 Symbiosis
                          </span>
                          <span className="text-[10px] text-emerald-400/80 font-mono flex items-center gap-0.5">
                            <CheckCircle2 className="h-3 w-3 inline" /> Achieved
                          </span>
                        </div>
                        <p className="text-xs text-emerald-200 leading-relaxed">
                          Great job! Your analysis successfully integrates literary methods (AO2) and socio-political context (AO3) within a 15-word proximity window.
                        </p>
                      </div>
                    )}

                    {/* Missing Symbiosis alert (General Warning) */}
                    {result && !hasSymbiosis && (
                      <div className="bg-red-950/15 border border-red-950/30 p-3 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded-sm">
                            AO2 / AO3 Symbiosis
                          </span>
                          <span className="text-[10px] text-red-400 font-mono">Missing</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          No instances of a literary device (AO2) and socio-political context (AO3) were found within 15 words of each other. Integrate them closer to establish Level 5 symbiosis.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    </div>
  );
}
