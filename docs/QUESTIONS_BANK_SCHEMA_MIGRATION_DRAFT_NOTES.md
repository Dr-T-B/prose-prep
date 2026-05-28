# Questions Bank Schema Migration Draft Notes

**Important context:**

The migration draft `supabase/migrations/20260528131629_add_question_bank_metadata.sql` is a **local draft only**. 

- It must **not** be applied to the remote database until explicit approval is given.
- Do not run `supabase db push`, `supabase migration up`, or similar mutating commands.
- No data import is included in this phase.
- Once this PR and subsequent adapter testing PRs are verified, a separate deliberate deployment step will be needed.
