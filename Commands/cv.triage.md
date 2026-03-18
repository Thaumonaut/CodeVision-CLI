# /cv.triage
<!-- cv.triage.md | Classify and route a gap discovered during Build. -->
<!-- Entered from a Validation Agent failure report or an unexpected behavior found mid-task. -->

---

## What This Command Does

`/cv.triage` is the response to something going wrong during Build — either a Validation Agent failure or an unexpected behavior discovered while implementing. It classifies the problem into one of three tiers and routes it to the right resolution path. The AI does not fix the problem here — it identifies what kind of problem it is and what the minimum response is.

**The three tiers:**

| Tier | What it means | Response |
|------|--------------|----------|
| **Tier 1** — Implementation detail | The spec is correct; the code just needs to be fixed | Stay in `/cv.debug`, no plan change |
| **Tier 2** — Spec revision needed | The implementation revealed something the spec got wrong or didn't cover | Rewind to Define, revise affected document(s) |
| **Tier 3** — Assumption broken | A fundamental discovery assumption was wrong | Rewind to Explore or Discover, re-examine scope |

Getting the tier right matters. Under-triaging (calling Tier 2 a Tier 1) creates hidden technical debt. Over-triaging (calling Tier 1 a Tier 3) wastes planning cycles.

**Gate:** Can be entered from a Validation Agent triage brief, or invoked manually when a gap is found during implementation.

---

## Invocation

```
/cv.triage FEAT-###/MB-##                    ← triage a gap for a sub-feature
/cv.triage FEAT-###/MB-## --from-validation  ← load the Validation Agent's triage brief as context
```

---

## Step 1 — Load Context

Read:
1. Validation Agent triage brief (if `--from-validation` — from `MB-##/validation/checkpoint-N/verdict.md`)
2. `MB-##/tasks.md` — the current task and checkpoint
3. `MB-##/ac.md` — the relevant AC criterion that failed or is at risk
4. `MB-##/.brief` — Signal Blocks for all approved documents

Do not load the full spec or full PRD unless the triage analysis requires it. Start with the minimum context.

---

## Step 2 — Describe the Gap

If entering from a Validation Agent failure, extract the gap from the triage brief.

If entering manually, ask:

> "What did you find? Describe what's happening versus what you expected — specifically what the app is doing or not doing."

Then ask one clarifying question:

> "Is this something that was covered in the spec, or something the spec didn't address?"

This is the first signal for tier classification.

---

## Step 3 — Classify the Tier

Work through this decision tree:

**Question 1:** Is the expected behavior defined in the spec and AC?

- **Yes** → the spec is correct, the code is wrong → likely **Tier 1**
- **No** → the spec has a gap → go to Question 2

**Question 2:** Is this gap something that could have been predicted from the Chronicle and Feature Map?

- **No, it's a new detail within already-agreed scope** → **Tier 2** (spec revision)
- **Yes, but it was missed** → **Tier 2** (spec revision with a note on why it was missed)
- **It contradicts a core assumption from the Explore phase** → **Tier 3** (rewind to Explore)

**Question 3 (for Tier 2/3 candidates):** Can this be resolved with a local spec change, or does it invalidate multiple approved documents?

- **Local change to one document** → confirm **Tier 2**
- **Invalidates PRD goal, Chronicle trigger, or persona behavior** → escalate to **Tier 3**

State the tier clearly:

> "This is a **Tier [N]** gap — [one sentence explanation of why]."

---

## Step 4 — Route by Tier

### Tier 1 — Stay in Build

> "**Tier 1 — Implementation detail.** The spec is correct; the code needs to be fixed.
>
> The plan does not change. Route to `/cv.debug` with this context:
> - Expected behavior: [AC criterion or spec statement]
> - Observed behavior: [what the Validation Agent or developer found]
> - Likely location: [component, file, or function]
>
> After the fix, `/cv.validate` re-runs for checkpoint [N]."

Deposit a ledger entry:
```
[PE-###] Tier 1 gap found and routed: FEAT-###/MB-##
  date:   YYYY-MM-DD
  source: triage
  actor:  <config.json → author> | ai
  status: decided
  tags:   [AC:criterion]
  note:   Implementation error. No spec change. Routed to /cv.debug.
```

Identify any tasks in the current checkpoint that are unaffected and can continue in parallel:
> "While the fix is in progress, these tasks are unblocked and can continue: [list]."

---

### Tier 2 — Rewind to Define

> "**Tier 2 — Spec revision needed.** The spec doesn't correctly cover [gap].
>
> Affected document(s): [PRD | UIRD | ERD | AC]
> Affected slot(s): [specific slots]
>
> Resolution path:
> 1. `/cv.define FEAT-###/MB-## --resume` — add ledger entries for the missing or incorrect scope
> 2. `/cv.write FEAT-###/MB-## [doc]` — recompile the affected document(s)
> 3. `/cv.reconcile` if the change creates UIRD/ERD conflicts
> 4. `/cv.approve FEAT-###/MB-## [doc]` — re-approve the changed document(s)
> 5. `/cv.spec FEAT-###/MB-##` — regenerate spec from the updated documents
> 6. `/cv.tasks FEAT-###/MB-##` — update the task list
> 7. `/cv.build` — resume from the affected checkpoint
>
> Unaffected tasks that can continue while this rewinds: [list any tasks not touched by the spec change]"

Deposit:
```
[PE-###] Tier 2 gap found: FEAT-###/MB-##
  date:   YYYY-MM-DD
  source: triage
  actor:  <config.json → author> | ai
  status: open
  tags:   [PRD:signal:scope] ← (the specific affected slot)
  note:   Spec revision needed. [Describe the gap]. Rewinding to Define phase.
```

---

### Tier 3 — Rewind to Explore

> "**Tier 3 — Discovery assumption broken.** [Gap description] contradicts a core assumption from the Explore phase.
>
> What this affects:
> - Ledger entries: [PE-### IDs of the affected assumptions]
> - Chronicle: [which Chronicle step or trigger is called into question]
> - Feature Map: [which sub-features may need re-scoping]
>
> This is not a local fix. Before any implementation continues on this feature:
> 1. Review the affected ledger entries and Chronicle
> 2. `/cv.discover FEAT-### CHR-###` — re-run feature discovery with the new information
> 3. Update the Feature Map
> 4. Return to Define for affected sub-features
>
> Unaffected sub-features that can continue: [list sub-features not touched by this assumption]"

Deposit:
```
[PE-###] Tier 3 assumption failure: FEAT-###/MB-##
  date:   YYYY-MM-DD
  source: triage
  actor:  <config.json → author> | ai
  status: contested
  tags:   [PRD:signal:scope, CHR:trigger]
  related: [PE-### IDs of the original assumptions]
  note:   Core assumption broken. [What was assumed vs what is true]. Rewinding to Explore.
```

---

## Step 5 — Always: Identify Unblocked Work

Regardless of tier, before closing:

> "While this is being resolved, the following work is **unblocked** and can continue:
> - [Task or sub-feature] — not affected by this gap
> - [Task or sub-feature] — different checkpoint, no dependency on the failing criterion"

If everything is blocked:
> "All remaining tasks in this checkpoint depend on resolving this gap. No parallel work is available. Focus on the triage path."

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include:

```
<!-- Running in standalone mode. Ledger writes require _core.md. -->
```

And include inline:
- Tier 1: implementation error, no plan change, route to /cv.debug
- Tier 2: spec revision, rewind to Define
- Tier 3: assumption broken, rewind to Explore
- Always identify unblocked work before closing
