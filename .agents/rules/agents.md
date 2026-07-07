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