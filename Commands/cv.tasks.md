# /cv.tasks
<!-- cv.tasks.md | Generate ordered, checkpointed task list from an approved spec. -->
<!-- Every task includes a verify: field — the exact behavior the Validation Agent will check. -->
<!-- Gates /cv.build. -->

---

## What This Command Does

`/cv.tasks` reads the approved spec and breaks it into an ordered, checkpointed task list. Every task includes a `verify:` field — the exact interaction or observable outcome the Validation Agent will confirm in a running app. Checkpoints are not progress groupings; they are validation gates. No checkpoint advances without a clean validation pass.

The output is not a backlog. It is an executable plan with a clear dependency order, identified parallelizable tracks, and flagged high-uncertainty tasks.

**Gate:** Spec must be approved for this sub-feature. Run `/cv.approve` first.

---

## Invocation

```
/cv.tasks FEAT-###/MB-##    ← generate tasks for a sub-feature
```

---

## Step 1 — Gate Check

Check `approvals.json` for spec status:

```json
{ "spec": { "status": "approved" } }
```

If not approved:
```xml
<stop_signal>
  <gate>tasks</gate>
  <reason>Spec for FEAT-###/MB-## is not approved. Tasks cannot be generated from an unapproved spec.</reason>
  <action>Run /cv.approve FEAT-###/MB-## to approve the spec first.</action>
</stop_signal>
```

---

## Step 2 — Read the Spec

Load `MB-##/spec.md`. Extract:

