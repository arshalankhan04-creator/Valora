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

NEVER run `git commit` or `git push` unless the user explicitly says
"commit" or "push" in that exact message. Finishing a task, even
successfully, is never sufficient reason to commit on your own.

## Project status (update this as pages get finished — do not treat
## outdated status notes below as current without checking the actual
## codebase first)

Backend: Phases A–E complete (Auth, Listings+Images, Inquiries/Chat,
Admin Panel, Email notifications) — fully built and tested.

Frontend, visually redesigned AND functional (real backend data,
not static): Home, Browse, Listing Detail, Create/Edit Listing,
Chat/Inquiries (Inquiries.jsx + InquiryThread.jsx), Admin Panel,
Seller Dashboard.

Frontend, NOT yet redesigned: Login.jsx, Register.jsx (in progress).

We are past the "static-UI-only" phase. Wiring real backend data into
a page is now normal and expected, not an exception — the early
static-first phase applied only to the initial landing-page mockup
pass and is no longer a blanket rule.

## Frontend Design System

Colors are NOT locked yet — match whatever the current reference image
calls for per page. Font is locked: Inter, all weights.

Styling rules:
- Tailwind CSS only, no other CSS frameworks. No TypeScript, no
  shadcn/ui, no Radix UI — plain JavaScript + Tailwind + our own
  components only.
- Build every UI element as a reusable component in src/components/
  wherever it will be used more than once (Button, Input, Card, Badge,
  NavLink, etc.) — reuse existing ones (Button.jsx, CarCard.jsx, etc.)
  rather than creating parallel/duplicate versions.
- Before styling a new page/section, ask me whether I have a design
  reference for it.
- When a reference design includes a feature we haven't built on the
  backend yet (e.g. Trust Score, condition assessment, comparison
  tool), build the UI as a visual placeholder — a disabled-looking
  element, greyed out, with a "Coming Soon" label — never fake it with
  hardcoded data or a realistic-looking number that implies a real
  computed result.
- When restyling a page that already has real, working logic
  (validation, access control, data fetching, business rules), the
  redesign is a VISUAL change only. Identify every existing functional
  behavior on that page before restyling, and explicitly preserve it —
  do not let a visual overhaul silently drop, simplify, or omit
  functional behavior that already works. If unsure whether something
  should be preserved, ask rather than dropping it.

## Plan Mode (single source of truth)

- BACKEND/logic changes (API routes, schemas, business logic, anything
  touching data or state): propose an implementation plan and wait for
  approval before writing code.
- DESIGN/STYLING-ONLY changes (Tailwind classes, layout, colors, static
  markup, new visual sections, restyling existing pages): NEVER
  produce a plan. Go straight to making the code edit, then report
  what changed. Use judgment based on what's being asked — visual/
  layout/styling = no plan; new API endpoint, schema field, or
  business logic = plan.

## Dev server & browser behavior

Assume the Vite dev server is already running in a terminal I control.
Do NOT start, stop, or restart it after making frontend changes, unless
I explicitly ask. Do NOT automatically open, launch, navigate, or
refresh a browser after a change — I will check results myself in my
own already-open tab. Just make the edit and stop.