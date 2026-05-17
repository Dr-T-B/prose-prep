import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import type { ParagraphBuilderContext } from '@/types/thesisRoutes';
import { useGradeBMode } from '@/contexts/GradeBModeContext';

type TextareaBlockProps = {
  title: string;
  subtitle?: string;
  value: string;
  onChange: (value: string) => void;
  starter?: string;
  scaffold?: string[];
};

function TextareaBlock({ title, subtitle, value, onChange, starter, scaffold }: TextareaBlockProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        {starter && (
          <div className="mt-2 rounded-sm border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <span className="font-mono uppercase tracking-wider text-[10px] mr-2">Sentence starter</span>
            <span className="italic">{starter}</span>
          </div>
        )}
        {scaffold && scaffold.length > 0 && (
          <ul className="mt-2 list-disc pl-5 text-xs text-amber-900 space-y-1">
            {scaffold.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        )}
      </CardHeader>
      <CardContent>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-28 w-full border p-3"
          placeholder={starter ?? undefined}
        />
      </CardContent>
    </Card>
  );
}

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

  const [topic, setTopic] = useState('');
  const [ht, setHt] = useState('');
  const [at, setAt] = useState('');
  const [comparison, setComparison] = useState('');
  const [ao3, setAo3] = useState('');
  const [interpretive, setInterpretive] = useState('');
  const [saving, setSaving] = useState(false);

  const assembled = useMemo(() => [topic, ht, at, comparison, ao3, interpretive].join(' '), [topic, ht, at, comparison, ao3, interpretive]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const studentId = userData.user?.id;

      if (userError) throw userError;
      if (!studentId) throw new Error('You must be signed in to save paragraph progress.');
      if (!context?.id) throw new Error('Choose a quote pair before saving paragraph progress.');

      const { error: attemptError } = await supabase.from('paragraph_attempts').insert({
        student_id: studentId,
        quote_pair_id: context.id,
        topic_sentence: topic,
        hard_times_analysis: ht,
        atonement_analysis: at,
        ao4_comparison: comparison,
        ao3_context_integration: ao3,
        interpretive_judgement: interpretive,
        final_paragraph: assembled,
        draft_status: 'complete',
      });

      if (attemptError) throw attemptError;

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

      toast.success('Paragraph saved and progress tracked.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save paragraph progress.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const contextErrorMessage = contextError instanceof Error ? contextError.message : null;

  return (
    <div className="p-6 space-y-6">
      <Badge>Paragraph Builder (Tracked)</Badge>

      {!quotePairId && (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Open this builder from a dashboard recommendation or quote-pair route so progress can be tracked.
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">Loading quote pair...</CardContent>
        </Card>
      )}

      {contextErrorMessage && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="pt-6 text-sm text-muted-foreground">{contextErrorMessage}</CardContent>
        </Card>
      )}

      {quotePairId && !isLoading && !contextErrorMessage && !context && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            This quote pair could not be found.
          </CardContent>
        </Card>
      )}

      {context && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{context.quote_pair_code}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {context.theme_label}
          </CardContent>
        </Card>
      )}

      <TextareaBlock
        title="Topic Sentence"
        value={topic}
        onChange={setTopic}
        starter={gradeBMode ? "Both Hard Times and Atonement explore… in order to…" : undefined}
        scaffold={gradeBMode ? ["State a claim that fits both novels.", "Use 'Both… however…' to signal comparison early."] : undefined}
      />
      <TextareaBlock
        title="Hard Times"
        value={ht}
        onChange={setHt}
        starter={gradeBMode ? "Dickens uses [method] in [quote] to suggest…" : undefined}
        scaffold={gradeBMode ? ["Name one method (e.g. metaphor, satire).", "Quote a short phrase.", "Say what feeling or idea it creates."] : undefined}
      />
      <TextareaBlock
        title="Atonement"
        value={at}
        onChange={setAt}
        starter={gradeBMode ? "McEwan, by contrast, uses [method] in [quote] to show…" : undefined}
        scaffold={gradeBMode ? ["Name one method (e.g. focalisation, free indirect discourse).", "Quote a short phrase.", "Say what it makes the reader feel or think."] : undefined}
      />
      <TextareaBlock
        title="Comparison"
        value={comparison}
        onChange={setComparison}
        starter={gradeBMode ? "Whereas Dickens externalises this as…, McEwan internalises it as…" : undefined}
        scaffold={gradeBMode ? ["Name the similarity or difference clearly.", "Avoid 'both authors show' — make the contrast sharp."] : undefined}
      />
      <TextareaBlock
        title="Context"
        value={ao3}
        onChange={setAo3}
        starter={gradeBMode ? "This reflects [context] because…" : undefined}
        scaffold={gradeBMode ? ["Pick one historical or biographical fact.", "Link it to the quote — don't just drop it in."] : undefined}
      />
      <TextareaBlock
        title="Evaluation"
        value={interpretive}
        onChange={setInterpretive}
        starter={gradeBMode ? "Ultimately, this matters because…" : undefined}
        scaffold={gradeBMode ? ["Say what the reader is left to think.", "Link back to the topic sentence."] : undefined}
      />

      <Card>
        <CardContent>
          <p>{assembled}</p>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving || !context}>
        {saving ? 'Saving...' : 'Save + Track Progress'}
      </Button>
    </div>
  );
}
