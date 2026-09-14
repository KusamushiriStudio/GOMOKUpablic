# TRIAD Supabase backend

`functions/api` is the authoritative ONLINE API. The generated `game-core.js` uses exactly the
same profile, gacha and match rules as `index.html`, so LOCAL and ONLINE do not drift.

## Build and verify

```powershell
node tools/extract-edge-core.mjs
node --test
supabase functions serve api --no-verify-jwt
```

## Deploy

Link the existing project, review the migration against a backup/staging project, and then run:

```powershell
supabase link --project-ref smblibukiazihefecwmo
supabase db push
supabase functions deploy api
```

The function requires the standard hosted secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY`. Never commit their values.

Important: deploy the migration before the function. Existing browser save data is not changed.
The first ONLINE profile read passes through `normalizeProfile`, which preserves XP/items and
unlocks all six characters.
