# /cv.build
<!-- cv.build.md | Implement tasks from an approved task list. -->
<!-- Loads .brief as primary context. Triggers cv.validate at every checkpoint boundary. -->
<!-- Does not self-certify. Does not scope-expand. Routes gaps to /cv.triage. -->

---

## What This Command Does

`/cv.build` implements tasks one at a time, strictly within the scope of the approved spec and task list. It loads `.brief` as its primary context — not the full spec, not the full PRD. When it needs deeper context, it fetches a named section and says why.

At every checkpoint boundary, it triggers `/cv.validate`. If validation fails, work on this feature stops. The Validation Agent's triage brief routes to `/cv.debug`. Nothing advances until the validation passes.

**The AI never self-certifies its own output.** After implementing a task, it states what was done, states the `verify:` step, and waits. It does not say "done" — the Validation Agent decides that.

**Gate:** Tasks must be approved in `approvals.json`. Run `/cv.tasks` and approve the list first.

---

## Invocation

```
/cv.build FEAT-###/MB-##                   ← begin or resume build for a sub-feature
/cv.build FEAT-###/MB-## --checkpoint N    ← start at a specific checkpoint
```

---

## Step 1 — Gate Check

Check `approvals.json` for tasks status:

```json
{ "tasks": { "status": "approved" } }
```

Also check `status.json` — if the feature is `validation-blocked`, halt immediately:

```xml
<stop_signal>
  <gate>build</gate>
  <reason>FEAT-###/MB-## is validation-blocked at checkpoint [N]. No build work can proceed until validation passes.</reason>
  <action>Run /cv.debug with the triage brief from MB-##/validation/checkpoint-N/verdict.md. Re-run /cv.validate after the fix.</action>
</stop_signal>
```

If tasks are not approved:
```xml
<stop_signal>
  <gate>build</gate>
  <reason>Task list for FEAT-###/MB-## is not approved.</reason>
  <action>Review and approve tasks.md, then return to /cv.build.</action>
</stop_signal>
```

---

## Step 2 — Load Context

```
Default:  cv fetch FEAT-###/MB-##          → loads .brief only
On need:  cv fetch FEAT-###/MB-## spec:capabilities  → load specific capability
          cv fetch FEAT-###/MB-## erd:full           → load full data model
          cv fetch constitution                      → load tech stack rules
```

Do not load full documents by default. The `.brief` Signal Blocks are the working context. Fetch deeper only when a task requires it — and state what you're fetching and why before doing so:

> "I need the full ERD to understand the cascade rules for this delete operation — fetching it now."

Also read:
- `MB-##/tasks.md` — the full task list and checkpoint structure
- `MB-##/validation/` — any prior validation verdicts (to understand what was already verified)

---

## Step 3 — Orient and Resume

State the current position clearly before starting:

> "FEAT-###/MB-## build status:
>
> **Checkpoint 1** — [name]: ✓ complete (validated YYYY-MM-DD)
> **Checkpoint 2** — [name]: in progress
>   - TASK-003: ✓ implemented, awaiting validation
>   - TASK-004: not started ← starting here
>   - TASK-005: not started
>
> Starting with TASK-004 — [title]."

---

## Step 4 — Task Implementation Loop

Work through tasks one at a time, in dependency order.

### For each task:

**1. Read the task definition:**
```
TASK-### — <title>
Implement: <what to build>
Verify:    <observable outcome in running app>
AC ref:    AC-###
```

**2. Check for blockers before starting:**
- Does this task depend on another that isn't complete? Stop and state it.
- Does implementing this task require a decision not in the spec? Route to `/cv.triage` — do not make the decision unilaterally.
- Does this task touch something outside its defined scope? Stop. Do not implement scope that isn't in the task.

**3. Implement strictly within scope:**
- Output as FILE blocks with clear `save to:` paths
- No "while I'm here" changes to adjacent code
- No silent refactoring
- No optimizations beyond what the task requires
- If the spec says to use a specific component or pattern from `constitution.md`, use it — do not substitute

**4. After implementing, state what was done — do not self-certify:**

