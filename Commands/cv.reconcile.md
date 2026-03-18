# /cv.reconcile
<!-- cv.reconcile.md | Resolve conflicts between UIRD and ERD before approval. -->
<!-- Run after /cv.write when cross-document conflicts are detected. Required before /cv.approve. -->

---

## What This Command Does

`/cv.reconcile` resolves conflicts between the UIRD and ERD that were detected during `/cv.write`. These conflicts mean the UI design and the data model are making contradictory assumptions — and if both get approved as-is, the spec will encode the contradiction, the AI will implement the wrong thing, and the Validation Agent will catch a behavioral failure that could have been avoided here.

This is a focused conflict resolution session, not a re-do of the Define phase. Each conflict is surfaced as a specific decision to make. Once resolved, the affected documents are updated and the session closes.

**Gate:** Requires UIRD and ERD to exist in Draft status (produced by `/cv.write`) with at least one detected conflict. If `/cv.write` found no conflicts, this command is not required.

---

## Invocation

```
/cv.reconcile FEAT-###/MB-##    ← resolve all detected conflicts for a sub-feature
```

---

## Step 1 — Load Conflicts

Read:
1. `MB-##/.brief` — the Conflicts Detected section (populated by `/cv.write`)
2. `MB-##/uird.md` — the full UIRD
3. `MB-##/erd.md` — the full ERD
4. `FEAT-###/ledger.md` — entries that contributed to the conflicting slots

List all detected conflicts:

> "I found [N] conflict(s) between UIRD and ERD for FEAT-###/MB-##. I'll work through them one at a time. Each conflict is a decision — the resolution will update the affected document(s) and be deposited to the ledger."

---

## Step 2 — Conflict Resolution Loop

For each conflict, work through the following:

### 2a — Present the Conflict

> "**Conflict [N] of [N] — [Slot name]**
>
> **UIRD says:** [what the UIRD states — specific field or flow]
> **ERD says:** [what the ERD states — specific entity, constraint, or lifecycle rule]
>
> **Why this matters:** [what will break at implementation or validation if this is not resolved]
>
> To resolve this, one of them needs to change. Which is correct — the UI design or the data model?
>
> → [Option A] — keep the UIRD, update the ERD: [what the ERD change would be]
> → [Option B] — keep the ERD, update the UIRD: [what the UIRD change would be]
> → [Option C] — both need to change: [describe a reconciled version]
> → Custom — I'll describe the resolution"

### 2b — Confirm the Resolution

After the user chooses:

> "Resolution: [what changes]. Here's the updated [UIRD signal block | ERD signal block] with this applied:
>
> ```yaml
> [updated Signal Block]
> ```
>
> Does this look right?"

If confirmed: update the document inline and proceed to the next conflict.
If not: re-present with the correction.

### 2c — Deposit to Ledger

```
[PE-###] Conflict resolved: UIRD ↔ ERD — [slot]
  date:   YYYY-MM-DD
  source: define
  actor:  <config.json → author>
  status: decided
  tags:   [UIRD:signal:component-manifest, ERD:signal:entities] ← both affected slots
  note:   Resolved in favor of [UIRD | ERD | hybrid]. Reason: [user's reasoning].
  related: [PE-### IDs of the original conflicting entries]
```

---

## Conflict Types to Check

`/cv.reconcile` focuses on three known conflict surfaces, but should also catch any others surfaced by `/cv.write`:

**1. Component manifest vs entity definitions**
The UIRD `component-manifest.new` lists components that work with data the ERD doesn't define. Or the ERD defines entities that no UIRD component uses.

> "UIRD declares a `[ComponentName]` that reads `[field]` — but the ERD has no `[field]` on `[EntityName]`. Which is right?"

**2. UI state machine vs data lifecycle**
The UIRD `states` list includes a state (e.g. `offline`, `partial`) that the ERD's data lifecycle doesn't account for.

> "UIRD has an `offline` state — but the ERD doesn't define how `[EntityName]` behaves when the data source is unavailable. Does the data model need an offline rule, or is this a UI-only state?"

**3. User flows vs data constraints**
A UIRD flow allows an action (e.g. deleting a record) that an ERD constraint prohibits (e.g. cascading FK dependency).

> "UIRD flow `[FlowName]` allows a user to [action] — but ERD constraint `[constraint]` prevents that operation. One of these has to give. Should the flow add a guard, or should the constraint be relaxed?"

---

## Step 3 — Post-Resolution Document Updates

After all conflicts are resolved, present the updated Signal Blocks for both documents:

> "All [N] conflicts resolved. Here are the updated Signal Blocks:
>
> **UIRD — updated Signal Block**
> ```yaml
> [updated block]
> ```
>
> **ERD — updated Signal Block**
> ```yaml
> [updated block]
> ```
>
> Confirm these look correct and I'll clear the conflict flag in `.brief`."

---

## Step 4 — Clear Conflict Flag and Update .brief

Output a `.brief` update block:

```
.BRIEF UPDATE — write to features/FEAT-###/MB-##/.brief

## Conflicts Detected
none — resolved in /cv.reconcile session YYYY-MM-DD

## UIRD Signal
[updated Signal Block]

## ERD Signal
[updated Signal Block]
```

---

## Step 5 — Handoff

> "Reconciliation complete. [N] conflicts resolved.
>
> Next step:
> - `/cv.approve FEAT-###/MB-##` — all four documents are now ready for review and approval"

Output all ledger entries from this session.

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include:

```
<!-- Running in standalone mode. Ledger writes require _core.md. -->
```

And include inline:
- Gate: UIRD and ERD must exist in draft with at least one detected conflict
- One conflict at a time — present, decide, confirm, deposit, next
- Both affected Signal Blocks must be updated before session closes
- Conflict flag in .brief must be cleared before /cv.approve can proceed
