import { useState, useEffect } from "react";
import { useContent } from "@/lib/ContentProvider";
import { PAST_PAPER_QUESTIONS } from "@/data/pastPapers";
import { PastPaperQuestion, EssayGenerationResult } from "@/types/essayGenerator";
import { generateModelEssay } from "@/services/essayGenerationService";
import { Button } from "@/components/ui/button";
import { Loader2, Award, BookOpen, Layers, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

export default function ProseCompass() {
  const { comparative_matrix } = useContent();

  // Selected state
  const [selectedQuestion, setSelectedQuestion] = useState<PastPaperQuestion | null>(null);
  const [activeThesisAxis, setActiveThesisAxis] = useState<string>("");
  const [questionText, setQuestionText] = useState<string>("");
  const [theme, setTheme] = useState<string>("");

  // Loading & Generation state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<EssayGenerationResult | null>(null);
  const [activeTab, setActiveTab] = useState<"essay" | "breakdown">("essay");

  // Accordion state
  const [expandedThemes, setExpandedThemes] = useState<Record<string, boolean>>({
    Childhood: true,
  });

  // Group past paper questions by theme
  const questionsByTheme = PAST_PAPER_QUESTIONS.reduce((acc, q) => {
    if (!acc[q.theme]) {
      acc[q.theme] = [];
    }
    acc[q.theme].push(q);
    return acc;
  }, {} as Record<string, PastPaperQuestion[]>);

  // Auto-populate when a question is clicked
  const handleSelectQuestion = (q: PastPaperQuestion) => {
    setSelectedQuestion(q);
    setQuestionText(q.questionText);
    setTheme(q.theme);

    // Auto-select a default thesis axis if none is active or if we want a fresh start
    if (comparative_matrix && comparative_matrix.length > 0) {
      // Find one that shares a theme if possible, otherwise select the first one
      const matchingAxis = comparative_matrix.find((m) =>
        m.themes.some((t) => t.toLowerCase().includes(q.theme.toLowerCase()))
      );
      if (matchingAxis) {
        setActiveThesisAxis(matchingAxis.axis);
      } else {
        setActiveThesisAxis(comparative_matrix[0].axis);
      }
    }
  };

  // Toggle theme accordions
  const toggleTheme = (themeName: string) => {
    setExpandedThemes((prev) => ({
      ...prev,
      [themeName]: !prev[themeName],
    }));
  };

  // Trigger model essay generation
  const handleGenerate = async () => {
    if (!questionText.trim()) {
      toast.error("Please enter or select an exam question.");
      return;
    }
    if (!activeThesisAxis) {
      toast.error("Please select a comparative thesis axis from the bank.");
      return;
    }

    setLoading(true);
    setError(null);
    setGenerationResult(null);

    try {
      const result = await generateModelEssay(
        questionText,
        theme || "General Prose Study",
        activeThesisAxis
      );
      setGenerationResult(result);
      setActiveTab("essay");
      toast.success("Model essay generated successfully!");
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Failed to generate model essay. Please verify your connection or VITE_GEMINI_API_KEY configuration."
      );
      toast.error("Generation failed. See details below.");
    } finally {
      setLoading(false);
    }
  };

  // Initial populate
  useEffect(() => {
    if (PAST_PAPER_QUESTIONS.length > 0 && !selectedQuestion) {
      handleSelectQuestion(PAST_PAPER_QUESTIONS[0]);
    }
  }, []);

  return (
    <div className="bg-[#0b0a10] text-[#f0ebe0] min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <header className="border-b border-[#26233a] pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#c4a24a]">
              Pearson Edexcel A-Level · Component 2 · Prose
            </p>
            <h1 className="mt-2 font-serif text-4xl sm:text-5xl leading-tight tracking-tight text-[#f0ebe0]">
              Prose Compass Workspace
            </h1>
            <p className="mt-2 text-sm text-[#7a7268] max-w-2xl font-serif">
              Architect and generate Level 5 (A*) comparative model essays for 'Hard Times' & 'Atonement' utilizing senior-examiner paradigms.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#141219] border border-[#26233a] px-3 py-1.5 rounded-md font-serif italic text-xs text-[#c4a24a]">
            <span>Active Texts:</span>
            <span className="font-mono not-italic text-[10px] bg-[#c4a24a]/10 border border-[#c4a24a]/30 px-2 py-0.5 rounded text-[#c4a24a]">
              Hard Times x Atonement
            </span>
          </div>
        </header>

        {/* Workspace Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Past Paper Bank */}
          <aside className="lg:col-span-4 bg-[#141219] border border-[#26233a] rounded-xl p-6 space-y-6">
            <div>
              <h2 className="font-serif text-xl text-[#f0ebe0] flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#c4a24a]" />
                Past Paper Bank
              </h2>
              <p className="text-xs text-[#7a7268] mt-1">
                Select an Edexcel past examination question to populate the control canvas.
              </p>
            </div>

            <div className="space-y-4">
              {Object.keys(questionsByTheme).map((themeName) => {
                const isOpen = !!expandedThemes[themeName];
                return (
                  <div key={themeName} className="border border-[#1c1a28] rounded-lg overflow-hidden bg-[#0d0c12]">
                    <button
                      onClick={() => toggleTheme(themeName)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-[#181620] text-left hover:bg-[#1f1d28] transition-colors"
                    >
                      <span className="font-serif text-sm font-semibold text-[#f0ebe0]">
                        {themeName}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-[#7a7268]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[#7a7268]" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-[#1c1a28] bg-[#0d0c12]">
                        {questionsByTheme[themeName].map((q) => {
                          const isSelected = selectedQuestion?.id === q.id;
                          return (
                            <button
                              key={q.id}
                              onClick={() => handleSelectQuestion(q)}
                              className={`w-full text-left p-4 hover:bg-[#141219] transition-all flex flex-col gap-2 ${
                                isSelected ? "bg-[#c4a24a]/5 border-l-2 border-[#c4a24a]" : ""
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-mono text-[9px] uppercase tracking-wider text-[#c4a24a]">
                                  {q.examBoard} · {q.year}
                                </span>
                                {isSelected && (
                                  <span className="font-mono text-[9px] uppercase text-[#c4a24a] bg-[#c4a24a]/10 px-1.5 py-0.2 rounded">
                                    Selected
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-[13px] leading-relaxed text-[#7a7268] group-hover:text-[#f0ebe0] font-serif transition-colors">
                                "{q.questionText}"
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Right Panel: Canvas & Output */}
          <main className="lg:col-span-8 space-y-8">
            
            {/* Control Canvas */}
            <div className="bg-[#141219] border border-[#26233a] rounded-xl p-6 space-y-6">
              <div>
                <h2 className="font-serif text-xl text-[#f0ebe0] flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#c4a24a]" />
                  Central Control Canvas
                </h2>
                <p className="text-xs text-[#7a7268] mt-1">
                  Configure your baseline thesis pairing and question details below.
                </p>
              </div>

              {/* Thesis Axis Bank */}
              <div className="space-y-3">
                <label className="font-mono text-[11px] uppercase tracking-wider text-[#7a7268] block">
                  Thesis Axis Bank (Comparative Matrix)
                </label>
                <div className="flex flex-wrap gap-2">
                  {comparative_matrix && comparative_matrix.length > 0 ? (
                    comparative_matrix.map((axisItem) => {
                      const isSelected = activeThesisAxis === axisItem.axis;
                      return (
                        <button
                          key={axisItem.id}
                          onClick={() => setActiveThesisAxis(axisItem.axis)}
                          className={`px-3 py-1.5 rounded-full text-xs font-serif transition-all border ${
                            isSelected
                              ? "bg-[#c4a24a]/10 border-[#c4a24a] text-[#c4a24a] shadow-[0_0_10px_rgba(196,162,74,0.15)]"
                              : "bg-[#0b0a10] border-[#26233a] text-[#7a7268] hover:border-[#7a7268] hover:text-[#f0ebe0]"
                          }`}
                        >
                          {axisItem.axis}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-xs text-[#7a7268] italic">
                      Loading comparative axes...
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text Area */}
              <div className="space-y-3">
                <label
                  htmlFor="exam-question-input"
                  className="font-mono text-[11px] uppercase tracking-wider text-[#7a7268] block"
                >
                  Active Exam Question
                </label>
                <textarea
                  id="exam-question-input"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Paste or type your custom Edexcel A-Level comparative exam question here..."
                  className="w-full min-h-[100px] bg-[#0b0a10] border border-[#26233a] rounded-lg text-[#f0ebe0] p-4 text-[14px] leading-relaxed font-serif focus:outline-none focus:border-[#c4a24a] focus:ring-1 focus:ring-[#c4a24a] transition-all resize-y"
                />
              </div>

              {/* Action trigger */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full sm:w-auto bg-[#c4a24a]/10 border border-[#c4a24a] hover:bg-[#c4a24a] hover:text-[#0b0a10] text-[#c4a24a] font-serif font-medium font-italic italic px-6 py-5 rounded-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating Essay...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Model Essay</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Loading / Empty / Error State */}
            {loading && (
              <div className="bg-[#141219] border border-[#26233a] rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 text-[#c4a24a] animate-spin" />
                <h3 className="font-serif text-lg text-[#f0ebe0] italic">
                  Summoning Senior Examiner Core...
                </h3>
                <p className="text-xs text-[#7a7268] max-w-sm">
                  Weaving comparative dialectics, enforcing AO2/AO3 symbiosis, and writing model introduction and body paragraphs.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-[#8a3050]/10 border border-[#8a3050] text-[#e8a0b0] rounded-xl p-6 space-y-2 font-serif text-sm">
                <p className="font-bold">Generation failed</p>
                <p className="text-xs leading-relaxed opacity-90">{error}</p>
                <div className="text-[11px] font-mono text-[#7a7268] pt-2">
                  Tip: Supply your Gemini key via the `.env.local` or environment file as `VITE_GEMINI_API_KEY`.
                </div>
              </div>
            )}

            {/* Output View Layout */}
            {!loading && generationResult && (
              <div className="space-y-6">
                
                {/* Tab selector */}
                <div className="flex border-b border-[#26233a] gap-2">
                  <button
                    onClick={() => setActiveTab("essay")}
                    className={`pb-3 px-4 font-serif text-base font-semibold border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === "essay"
                        ? "border-[#c4a24a] text-[#f0ebe0]"
                        : "border-transparent text-[#7a7268] hover:text-[#f0ebe0]"
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                    Model Essay
                  </button>
                  <button
                    onClick={() => setActiveTab("breakdown")}
                    className={`pb-3 px-4 font-serif text-base font-semibold border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === "breakdown"
                        ? "border-[#c4a24a] text-[#f0ebe0]"
                        : "border-transparent text-[#7a7268] hover:text-[#f0ebe0]"
                    }`}
                  >
                    <Award className="h-4 w-4" />
                    Examiner Breakdown
                  </button>
                </div>

                {/* Tab 1: Model Essay */}
                {activeTab === "essay" && (
                  <div className="space-y-6 font-serif">
                    
                    {/* Introduction */}
                    <div className="bg-[#141219] border border-[#26233a] rounded-xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#c4a24a]" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#c4a24a] bg-[#c4a24a]/5 border border-[#c4a24a]/25 px-2 py-0.5 rounded block w-fit mb-3">
                        Introduction
                      </span>
                      <p className="text-sm sm:text-base leading-relaxed text-[#f0ebe0] italic">
                        {generationResult.modelAnswer.introduction}
                      </p>
                    </div>

                    {/* Body Paragraph 1 */}
                    <div className="bg-[#141219] border border-[#26233a] rounded-xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#3a8a7a]" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#3a8a7a] bg-[#3a8a7a]/5 border border-[#3a8a7a]/25 px-2 py-0.5 rounded block w-fit mb-3">
                        Analytical Paragraph 1
                      </span>
                      <p className="text-sm sm:text-base leading-relaxed text-[#f0ebe0]">
                        {generationResult.modelAnswer.bodyParagraph1}
                      </p>
                    </div>

                    {/* Body Paragraph 2 */}
                    <div className="bg-[#141219] border border-[#26233a] rounded-xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#c47a2a]" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#c47a2a] bg-[#c47a2a]/5 border border-[#c47a2a]/25 px-2 py-0.5 rounded block w-fit mb-3">
                        Analytical Paragraph 2
                      </span>
                      <p className="text-sm sm:text-base leading-relaxed text-[#f0ebe0]">
                        {generationResult.modelAnswer.bodyParagraph2}
                      </p>
                    </div>

                    {/* Body Paragraph 3 */}
                    <div className="bg-[#141219] border border-[#26233a] rounded-xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#8a3050]" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#8a3050] bg-[#8a3050]/5 border border-[#8a3050]/25 px-2 py-0.5 rounded block w-fit mb-3">
                        Analytical Paragraph 3
                      </span>
                      <p className="text-sm sm:text-base leading-relaxed text-[#f0ebe0]">
                        {generationResult.modelAnswer.bodyParagraph3}
                      </p>
                    </div>

                    {/* Conclusion */}
                    <div className="bg-[#141219] border border-[#26233a] rounded-xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#c4a24a]" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#c4a24a] bg-[#c4a24a]/5 border border-[#c4a24a]/25 px-2 py-0.5 rounded block w-fit mb-3">
                        Conclusion
                      </span>
                      <p className="text-sm sm:text-base leading-relaxed text-[#f0ebe0] italic">
                        {generationResult.modelAnswer.conclusion}
                      </p>
                    </div>

                  </div>
                )}

                {/* Tab 2: Examiner Breakdown */}
                {activeTab === "breakdown" && (
                  <div className="space-y-6">
                    
                    {/* Top indicator bar */}
                    <div className="bg-[#181620] border border-[#26233a] rounded-xl p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#c4a24a]/10 p-2 rounded-lg border border-[#c4a24a]/30">
                          <Award className="h-5 w-5 text-[#c4a24a]" />
                        </div>
                        <div>
                          <h4 className="font-serif text-[#f0ebe0] font-semibold text-sm">
                            Edexcel Level 5 (A*) Grade Calibrated
                          </h4>
                          <p className="text-xs text-[#7a7268]">
                            Strictly assessed against official A* band descriptions.
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#c4a24a] border border-[#c4a24a] px-3 py-1 rounded-lg">
                        Grade: A*
                      </span>
                    </div>

                    {/* AO1 */}
                    <div className="bg-[#141219] border border-[#26233a] rounded-xl p-6 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-[#9333ea]/20 text-[#c084fc] border border-[#a855f7]/30 px-2 py-0.5 rounded">
                          AO1
                        </span>
                        <h4 className="font-serif text-sm font-semibold text-[#f0ebe0]">
                          Conceptual Umbrella Notes
                        </h4>
                      </div>
                      <p className="text-[13px] leading-relaxed text-[#7a7268] font-serif">
                        {generationResult.examinerBreakdown.ao1_conceptual_umbrella_notes}
                      </p>
                    </div>

                    {/* AO2 */}
                    <div className="bg-[#141219] border border-[#26233a] rounded-xl p-6 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-[#0284c7]/20 text-[#38bdf8] border border-[#0ea5e9]/30 px-2 py-0.5 rounded">
                          AO2
                        </span>
                        <h4 className="font-serif text-sm font-semibold text-[#f0ebe0]">
                          Micro-Linguistic Highlights
                        </h4>
                      </div>
                      <p className="text-[13px] leading-relaxed text-[#7a7268] font-serif">
                        {generationResult.examinerBreakdown.ao2_micro_linguistic_highlights}
                      </p>
                    </div>

                    {/* AO3 */}
                    <div className="bg-[#141219] border border-[#26233a] rounded-xl p-6 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-[#ea580c]/20 text-[#fb923c] border border-[#f97316]/30 px-2 py-0.5 rounded">
                          AO3
                        </span>
                        <h4 className="font-serif text-sm font-semibold text-[#f0ebe0]">
                          Symbiosis Validation
                        </h4>
                      </div>
                      <p className="text-[13px] leading-relaxed text-[#7a7268] font-serif">
                        {generationResult.examinerBreakdown.ao3_symbiosis_validation}
                      </p>
                    </div>

                    {/* AO4 */}
                    <div className="bg-[#141219] border border-[#26233a] rounded-xl p-6 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-[#16a34a]/20 text-[#4ade80] border border-[#22c55e]/30 px-2 py-0.5 rounded">
                          AO4
                        </span>
                        <h4 className="font-serif text-sm font-semibold text-[#f0ebe0]">
                          Comparative Pivot Excellence
                        </h4>
                      </div>
                      <p className="text-[13px] leading-relaxed text-[#7a7268] font-serif">
                        {generationResult.examinerBreakdown.ao4_comparative_pivot_excellence}
                      </p>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* Setup Help */}
            {!generationResult && !loading && (
              <div className="bg-[#141219] border border-[#1c1a28] rounded-xl p-6">
                <h3 className="font-serif text-sm text-[#7a7268] uppercase tracking-wider mb-3">
                  How to utilize the Prose Compass
                </h3>
                <div className="font-serif text-[13px] leading-relaxed text-[#7a7268] space-y-3">
                  <p>
                    1. <strong className="text-[#f0ebe0]">Select a Question</strong>: Use the Past Paper Bank on the left sidebar to select a Pearson Edexcel past paper prompt. The question details and theme will automatically load.
                  </p>
                  <p>
                    2. <strong className="text-[#f0ebe0]">Choose a Thesis Axis</strong>: Tapping any chip in the Thesis Axis Bank will baseline the comparative joint on which your essay plans and paragraph transitions will hinge.
                  </p>
                  <p>
                    3. <strong className="text-[#f0ebe0]">Refine & Generate</strong>: Edit the question text in the Control Canvas if needed, then hit "Generate Model Essay" to run the LLM compiler.
                  </p>
                  <p>
                    4. <strong className="text-[#f0ebe0]">Analyse Results</strong>: Examine the generated introduction, body paragraphs, and conclusion under the Model Essay tab, and study the examiners grading critiques under the Examiner Breakdown tab.
                  </p>
                </div>
              </div>
            )}

          </main>
        </div>

      </div>
    </div>
  );
}
