import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, LayoutGrid, Compass, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans overflow-x-hidden selection:bg-cyan-500/30">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.08),transparent_50%)]" />
        
        <div className="text-center relative z-10 space-y-6 max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-cyan-950 text-cyan-400 border border-cyan-800/50 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" /> Calibrated for Pearson Edexcel Component 2 (Prose)
          </span>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Stop Writing Block Summaries. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400">
              Master the Comparative Weave.
            </span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            The only automated writing engine designed to train high-achieving students for $A^*$ prose analysis. Eliminate history dumps and structural drift with real-time examiner diagnostics.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/phase4"
              className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg shadow-lg shadow-cyan-600/20 transition-all duration-200 transform hover:-translate-y-0.5 text-center w-full sm:w-auto"
            >
              Launch Writing Workspace
            </Link>
            <Link
              to="/compass"
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-lg border border-slate-800 transition-all duration-200 text-center w-full sm:w-auto"
            >
              Open Prose Compass
            </Link>
          </div>
        </div>

        {/* Hero Preview Card Mockup */}
        <div className="mt-16 bg-slate-900/60 border border-slate-800 rounded-xl p-4 md:p-6 shadow-2xl backdrop-blur-md max-w-5xl mx-auto relative group">
          <div className="absolute -top-3 left-6 px-3 py-1 bg-slate-950 border border-slate-800 text-xs text-slate-500 rounded-md font-mono">
            workspace_diagnostic_active
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm leading-relaxed border border-slate-900">
                <span className="text-slate-500">// Real-time linguistic evaluation pass</span>
                <p className="mt-2 text-slate-300">
                  While Dickens employs a <span className="bg-amber-500/10 text-amber-400 border-b border-amber-500/40 px-0.5">satirical caricature of mechanical nomenclature</span> to interrogate the dehumanising pressures of the 1854 industrial classroom, McEwan, <span className="bg-cyan-500/10 text-cyan-400 border-b border-cyan-500/40 px-0.5">by contrast, utilizes the retrospective unreliability of free indirect discourse</span> to expose how interwar class hegemony pre-determines social guilt.
                </p>
              </div>
            </div>
            <div className="bg-slate-950 rounded-lg p-4 border border-slate-900 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                  <span>METRIC</span>
                  <span>SCORE</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-slate-400 text-sm">AO2/AO3 Symbiosis</span>
                  <span className="text-emerald-400 font-bold font-mono">LEVEL 5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Comparative Weave</span>
                  <span className="text-cyan-400 font-bold font-mono">PASS</span>
                </div>
              </div>
              <div className="bg-emerald-950/40 text-emerald-400 text-xs p-2 rounded border border-emerald-900/50 mt-4">
                ✨ <strong>Symbiosis Verified:</strong> Literary method and socio-political context successfully mapped within a tight 15-word token proximity window.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 4 ENGINEERING FEATURES SECTION */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Architected For Academic Rigour
          </h2>
          <p className="text-slate-400">
            Four specialized developer-grade features built to dismantle descriptive writing habits and enforce structural complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Feature 1: Paragraph Engine */}
          <div className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-xl p-6 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-lg bg-amber-950/50 border border-amber-900/50 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-105 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2 font-mono">01. The Paragraph Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Enforces a strict analytical pipeline from sentence one. Forces students to ground their paragraphs in a shared multi-text thematic thesis statement—the "Conceptual Umbrella"—before deploying evidence.
            </p>
          </div>

          {/* Feature 2: Character Pairings */}
          <div className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-xl p-6 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-lg bg-cyan-950/50 border border-cyan-900/50 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-105 transition-transform">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2 font-mono">02. Functional Equivalence Pairings</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Replaces flat, sequential biographical character profiling with dynamic split-screen comparison cards. Instantly map systemic parallels between the mechanised Coketown Hands and fragmented Dunkirk bodies.
            </p>
          </div>

          {/* Feature 3: Real-Time Essay Linter */}
          <div className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-xl p-6 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-lg bg-rose-950/50 border border-rose-900/50 flex items-center justify-center text-rose-400 mb-6 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2 font-mono">03. Algorithmic Essay Linter</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Runs a dual-pass client and server-side semantic validation loop. Automatically flags the Mimetic Fallacy, isolates descriptive plot-telling, and checks for direct 15-word proximity limits between craft and context.
            </p>
          </div>

          {/* Feature 4: Prose Compass */}
          <div className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-xl p-6 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-lg bg-emerald-950/50 border border-emerald-900/50 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2 font-mono">04. The Prose Compass</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your exam-room tactical coordinator. Sort through historic exam targets by theme or year, pair them with custom thesis tokens, and generate pristine, multi-paragraph model responses anchored to an interactive Examiner Insight sidebar.
            </p>
          </div>

        </div>
      </section>

      {/* 3. ASSESSMENT CODES EXAMINER SECTION */}
      <section className="bg-slate-900/30 border-t border-b border-slate-900 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Calibrated to Eliminate Binary Red Flags
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Senior examiners cap descriptive scripts at lower bands. Our validation model catches stylistic failures programmatically before you submit. If you write an isolated historical block, the editor flags it instantly.
            </p>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-3 text-rose-400 bg-rose-950/20 p-2 rounded border border-rose-900/30">
                <span className="font-bold">ERR_01 [MIMETIC_FALLACY]:</span> Treating setting as history instead of calculated authorial choice.
              </div>
              <div className="flex items-center gap-3 text-amber-400 bg-amber-950/20 p-2 rounded border border-amber-900/30">
                <span className="font-bold">ERR_03 [HISTORY_DUMP]:</span> Segregating historical fact away from formal literary close-reading.
              </div>
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 font-mono text-sm space-y-4">
            <span className="text-slate-500 text-xs">// Automated Rule Token Validation Parser</span>
            <div className="space-y-2 text-xs text-slate-400">
              <p>IF (Paragraph.Sentence CONTAINS Text_A AND Text_B)</p>
              <p className="pl-4 text-emerald-500">AND (Proximity(Context_Term, Literary_Device) &lt;= 15) -&gt; TRUE</p>
              <p className="pl-4 text-slate-600">ELSE -&gt; Trigger AO2_AO3_SYMBIOSIS_MISSING</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FINAL CALL TO ACTION */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto relative z-10">
        <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">
          Ready to Calibrate Your Writing?
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-8">
          Gain immediate access to the structural paragraph templates, character comparative maps, and generative exam compass workspaces.
        </p>
        <Link
          to="/phase4"
          className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold rounded-lg shadow-xl shadow-cyan-500/10 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          Enter the Prose Engine Workspace
        </Link>
      </section>

    </div>
  );
}