- All capability blocks (CAP-## entries)
- Acceptance Criteria IDs referenced per capability
- Component manifest (reuse vs new from UIRD Signal Block)
- Entity definitions (from ERD Signal Block)
- Integration points and external dependencies
- Any flagged high-uncertainty or spike-required items

---

## Step 3 — Identify Tasks

For each capability in the spec, identify the discrete, implementable tasks. A task is:

- **Small enough to complete in one session** — if a capability takes more than one focused session to implement, split it
- **Independently verifiable** — its `verify:` step can be confirmed without completing other tasks
- **Clearly scoped** — a developer reading it knows exactly what to build and what done looks like

Do not create tasks for documentation, comments, or configuration unless they are required for the feature to function. Do not create tasks for things the spec does not require.

---

## Step 4 — Write verify: for Every Task

Every task must have a `verify:` field before it is included in the output. This is not optional.

The `verify:` field must be:
- **Observable** — something visible in the running app, not in the code
- **Specific** — exactly what to interact with and what to expect
- **Executable by the Validation Agent** — the agent opens the app, performs this interaction, and observes this outcome

Bad verify (not observable): "Unit tests pass for the AuthService"
Good verify (observable): "Open the app, tap Sign In, enter valid credentials, confirm the home screen loads within 2 seconds"

Bad verify (too vague): "The form works"
Good verify (specific): "Fill the registration form with a duplicate email, submit, confirm the 'Email already in use' error appears inline below the email field"

If a capability cannot be verified behaviorally (e.g. a background job with no UI signal), design a minimal observable indicator:
> "This task has no direct UI signal. I've added a verify step that checks the side effect: [observable outcome in the app]. If that's not appropriate, define an observable indicator before proceeding."

---

## Step 5 — Assign Dependencies and Checkpoints

### Dependencies

For each task, identify:
- **Depends on:** tasks that must complete before this one can start (data model, component, API)
- **Blocks:** tasks that cannot start until this one is done

Build a dependency graph. Tasks with no dependencies are Phase 1. Tasks that only depend on Phase 1 tasks are Phase 2. And so on.

### Checkpoints

Group tasks into checkpoints based on the dependency graph, not arbitrary counts. A checkpoint closes when:
1. All tasks in the group are implemented
2. `/cv.validate` runs and passes (static + behavioral) for all tasks in the group

**Checkpoint sizing guidelines:**
- Each checkpoint should be validatable as a coherent unit — the app should be in a meaningful, testable state after it
- Foundation tasks (data model, auth, routing) form their own checkpoint
- UI tasks that depend on a working data layer go in the next checkpoint
- Do not mix unrelated capabilities in a single checkpoint if it makes the verify: steps harder to confirm

---

## Step 6 — Flag High-Uncertainty Tasks

Flag any task where:
- The implementation approach is not obvious from the spec
- It touches an external dependency (API, third-party SDK, platform API)
- It was marked as a spike candidate in the Feature Map
- The `verify:` step is difficult to define precisely

Flag format:
> ⚠️ **High uncertainty** — [reason]. Consider spiking before committing to this implementation approach.

High-uncertainty tasks should be placed in their own checkpoint where possible so a failure doesn't block unrelated work.

---

## Step 7 — Present Checkpoint Overview

Before outputting the full task list, present a summary for review:

> "Here's the checkpoint plan for FEAT-###/MB-##:
>
> **Checkpoint 1 — [name]:** [N] tasks — [what will be working after this checkpoint]
> **Checkpoint 2 — [name]:** [N] tasks — [what will be working after this checkpoint]
> **Checkpoint 3 — [name]:** [N] tasks — [what will be working after this checkpoint]
>
> **Parallel tracks:** [tasks that can run simultaneously within a checkpoint]
> **High-uncertainty tasks:** [N] — [brief description]
> **Total tasks:** [N]
>
> Does this structure look right before I write the full task list?"

Wait for confirmation before proceeding.

---

## Step 8 — Generate tasks.md

Output the complete `tasks.md` as a code block:

~~~markdown
# Tasks — FEAT-###/MB-##: <Feature Title>
<!-- cv-artifact: tasks -->
<!-- cv-compiled-from: spec.md -->

**Status:** draft
**Spec ref:** FEAT-###/MB-## spec.md
**Generated:** YYYY-MM-DD

---

## Signal Block
<!-- cv-section: signal -->

```
feature:      FEAT-###/MB-## — <title>
checkpoints:  <count>
total-tasks:  <count>
parallel-tracks: <count>
high-uncertainty: <count>
status:       draft
```

---

## Checkpoint 1 — <Name>
<!-- cv-section: checkpoint-1 -->
**Validates:** <what the app can do after this checkpoint passes>
**Validation gate:** /cv.validate FEAT-###/MB-## --checkpoint 1

### TASK-001 — <Title>
**Capability:** CAP-##
**Depends on:** none | TASK-###
**Implement:** <what to build — specific, no ambiguity>
**Verify:** <exact interaction in running app → expected observable outcome>
**AC ref:** AC-###
- [ ] Implemented
- [ ] Verified

### TASK-002 — <Title>
**Capability:** CAP-##
**Depends on:** TASK-001
**Implement:** <what to build>
**Verify:** <exact interaction → expected outcome>
**AC ref:** AC-###
- [ ] Implemented
- [ ] Verified

---

## Checkpoint 2 — <Name>
<!-- cv-section: checkpoint-2 -->
**Validates:** <what the app can do after this checkpoint passes>
**Validation gate:** /cv.validate FEAT-###/MB-## --checkpoint 2

### TASK-003 — <Title> ⚠️ High uncertainty
**Capability:** CAP-##
**Depends on:** TASK-001, TASK-002
**Uncertainty:** <why this is high-uncertainty — external dependency, unclear approach>
**Implement:** <what to build>
**Verify:** <exact interaction → expected outcome>
**AC ref:** AC-###
- [ ] Implemented
- [ ] Verified

[Continue for all tasks]

---

## Dependency Graph

```
TASK-001 ──────────────────────────────── no dependencies
  │
  └──▶ TASK-002 ───────────────────────── depends on TASK-001
  │
  └──▶ TASK-003 (⚠️ high uncertainty) ─── depends on TASK-001

TASK-004 ──────────────────────────────── parallel to TASK-002/003
```

---

## Parallel Tracks

Tasks that can run simultaneously within a checkpoint:
- TASK-002 and TASK-004 — independent, no shared dependencies

---

## High-Uncertainty Tasks

- **TASK-003** — [reason, suggested spike approach]
~~~

Instruct the user:
> "Save this to `MB-##/tasks.md`. Approve it to unblock `/cv.build`."

---

## Step 9 — Handoff

> "Task list ready for FEAT-###/MB-##. [N] tasks across [N] checkpoints.
>
> Next steps:
> - Review and approve the task list (required before /cv.build)
> - `/cv.build FEAT-###/MB-##` — begin implementation once tasks are approved
> - Spike any high-uncertainty tasks before committing to implementation"

Output ledger entry:

```
LEDGER ENTRIES — append to features/FEAT-###/ledger.md

[PE-###] Task list generated: FEAT-###/MB-##
  date:   YYYY-MM-DD
  source: define
  actor:  ai
  status: compiled
  tags:   [AC:criterion]
  note:   [N] tasks, [N] checkpoints, [N] high-uncertainty tasks flagged.
```

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include:

```
<!-- Running in standalone mode. Gate enforcement requires _core.md. -->
```

And include inline:
- Gate: spec must be approved in approvals.json
- Every task requires a verify: field — observable behavior in a running app, not a test assertion
- Checkpoints are validation gates, not groupings — /cv.validate runs at each checkpoint boundary
- High-uncertainty tasks must be flagged and isolated where possible
