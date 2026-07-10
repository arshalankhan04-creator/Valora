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
or modifying code, even for scaffolding/setup tasks — not just for business
logic changes.

NEVER run `git commit` or `git push` unless the user explicitly says
"commit" or "push" in that exact message. Finishing a task, even
successfully, is never sufficient reason to commit on your own.

## Frontend Design System (locked)

Colors, font, and spacing below are FIXED — never invent new colors or
fonts outside this palette without being told to.

Primary: #4F46E5 | Primary dark: #3730A3
Background (dark sections): #0F0F17 | Surface: #FFFFFF
Neutral-100: #F4F4F6 | Neutral-400: #9494A0 | Neutral-800: #1E1E27
Success: #22C55E | Warning: #F59E0B | Danger: #EF4444
Font: Inter (all weights via Google Fonts or @fontsource)

Styling rules:
- Tailwind CSS only, no other CSS frameworks.
- Build every UI element as a reusable component in src/components/
  wherever it will be used more than once (Button, Input, Card, Badge,
  NavLink, etc.) — do not copy-paste styled JSX across pages. If a new
  page needs a button, reuse the existing Button component, don't
  hand-roll a new one.
- Before styling a new page/section, ask me whether I have a design
  reference for it. Don't invent a layout from scratch if I might have
  inspiration to share first.
- A styling pass must never change component logic, state, or API calls
  — visual changes only, unless explicitly told otherwise.
- When given a design reference image, adapt its layout, spacing, and
  visual hierarchy — but always substitute in Valora's actual color
  palette (never the reference's original colors) and Valora's actual
  data fields/features. Do not copy filter fields, buttons, or content
  from a reference that don't correspond to something Valora's backend
  actually supports.