
CREATE TABLE IF NOT EXISTS public.quotes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text             text        NOT NULL,
  attribution      text        NOT NULL,
  location         text,
  source           text        NOT NULL
                     CHECK (source IN ('hard-times','atonement')),
  word_analysis    text,
  a_star_insight   text,
  anchor_id        text UNIQUE,
  paired_anchor_id text,
  is_verified      boolean     NOT NULL DEFAULT false,
  ao_tags          text[]      NOT NULL DEFAULT '{}',
  theme_tags       text[]      NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon read"
  ON public.quotes
  FOR SELECT TO anon
  USING (true);
