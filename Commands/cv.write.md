# /cv.write
<!-- cv.write.md | Compile Define documents from the Exploration Ledger. -->
<!-- Run after /cv.define reaches clarity threshold. Produces prd.md, uird.md, erd.md, ac.md, and .brief. -->

---

## What This Command Does

`/cv.write` reads all ledger entries tagged for a sub-feature and compiles them into the four Define documents: PRD, UIRD, ERD, and Acceptance Criteria. It is not a Q&A — it is a compilation pass. The AI reads the ledger, fills each document's slots from matched entries, surfaces any conflicts, and presents each Signal Block for human confirmation before writing.

Documents compiled here are in **Draft** status. They cannot generate a spec until they are approved via `/cv.approve`.

**Gate:** The sub-feature ledger must have no unresolved blocking open questions. Run `cv lint FEAT-###/MB-##` first to check.

---

## Invocation

```
/cv.write FEAT-###/MB-##         ← compile all four documents for a sub-feature
/cv.write FEAT-###/MB-## prd     ← compile only the PRD (can target one doc)
```

---

## Step 1 — Gate Check

Before anything else, check for unresolved blocking questions in the ledger:

1. Scan all ledger entries for `FEAT-###/MB-##` with `status: open` or `status: assumed`
2. Filter to entries tagged with any `:signal:` slot (these are required for Signal Block generation)

If blocking open questions exist, issue a stop signal:

```xml
<stop_signal>
  <gate>write</gate>
  <reason>FEAT-###/MB-## has [N] unresolved blocking question(s) in the ledger: [PE-### brief description]. These must be resolved before documents can be compiled.</reason>
  <action>Run /cv.define FEAT-###/MB-## to resolve the remaining questions, then re-run /cv.write.</action>
</stop_signal>
```

---

## Step 2 — Ledger Read

Read all ledger entries for `FEAT-###/MB-##`. Build a slot map:

For each entry, check its `tags` array. Map each tag to the document slot it belongs to:

```
PRD:signal:goal             → PRD Signal Block, goal field
PRD:signal:scope            → PRD Signal Block, scope array
PRD:full:problem-statement  → PRD Full Context, problem statement
UIRD:signal:screens         → UIRD Signal Block, screens array
UIRD:full:flows             → UIRD Full Context, flows section
ERD:signal:entities         → ERD Signal Block, entities array
ERD:signal:migration-impact → ERD Signal Block, migration-impact field
AC:criterion                → Acceptance Criteria document
```

If multiple entries map to the same slot, merge them. If they conflict, flag the conflict — do not silently pick one.

---

## Step 3 — Conflict Detection

Before presenting any document, surface conflicts explicitly:

> "I found a conflict in the ledger for [slot]:
>
> - PE-### says: [what it says]
> - PE-### says: [what it says — the conflicting claim]
>
> Which should the compiled document use?"

Wait for the user's answer. Deposit the resolution as a new ledger entry:

```
[PE-###] Conflict resolved: <slot>
  date:   YYYY-MM-DD
  source: define
  actor:  <config.json → author>
  status: decided
  tags:   [<conflicting slot>]
  note:   Resolved in favor of PE-###. Reason: <user's reasoning>
```

Resolve all conflicts before generating documents.

---

## Step 4 — Document Compilation

Compile documents in this order: PRD → UIRD → ERD → AC.

For each document:

1. Present the **Signal Block only** first:
   > "Here's the PRD Signal Block compiled from the ledger. Confirm before I write the full document."
   > ```
   > goal:     <compiled from PRD:signal:goal entries>
   > scope:    [<item>, <item>]
   > ...
   > ```
   > "Anything to correct?"

2. If confirmed: present the full document draft.
3. If corrected: update the Signal Block, deposit the correction as a ledger entry, re-present.
4. After full document is confirmed: move to the next document.

**Slots with no ledger entries:** Write `[empty — no ledger entries for this slot]` and flag them:
> "The UIRD `states` slot has no entries. This is required before the document can be approved. Add it via `/cv.define` or type the states now."

---

## Document Schemas

### PRD — Signal Block

