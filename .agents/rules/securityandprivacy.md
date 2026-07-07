---
trigger: always_on
---

## Security & Privacy — check before every commit/push

Before staging or committing any files, verify:
- No .env file, API key, DB connection string, or JWT secret is included in the
  diff — these must only exist locally, never in git.
- .gitignore includes at minimum: .env, node_modules/, uploads/* (except
  .gitkeep), and any credentials or config files with real secrets.
- No hardcoded secrets, passwords, or tokens appear inline in any .js file —
  all secrets come from process.env, never literals.
- No real user data, test accounts with real emails/passwords, or uploaded
  images with personal/identifying content are committed — use placeholder
  data only.
- If a .env.example file doesn't exist yet, create one listing required
  variable names with placeholder values (e.g. JWT_SECRET=your_secret_here),
  so the repo documents what's needed without exposing real values.

If any of the above is found in a set of changes about to be committed, stop
and flag it to me instead of committing — do not silently exclude or silently
include it.