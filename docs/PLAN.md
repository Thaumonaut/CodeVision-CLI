# CodeVision v3 — Project Plan
> Derived from design sessions March 2026
> This document tracks all work required to rebuild CodeVision around the
> Explore → Define → Specify → Task → Build → Surface → Prove lifecycle.

---

## How to Read This Plan

Work is organized into **Tracks** (parallel workstreams) and **Milestones**
(points where something is testable end-to-end). Each item has a status:

  [ ] not started  [~] in progress  [x] complete  [!] blocked

Items marked **TEMPLATE** produce a file in `/templates`.
Items marked **SPEC** produce or update a section of the master spec.
Items marked **CLI** produce a command or behavior in `cv.js`.
Items marked **CMD** produce an AI command file in `/.cv/commands/`.

---

## Milestone Overview

```
M1 — Foundation       Core schemas, lifecycle spec, document templates
M2 — Explore Phase    Persona, Chronicle, Story Discovery, Feature Map
M3 — Define Phase     Compilation, .brief, Signal Blocks, document locking
M4 — Specify + Task   Spec generation, task decomposition
M5 — Build Loop       Context loading, implementation, checkpoint validation
M6 — Surface + Prove  Gap classification, rewind mechanics, validation
M7 — Team Mode        Handoff package, escalation path, PM surface
M8 — Integration      .brief + CLI wiring, full end-to-end test
```

Each milestone builds on the previous. M1 must complete before M2 starts.
M2-M4 can partially overlap once M1 is done.

---

## Track A — Lifecycle & Master Spec

The master spec defines the rules everything else follows.
Build this first — it is the source of truth for all other tracks.

