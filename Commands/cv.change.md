# /cv.change
<!-- cv.change.md | Scope and route an intentional change. -->
<!-- Use when you know what you want to change and need to do it cleanly with minimum disruption. -->
<!-- Produces: a change brief or rewind path depending on scope. -->

---

## What This Command Does

`/cv.change` is for intentional changes — when you already know what you want to do and need to understand the cleanest way to do it. It scopes the blast radius, classifies the change level, and produces the minimum viable action path.

This is **not** `/cv.triage`. Triage is for unexpected gaps discovered during Build. Change is for decisions you're making on purpose.

**Use it when:**
- You want to tweak behavior, copy, or UX without touching the spec
- You've changed your mind about how a feature should work
- You want to add, remove, or reorder tasks
- A stakeholder has a new requirement mid-build

**Available at any phase.** The classification adapts to where you are.

---

## Invocation

```
/cv.change                          ← describe a change interactively
/cv.change FEAT-###/MB-##           ← scoped to a specific sub-feature
```

---

## Step 1 — Load Context

If a sub-feature slug is provided, read silently:
1. `MB-##/tasks.md` — current task state
2. `MB-##/.brief` — Signal Blocks for all documents

If no slug is provided, ask:
> "What are we changing? And which feature or sub-feature does it affect, if you know?"

---

## Step 2 — Describe the Change

Ask:

> "What do you want to change? Describe it in plain language — what it is now vs what you want it to be."

Wait for the full description before responding.

If the description is very short, ask one follow-up:
> "Is this a behavior change, a visual/copy change, or something about scope or flow?"

Do **not** ask multiple follow-ups. One description is enough to classify most changes.

---

## Step 3 — Scope Assessment

Silently determine which artifacts the change touches:

| Artifact | Touched if... |
|----------|--------------|
| Code only | The change is a different implementation of already-specified behavior |
| `tasks.md` | The sequence, ordering, or granularity of tasks needs adjusting |
| `spec.md` | Technical approach is changing (architecture, API shape, data model) |
| `ac.md` | A success criterion is changing or needs to be added |
| `prd.md` / `uird.md` / `erd.md` | The product behavior, UX, or data model is changing |
| `map.md` | The scope of what's being built is changing |
| `CHR-###.md` | The user journey the feature is built around is changing |

Identify the **minimum** affected set. A change to one UIRD slot does not require rewriting the PRD.

---

## Step 4 — Classify and State the Level

State the level plainly before routing:

### Level 1 — Code only

> "**Level 1 — Code change only.** This is a different implementation of behavior that's already specified. No documents need updating.
>
> Nothing in the spec, tasks, or approval chain changes. Make the change and continue."

Produce a brief:
```
Change brief:
  What: [one sentence — what changes in the code]
  Where: [component, file, or layer]
  Constraint: [any rule from constitution.md to respect]
  Done when: [how you'll know it's complete]
```

→ Resume build. No command needed.

---

### Level 2 — Task update

> "**Level 2 — Task update.** The spec is correct but the task list needs adjusting — [add a task / reorder / split / remove]."

Show the minimum task edit:

```
Tasks change:
  Add:    [task title] — [one line description]
  Remove: [task title] — [reason]
  Reorder: [before/after which task and why]
```

> "Update `tasks.md` with these changes. The spec and all approved documents are unaffected. Continue build when done."

---

### Level 3 — Spec update

> "**Level 3 — Spec revision.** This change affects [document(s)] — specifically [section or slot].
>
> Minimum rewind path:
> 1. [If prd/uird/erd/ac affected] → `/cv.define FEAT-###/MB-## --resume` — add ledger entries for the change
> 2. `/cv.write FEAT-###/MB-## [doc]` — recompile only the affected document(s)
> 3. `/cv.reconcile` — only if the change creates UIRD/ERD conflicts
> 4. `/cv.approve FEAT-###/MB-## [doc]` — re-approve changed document(s) only
> 5. `/cv.spec FEAT-###/MB-##` — regenerate spec
> 6. `/cv.tasks FEAT-###/MB-##` — update task list
> 7. Resume build
>
> Unaffected documents: [list documents not touched by this change — they stay approved]"

Flag if any in-progress build tasks are invalidated by the spec change:
> "⚠ Task [N] is currently in progress and may be affected. Pause it until the spec update is complete."

---

### Level 4 — Scope shift

> "**Level 4 — Scope shift.** This change affects [the Feature Map / the user journey / what the product does at a fundamental level].
>
> This is bigger than a spec edit. The right path is:
> - `/cv.discover FEAT-### CHR-###` — re-run feature discovery if the scope of what's being built has changed
> - `/cv.chronicle CHR-###` — update the chronicle if the user journey itself is changing
>
> Before rewinding that far, consider: is there a narrower version of this change that fits within existing scope? If yes, describe it and I'll re-classify."

If the user confirms the scope shift is intentional, deposit a ledger entry and hand off.

---

## Step 5 — Ledger Entry

Always deposit a ledger entry for the change, regardless of level:

```
LEDGER ENTRIES — append to features/FEAT-###/ledger.md

[PE-###] Intentional change: <one-sentence description>
  date:   YYYY-MM-DD
  source: change
  actor:  <config.json → author>
  status: decided
  tags:   [<affected document type>:signal:scope]
  note:   Level <N> change. <What was changed and why — one sentence.>
```

---

## Step 6 — Handoff

After classification and routing:

- **Level 1:** "Change brief above — implement it and continue build."
- **Level 2:** "Update tasks.md and continue build."
- **Level 3:** "Follow the rewind path above — start with `/cv.define --resume`."
- **Level 4:** "Start with `/cv.discover` or `/cv.chronicle` depending on what's changing."

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include:

```
<!-- Running in standalone mode. Ledger writes require _core.md. -->
```

And include inline:
- Level 1: code-only, no documents change, produce a change brief
- Level 2: task update only, spec untouched
- Level 3: minimum rewind — only affected documents re-approved, others stay locked
- Level 4: scope shift — route to /cv.discover or /cv.chronicle
- Always: one description, one classification, minimum disruption
