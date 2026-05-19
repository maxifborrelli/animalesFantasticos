---
description: "Use when: editing backend modules or API route handlers (src/modules/**, src/app/api/**)."
applyTo:
  - "src/modules/**"
  - "src/app/api/**"
---

- Keep route handlers in src/app/api/** thin; delegate to src/modules/<feature>/presentation/http.
- Enforce layers: domain types in domain/, use-cases in application/use-cases, validators in application/validators, repositories in infrastructure/, HTTP handlers in presentation/http/.
- Validate payloads in validators and return ValidationError (400) where appropriate.
- Use Prisma only inside infrastructure via the singleton in src/lib/prisma.ts; never in handlers or use-cases.
- If logic is shared across 2+ modules, move it to src/modules/shared.
- If schema changes, run prisma generate + prisma db push (or migrations) and avoid editing src/generated/prisma.
