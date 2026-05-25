// AnnotatedEssayReview — admin surface for promoting annotated essay pack content
/* eslint-disable react-refresh/only-export-components */
// from 'teacher review required' through the canonical six-status pipeline:
//   draft → teacher review required → reviewed → approved
//                        ↘ needs correction (requires correction notes)
//                        ↘ retired (hidden from students)
//
// Unlike the staged_changes / apply-staged-change pipeline (which proposes
// field-level edits before applying), this surface mutates verification_status
// and review metadata directly on the live row. RLS gates the UPDATE on
// has_role(auth.uid(),'admin'), so only admins can land changes.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, RefreshCw, Search, AlertTriangle } from "lucide-react";

export const ANNOTATED_PACK_TABLES = [
  { key: "essay_questions", label: "Essay questions", titleField: "question_text" },
  { key: "annotated_essays", label: "Annotated essays", titleField: "title" },
  { key: "essay_paragraphs", label: "Essay paragraphs", titleField: "main_argument" },
  { key: "ao_annotations", label: "AO annotations", titleField: "text_span" },
  { key: "paragraph_stems", label: "Paragraph stems", titleField: "stem_text" },
  { key: "quote_method_links", label: "Quote-method links", titleField: "quotation" },
  { key: "misconception_upgrades", label: "Misconception upgrades", titleField: "weakness" },
] as const;

export type AnnotatedPackTable = (typeof ANNOTATED_PACK_TABLES)[number]["key"];

export const VERIFICATION_STATUSES = [
  "draft",
  "teacher review required",
  "reviewed",
  "approved",
  "needs correction",
  "retired",
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

interface ReviewRow {
  id: string;
  table: AnnotatedPackTable;
  tableLabel: string;
  title: string;
  verification_status: VerificationStatus;
  reviewed: boolean;
  reviewed_at: string | null;
  reviewed_by: string | null;
  approved_at: string | null;
  approved_by: string | null;
  review_notes: string | null;
  correction_notes: string | null;
  updated_at: string | null;
  theme: string | null;
  raw: Record<string, unknown>;
}

function statusVariant(s: VerificationStatus) {
  if (s === "approved") return "default" as const;
  if (s === "reviewed") return "secondary" as const;
  if (s === "needs correction") return "destructive" as const;
  if (s === "retired") return "outline" as const;
  return "outline" as const;
}

function truncate(s: string, n = 90) {
  if (!s) return "";
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}

function fmtDate(s: string | null) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}

/**
 * Compute the field patch for a status promotion. Exported for unit testing
 * so the rules can be exercised without a Supabase round-trip.
 */
export function buildPromotionPatch({
  next,
  userId,
  existing,
  notes,
  correctionNotes,
}: {
  next: VerificationStatus;
  userId: string | null;
  existing: Pick<ReviewRow, "reviewed_at" | "approved_at">;
  notes?: string;
  correctionNotes?: string;
}): Record<string, unknown> {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { verification_status: next };
  if (notes !== undefined) patch.review_notes = notes || null;
  if (correctionNotes !== undefined) patch.correction_notes = correctionNotes || null;

  if (next === "reviewed") {
    patch.reviewed = true;
    patch.reviewed_at = existing.reviewed_at ?? now;
    patch.reviewed_by = userId;
    patch.approved_at = null;
    patch.approved_by = null;
  } else if (next === "approved") {
    patch.reviewed = true;
    patch.reviewed_at = existing.reviewed_at ?? now;
    patch.reviewed_by = userId;
    patch.approved_at = now;
    patch.approved_by = userId;
  } else if (next === "needs correction") {
    patch.reviewed = false;
    patch.reviewed_at = null;
    patch.reviewed_by = null;
    patch.approved_at = null;
    patch.approved_by = null;
  } else if (next === "teacher review required") {
    patch.reviewed = false;
    patch.reviewed_at = null;
    patch.reviewed_by = null;
    patch.approved_at = null;
    patch.approved_by = null;
  } else if (next === "retired") {
    // Preserve audit trail (reviewed_at / approved_at), just flip the visibility.
  } else if (next === "draft") {
    patch.reviewed = false;
    patch.reviewed_at = null;
    patch.reviewed_by = null;
    patch.approved_at = null;
    patch.approved_by = null;
  }
  return patch;
}

async function fetchTable(table: AnnotatedPackTable, titleField: string): Promise<ReviewRow[]> {
  // Casting to `never` here is the same escape hatch used by ReviewQueue: these
  // tables aren't in the generated Database types yet.
  const { data, error } = await supabase
    .from(table as never)
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`${table}: ${error.message}`);
  const rows = (data as Record<string, unknown>[] | null) ?? [];
  const tableLabel = ANNOTATED_PACK_TABLES.find((t) => t.key === table)?.label ?? table;
  return rows.map((r): ReviewRow => ({
    id: String(r.id ?? ""),
    table,
    tableLabel,
    title: String(r[titleField] ?? r.id ?? ""),
    verification_status: (String(r.verification_status ?? "teacher review required") as VerificationStatus),
    reviewed: r.reviewed === true,
    reviewed_at: typeof r.reviewed_at === "string" ? r.reviewed_at : null,
    reviewed_by: typeof r.reviewed_by === "string" ? r.reviewed_by : null,
    approved_at: typeof r.approved_at === "string" ? r.approved_at : null,
    approved_by: typeof r.approved_by === "string" ? r.approved_by : null,
    review_notes: typeof r.review_notes === "string" ? r.review_notes : null,
    correction_notes: typeof r.correction_notes === "string" ? r.correction_notes : null,
    updated_at: typeof r.updated_at === "string" ? r.updated_at : null,
    theme: typeof r.theme === "string" ? r.theme : null,
    raw: r,
  }));
}

