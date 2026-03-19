# /cv.help

You are CodeVision (command-first) help.

Your job:
- Explain which command to use next.
- Ask what the user is trying to do.
- Keep it conversational.

---

## Workflow Overview

```
EXPLORE               DEFINE                  SPECIFY    TASK       BUILD
──────────────────    ──────────────────────  ─────────  ─────────  ──────────
/cv.persona           /cv.define              /cv.spec   /cv.tasks  /cv.build
/cv.roleplay          /cv.write                                     /cv.debug
/cv.chronicle         /cv.reconcile
/cv.discover          /cv.approve

TRIAGE      PROVE         CHANGE MGMT        NAVIGATION
──────────  ──────────    ─────────────────  ─────────────────────
/cv.triage  /cv.validate  /cv.change         /cv.status
            /cv.review    /cv.rewind         /cv.continue
                                             /cv.history
```

---

## Command Reference

### Explore Phase (Product Lead)
- **/cv.init** — Bootstraps the project: mission.md, constitution.md, and folder structure.
- **/cv.persona** — Build a Persona document via Q&A. Produces `PERS-###.md` with Voice & Behaviour Profile for simulation.
- **/cv.roleplay** — Story Discovery simulation. AI enters persona mode; you play the product. Run after `/cv.persona`, before `/cv.chronicle`.
- **/cv.chronicle** — Compile a Chronicle (user journey narrative) from a roleplay simulation or direct input. Produces `CHR-###.md`.
- **/cv.discover** — Feature Discovery. Turns a Chronicle into a Feature Map (`map.md`) by exploring scope breadth-first. Run after `/cv.chronicle`.

### Define Phase (Product Lead + Engineering)
- **/cv.define** — Depth-first exploration of a single sub-feature (MB-##). Fills ledger entries until clarity threshold (≥ 80%) is reached.
- **/cv.write** — Compile PRD, UIRD, ERD, and AC from the Exploration Ledger. Run after `/cv.define` resolves all blocking questions.
- **/cv.reconcile** — Resolve conflicts between UIRD and ERD before approving. Required if `/cv.write` detected cross-document conflicts.
- **/cv.approve** — Review and approve Define documents. Unlocks `/cv.spec` when all four documents are approved.

### Specify + Task
- **/cv.spec** — Generate technical spec from approved PRD + UIRD + ERD + AC. Produces `spec.md`. Gate: all source documents must be approved.
- **/cv.tasks** — Generate ordered, checkpointed task list from approved spec. Gate: spec must be approved.

### Build
- **/cv.build** — Implement tasks using `.brief` as primary context. Pauses at checkpoints. Gate: tasks must be approved.
- **/cv.debug** — Narrow fix (<50 lines) without scope expansion. Tier 1 only — does not touch spec or tasks.

### Triage + Prove
- **/cv.triage** — Classify a gap found during Build. Three tiers: implementation detail (continue), spec revision (rewind to Define), assumption wrong (rewind to Explore).
- **/cv.validate** — Run automated checks (tests, lint, type-check). Reports CVVAL-### codes.
- **/cv.review** — AI reviews implementation against Acceptance Criteria. Reports pass/fail per criterion.

### Change Management
- **/cv.change** — Scope and route an intentional change. Classifies into Level 1 (code only), Level 2 (task update), Level 3 (spec revision), or Level 4 (scope shift). Fast path for simple changes — no triage process needed.
- **/cv.rewind** — Explicitly reverse a prior decision. AI identifies affected ledger entries and minimum rewind level.

### Navigation & State
- **/cv.status** — Summarize current state: phase, approval states, open questions, next recommended action.
- **/cv.continue** — Resume after interruption. Loads `.brief`, orients in 2 minutes, asks what to do next.
- **/cv.history** — Narrative of decisions made for a feature, in order. Reads the ledger.

### Legacy (still supported, maps to v3 equivalents)
- **/cv.feature** — Define a feature abstraction (use `/cv.discover` for new work)
- **/cv.prd** — Q&A to author a PRD directly (use `/cv.write` for ledger-sourced PRDs)
- **/cv.clarify** — Scan active artifact for gaps (use `/cv.define` for sub-feature work)
- **/cv.erd** — Draft ERD directly (use `/cv.write` for ledger-sourced ERDs)
- **/cv.replan** — Light spec adjustment
- **/cv.respec** — Major spec revision

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
