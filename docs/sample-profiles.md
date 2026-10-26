# Sample profiles on Vercel

Vercel builds use the public sample catalogue by default. Local builds continue
to use the Laravel API. Override `NEXT_PUBLIC_PROFILE_SOURCE` with `mock` or
`api` to choose explicitly, then rebuild.

The catalogue at `public/mock_data/profiles.json` contains 100 sample profiles.
List pagination, search, filters and profile detail use this file. Images are
served directly from `/mock_data/Talent_Image/`. Account creation, login and
booking writes still require the backend.

The talent jobs list and detail also use published sample campaigns from
`lib/brand-mvp-data.ts` in mock mode. Demo recruitment dates are relative to the
current date so the recruiting tab stays populated. Job filters, pagination and
detail use the same sample catalogue; private application history is not mocked.

To rebuild the catalogue locally from the supplied CSV templates:

```powershell
powershell -NoProfile -File scripts/build-mock-profiles.ps1
```

The generator selects ghost profiles and maps image folders by profile order,
matching the backend `SyncTalentImages` command. It only exports public profile
fields. Raw CSV templates, archives and asset generation tools are excluded from
Git; do not publish account CSVs, SQL dumps, password hashes or session tokens.

Verification:

```powershell
node --experimental-strip-types --test scripts/mock-talents.test.mjs
npm run build
```
