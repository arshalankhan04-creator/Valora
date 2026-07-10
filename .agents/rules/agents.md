---
trigger: always_on
---

Valora

I am Team Member A. I own ONLY the MERN stack: React, Node/Express, MongoDB.
Never write Django/Python code — that's my teammate's responsibility.

Stack: Node.js, Express, MongoDB (local, mongodb://localhost:27017/valora),
Mongoose, JWT + bcrypt auth, Multer for local image uploads (no Cloudinary yet).

Before generating backend code, read docs/Valora_Final_Spec_APIs.md and
docs/Valora_Team_Workflow.md, especially the Node ↔ Django API Contract
(workflow doc, section 8). Match field names and response shapes exactly,
even for fields we can't populate yet (leave them null/default).

Folder structure: models/, controllers/, routes/, middleware/, utils/, uploads/.
One phase at a time — do not build ahead of what I've asked for in this prompt.
Every route needs clean error handling (proper 400/401/403, no silent failures).

Do not over-engineer: no features, abstractions, or config beyond what I asked for.
If anything is unclear, ambiguous, or you're making an assumption — stop and ask
me before writing code, rather than guessing.

Always propose an implementation plan and wait for approval before writing
or modifying BACKEND code (including scaffolding/setup tasks) — this does
NOT apply to design/styling-only changes, see the Plan Mode section below
for those.

NEVER run `git commit` or `git push` unless the user explicitly says
"commit" or "push" in that exact message. Finishing a task, even
successfully, is never sufficient reason to commit on your own.

## Frontend Design System (in progress — palette NOT locked)

We are in a static-UI-first design phase. Colors are NOT fixed yet —
match whatever the current reference image calls for. Font is locked:
Inter, all weights.

Once the full static landing page design is approved, we will extract
a final palette from what was actually built and lock it at that point.

Styling rules:
- Tailwind CSS only, no other CSS frameworks.
- Build every UI element as a reusable component in src/components/
  wherever it will be used more than once (Button, Input, Card, Badge,
  NavLink, etc.).
- Before styling a new page/section, ask me whether I have a design
  reference for it.
- Current phase: STATIC UI ONLY. Use placeholder/dummy data and static
  markup. Do NOT wire up API calls, backend integration, or real state
  management during this phase unless explicitly told to. We will
  integrate with the real backend as a separate phase after the full
  static design is approved.
- When a reference design includes a feature we haven't built on the
  backend yet (e.g. comparison tool, Browse by Brand), build the UI
  as a visual placeholder — either a disabled-looking element, a
  "Coming Soon" state, or a link to a stub route — never fake it with
  hardcoded data that looks live.

## Plan mode — design vs. backend work

For BACKEND or logic changes (API routes, schemas, business logic,
anything that touches data or state): always propose an implementation
plan and wait for approval before writing code, as established earlier.

For DESIGN/STYLING-ONLY changes (Tailwind classes, layout, colors,
static markup, new visual sections): skip the implementation plan step
entirely — just make the change directly and show me the result. Design
work is fast to redo and slow to plan-and-approve; the "plan" adds
friction with no real benefit here since I need to SEE the visual result
to judge it, not read a description of it.

CRITICAL: For any prompt that begins with "Design-only change" — do NOT
output an implementation plan under any circumstance. Go straight to
making the code edit and report what you changed afterward. Producing
a plan for these prompts is a rule violation.

For backend/logic changes, continue proposing a plan and waiting for
approval as before.

## Plan Mode (single source of truth — supersedes any other planning
instruction in this file)

- BACKEND/logic changes (API routes, schemas, business logic, anything
  touching data or state): propose an implementation plan and wait for
  approval before writing code.
- DESIGN/STYLING-ONLY changes (Tailwind classes, layout, colors, static
  markup, new visual sections): NEVER produce a plan. Go straight to
  making the code edit, then report what changed. This applies by
  default to any prompt in the current static-UI design phase — you do
  not need to see the words "design-only" to know a prompt is design
  work; use judgment based on what's being asked (visual/layout/styling
  = no plan; new API endpoint, schema field, or business logic = plan).