### A1 — Lifecycle Spec  [SPEC]
  [ ] A1.1  Write Section 00 — Overview & Philosophy
            · The zoom-in mental model
            · Documents as compiled understanding, not authored artifacts
            · The stalagmite + crystal duality
            · Solo vs team mode philosophy

  [ ] A1.2  Write Section 01 — The Six Phases
            · EXPLORE — ledger accumulation, three sub-phases
            · DEFINE  — compilation, crystallization, slot model
            · SPECIFY — AI-generated from locked docs only
            · TASK    — AI-generated from spec only
            · BUILD   — context loading, task execution, checkpoints
            · SURFACE — gap classification, rewind tiers
            · PROVE   — validation, review, acceptance

  [ ] A1.3  Write Section 02 — Phase Transitions
            · Transition triggers (AI-proposed, user-confirmed)
            · Forward transition preconditions per phase
            · Backward transitions — rewind tier classification
            · Ghost work prevention (unlinked branch enforcement)

  [ ] A1.4  Write Section 03 — The Three Surfaces
            · CLI — what it owns, what it must not do
            · AI Command Layer — what it owns, what it must not do
            · Web Interface — PM journey, guided workflow
            · Shared artifact store — single source of truth

  [ ] A1.5  Write Section 04 — Team vs Individual Mode
            · Role model — PM owns Explore/Define, Eng owns Specify–Build
            · Handoff gate — when it fires, what it produces
            · Escalation path — tier classification, routing, unblocking
            · Individual mode — same phases, collapsed roles, no overhead

  [ ] A1.6  Write Section 05 — AI Role & Behavior
            · AI as facilitator during Explore (not form-filler)
            · AI as compiler during Define (not author)
            · AI as generator during Specify/Task (not decision-maker)
            · AI as implementer during Build (junior engineer model)
            · AI as classifier during Surface (not scope-changer)
            · Next-step guidance — AI always proposes what comes next
            · Conservative by default — slow down, ask, escalate

  [ ] A1.7  Write Section 06 — Token Efficiency Model
            · .brief as primary context load (one call default)
            · Named section fetching (cv fetch FEAT-001 prd:edge-cases)
            · Signal Block as contract with the system
            · CLI pre-computes at write time, AI reads at use time
            · Context policy per command (what each command loads)

  [ ] A1.8  Preserve from v2 spec (copy + lightly update)
            · Git branch model (Section 2.4 of v2)
            · Approval model + approvals.json schema
            · Stop signal format
            · Validation ruleset (CVVAL-### codes)
            · Waiver schema
            · Blocker semantics

---

## Track B — Document Schemas & Templates

Every document CodeVision produces needs a defined schema:
- what slots it contains
- which slots are required vs optional
- which slots are human-authored vs AI-compiled
- which slots belong in the Signal Block vs Full Context

### B1 — Exploration Ledger  [SPEC] [TEMPLATE]
  [ ] B1.1  Define the ledger entry schema
            · id (PE-###)
            · timestamp
            · source (session type: persona-build, story-discovery,
              feature-discovery, details, surface)
            · actor (who said it)
            · content (the decision, insight, or open question)
            · status (decided / open / assumed / deferred / contested)
            · tags (array of document slots this maps to)
              format: DOCUMENT_TYPE:SECTION:SLOT
              e.g. PRD:scope:in-scope, ERD:board-entity:constraints
            · related_entries (IDs of entries that conflict or extend)

  [ ] B1.2  Define the ledger file structure
            · Project-level ledger (global decisions, constitution)
            · Feature-level ledger (per FEAT-###)
            · Sub-feature ledger (per MB-01 etc.)
            · Append-only — entries are never deleted, only updated

  [ ] B1.3  Create ledger template file
  [ ] B1.4  Write ledger entry examples (one per session type)

### B2 — Persona Schema  [SPEC] [TEMPLATE]
  [ ] B2.1  Define required slots
            · identity (name, archetype, age, location, life situation)
            · health / domain context (product-specific)
            · tech profile
            · pain points (numbered, specific)
            · motivations and goals
            · voice profile — how they speak
            · emotional defaults (base state, under stress, when scared,
              when reassured, when overwhelmed)
            · decision-making patterns
            · situation-specific responses (keyed to product moments)
            · what this persona would never do
            · research notes (validated vs assumed vs to-validate)

  [ ] B2.2  Define Signal Block fields for persona
            · archetype, age, location, primary pain, primary motivation
            · one-line behavioral summary
            · chronicles featuring this persona (links)

  [ ] B2.3  Define AI consistency enforcement comment block
            (the <!-- cv-persona: enforce --> annotation that tells
            any AI command to load this persona for consistency checks)

  [ ] B2.4  Create PERS-000 template file
  [ ] B2.5  Write field-level authoring guidance for each slot

### B3 — Chronicle Schema  [SPEC] [TEMPLATE]
  [ ] B3.1  Define required slots
            · metadata (id, persona ref, story state, author, status)
            · story state field (CURRENT / PROPOSED / ASPIRATIONAL)
              with version note explaining which features exist
            · trigger — what brought the user to this moment
            · journey steps (action / thought-feeling per step)
            · key emotional moments table
              (moment / emotion / risk if handled poorly)
            · success signal (functional + emotional + behavioral)
            · failure path (specific, not generic)
            · features implicated table (id / title / role / exists?)
            · user research questions
              (screener / discovery / usability / post-launch)
            · open questions (blocking flagged separately from advisory)
            · future versions

  [ ] B3.2  Define Signal Block fields for chronicle
            · persona ref, story state, trigger summary
            · emotional arc (anxiety → confidence, etc.)
            · primary features implicated
            · blocking open questions count
            · linked PRDs

  [ ] B3.3  Define Story State values and what each implies downstream
  [ ] B3.4  Create CHR-000 template file
  [ ] B3.5  Write authoring guidance — emphasize simulation over prediction

### B4 — Feature Map Schema  [SPEC] [TEMPLATE]
  [ ] B4.1  Define required slots
            · feature id and title
            · discovery session source (ledger refs)
            · sub-features table
              (id / title / tier / clarity-score / status)
            · dependency graph (which sub-features depend on which)
            · risk flags (HIGH/MED/LOW per sub-feature with reason)
            · recommended order of attack (with rationale)
            · open questions (blocking vs advisory)
            · spike recommendations (high-risk items to investigate first)

  [ ] B4.2  Define clarity score (0–100)
            · what score is needed to proceed to Details (80)
            · what score blocks Define compilation (<60)
            · how AI calculates it from ledger entry completeness

  [ ] B4.3  Create MAP-000 template file

### B5 — PRD+ Schema  [SPEC] [TEMPLATE]
  [ ] B5.1  Define Signal Block slots (machine-readable header)
            · goal (one sentence)
            · scope (array)
            · out-of-scope (array)
            · constraints (array)
            · success-metric
            · components-implicated (array, refs to registry)
            · entities-implicated (array)
            · chronicle-ref
            · open-questions (blocking count)
            · status / lock state

  [ ] B5.2  Define Full Context slots
            · problem statement
            · user scenarios (refs to Chronicle steps)
            · goals expanded
            · non-goals expanded
            · edge cases and constraints
            · open questions (full entries with status)
            · assumptions

  [ ] B5.3  Define compilation rules
            · which ledger tags map to which slots
            · conflict resolution behavior
            · slots that require human confirmation before locking

  [ ] B5.4  Create PRD-000 template file with all slots present
            (empty slots visible with [empty] marker)

### B6 — UIRD+ Schema  [SPEC] [TEMPLATE]
  [ ] B6.1  Define Signal Block slots
            · screens (array of surface names)
            · component-manifest
              · reuse (component@version)
              · new (component names to create)
            · user-flows (array of named paths)
            · state-list (array: idle/loading/empty/error/success/offline)
            · key-interactions (array)
            · chronicle-ref (which journey steps this covers)

  [ ] B6.2  Define Full Context slots
            · screen inventory (per screen: purpose, entry points, exits)
            · user flows (step by step per flow)
            · component behavior specs (per component in manifest)
            · state machine (all states with transitions)
            · interaction details (hover, focus, animation, transitions)
            · accessibility requirements
            · design constraints and references
            · empty states and edge case UI behavior

  [ ] B6.3  Define component manifest rules
            · how to check the component registry before marking as "new"
            · cv lint rule: CVVAL-010 — new component declared but
              similar component exists in registry (warning)

  [ ] B6.4  Create UIRD-000 template file

### B7 — ERD+ Schema  [SPEC] [TEMPLATE]
  [ ] B7.1  Define Signal Block slots
            · entities (array with brief attribute summary)
            · key-relationships (array: A →type→ B)
            · constraints (array)
            · migration-impact (additive / modifying / destructive)
            · affected-existing-entities (array)

  [ ] B7.2  Define Full Context slots
            · entity definitions (full attribute table per entity)
            · relationship details (cardinality, FK constraints)
            · validation rules
            · data lifecycle (create / update / delete behavior)
            · integration points
            · migration notes

  [ ] B7.3  Create ERD-000 template file

### B8 — Acceptance Criteria Schema  [SPEC] [TEMPLATE]
  [ ] B8.1  Define the format
            · Given / When / Then per criterion
            · ID (AC-###)
            · linked capability (CAP-##)
            · linked Chronicle step (which journey step this validates)
            · type (functional / behavioral / performance / accessibility)
            · verification method (automated / manual / AI-review)

  [ ] B8.2  Rule: AC must be authored before spec is generated
            AC authoring is a Define-phase task, not a Specify-phase task.
            The spec references ACs — it does not generate them.

  [ ] B8.3  Create AC-000 template file

### B9 — Updated SFS-v2 Capability Template  [SPEC] [TEMPLATE]
  [ ] B9.1  Add mandatory Human Summary section (first in the file)
            · 3–5 sentence plain-language description
            · PM-readable in 30 seconds
            · Authored by AI, confirmed by PM before spec locks

  [ ] B9.2  Update capability block to reference AC IDs
            (instead of writing acceptance criteria inline)

  [ ] B9.3  Add Chronicle reference field to each capability
            (which journey step this capability serves)

  [ ] B9.4  Update Design & UX Notes to reference UIRD component manifest
            (not free-form — must link to registered components)

  [ ] B9.5  Add Persona Consistency Note field
            (which persona behaviors this capability must respect)

  [ ] B9.6  Create updated SFS-v2 template file

### B10 — ADR Schema  [SPEC] [TEMPLATE]
  [ ] B10.1 Define slots
            · id (ADR-###), date, phase-when-made, feature-scope
            · context (what situation required this decision)
            · decision (what was chosen, one sentence)
            · alternatives-considered (array with rejection reason each)
            · consequences (what this decision implies downstream)
            · reversibility (easy / hard / irreversible)
            · ledger-refs (PE-### entries that led to this)

  [ ] B10.2 Create ADR-000 template file

### B11 — .brief Schema  [SPEC]
  [ ] B11.1 Define the full .brief format
            · auto-generated header (feature, phase, timestamp, locks)
            · one Signal Block entry per locked/draft document
            · lock status indicator per document
            · conflict detection output (UIRD/ERD conflicts)
            · open question summary (blocking count, advisory count)
            · open questions list (blocking only in .brief)
            · deferred items list

  [ ] B11.2 Define .brief generation rules
            · regenerated on every document save (CLI responsibility)
            · regenerated on cv lint
            · regenerated on cv fetch
            · NOT regenerated by AI — CLI only

  [ ] B11.3 Define what each command loads by default
            (full context policy table — what gets loaded for each
            AI command without an explicit fetch override)

---

## Track C — AI Command Files

Each command is a markdown file that defines the AI's behavior for that phase.
Commands replace v2's /cv.* files entirely. Build in lifecycle order.

### C1 — Project Init  [CMD]
  [ ] C1.1  /cv.init
            · Mission Q&A (4–6 questions max)
            · Constitution definition (tech stack, design system,
              architecture principles, non-negotiables)
            · Produces: mission.md, constitution.md
            · Ends with: suggested next step (/cv.persona or /cv.feature)

### C2 — Explore Phase Commands  [CMD]
  [ ] C2.1  /cv.persona
            · Guided conversation to build a Persona document
            · Deposits to ledger with PERS tags throughout
            · Enforces: voice profile, emotional defaults,
              situation-specific responses, "would never do" section
            · Validates against existing personas for consistency
            · Ends with: pre-compile recap, confirmation, compile prompt

  [ ] C2.2  /cv.story
            · Loads specified persona (PERS-###)
            · AI enters persona mode — responds as that user
            · Facilitator (user) plays the product
            · AI-as-persona reacts authentically, may surprise
            · After each exchange, optional annotation mode:
              "stepping out of character — I almost closed here because..."
            · Deposits emotional moments, product gaps to ledger
            · Ends with: Chronicle seed (key moments, gaps, success signal)
            · Suggests: /cv.chronicle to compile, or continue simulating

  [ ] C2.3  /cv.chronicle
            · Compiles Chronicle from ledger entries tagged CHR:*
            · Presents draft section by section for confirmation
            · Resolves conflicts in ledger entries
            · Flags open questions, marks blocking vs advisory
            · Sets Story State based on feature existence
            · Ends with: Chronicle compiled, next step is Story Discovery
              or Feature Discovery depending on Story State

  [ ] C2.4  /cv.discover
            · Breadth-first feature exploration
            · AI asks clarifying questions until Feature Map is producible
            · Proactively surfaces: edge cases, implicit assumptions,
              dependency implications, scope creep risks
            · Deposits all answers to ledger with FEAT tags
            · Produces Feature Map with tier estimates and clarity scores
            · Identifies high-risk sub-features and recommends spikes
            · Ends with: Feature Map review, recommended order of attack,
              suggested next steps (/cv.details or /cv.discover <sub>)

### C3 — Define Phase Commands  [CMD]
  [ ] C3.1  /cv.details
            · Depth-first on a single sub-feature
            · AI pre-populates from ledger entries already tagged
            · Asks targeted questions about missing slots
            · Tracks clarity score in real time
            · Surfaces cross-document implications as they arise
            · Ends with: sub-feature clarity threshold reached,
              suggestion to detail next dependency or begin compile

  [ ] C3.2  /cv.compile
            · Compiles all Define documents from ledger for a feature
            · Runs in order: PRD+ → UIRD+ → ERD+ → AC → ADRs
            · Presents each document Signal Block for confirmation
            · Flags slot conflicts for human resolution
            · Generates .brief after all documents confirm
            · Ends with: all docs in Draft, .brief generated,
              next step /cv.reconcile (if UIRD/ERD conflict detected)
              or /cv.lock to approve documents

  [ ] C3.3  /cv.reconcile
            · Surfaces explicit UIRD ↔ ERD conflicts
            · Presents each conflict as a decision to make
            · Deposits resolutions to ledger
            · Updates affected document slots
            · Ends with: conflicts resolved, documents updated,
              ready for /cv.lock

  [ ] C3.4  /cv.lock
            · Reviews documents for lock readiness
            · Checks: all required slots filled, no blocking open questions,
              no unresolved conflicts
            · Requires human confirmation per document
            · Writes approval to approvals.json
            · Triggers .brief regeneration
            · Ends with: locked documents listed, /cv.spec unblocked

### C4 — Specify + Task Commands  [CMD]
  [ ] C4.1  /cv.spec
            · Generates spec from locked documents
            · Loads .brief (one call)
            · Generates Human Summary first (PM confirms)
            · Generates capability blocks (SFS-v2 format)
            · References AC IDs, Chronicle steps, component manifest
            · Ends with: spec in Draft, human summary confirmed,
              next step /cv.tasks

  [ ] C4.2  /cv.tasks
            · Generates task list from approved spec
            · Orders by dependency, not sequence
            · Groups into checkpoints
            · Flags high-uncertainty tasks
            · Identifies parallelizable work
            · Ends with: task list review, checkpoint overview,
              next step /cv.build <checkpoint>

### C5 — Build Phase Commands  [CMD]
  [ ] C5.1  /cv.build
            · Loads .brief (one call — default context)
            · Loads named sections on demand only
            · Implements task by task with FILE blocks
            · Pauses at checkpoint boundaries for validation
            · Ends each task with: done / blocked / needs-clarification
            · Ends each checkpoint with: CV validates, AI reviews
              against acceptance criteria

  [ ] C5.2  /cv.bug
            · Narrow fix, minimal scope
            · Classifies as Tier 1 automatically (no plan change)
            · Logs to ledger as PE-### type: bug-fix
            · Does not touch spec or tasks

### C6 — Surface + Prove Commands  [CMD]
  [ ] C6.1  /cv.surface
            · Triggered when refactor reveals a gap
            · AI classifies gap tier immediately:
              Tier 1 — implementation detail, engineer decides
              Tier 2 — spec revision needed, rewind to Define
              Tier 3 — assumption wrong, rewind to Explore/Discover
            · For Tier 1: patches task list, logs PlanEvent, continues
            · For Tier 2: opens affected document slots, routes to
              /cv.details for re-decision
            · For Tier 3: opens ledger entries, routes to /cv.discover
              with full context of what changed
            · Always: identifies unaffected tasks engineer can continue
              while rewind resolves

  [ ] C6.2  /cv.validate
            · Runs automated checks (tests, lint, type-check)
            · Reports CVVAL-### codes
            · Blocking failures halt, warnings surface for review

  [ ] C6.3  /cv.review
            · AI reviews implementation against acceptance criteria
            · Loads .brief + AC document (two calls)
            · Reports pass/fail per criterion with evidence

### C7 — Continuity Commands  [CMD]
  [ ] C7.1  /cv.status
            · Loads .brief only
            · Reports: current phase, lock states, open questions,
              next recommended action
            · No implementation context loaded

  [ ] C7.2  /cv.continue
            · Resume after interruption
            · Loads .brief + determines current phase from status.json
            · Provides 2-minute orientation (what's done, what's next)
            · Asks: continue with suggested next step or redirect?

  [ ] C7.3  /cv.history
            · Loads ledger for specified scope
            · Produces narrative of decisions made, in order
            · Can scope to: feature, sub-feature, document type,
              date range, or specific ledger entry thread

### C8 — Change Management Commands  [CMD]
  [ ] C8.1  /cv.rewind
            · Explicit request to reverse a decision
            · AI identifies affected ledger entries and document slots
            · Shows what was decided, when, why (from ledger)
            · Asks if the reason for the original decision still applies
            · Routes to minimum required rewind level
            · Lists all downstream impacts before proceeding

  [ ] C8.2  /cv.escalate  (team mode only)
            · Engineer flags a gap that requires PM decision
            · AI classifies, scopes, identifies unblocked tasks
            · Notifies PM with full context (not just "jacob is stuck")
            · PM receives: gap description, contested ledger entries,
              specific decision needed, affected documents

  [ ] C8.3  /cv.handoff  (team mode only)
            · Generates handoff package when Define completes
            · Includes: .brief, key decisions summary, deferred items,
              escalation path instructions, engineer assignment

---

## Track D — CLI Tool (`cv.js`)

The CLI is the file system operator. It does not reason.
It executes, validates, indexes, and loads context.

### D1 — Core Infrastructure  [CLI]
  [ ] D1.1  cv init <slug>
            · Scaffold project folder structure (full tree)
            · Create status.json (initial state)
            · Create exploration ledger files (project level)
            · Hand off to /cv.init

  [ ] D1.2  cv init-feature <FEAT-###> <slug>
            · Create feature folder structure
            · Create sub-ledger
            · Link to current git branch
            · Create empty .brief

  [ ] D1.3  cv fetch <feature> [document:section]
            · Default: load .brief only
            · With document arg: load named section
            · Section index pre-built from cv-section annotations
            · Supports: prd, uird, erd, spec, tasks, ac, ledger,
              map, persona, chronicle, brief
            · Supports section qualifiers: :signal, :full,
              :edge-cases, :scenarios, :flows, etc.

  [ ] D1.4  cv status
            · Print project state from status.json
            · No AI — pure file read
            · Shows: phase, locks, open questions per feature,
              next recommended command

  [ ] D1.5  cv lint
            · Validate structure and gate conditions
            · Check Signal Block required fields
            · Check document lock prerequisites
            · Check .brief freshness (regenerate if stale)
            · Check component manifest against registry
            · Check UIRD/ERD conflict flags
            · Emit CVVAL-### codes with severity

### D2 — Brief Management  [CLI]
  [ ] D2.1  Brief auto-generation
            · Trigger: any document save
            · Reads all Signal Blocks in feature folder
            · Detects UIRD/ERD conflicts (runs reconcile check)
            · Writes .brief file
            · Updates status.json

  [ ] D2.2  Section index generation
            · Trigger: any document save
            · Reads cv-section annotations
            · Builds section boundary map (section → line range)
            · Stored in .cv-index (hidden, per document)
            · Used by cv fetch for named section loading

### D3 — Ledger Operations  [CLI]
  [ ] D3.1  cv ledger add
            · Add a PlanEvent manually (for human-authored entries)
            · Validates schema
            · Appends to correct ledger file

  [ ] D3.2  cv ledger tag <PE-###> <tag>
            · Add/update tags on an existing entry
            · Triggers .brief regeneration if tag affects Signal Block

  [ ] D3.3  cv ledger status <PE-###> <status>
            · Update entry status (decided/open/deferred/contested)

### D4 — Validation  [CLI]
  [ ] D4.1  cv validate <FEAT-###>
            · Run post-implementation checks
            · Tests, lint, type-check, file existence
            · Emit CVVAL-### codes
            · Update checkpoint status in status.json

  [ ] D4.2  cv validate --brief
            · Validate that .brief is current and complete
            · Check all referenced documents exist
            · Check all Signal Blocks have required fields

### D5 — Import / Export  [CLI]
  [ ] D5.1  cv import --from gdocs <url> --as prd <FEAT-###>
            · Convert Google Doc → markdown
            · Extract structure into PRD+ slot format
            · Deposit recognizable content to ledger as PE-### entries
            · Flag unrecognized content for human review

  [ ] D5.2  cv export --to gdocs <FEAT-###> <document>
            · Push markdown → Google Doc
            · Maintain section structure

  [ ] D5.3  cv export --format cursor <FEAT-###>
  [ ] D5.4  cv export --format claude <FEAT-###>
  [ ] D5.5  cv export --format copilot <FEAT-###>

---

## Track E — Artifact Store Structure

Define the canonical folder structure for all projects.

  [ ] E1    Define full folder tree with comments per file
  [ ] E2    Define file naming conventions
  [ ] E3    Define which files are AI-generated vs human-authored
  [ ] E4    Define which files are append-only (ledger, history)
  [ ] E5    Document the .cv-index hidden file format
  [ ] E6    Document status.json schema (updated from v2)

### Proposed Structure
```
~/.codevision/
  config.json

  projects/
    <slug>/
      mission.md              ← human + AI (cv.init)
      constitution.md         ← human + AI (cv.init)
      status.json             ← CLI-managed, derived cache
      ledger.md               ← append-only, AI-managed

      personas/
        PERS-001.md           ← compiled by AI (cv.persona)
        PERS-001.cv-index     ← CLI-managed section index

      chronicles/
        CHR-001.md            ← compiled by AI (cv.chronicle)

      features/
        FEAT-001/
          idea.md             ← AI capture (cv.feature)
          map.md              ← AI generated (cv.discover)
          ledger.md           ← append-only, AI-managed
          approvals.json      ← CLI-managed
          .brief              ← CLI-generated, always current

          MB-01/
            details.md        ← AI compiled (cv.details)
            prd.md            ← AI compiled (cv.compile)
            uird.md           ← AI compiled (cv.compile)
            erd.md            ← AI compiled (cv.compile)
            ac.md             ← AI compiled (cv.compile)
            spec.md           ← AI generated (cv.spec)
            tasks.md          ← AI generated (cv.tasks)
            approvals.json
            .brief            ← CLI-generated
            *.cv-index        ← per-document, CLI-generated

      adrs/
        ADR-001.md            ← AI compiled, any phase

      contracts/              ← tech stack, design system, security
      components/
        registry.md           ← updated by cv.component
      ledger/
        decisions.md          ← promoted from ledger (first-class)
        history.md            ← append-only PlanEvents

      stakeholders/
        PERS-001.md           ← symlink or copy from personas/
```

---

## Track F — Testing Plan

Define how to validate each milestone is working.

  [ ] F1    M1 test: templates exist, schemas documented, spec coherent
  [ ] F2    M2 test: run a full Explore session with Cami/Aiko Health
            · /cv.persona → PERS-001 produced correctly
            · /cv.story → simulation runs, Chronicle seed deposited
            · /cv.chronicle → CHR-001 compiled, matches simulation
            · /cv.discover → Feature Map produced for one feature
  [ ] F3    M3 test: compile + lock cycle
            · /cv.details → clarity threshold reached
            · /cv.compile → all documents drafted from ledger
            · /cv.reconcile → UIRD/ERD conflict detected and resolved
            · /cv.lock → documents locked, .brief generated
            · cv fetch → .brief loads in one call, correct content
  [ ] F4    M4 test: spec and task generation
            · /cv.spec → generates correctly from locked docs
            · /cv.tasks → ordered, checkpointed, verifiable
  [ ] F5    M5 test: build loop with Cosplans moodboard MB-01
            · .brief loaded, correct context
            · Task implemented, checkpoint validated
  [ ] F6    M6 test: Surface loop
            · Tier 1 gap — patches in place, continues
            · Tier 2 gap — rewinds to Define, re-compiles, unblocks
  [ ] F7    M7 test: team handoff
            · Handoff package generated from Natalie's Define work
            · Engineer (jacob) receives, orients via /cv.continue
            · Escalation fired, PM unblocked engineer

---

## Suggested Execution Order

Given solo execution with limited time:

**Sprint 1 (do now):**
  A1.1 → A1.2 → A1.3  (lifecycle spec foundation)
  B1.1 → B1.3          (ledger schema + template)
  B2.4 → B3.4          (persona + chronicle templates)
  B4.3                  (feature map template)

**Sprint 2:**
  B5.4 → B6.4 → B7.3   (PRD+, UIRD+, ERD+ templates)
  B8.3 → B9.6           (AC + updated SFS-v2 templates)
  B11.1 → B11.3         (.brief schema)

**Sprint 3:**
  C1.1                  (/cv.init command)
  C2.1 → C2.4           (all Explore commands)
  C3.1 → C3.4           (all Define commands)
  D1.1 → D1.5           (core CLI commands)

**Sprint 4:**
  C4.1 → C4.2           (Specify + Task commands)
  C5.1 → C5.2           (Build commands)
  D2.1 → D2.2           (brief + index generation)
  F2 → F3               (test M2 + M3)

**Sprint 5:**
  C6.1 → C6.3           (Surface + Prove commands)
  C7.1 → C7.3           (Continuity commands)
  C8.1 → C8.3           (Change management)
  D3 → D4               (CLI ledger + validation)
  F4 → F7               (remaining tests)

---

## Open Decisions

These need resolution before the relevant work item starts:

  [?] OD-001  JSON vs TOON for structured data files
              Current: TOON (v2 spec). Question: is the dependency
              on @toon-format/cli worth the 40% token saving?
              Recommendation: switch to JSON for M1, revisit at M4
              when token costs can be measured empirically.

  [?] OD-002  Clarity score calculation
              How does the AI derive the 0–100 clarity score?
              Options: (a) % of required slots filled, (b) AI judgment
              based on ledger entry quality, (c) hybrid.
              Recommendation: hybrid — slot fill % as floor,
              AI judgment raises it based on answer quality.

  [?] OD-003  Simulation session format
              How does /cv.story handle multi-person sessions?
              Solo: AI plays both persona and product, user facilitates.
              Group: does the AI switch modes explicitly or does a
              human play the product while AI holds the persona?
              Recommendation: solo mode first. Group mode in M7.

  [?] OD-004  Web interface scope for MVP
              Full PM surface (M7) vs CLI-only for initial testing?
              Recommendation: CLI + AI commands first. Web UI is M7+.

  [?] OD-005  PageIndex integration timing
              Agreed: not now. Revisit when cross-feature queries
              become painful in practice. Flag as future Track G.
```

---

*Plan v1.0 — created from design sessions March 2026*
*Next action: begin Sprint 1 — A1.1 lifecycle spec foundation*
