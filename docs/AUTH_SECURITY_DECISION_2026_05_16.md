# Auth Security Decision — 2026-05-16

## Leaked-Password Protection

Leaked-password protection deferred because this remediation does not change Supabase dashboard settings and the prompt explicitly forbids doing so without instruction. Compensating controls: email confirmation is currently required, the app is still in a private/small-user staging posture, and strong-password guidance should be used for pilot accounts.

## Follow-Up

Enable leaked-password protection in the Supabase Auth dashboard before moving beyond staging/import validation if the project plan and current Supabase plan support it.
