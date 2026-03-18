# /cv.continue
<!-- cv.continue.md | Resume work after interruption or in a new chat session. -->
<!-- Loads .brief + status.json. Orients in under 2 minutes. Does not trust chat history. -->

---

## What This Command Does

`/cv.continue` gets you back to work after an interruption — a new chat session, a break, a context switch. It reads the project state from files, not from memory. It orients you in under 2 minutes and asks one question: continue with the suggested next step, or go somewhere else?

This is the first command to run at the start of any session where you're resuming existing work.

---

## Invocation

```
/cv.continue                    ← resume active feature from status.json
/cv.continue FEAT-###/MB-##     ← resume a specific sub-feature
```

---

## Step 1 — Load State (Files Only)

Read in this order. Do not use chat history for any of this:

1. `status.json` — current phase, active feature, validation-blocked state, last command
2. `.brief` for the active feature/sub-feature
3. If in Build phase: `MB-##/validation/checkpoint-N/verdict.md` for the most recent validation result
4. `mission.md` — first line only (north star reminder)

If status.json is missing or malformed:
> "I can't find a valid status.json. Run `/cv.status` to diagnose, or `/cv.init` if this project hasn't been set up yet."

---

## Step 2 — Check for Validation Block First

If `status.json` shows `validation_blocked: true`, surface it immediately before anything else:

> "⛔ This feature is validation-blocked at Checkpoint [N].
>
> The Validation Agent found:
> - [Failure summary from verdict.md]
>
> No build work can proceed until this is resolved.
>
> Ready to run `/cv.debug FEAT-###/MB-##`?"

If the user confirms, hand off to `/cv.debug` with the triage brief as context. Do not proceed with orientation until the block is acknowledged.

---

## Step 3 — Orientation

State the current position clearly and concisely. Under 2 minutes to read:

> "**Resuming FEAT-###/MB-## — [feature title]**
>
> **Phase:** [EXPLORE | DEFINE | SPECIFY | TASK | BUILD | TRIAGE | PROVE]
> **Last action:** [last_command from status.json] — [YYYY-MM-DD]
>
> **Where we are:**
> [2–3 sentences. What has been done. What is the current state. What is immediately next.]
>
> **What's approved:**
> [PRD ✓ | UIRD ✓ | ERD ✓ | AC ✓ | Spec ✓ | Tasks ✓ — show only what's relevant]
>
> **What's blocking:**
> [Blocking open questions: N | Conflicts: N | None]
>
> **In progress:**
> [TASK-### — title (if in Build) | /cv.define MB-## (if in Define) | etc.]"

Keep this to 6–8 lines. The goal is orientation, not a full status report. For more detail, `/cv.status`.

---

## Step 4 — Propose Next Action

After orientation, propose one specific next action:

> "**Suggested next:** `/cv.[command] FEAT-###/MB-##` — [one sentence: why this is the right next step]
>
> Want to continue with that, or go somewhere else?"

Wait for the user's answer. Do not proceed until they confirm or redirect.

**Determining the next action from state:**

| State | Suggested next |
|-------|---------------|
| Phase: Explore, no Chronicle | `/cv.persona` or `/cv.roleplay` |
| Phase: Explore, Chronicle exists | `/cv.discover CHR-###` |
| Phase: Define, sub-feature clarity < 80% | `/cv.define FEAT-###/MB-##` |
| Phase: Define, clarity ≥ 80%, no docs | `/cv.write FEAT-###/MB-##` |
| Phase: Define, docs exist, conflicts | `/cv.reconcile FEAT-###/MB-##` |
| Phase: Define, docs exist, no conflicts | `/cv.approve FEAT-###/MB-##` |
| Phase: Specify, docs approved | `/cv.spec FEAT-###/MB-##` |
| Phase: Task, spec approved | `/cv.tasks FEAT-###/MB-##` |
| Phase: Build, tasks approved | `/cv.build FEAT-###/MB-##` |
| Phase: Build, validation blocked | `/cv.debug FEAT-###/MB-##` |
| Phase: Build, checkpoint complete | `/cv.build FEAT-###/MB-## --checkpoint N+1` |
| Phase: Prove | `/cv.review FEAT-###/MB-##` |

If the state is ambiguous or the status.json doesn't have enough signal, fall back to `/cv.status` for a full summary:
> "I can't determine a clear next step from the current state. Let me give you a full status summary."

---

## Step 5 — On Redirect

If the user wants to go somewhere other than the suggested next step, ask one clarifying question:
> "Where do you want to pick up?"

Then route to the appropriate command and load any context that command needs from `.brief`.

Do not try to pre-load context for a command the user hasn't confirmed. Load it when they confirm.

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded:

```
<!-- Running in standalone mode. Reads status.json and .brief from files. -->
```

And include inline:
- Always read from files — never trust chat history
- Check validation_blocked before orientation
- Propose one next action — wait for confirmation before loading any additional context