export default function AnnotatedEssayReview() {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const [tableFilter, setTableFilter] = useState<"all" | AnnotatedPackTable>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | VerificationStatus>("teacher review required");
  const [reviewedFilter, setReviewedFilter] = useState<"all" | "reviewed" | "unreviewed">("all");
  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState("");
  const [draftCorrection, setDraftCorrection] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLastError(null);
    try {
      const all = await Promise.all(
        ANNOTATED_PACK_TABLES.map((t) => fetchTable(t.key, t.titleField)),
      );
      setRows(all.flat());
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLastError(msg);
      toast({ title: "Failed to load review queue", description: msg, variant: "destructive" });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selected = useMemo(() => {
    if (!selectedId) return undefined;
    const sepIndex = selectedId.indexOf("::");
    if (sepIndex < 0) return undefined;
    const tableKey = selectedId.slice(0, sepIndex);
    const id = selectedId.slice(sepIndex + 2);
    return rows.find((r) => r.id === id && r.table === tableKey);
  }, [rows, selectedId]);

  // Sync draft inputs to whichever row is selected.
  useEffect(() => {
    if (!selected) {
      setDraftNotes("");
      setDraftCorrection("");
      return;
    }
    setDraftNotes(selected.review_notes ?? "");
    setDraftCorrection(selected.correction_notes ?? "");
  }, [selected]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (tableFilter !== "all" && r.table !== tableFilter) return false;
      if (statusFilter !== "all" && r.verification_status !== statusFilter) return false;
      if (reviewedFilter === "reviewed" && !r.reviewed) return false;
      if (reviewedFilter === "unreviewed" && r.reviewed) return false;
      if (!q) return true;
      const haystack = [
        r.id,
        r.title,
        r.tableLabel,
        r.verification_status,
        r.theme ?? "",
        r.review_notes ?? "",
        r.correction_notes ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, tableFilter, statusFilter, reviewedFilter, search]);

  const kpis = useMemo(() => {
    const counts: Record<VerificationStatus, number> = {
      draft: 0,
      "teacher review required": 0,
      reviewed: 0,
      approved: 0,
      "needs correction": 0,
      retired: 0,
    };
    rows.forEach((r) => {
      counts[r.verification_status] = (counts[r.verification_status] ?? 0) + 1;
    });
    return counts;
  }, [rows]);

  const promote = useCallback(
    async (row: ReviewRow, next: VerificationStatus) => {
      if (next === "needs correction" && !draftCorrection.trim()) {
        toast({
          title: "Correction notes required",
          description: "Add a correction note before marking this item as needs correction.",
          variant: "destructive",
        });
        return;
      }
      setActing(true);
      const { data: userData } = await supabase.auth.getUser();
      const patch = buildPromotionPatch({
        next,
        userId: userData.user?.id ?? null,
        existing: row,
        notes: draftNotes,
        correctionNotes: draftCorrection,
      });
      const { error } = await supabase
        .from(row.table as never)
        .update(patch as never)
        .eq("id", row.id);
      setActing(false);
      if (error) {
        toast({
          title: "Promotion failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Status updated",
        description: `${row.tableLabel} · ${next}`,
      });
      await load();
    },
    [draftNotes, draftCorrection, load],
  );

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Annotated essay content review</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          Promote annotated essay pack content through the canonical six-status pipeline. Status
          changes update verification metadata in place and are gated by the admin role policy.
        </p>
      </header>

      {/* KPI cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {VERIFICATION_STATUSES.map((s) => (
          <Card key={s}>
            <CardHeader className="pb-2">
              <CardTitle className="text-[11px] font-medium text-muted-foreground capitalize">{s}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">{kpis[s]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Control bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="text-[11px] uppercase tracking-wide text-muted-foreground block mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Title, theme, notes, id…"
                  className="pl-7 h-9"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wide text-muted-foreground block mb-1">Table</label>
              <Select value={tableFilter} onValueChange={(v) => setTableFilter(v as typeof tableFilter)}>
                <SelectTrigger className="w-[200px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tables</SelectItem>
                  {ANNOTATED_PACK_TABLES.map((t) => (
                    <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wide text-muted-foreground block mb-1">Status</label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-[200px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {VERIFICATION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wide text-muted-foreground block mb-1">Reviewed</label>
              <Select value={reviewedFilter} onValueChange={(v) => setReviewedFilter(v as typeof reviewedFilter)}>
                <SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="unreviewed">Unreviewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={load} disabled={loading}>
                <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
          {lastError && (
            <div className="mt-3 flex items-start gap-2 text-destructive text-xs border border-destructive/30 bg-destructive/5 rounded-md p-2">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{lastError}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Queue grid + detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">
                No items match the current filters.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Status</TableHead>
                    <TableHead className="w-[180px]">Table</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[120px]">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const rowKey = `${r.table}::${r.id}`;
                    const isSelected = selectedId === rowKey;
                    return (
                      <TableRow
                        key={rowKey}
                        data-state={isSelected ? "selected" : undefined}
                        onClick={() => setSelectedId(rowKey)}
                        className="cursor-pointer"
                      >
                        <TableCell>
                          <Badge variant={statusVariant(r.verification_status)} className="text-[10px] capitalize">
                            {r.verification_status}
                          </Badge>
                          {r.reviewed && (
                            <Badge variant="secondary" className="text-[10px] ml-1">
                              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> reviewed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">{r.tableLabel}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{truncate(r.title)}</div>
                          <code className="text-[10px] text-muted-foreground">{r.id}</code>
                        </TableCell>
                        <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {r.updated_at ? new Date(r.updated_at).toLocaleDateString() : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 self-start sticky top-4">
          <CardHeader>
            <CardTitle className="text-base">Item detail</CardTitle>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Select an item to inspect and promote.
              </p>
            ) : (
              <DetailPanel
                row={selected}
                notes={draftNotes}
                correction={draftCorrection}
                onNotesChange={setDraftNotes}
                onCorrectionChange={setDraftCorrection}
                onPromote={(next) => promote(selected, next)}
                acting={acting}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface DetailPanelProps {
  row: ReviewRow;
  notes: string;
  correction: string;
  onNotesChange: (v: string) => void;
  onCorrectionChange: (v: string) => void;
  onPromote: (next: VerificationStatus) => void;
  acting: boolean;
}

function DetailPanel({
  row,
  notes,
  correction,
  onNotesChange,
  onCorrectionChange,
  onPromote,
  acting,
}: DetailPanelProps) {
  // Fields we surface in the detail panel for orientation. Other columns stay
  // in the raw object behind a toggle so the panel stays scannable.
  const orientationKeys = [
    "question_text",
    "thesis",
    "main_argument",
    "paragraph_text",
    "stem_text",
    "quotation",
    "text_span",
    "weakness",
    "diagnosis",
    "examiner_summary",
    "method",
    "theme",
    "question_family",
    "ao_requirements",
    "ao_coverage",
    "ao_focus",
    "ao_tags",
    "annotation_type",
    "paragraph_number",
    "paragraph_function",
  ];

  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={statusVariant(row.verification_status)} className="text-[10px] capitalize">
            {row.verification_status}
          </Badge>
          <Badge variant="outline" className="text-[10px]">{row.tableLabel}</Badge>
          {row.reviewed && <Badge variant="secondary" className="text-[10px]">reviewed</Badge>}
        </div>
        <code className="text-[11px] text-muted-foreground break-all block">{row.id}</code>
      </div>

      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Orientation</div>
        <div className="rounded-md border bg-muted/30 p-3 text-xs space-y-1.5 max-h-72 overflow-auto">
          {orientationKeys
            .filter((k) => row.raw[k] != null && row.raw[k] !== "")
            .map((k) => {
              const v = row.raw[k];
              const display = Array.isArray(v) ? v.join(" · ") : String(v);
              return (
                <div key={k}>
                  <span className="text-muted-foreground">{k}: </span>
                  <span>{truncate(display, 240)}</span>
                </div>
              );
            })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <div className="text-muted-foreground">Reviewed at</div>
          <div className="font-mono">{fmtDate(row.reviewed_at)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Approved at</div>
          <div className="font-mono">{fmtDate(row.approved_at)}</div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-wide text-muted-foreground block">
          Review notes
        </label>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
          className="text-xs"
          placeholder="Context for this decision."
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-wide text-muted-foreground block">
          Correction notes <span className="text-destructive">(required for "needs correction")</span>
        </label>
        <Textarea
          value={correction}
          onChange={(e) => onCorrectionChange(e.target.value)}
          rows={2}
          className="text-xs"
          placeholder="What needs correcting and why?"
        />
      </div>

      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Promote to</div>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" disabled={acting} onClick={() => onPromote("reviewed")}>
            Mark reviewed
          </Button>
          <Button size="sm" disabled={acting} onClick={() => onPromote("approved")}>
            Approve
          </Button>
          <Button size="sm" variant="destructive" disabled={acting} onClick={() => onPromote("needs correction")}>
            Needs correction
          </Button>
          <Button size="sm" variant="outline" disabled={acting} onClick={() => onPromote("teacher review required")}>
            Return to review
          </Button>
          <Button size="sm" variant="outline" disabled={acting} onClick={() => onPromote("draft")}>
            Move to draft
          </Button>
          <Button size="sm" variant="outline" disabled={acting} onClick={() => onPromote("retired")}>
            Retire
          </Button>
        </div>
      </div>
    </div>
  );
}