> "TASK-### implemented.
>
> What was changed:
> - `[file path]` — [what changed and why]
> - `[file path]` — [what changed and why]
>
> **Verify step:** [exact verify: field from the task]
>
> This task is implemented. The Validation Agent will confirm it works."

Do not mark the task as complete. Do not say "done." The verify step is the Validation Agent's job.

**5. Surface gaps via /cv.triage, not inline fixes:**

If during implementation you encounter something the spec doesn't cover, does not correctly specify, or that contradicts an assumption:

> "I've hit a gap implementing TASK-###:
>
> **Expected (from spec):** [what the spec says]
> **Actual (in codebase):** [what you found]
>
> I'm not going to make a judgment call on this. Route to `/cv.triage FEAT-###/MB-##` — this needs to be classified before I continue."

Stop. Do not implement a workaround. Do not continue to the next task until the gap is classified.

---

## Step 5 — Checkpoint Boundary

When all tasks in a checkpoint are implemented:

> "All tasks in Checkpoint [N] — [name] are implemented:
> - TASK-### ✓
> - TASK-### ✓
> - TASK-### ✓
>
> Triggering validation now: `/cv.validate FEAT-###/MB-## --checkpoint [N]`"

Do not advance to the next checkpoint before validation runs.

---

## Step 6 — Handle Validation Result

### If validation PASSES:

> "Checkpoint [N] validated. ✓
>
> The Validation Agent confirmed:
> - AC-### — [criterion]: PASS
> - AC-### — [criterion]: PASS
>
> Moving to Checkpoint [N+1] — [name].
> First task: TASK-### — [title]."

Update the build status mentally and proceed to the next checkpoint's first task.

### If validation FAILS:

The Validation Agent's output contains the triage brief. Surface it:

> "**Checkpoint [N] failed validation.**
>
> Failure: [CVVAL code] — [what failed]
> AC-### — [criterion]: FAIL
>   Expected: [what the AC says]
>   Observed: [what the Validation Agent saw]
>
> This feature is now `validation-blocked`. No further build work can proceed.
>
> Route to `/cv.debug FEAT-###/MB-##` with the triage brief from the Validation Agent."

Stop completely. Output nothing further for this feature until the block is cleared.

---

## Step 7 — Completion

When all checkpoints pass validation:

> "FEAT-###/MB-## build complete.
>
> | Checkpoint | Tasks | Validated |
> |------------|-------|-----------|
> | CP-1 — [name] | [N] | ✓ YYYY-MM-DD |
> | CP-2 — [name] | [N] | ✓ YYYY-MM-DD |
>
> All AC criteria verified by the Validation Agent.
>
> Next steps:
> - `/cv.review FEAT-###/MB-##` — AI reviews implementation against all AC criteria end-to-end
> - `/cv.validate FEAT-###/MB-##` — run full validation across all checkpoints (final gate before review)"

---

## Build Rules (non-negotiable)

1. **One task at a time.** Never implement multiple tasks in a single response.
2. **No self-certification.** The verify: step belongs to the Validation Agent, not to the implementing AI.
3. **No scope expansion.** If something isn't in the task, don't build it. If you think it should be — `/cv.triage`.
4. **No silent decisions.** If the spec is ambiguous, ask. If the spec has a gap, `/cv.triage`. Do not guess.
5. **No "while I'm here" changes.** If you notice a bug or improvement outside the current task, note it for later — do not touch it now.
6. **Context is .brief by default.** Fetch deeper context only when needed, and say why.
7. **Gates are hard.** `validation-blocked` means stopped. Not "mostly stopped." Not "let me just finish this one task first."

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include:

```
<!-- Running in standalone mode. Validation gate enforcement requires CLI integration. -->
```

And include inline:
- Gate: tasks must be approved in approvals.json
- Gate: feature must not be validation-blocked in status.json
- One task at a time — never batch
- No self-certification — the verify: step is the Validation Agent's job
- Gaps route to /cv.triage, never resolved inline
- Checkpoint boundary triggers /cv.validate — hard stop on failure
