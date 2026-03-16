# /cv.feature

Goal: plan or revise a single feature through dialogue, then crystallize it into the spec.

Process:
1) Confirm feature intent and boundaries.
2) Check contracts, component registry, and variable library for constraints and reuse.
3) Draft a feature section in `.cv/spec.md` (or `.cv/spec/features/FEAT-###.md` if user prefers).
4) Ensure it includes:
   - Goal
   - User story (optional)
   - Functional requirements (what)
   - Implementation notes (how, but not code)
   - Acceptance criteria
   - Verification steps
   - Edge cases
   - Assumptions / open questions

Reuse discipline:
- If UI is involved, you must reference `.cv/components/registry.md` first.
- If adding a new component seems necessary, recommend `/cv.component`.
- If adding/changing tokens/naming, recommend `/cv.vars`.

Never:
- generate coding tasks unless /cv.tasks
- silently expand scope

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
