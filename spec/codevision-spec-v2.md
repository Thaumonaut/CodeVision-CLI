# CodeVision — Master Specification
**Version:** 2.1.1
**Status:** DRAFT

> This document supersedes all prior CodeVision specifications. Where this document and any prior spec conflict, this document wins.

**Data format:** All structured data files use [TOON](https://toonformat.dev) (Token-Oriented Object Notation) with `.toon` extension. TOON is a lossless, compact encoding of the JSON data model — YAML-like indentation for objects, CSV-style rows for uniform arrays — that uses ~40% fewer tokens than JSON. Use the TOON TypeScript SDK or CLI (`npx @toon-format/cli`) to convert between TOON and JSON programmatically.

---

# Section 00 — Overview & Scope

## 0.1 What Is CodeVision?

CodeVision is a **spec-driven development framework for AI-assisted software engineering**. It bridges the gap between product planning and engineering implementation — working for solo developers and cross-functional teams alike.

CodeVision is built around three beliefs:

- A feature defined by a PM should be implementable by an AI with a clear, auditable chain of decisions between them.
- Plans live in files, not in conversation memory. Interruptions are normal and must be survivable.
- The AI is a capable junior engineer. It follows plans, asks when uncertain, and defers to the human at every decision gate.

## 0.2 What Problem Does CodeVision Solve?

Most AI-assisted development fails because plans are implicit, acceptance is inferred, state lives in memory, and authority boundaries are unclear. CodeVision replaces conversational momentum with **durable artifacts**, **explicit ownership**, and **verifiable gates**.

## 0.3 Scope

CodeVision governs: mission capture, user journey planning, product requirements, engineering design, specification, task decomposition, implementation, review, testing, acceptance, change management, and recovery from interruption.

CodeVision does not prescribe: programming languages, frameworks, deployment platforms, team structure, or stack choices.

## 0.4 Non-Goals

CodeVision is not an auto-coding tool, not a replacement for engineering judgment, not a prompt library, and not a CLI-first workflow. The CLI bootstraps and maintains projects; **the process is governed by artifacts, gates, and AI commands**.

## 0.5 How to Read This Document

Sections are numbered. **Bold** text signals a rule. `code blocks` are schemas or examples. Earlier sections take priority over later ones if conflict arises.

---

# Section 01 — Goals & Core Principles

## 1.1 Primary Goals

**G-01 — Reduce Ambiguity.** All intent, scope, and acceptance criteria must be explicit. Unclear things must be clarified before proceeding.

**G-02 — Enforce Planning Before Execution.** No implementation without an approved plan. Plans must describe both what is being built and how.

**G-03 — Durable State Outside AI Memory.** All authoritative state lives in files. Conversation context is never a source of truth.

**G-04 — Safe Interruption and Recovery.** The system must survive crashes, pauses, redirections, and mid-stream changes. Recovery must be deterministic.

**G-05 — Preserve User Authority.** The user is always the final decision-maker. The AI proposes, analyzes, and warns — it never decides.

**G-06 — Explicit Ownership Chain.** Every artifact has a designated author. PMs own chronicles and PRDs. Engineers own ERDs. AI generates specs and tasks. No one silently adopts another's artifact.

## 1.2 Core Principles

**P-01 — Explicit Over Implicit.** Nothing is assumed. All decisions, transitions, and acceptances must be written down.

**P-02 — Evidence Over Confidence.** Progress is proven through artifacts, tests, and verification — not fluent explanations.

**P-03 — Conservative by Default.** When in doubt: slow down, ask questions, escalate to review.

**P-04 — Separation of Authority and Execution.** Planning, review, and implementation are distinct phases with distinct owners. No single actor may silently collapse these.

**P-05 — Checkpoints Are the Unit of Trust.** Tasks may be completed; only checkpoint closure advances the project state.

**P-06 — No Silent Scope Change.** Any change to scope, contracts, or specs must be explicit and versioned.

**P-07 — Token Efficiency by Design.** The CLI loads only what the AI needs. Context is explicit, not assumed from previous sessions.

## 1.3 AI Role Framing

CodeVision frames the AI as a **junior engineer operating under a plan**. It follows instructions, asks for clarification when uncertain, does not optimize for speed over correctness, and defers to approved artifacts. The system is intentionally biased toward over-communication rather than assumption.

---

# Section 02 — Lifecycle, Phases & Leads

## 2.1 Lifecycle Phases

CodeVision defines the following project lifecycle phases:

1. **Initialization** — project scaffolding, mission capture, config
2. **Discovery** — chronicle authoring, persona definition
3. **Planning** — PRD authoring, team review, approval
4. **Clarification** — AI-guided gap analysis on active artifact, multiple-choice Q&A. Runs automatically after `/cv.prd` and `/cv.erd` complete; also invokable manually at any time.
5. **Engineering Design** — ERD authoring, technical review, approval
6. **Specification** — AI-generated spec from approved PRD + ERD
7. **Task Decomposition** — AI-generated task list, checkpoint definition
8. **Implementation** — AI-driven or human-driven code output, one git branch per feature
9. **Review** — AI-assisted verification against acceptance criteria
10. **Validation** — automated test/lint/type-check execution
11. **Completion** — feature marked done, ledger entry written
12. **Archive** — project closed, state frozen

Phases describe *where the project is*. Commands express *what the user wants*. Transitions are proposed and must be explicitly confirmed.

## 2.2 Leads

Each phase has a designated **Lead** responsible for interpreting user intent, enforcing phase constraints, and proposing transitions. Leads may propose; only the user approves.

| Phase | Lead |
|---|---|
| Initialization | Project Lead |
| Discovery | Product Lead |
| Planning | Product Lead |
| Clarification | Product Lead / Architecture Lead (depends on artifact) |
| Engineering Design | Architecture Lead |
| Specification | Architecture Lead |
| Task Decomposition | Implementation Lead |
| Implementation | Implementation Lead |
| Review | Review Lead |
| Validation | QA Lead |
| Completion / Archive | Project Lead |

## 2.3 Transitions

Transitions are **proposed**, never assumed. A command issued outside the current phase may trigger a transition proposal. The system must verify preconditions before proposing.

**Backward transitions are allowed.** Any phase can rewind to any earlier phase — gate re-checks fire on the way forward again. When a backward transition occurs mid-checkpoint, the checkpoint status changes to `blocked`. Work may continue on other tasks within the checkpoint, but evidence already attached is preserved and not discarded. It is not counted toward closure until the checkpoint is explicitly unblocked and re-verified.

**During Implementation, Review, and Validation:** any input that would change scope, change code, or change artifacts **must use an explicit `/cv.*` command**. Free-form messages may ask questions or check status, but cannot trigger changes. If a free-form message appears to request a change, the system must refuse, name the inferred intent, and request the correct command.

## 2.4 Git Branch Model

Each feature implementation lives on its own git branch. The active feature is determined by the current branch — there is no global `active_feature_id` in `status.toon`.

**Branch naming convention:** `dev/{engineer}/{type}-{feat-id}-{feature-slug}`

Example: `dev/jacob/feat-FEAT-001-health-logger`

Valid `{type}` values: `feat | fix | chore | refactor`

**Feature detection order:**
1. Parse `FEAT-###` from the current branch name via regex
2. Fall back to `.cv-feature` file at repository root if branch name does not contain a valid feature ID

**Unlinked branch enforcement:** If an AI command is run on a branch with no detectable feature, the system **blocks** and requires `cv init-feature` or an explicit feature link before any `/cv.*` command operates. This prevents ghost work — code that exists outside the artifact chain.

**`cv lint` and `cv validate`** automatically detect the current branch and scope to the inferred feature. The `--feature FEAT-###` flag overrides this for cross-checking (e.g., running lint from a different branch than the one being reviewed).

## 2.5 Interruptions

Interruptions are normal. When work is interrupted:
- Current phase and lead remain unchanged
- State is recovered from disk (see Section 05 — State Model)
- Resume requires explicit user direction via `/cv.continue`

Conversation continuity is irrelevant. The system never assumes context from a prior session.

---

# Section 03 — The Three Surfaces

CodeVision operates through three surfaces that share a single artifact store. Each surface has a defined role. They do not duplicate each other's responsibilities.

## 3.1 CLI (`cv`)

The CLI is the **file system operator and context loader**. It does not reason — it executes. It creates files, validates structure, loads context for AI sessions, and manages integrations.

**CLI owns:**
- Folder/file creation and initialization
- Loading artifacts into AI context (`cv fetch`)
- Google Docs import/export
- Structural linting and gate validation
- Post-implementation automated checks
- Export to external AI tools
- Git hooks (optional)

**CLI must NOT:** generate plans, write specs, make decisions, or run as the primary workflow interface.

```bash
cv init <slug>                               # scaffold project, hand off to /cv.init
cv init-feature FEAT-### <slug>              # create feature folder + link current branch
cv fetch FEAT-001                            # load phase-appropriate artifacts into AI context
cv fetch FEAT-001 --artifacts prd,erd        # load specific artifacts only
cv fetch FEAT-001 --full                     # load all artifacts regardless of phase
cv import prd FEAT-001 --from gdocs <url>    # convert Google Doc → markdown
cv export prd FEAT-001 --to gdocs            # push markdown → Google Doc
cv export spec FEAT-001 --format cursor      # export for Cursor
cv export tasks FEAT-001 --format claude     # export for Claude Projects
cv export tasks FEAT-001 --format copilot    # export for GitHub Copilot
cv lint                                      # validate structure + gate conditions
cv lint FEAT-001                             # lint a specific feature
cv lint --feature FEAT-001                   # override branch detection, lint specific feature
cv validate FEAT-001                         # run post-implementation checks
cv validate --feature FEAT-001               # override branch detection
cv status                                    # print project state (no AI)
cv upgrade                                   # apply framework version migrations
```

**Phase-aware loading:** `cv fetch` without `--artifacts` or `--full` loads only the artifacts relevant to the current phase. This keeps AI context lean and token-efficient.

| Phase | Artifacts loaded by default |
|---|---|
| Planning | mission.md, chronicle, feature.md |
| Clarification | mission.md, active artifact being clarified |
| Engineering Design | prd.md, feature.md |
| Specification | prd.md, erd.md |
| Task Decomposition | spec.md |
| Implementation | spec.md, tasks.md, contracts/ |
| Review | spec.md, tasks.md, checkpoints.toon |
| Validation | checkpoints.toon, tasks.md |

## 3.2 AI Command Layer (`/cv.*`)

The AI command layer is the **reasoning and conversation interface**. It is invoked inside any AI chat (Claude, Cursor, VS Code extension, etc.). Commands reduce ambiguity and select appropriate enforcement workflows — they do not grant authority or force transitions.

**AI layer owns:** mission Q&A, chronicle definition, PRD authoring, spec generation, task breakdown, implementation, review, change management, recovery narration.

**The AI may call CLI commands as shell tools** for file operations during a session, keeping reasoning and I/O cleanly separated.

Command reference: Section 07.

## 3.3 Web Interface

The web interface is the **PM surface**. It mirrors the AI command layer exactly — same workflow, no commands to remember. Each stage is a guided wizard. Manual authoring is supported with AI assist on demand.

**Web UI owns:** PM onboarding, chronicle and PRD authoring, approval workflows, team visibility, stakeholder handoffs.

The web UI reads and writes to the same artifact store as the CLI. There is no translation layer. Engineers and PMs see the same artifacts.

Web UI design is detailed in Section 15.

---

# Section 04 — The Ownership Chain

The ownership chain is the core governance model of CodeVision. Every feature traces from a human story to a deployed implementation through a sequence of owned, gated artifacts.

```
Chronicle (CHR)       ← PM / Product: who is this person and why do they need this?
    ↓
PRD                   ← PM / Product: what are we building?
    ↓
ERD                   ← Engineering: how are we building it?
    ↓
Spec                  ← AI (generated): the contract between plan and code
    ↓
Tasks                 ← AI (generated): ordered, verifiable implementation steps
    ↓
Implementation        ← AI (or human): code output, task by task
    ↓
Validation            ← Automated: tests, lint, type checks
    ↓
Review                ← AI-assisted: does this match the acceptance criteria?
```

**Every arrow is a gate enforced by `cv lint`.** You cannot generate a spec without an approved PRD and ERD. You cannot implement without approved tasks. You cannot mark a feature done without a passing review.

## 4.1 Artifact Ownership

| Artifact | Owner | Gate Required |
|---|---|---|
| Chronicle (CHR) | PM / Product | Approved before PRD |
| PRD | PM / Product | Approved before ERD |
| ERD | Engineering | Approved before Spec |
| Spec | AI (generated) | Reviewed before Tasks |
| Tasks | AI (generated) | Reviewed before Implementation |
| Implementation | AI or Human | Validated + Reviewed before Completion |

## 4.2 Gate Enforcement

Gates are checked by `cv lint`. A gate blocks downstream work if:
- The required upstream artifact doesn't exist
- The required upstream artifact has not been approved
- Required fields in `approvals.toon` are missing or in a non-approved state

Gates may be waived (see Section 09.4 — Waivers).

---

# Section 05 — Artifact Store & State Model

## 5.1 Artifact Store Location

The artifact store lives at `~/.codevision/` on the local machine. It is per-machine and per-project.

```
~/.codevision/
  config.toon                              ← global config, auth tokens, IDE hooks, mode

  projects/
    <slug>/
      mission.md                           ← structured: north star, problem, users, success, non-goals (see 5.9)
      status.toon                          ← derived state cache (see 5.3)

      chronicles/
        CHR-001.md

      features/
        FEAT-001/
          feature.md                       ← goal, scope, chronicle refs
          prd.md                           ← PM-authored requirements
          erd.md                           ← dev-authored data model
          approvals.toon                   ← who approved what and when
          assumptions.md                   ← open assumptions (see Section 09)

      specs/
        FEAT-001.spec.md                   ← AI-generated from approved PRD + ERD

      tasks/
        FEAT-001.tasks.md                  ← ordered, verifiable task list
        FEAT-001.checkpoints.toon          ← checkpoint status ledger

      ledger/
        decisions.md                       ← structured log of every decision (authoritative)
        changes.md                         ← change records with classification

      contracts/                           ← product, architecture, design, security constraints
      components/
        registry.md                        ← reusable component definitions
      variables/
        tokens.md
        naming.md
      stakeholders/
        <slug>.md                          ← stakeholder perspective docs
```

## 5.2 Authoritative vs Derived Artifacts

**Authoritative (source of truth):**
- `decisions.md` — explicit decisions, approvals, waivers, transitions
- `approvals.toon` — gate states per feature
- `*.spec.md` — approved specifications
- `contracts/` — immutable project laws
- `assumptions.md` — assumption tracking
- Feature Spec checkpoints (within `*.spec.md`)

**Derived (cache):**
- `status.toon` — current phase and active scope, regenerable from authoritative artifacts
- `*.checkpoints.toon` — checkpoint status, regenerable from decisions.md + tasks

**Non-authoritative (never trusted as truth):**
- Conversation history
- AI memory
- Inferred intent
- Unstored intermediate reasoning

## 5.3 status.toon Schema

```toon
spec_version: "2.0"
current_phase: planning
active_lead: product_lead
git_branch: dev/jacob/feat-FEAT-001-health-logger
active_feature_id: FEAT-001
active_checkpoint_id: null
open_blockers[0]:
last_updated_utc: "2026-01-17T00:00:00Z"
```

`active_feature_id` is **derived** from `git_branch` (parsed regex) or the `.cv-feature` file — never set manually. `status.toon` is a cache. If it diverges from authoritative artifacts, authoritative artifacts win and the cache is repaired.

## 5.4 approvals.toon Schema

```toon
chronicle:
  status: approved
  by: jacob
  at: "2026-01-17T14:00:00Z"
  note: ""
prd:
  status: pending
  by: null
  at: null
  note: null
erd:
  status: draft
  by: null
  at: null
  note: null
spec:
  status: draft
  by: null
  at: null
  note: null
tasks:
  status: draft
  by: null
  at: null
  note: null
```

Valid status values: `draft | review | approved | rejected`

In **individual mode**, approvals are auto-self-signed. The record still exists for audit trail.

## 5.5 checkpoints.toon Schema

```toon
spec_version: "2.0"
feature_id: FEAT-001
checkpoints[1]:
  - id: CP-01
    title: Core data model + migrations
    status: open
    tasks[3]: T-001,T-002,T-003
    evidence[0]:
    blocked_by[0]:
    last_updated_utc: "2026-01-17T00:00:00Z"
```

Valid checkpoint statuses: `open | in_progress | verify_pending | blocked | closed | waived`

- `blocked` — a backward phase transition occurred mid-checkpoint. Evidence is preserved but not counted toward closure until explicitly unblocked and re-verified.

When evidence is added, each entry is a TOON object:

```toon
evidence[1]:
  - type: test
    ref: tests/feat-001.spec.ts
    summary: All 12 unit tests passing
    created_utc: "2026-01-17T15:00:00Z"
```

## 5.6 decisions.md Entry Format

```markdown
---
id: DEC-012
date: 2026-01-17
command: /cv.feature
scope: FEAT-004
type: decision | change | replan | respec | approval | waiver | transition
---
Short narrative of what was decided and why.
```

## 5.7 mission.md Schema

`/cv.init` generates `mission.md` through a guided Q&A. The output follows this structure:

```markdown
# Mission

## North Star
One sentence. What is this product, for whom, and why does it matter?

## Problem Statement
What is painful, broken, or missing without this product?

## Target Users
Who are we building for? Be specific about the primary segment.

## Success Definition
How will we know this is working? At least one measurable signal.

## Non-Goals
What are we explicitly not solving? Prevents scope drift at the project level.
```

This is always loaded by `cv fetch` regardless of phase — it is the constant context anchor.

## 5.8 Chronicle Staleness Rule

If a chronicle is edited **after** a linked PRD has status `approved`:

1. `cv lint` flags the PRD as `stale-chronicle`
2. The PRD's approval status reverts to `review`
3. The PRD must be re-reviewed and re-approved before Specification can proceed
4. A `decisions.md` entry of type `change` is automatically written recording the chronicle edit and its downstream impact

This protects against PRDs being built on outdated human context.

## 5.9 Minimal State Requirement

At any point the system must be able to answer:
- What phase are we in?
- Who is the active lead?
- What feature is active?
- What checkpoint is in progress?
- What is blocking progress?

**If any answer is unknown, work must stop.**

## 5.10 Recovery Protocol

On `/cv.continue` or any session start where state is needed:

1. Load `decisions.md`, active `approvals.toon`, active `*.spec.md`, and active `*.checkpoints.toon`
2. Reconcile and repair `status.toon` — authoritative artifacts win
3. Emit a recovery summary: current phase, active lead, active feature/checkpoint, open blockers
4. Propose next actions and wait for user direction — no automatic transitions

---

# Section 06 — Contracts

Contracts define constraints that **must never change silently**. They live under `projects/<slug>/contracts/`.

Common contracts:
- `architecture.md` — stack decisions, service boundaries
- `security.md` — auth model, data handling, rate limits
- `design-system.md` — component library, tokens, interaction patterns
- `testing-standards.md` — required coverage, test types

**Contracts are immutable by default.** Any change requires:
1. Explicit user approval
2. A decisions.md entry of type `change` referencing the contract
3. Impact analysis: which specs, ERDs, or tasks are affected?

Contract changes trigger a cascade review. Downstream artifacts may need to be re-approved.

---

# Section 07 — Commands

## 7.1 Command Semantics

All commands:
- Express user intent, not authority
- May propose lifecycle transitions
- Never force transitions or acceptance
- Are advisory signals interpreted by the active Lead

Commands are classified by risk:
- **Safe** — informational, no state change (e.g. `/cv.status`)
- **Controlled** — may propose changes, requires checks (e.g. `/cv.spec`)
- **Dangerous** — may bypass safeguards, requires explicit consent (e.g. `/cv.respec`)

**Dangerous commands must:** restate risks, require confirmation, and be logged in decisions.md.

## 7.2 Complete Command Reference

### CLI Commands

| Command | Purpose | Risk |
|---|---|---|
| `cv init <slug>` | Scaffold project structure | Safe |
| `cv init-feature FEAT-### <slug>` | Create feature folder + link current branch | Safe |
| `cv fetch <artifact>` | Load phase-appropriate artifacts into AI context | Safe |
| `cv import prd FEAT-### --from gdocs <url>` | Convert Google Doc → markdown | Controlled |
| `cv export prd FEAT-### --to gdocs` | Push markdown → Google Doc | Controlled |
| `cv export spec FEAT-### --format <tool>` | Export for external AI tools | Safe |
| `cv lint` | Validate structure + gate conditions (branch-scoped) | Safe |
| `cv lint --feature FEAT-###` | Override branch detection, lint specific feature | Safe |
| `cv validate FEAT-###` | Run post-implementation automated checks | Controlled |
| `cv validate --feature FEAT-###` | Override branch detection | Controlled |
| `cv status` | Print project state without AI | Safe |
| `cv upgrade` | Apply framework version migrations | Dangerous |

### AI Commands — Setup

| Command | Purpose | Risk | Phase |
|---|---|---|---|
| `/cv.init` | Mission Q&A after project scaffolding | Controlled | Initialization |
| `/cv.mission` | Update mission if direction changes | Controlled | Any |

### AI Commands — Discovery (PM-facing)

| Command | Purpose | Risk | Phase |
|---|---|---|---|
| `/cv.chronicle` | Define or refine a user journey / epic | Controlled | Discovery |
| `/cv.feature` | Define feature abstraction, link to chronicles | Controlled | Discovery / Planning |
| `/cv.invite` | Codify a stakeholder perspective | Safe | Any |

### AI Commands — Planning (PM-facing)

| Command | Purpose | Risk | Phase |
|---|---|---|---|
| `/cv.prd` | Guided Q&A to author or refine a PRD | Controlled | Planning |
| `/cv.clarify` | Scan active artifact for gaps; walk through them one at a time with multiple-choice answers | Controlled | Clarification / Any |

### AI Commands — Engineering Design (Dev-facing)

| Command | Purpose | Risk | Phase |
|---|---|---|---|
| `/cv.erd` | Draft ERD from approved PRD | Controlled | Engineering Design |
| `/cv.vars` | Update design tokens / naming rules | Controlled | Any |
| `/cv.component` | Define or register a reusable component | Controlled | Any |

### AI Commands — Specification

| Command | Purpose | Risk | Phase |
|---|---|---|---|
| `/cv.spec` | Generate spec from approved PRD + ERD | Controlled | Specification |

### AI Commands — Task Decomposition

| Command | Purpose | Risk | Phase |
|---|---|---|---|
| `/cv.tasks` | Break spec into ordered, verifiable tasks with checkpoints | Controlled | Task Decomposition |

### AI Commands — Implementation

| Command | Purpose | Risk | Phase |
|---|---|---|---|
| `/cv.implement` | Work through tasks, output FILE blocks | Controlled | Implementation |
| `/cv.review` | Verify implementation against acceptance criteria | Controlled | Review |
| `/cv.bug` | Narrow fix with a 50-line diff limit — escalates to `/cv.change` if exceeded | Controlled | Implementation / Review |

### AI Commands — Change Management

| Command | Purpose | Risk | Phase |
|---|---|---|---|
| `/cv.change` | Classify and route a change request | Controlled | Any |
| `/cv.replan` | Light spec adjustment from implementation learnings | Controlled | Any |
| `/cv.respec` | Major spec revision — triggers re-approval chain | Dangerous | Any |

### AI Commands — Navigation & Recovery

| Command | Purpose | Risk | Phase |
|---|---|---|---|
| `/cv.pause` | Pause with full context capture | Safe | Any |
| `/cv.continue` | Resume deterministically from artifacts | Safe | Any |
| `/cv.status` | Rehydrate and summarize current state | Safe | Any |
| `/cv.phase` | Navigate between phases (with gate check) | Controlled | Any |

## 7.3 Deprecated Commands

`/cv.scaffold` → replaced by `cv init` (CLI) + `/cv.init` (AI)
`/cv.plan` → replaced by `/cv.prd`, `/cv.erd`, `/cv.spec`
`/cv.code` → replaced by `/cv.implement`

---

# Section 08 — Checkpoints

## 8.1 What Is a Checkpoint?

A checkpoint is a **verifiable unit of trust**. Tasks are the steps; checkpoints are the gates. Checkpoints group related tasks and define acceptance evidence. A feature advances only when its checkpoints close.

Checkpoints are defined during `/cv.tasks` and stored in `FEAT-###.checkpoints.toon`.

## 8.2 Checkpoint Anatomy

Each checkpoint must define:
- A unique ID (`CP-01`)
- A title describing what is working at the end
- The tasks it contains
- Required evidence for closure
- Any open blockers

## 8.3 Closure Requirements

A checkpoint may close only when:
- All its tasks are complete
- Required tests pass (as defined in the task spec)
- No open blockers remain (or are waived)
- The user explicitly acknowledges closure

Implicit closure is forbidden.

## 8.4 Checkpoint Tiers

Reviews at checkpoint closure are proportional to risk:

- **Tier 1 (Trivial):** docs, typos, refactors with no behavior change → Active Lead review only
- **Tier 2 (Normal):** feature work or behavior change → Full review required
- **Tier 3 (High Risk):** auth, payments, data handling, public API, contract changes → Full review + explicit risk summary

Tier selection must be recorded in decisions.md.

## 8.5 Evidence

Evidence is attached to checkpoints and required for closure. Types: `test | doc | screenshot | log | link`.

## 8.6 Partial Acceptance

A checkpoint may be partially accepted only if:
- Scope is explicitly reduced
- Deferred work is recorded in decisions.md
- New checkpoints are created for deferred items

---

# Section 09 — Assumptions, Blockers & Waivers

## 9.1 Assumptions

Assumptions are unstated beliefs about behavior, constraints, or intent. They are blocking conditions, not conveniences.

All assumptions must be explicitly recorded in `features/FEAT-###/assumptions.md` with a stable ID:

```markdown
**Assumption A-001 (Open):** The health management logger stores events locally before syncing.
- Context: FEAT-002 / Checkpoint CP-02
- Risk: Medium
- Resolution Needed By: Before CP-02 closes
```

Assumption lifecycle: **Open → Clarified → Closed** or **Open → Waived**

**Open assumptions block:** checkpoint closure and phase transitions that depend on them.

## 9.2 Ambiguity Detection

The system must actively surface:
- Undefined terms
- Unclear acceptance criteria
- Missing edge case handling
- Implicit design or security expectations

When ambiguity is detected, work pauses and clarification is requested. Proceeding without clarity requires explicit user consent and an assumption record.

## 9.3 Blockers

`open_blockers` in `status.toon` is a union of:
- Open assumptions from `assumptions.md`
- Unresolved violations from the implementation log

Waived items must not appear in `open_blockers`. Expired waivers re-surface their underlying blockers.

## 9.4 Waivers

A waiver is a structured policy exception. It must be recorded in `decisions.md`:

```markdown
---
id: W-001
date: 2026-01-17
type: waiver
scope: CP-02 | FEAT-001 | contracts/security.md
---
**Rule Waived:** [rule or assumption ID]
**Rationale:** [why the exception is acceptable]
**Risk Level:** Low | Medium | High
**Mitigations:** [compensating controls, if any]
**Approver:** User
**Approved At (UTC):** 2026-01-17T23:17:50Z
**Expires:** [UTC timestamp or condition, optional]
```

A waived checkpoint is closed **by waiver**, not completed. This is tracked distinctly in `checkpoints.toon`.

---

# Section 10 — Implementation & Validation

## 10.1 Execution Preconditions

Before `/cv.implement` may run:
- An approved spec must exist
- Required contracts must be acknowledged
- Checkpoints must be defined in `checkpoints.toon`
- Open blocking assumptions must be resolved or waived

If any precondition is unmet, the command must surface the gap and halt.

## 10.2 Implementation Discipline

During implementation:
- Work is performed task-by-task within checkpoints
- No task may exceed its defined scope
- Deviations must be surfaced immediately, not silently resolved
- The AI must not "optimize" by skipping steps or combining tasks

## 10.3 The Implementation Loop

```
/cv.implement FEAT-001
  → AI reads approved spec + task list
  → Implements task by task as FILE blocks
  → cv validate FEAT-001 runs automated checks after each checkpoint
  → /cv.review verifies against acceptance criteria
  → Results logged to decisions.md
```

## 10.4 Validation vs Review

**Validation (`cv validate`)** — automated, CLI-owned:
- Unit tests
- Lint
- Type checks
- File existence checks
- Gate condition re-verification

**Review (`/cv.review`)** — AI-assisted, judgment-based:
- Does the implementation match the spec's acceptance criteria?
- Are edge cases handled as defined?
- Does the output match the checkpoint's evidence requirements?

Both are required before a feature is marked complete.

## 10.5 Violations

If a violation is detected (implementation exceeds spec, missing test, gate not met):

1. Work stops
2. The violation is recorded in decisions.md
3. Options are presented: clarify spec / refactor implementation / rollback to last checkpoint
4. User chooses the path forward

Silent correction is forbidden.

## 10.6 Validation Ruleset

The `cv validate` operation performs these minimum checks:

| Code | Check | Severity |
|---|---|---|
| CVVAL-001 | `status.toon` is regenerable from authoritative artifacts | Warning |
| CVVAL-002 | No open blockers on checkpoint closure or phase transition | Blocking |
| CVVAL-003 | Checkpoint statuses are valid enum values | Blocking |
| CVVAL-004 | Required artifacts exist for current phase | Blocking |
| CVVAL-005 | Tier selection recorded for Tier 2/3 checkpoints | Warning |
| CVVAL-006 | No open assumptions on checkpoint closure | Blocking |
| CVVAL-007 | approvals.toon gates met for requested transition | Blocking |

Any `blocking` error prevents progress.

## 10.7 Bug Handling

Bugs declared via `/cv.bug`:
- Must reference the affected spec section or task ID
- Are limited to **50 lines changed** across all files. If the fix exceeds this, the system blocks and requires escalation to `/cv.change` for proper classification and routing
- Cannot change public interfaces, data model schemas, or spec acceptance criteria — only implementation internals
- May trigger a regression check on dependent checkpoints
- Require a ledger entry

Fixing a bug does not imply checkpoint or feature acceptance.

---

# Section 11 — Change Management

## 11.1 Change Classes

All changes fall into one of three classes:

**Clarification** — no behavioral change, improves wording or examples. Does not require re-approval.

**Spec Change** — alters behavior, scope, or enforcement. Requires review and approval, and may require checkpoint reassessment. Use `/cv.replan`.

**Contract Change** — alters an immutable rule. Requires explicit user approval, a decisions.md entry, and full impact analysis across all specs and ERDs that reference the contract. Use `/cv.respec`.

## 11.2 Impact Analysis

When a spec or contract change occurs:
- Affected downstream artifacts must be identified
- Risks must be reassessed
- Required re-work must be surfaced before continuing

Impact analysis is mandatory for contract changes and for `/cv.respec`.

## 11.3 Versioning

All changes increment a version on the affected artifact. Previous versions remain readable. History is never rewritten.

Versioning applies to: contracts, specs, ERDs, PRDs, persona definitions.

## 11.4 Change Routing

`/cv.change` classifies an incoming request and routes it:

| Request Type | Routes To |
|---|---|
| Wording fix, doc update | Clarification — no gate |
| Scope adjustment within approved spec | `/cv.replan` — light revision |
| New feature or major scope change | New `/cv.feature` + `/cv.prd` flow |
| Tech design revision | `/cv.erd` revision |
| Contract modification | `/cv.respec` — full impact analysis |

---

# Section 12 — Governance & Personas

## 12.1 Optional Persona System

CodeVision supports a structured **persona / council model** for teams that want explicit multi-perspective review. Personas are governance roles with defined responsibilities and blocking authority.

Personas are **not required** in individual mode. They are available on demand in team mode and may be invoked via `/cv.invite`.

## 12.2 Default Council Personas

When activated, the council includes:

| Persona | Scope |
|---|---|
| Architecture Director | System design, dependency integrity, scalability |
| Lead Developer | Implementation quality, code contract adherence |
| QA Director | Test coverage, acceptance criteria, regression risk |
| Security Director | Auth model, data handling, threat vectors |
| Art Director | UX, design system adherence, interaction patterns |

## 12.3 Persona Authority

Personas may:
- Review specs, checkpoints, and closures
- Identify risks, gaps, and violations
- Block transitions if required checks fail

Personas may not:
- Accept checkpoints
- Approve features
- Override contracts or user decisions

Only the user may grant acceptance.

## 12.4 Adaptive Persona Invocation

Personas are invoked proportionally:

- **Routine work** (implementation steps, status checks) → Active Lead only
- **Normal feature work** → Relevant specialists (e.g., Art Director for UI, Security for auth)
- **High-risk work** (auth, payments, data, public API, contracts) → Full council + risk summary

## 12.5 Persona Definitions

Persona definitions live in `~/.codevision/projects/<slug>/contracts/personas/` as YAML or markdown files. They define: responsibilities, block conditions, and output format.

---

# Section 13 — Team vs Individual Mode

## 13.1 Mode Configuration

Mode is set in `~/.codevision/config.toon`:

```toon
mode: team
approvals_required[3]: prd,erd,spec
roles:
  jacob[2]: pm,dev
gdocs_auth:
ide_hooks:
```

## 13.2 Individual Mode

- Approvals auto-self-sign (but still recorded for audit trail)
- No notification layer
- Web UI optional
- Persona council optional
- Simpler status output

## 13.3 Team Mode

- Approval gates strictly enforced
- Web UI surfaces pending reviews as notifications
- Ledger entries include actor name and role
- Roles determine which commands are surfaced in the web UI
- Council personas available and recommended for high-risk checkpoints

## 13.4 Identical Command Surface

The CLI and AI command set is **identical in both modes**. Only enforcement strictness and visibility differ. A solo project can graduate to team mode by updating `config.toon`.

## 13.5 Sync Tiers

CodeVision gives users control over how the artifact store is synced across machines and team members. Sync is not owned by CodeVision for free tiers — the user manages it.

| Tier | Sync Method | Notes |
|---|---|---|
| Free | Git sync | `~/.codevision/` is a git repo. Teams use a shared remote (GitHub/GitLab). `cv sync` is a thin wrapper around `git push/pull`. |
| Paid | File sync | Dropbox, iCloud, S3, or any folder-sync provider. CodeVision does not own the sync layer — users configure their provider. |
| Higher tier | Dedicated backend | CodeVision cloud hosts artifact state. Local CLI syncs on every command. Real-time collaboration and approval notifications without manual git management. |

The CLI command surface and artifact format are identical across all tiers. Upgrading sync does not change how features are planned or implemented.

---

# Section 14 — Google Docs Integration

PMs often author PRDs in Google Docs. The CLI handles the bridge transparently.

```bash
cv import prd FEAT-001 --from gdocs <url>   # one-time pull → local markdown
cv export prd FEAT-001 --to gdocs           # push refined version back
```

The AI never touches the sync layer. It always reads clean local markdown. This keeps token usage predictable and the AI focused on reasoning, not I/O.

**Auth:** Google OAuth credentials are stored in `config.toon` (encrypted). The auth setup guide covers credential configuration.

**Conflict resolution:** if both local and remote have changed, `cv import` will warn and require explicit merge direction.

---

# Section 15 — Web Interface

## 15.1 Role

The web UI is a **guided workflow for PMs and stakeholders**. It is not a dashboard. It mirrors the AI command layer — same gates, same artifacts — without requiring any command knowledge.

## 15.2 PM Journey

A PM opens the web UI and sees: `Projects → Active chronicles → Features needing attention`

Each feature displays state: Draft / In Review / Approved / In Progress / Done

PM authoring flow (no commands):
1. **New chronicle** → AI asks guided questions → draft created → PM edits inline
2. **New feature** → PM describes it → AI generates feature.md + draft PRD structure
3. **Refine PRD** → PM writes, AI assists on demand ("help me add edge cases")
4. **Approve** → one-click or request teammate review
5. **Handoff** → system notifies dev that FEAT-### is ready for ERD

## 15.3 Artifact Store Relationship

The web UI reads and writes to the same `~/.codevision/` store (or a cloud-synced equivalent for teams). Engineers see the same artifacts in their CLI. There is no translation layer, no export step, no format conversion.

## 15.4 Approval Notifications

In team mode, pending approvals surface as in-app notifications. Approving in the web UI writes to `approvals.toon` and unblocks downstream CLI/AI commands in real time.

---

# Section 16 — Human-AI Interaction Model

## 16.0 The Clarification System (`/cv.clarify`)

Clarification is a first-class feature of CodeVision. It is the primary mechanism by which the AI surfaces gaps before they become implementation problems.

### Trigger

`/cv.clarify` runs **automatically** at the end of `/cv.prd` and `/cv.erd`. It can also be invoked **manually** at any time against any active artifact.

### Chronicle Entry Mode

`/cv.chronicle` has a distinct entry path from other clarification flows. The PM has no artifact yet — only a story. The sequence is:

1. **Free-form story input first.** The AI asks the PM to describe the experience in their own words, with no structure or prompts. This is the raw material.
2. **Clarification questions follow.** The AI reads the story and generates targeted questions — one at a time — to fill in the persona, emotional beats, entry point, and success definition. Questions reference specific details from the story (names, moments, habits mentioned) so they feel like a conversation drilling in, not a form being filled.
3. **Draft generation last.** Only after all blocking questions are answered does the AI draft the chronicle. The PM edits inline from the draft.

This order — story first, questions second, document third — is what makes the flow feel natural. Reversing it (questions first, story second) produces generic outputs.

### Behavior

1. The AI scans the active artifact (or the user's story, for chronicles) for gaps, ambiguities, missing fields, undefined edge cases, and implicit assumptions
2. It categorizes findings as **blocking** (must resolve before next gate) or **advisory** (recommended but not required)
3. It presents questions **one at a time** — never a numbered dump
4. Each question includes **3–4 multiple-choice options** plus a **"Custom — I'll define it"** option always as the final choice. Options carry their reasoning inline (e.g. *"Anxious — seeing elevated numbers without context is scary"*) so the choice feels obvious rather than arbitrary
5. The user's answer is written into the artifact immediately and a decisions.md entry is recorded
6. After the last question, the AI delivers a **pre-draft recap**: a short paragraph summarising what it understood before generating the artifact. This gives the user one last chance to correct a misread before it's baked into the document.
7. The AI then generates the artifact and proposes the next phase transition

### Question Format

Progress is always shown. Questions are never delivered without a count — this signals to the user how much cognitive effort remains and prevents fatigue from open-ended sessions.

```
─────────────────────────────────────────────
Question 2 of 6 (blocking)

The PRD mentions offline support but doesn't define what "offline" means
for this feature — read-only caching, full write queue, or no offline at all.

  A  Read-only cache — users can view existing data but not submit
  B  Write queue — actions are queued locally and sync when reconnected
  C  No offline support — show an error if connection is lost
  D  Custom — I'll define it
─────────────────────────────────────────────
```

### Pre-Draft Recap Format

Before generating any artifact, the AI delivers a brief summary:

```
─────────────────────────────────────────────
Here's what I'm working with before I draft:

Marcus is a health-conscious adult who gets routine checkups but struggles
to interpret clinical language. The core emotional arc is anxiety-to-confidence:
he arrives confused by flagged lab values and leaves with a concrete action plan
(new breakfast, workout reminder). Three new features are implicated: blood work
upload & interpretation, dietary recommendations from results, and health goal
reminders. The success signal is a check-in within the first week.

Anything to correct before I draft?
─────────────────────────────────────────────
```

### Web UI Presentation

In the web UI, clarification runs as a **sidebar wizard** — a slide-in panel that shows progress through all questions (e.g. "3 of 6 resolved") and allows the PM to navigate back to a previous answer. Each question renders as a card with radio-button choices and a free-text field that activates when "Custom" is selected. The pre-draft recap appears as a review card at the end of the wizard before the "Generate" button is enabled.

### Skipping

A clarification question may be skipped only if it is advisory (non-blocking). Skipped questions are recorded as open assumptions in `assumptions.md`. Blocking questions cannot be skipped — the gate does not advance until they are answered or explicitly waived.

---

In planning phases, the AI behaves like a **meeting facilitator**, not a form-filler or code generator:

- Keeps the conversation oriented toward decisions and outcomes
- Writes brief "minutes" frequently so state survives context loss
- Asks the right question at the right time rather than batching questions
- Prevents premature exit from planning when major blockers remain
- States uncertainty openly rather than guessing

## 16.2 Conversational Blocking

When information is missing, the system blocks progress — but does so in natural language:

- *"I'm not sure about X yet. Can we nail that down before we continue?"*
- *"There are two plausible reads here. Which one do you mean?"*
- *"Before we implement, we should lock down Y so we don't build the wrong thing."*

In low-risk phases, blocking should feel like a facilitator pausing the meeting. In high-risk phases (Implementation, Review, Validation), hard halts are appropriate and are emitted as `<stop_signal>` blocks for tool interception.

## 16.3 Meeting Minutes

During chronicle and PRD sessions, the AI should write brief "minutes" after each major decision:
- What was discussed
- What was decided
- What is still open
- What artifacts were created or updated

Minutes are informative only. They are not authoritative unless explicitly promoted into decisions.md.

## 16.4 Stop Signal

When the system must halt (blocking ambiguity, unmet preconditions, violation):

```xml
<stop_signal reason="clarification_required">
  <blocking>true</blocking>
  <next_action>request_user_input</next_action>
  <recommended_command>/cv.clarify</recommended_command>
  <questions>
    <q id="Q-001">What is the acceptance criterion for offline sync?</q>
  </questions>
</stop_signal>
```

---

# Section 17 — Reference Schemas

## 17.1 SFS-v2 Capability Template

Use this inside spec files to standardize "what + how":

```markdown
### Capability: CAP-01 — <name>

**Goal:** <what this enables>

**Inputs:**
- <input name>: <type> — <source/validation>

**Processing:**
1. <step 1>
2. <step 2>

**Outputs:**
- <output>: <type> — <where it goes / artifact impact>

**State & Data:**
- Reads: <state>
- Writes: <state>

**Edge Cases & Failure Modes:**
- <case>: <behavior>

**Security Considerations:**
- <threat>: <mitigation>

**Verification Steps:**
- Unit: <test>
- Integration: <test>
- Acceptance Evidence: <what to capture>
```

## 17.2 Test Definition Template

```markdown
### Test Definition: TD-01 — <name>

**Scope:** <Feature/Checkpoint/Capability IDs>
**Type:** Unit | Integration | E2E | Manual | Regression

**Setup:**
- Preconditions:
- Test data:
- Environment:

**Steps:**
1. ...

**Expected Results:**
- ...

**Evidence Required for Closure:**
- <links/artifacts to attach to checkpoint>
```

## 17.3 Decisions.md Quick Reference

```markdown
---
id: DEC-001
date: 2026-01-17
command: /cv.prd
scope: FEAT-001
type: decision
---
Decided to defer offline sync to v1.1. The V1 PRD now explicitly marks it as out of scope.
```

Types: `decision | change | replan | respec | approval | waiver | transition | reconciliation`

---

# Section 18 — Open Questions

These are unresolved decisions that do not block current work but should be addressed before public release:

- **Web UI hosting** — self-hosted binary, SaaS, or both?
- **Authentication model** for team approval identities (dedicated backend tier)
- **VS Code / Cursor extension scope** — read-only context loader vs full command surface?
- **Pricing model** — what is the boundary between free/paid/higher tiers in dollar terms?
- **Mobile web** — does the web UI support PM use on mobile?
- **`cv sync` implementation** — for git tier, should this be a thin wrapper or a full conflict-aware merge tool?
- **Dedicated backend consistency model** — optimistic vs pessimistic locking when two engineers open the same feature simultaneously?

---

*CodeVision Master Specification v2.1.0 — supersedes all prior versions*