```yaml
goal:           [one sentence — what this feature enables for the user]
tier:           1 | 2 | 3
chronicle-ref:  CHR-### — [title] step [#]
persona-ref:    PERS-### — [name/archetype]
scope:
  - [in-scope item]
out-of-scope:
  - [excluded item — with brief reason]
constraints:
  - [constraint]
success-metric: [measurable signal]
components-implicated:
  reuse: [[ComponentName@version]]
  new:   [[ComponentName]]
entities-implicated:
  - [EntityName — brief role]
open-questions:
  blocking: [count]
  advisory: [count]
status: draft
```

### UIRD — Signal Block

```yaml
screens:       [[ScreenName], ...]
component-manifest:
  reuse: [[Component@version]]
  new:   [[Component]]
states:        [idle, loading, empty, error, success, offline]
key-flows:     [[FlowName], ...]
chronicle-ref: CHR-### steps [#–#]
open:          [blocking: N, advisory: N]
status: draft
```

### ERD — Signal Block

```yaml
entities:
  - [EntityName]: [key attributes summary]
relations:
  - [A] —[type]→ [B]
constraints:
  - [constraint]
migration-impact: additive | modifying | destructive
open:         [blocking: N, advisory: N]
status: draft
```

### AC — Entry Format

```
## AC-### — [Title]

**Type:** functional | behavioral | performance | accessibility
**Given:** [precondition]
**When:** [action]
**Then:** [expected outcome]
**Verification:** automated | manual | ai-review
**Chronicle step:** CHR-### Step [#]
**Capability ref:** CAP-## (assigned during /cv.spec)
```

---

## Step 5 — UIRD / ERD Conflict Check

After both UIRD and ERD are compiled, run a cross-document conflict check:

Compare:
- `UIRD component-manifest.new` vs `ERD entities` — does the UIRD reference entities the ERD doesn't define?
- `UIRD states` vs `ERD lifecycle` — does the UI state machine match the data lifecycle?
- `UIRD key-flows` vs `ERD constraints` — does any flow violate a data constraint?

If conflicts are found, surface them in the `.brief` conflict block and recommend `/cv.reconcile`:

> "I found [N] conflict(s) between UIRD and ERD. These must be resolved before either document can be approved. Run `/cv.reconcile` to address them."

---

## Step 6 — Generate .brief

After all four documents are compiled and confirmed (even in Draft), regenerate the `.brief`:

Output a `.brief` update block:

```
.BRIEF UPDATE — write to features/FEAT-###/MB-##/.brief

# .brief — FEAT-###/MB-##: [Feature Title]
Generated: YYYY-MM-DD

## Document Status
| Document | Status | Blocking Questions |
|----------|--------|--------------------|
| PRD      | draft  | [N] |
| UIRD     | draft  | [N] |
| ERD      | draft  | [N] |
| AC       | draft  | [N] |
| Spec     | pending | — |
| Tasks    | pending | — |

## PRD Signal
[Signal Block content]

## UIRD Signal
[Signal Block content]

## ERD Signal
[Signal Block content]

## Conflicts Detected
[none | conflict descriptions]

## Blocking Open Questions
[none | aggregated blocking questions from all documents]
```

---

## Step 7 — Handoff

> "Compilation complete. All four documents are in Draft for FEAT-###/MB-##.
>
> Next steps:
> - `/cv.reconcile FEAT-###/MB-##` — resolve any UIRD/ERD conflicts before approving (required if conflicts were detected)
> - `/cv.approve FEAT-###/MB-##` — review and approve documents when all blocking questions are resolved
> - `/cv.define FEAT-###/MB-##` — fill any empty slots that are blocking approval"

Output final ledger entries:

```
LEDGER ENTRIES — append to features/FEAT-###/ledger.md

[PE-###] Write pass completed: FEAT-###/MB-##
  date:   YYYY-MM-DD
  source: define
  actor:  ai
  status: compiled
  tags:   [PRD:signal:goal, UIRD:signal:screens, ERD:signal:entities, AC:criterion]
  note:   [N] empty slots remain. [N] conflicts detected.
```

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include:

```
<!-- Running in standalone mode. Gate enforcement requires _core.md. -->
```

And include inline:
- Gate: no unresolved blocking questions in ledger for this sub-feature
- Compile order: PRD → UIRD → ERD → AC
- Signal Block confirmation required before writing each full document
- Cross-document conflict check (UIRD vs ERD) required before handoff
