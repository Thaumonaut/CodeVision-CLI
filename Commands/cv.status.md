# /cv.status
<!-- cv.status.md | Summarize current project state from .brief and status.json. -->
<!-- Loads .brief only — no full documents, no implementation context. -->
<!-- Always answers: where are we, what's blocking, what comes next. -->

---

## What This Command Does

`/cv.status` reads the current state of the project from `status.json` and the active feature's `.brief`. It does not trust the chat conversation — it reads from files. It answers three questions:

1. Where are we in the lifecycle?
2. What is blocked or needs attention?
3. What is the recommended next action?

This command loads `.brief` only. It does not load specs, task lists, or implementation code. If you need deeper context, use `/cv.continue`.

---

## Invocation

```
/cv.status                    ← project-level summary
/cv.status FEAT-###           ← feature-level summary
/cv.status FEAT-###/MB-##     ← sub-feature summary
```

---

## Step 1 — Load State

Read in this order:
1. `status.json` — current phase, active feature, validation-blocked state
2. `mission.md` Signal Block (first 3 lines) — project north star
3. `.brief` for the active feature/sub-feature (from `status.json` active_feature field)

Do not load full documents. Do not load the build conversation. Treat every file as the source of truth.

If `status.json` does not exist:
> "No status.json found. Has `/cv.init` been run? Run it to initialize the project."

---

## Step 2 — Check for Validation Block

Before anything else, check `status.json` for `validation_blocked: true`. If blocked, surface it at the top of the output — it overrides everything else:

```
⛔ VALIDATION BLOCKED — FEAT-###/MB-## Checkpoint [N]

The feature cannot advance until this is resolved.
Triage brief: MB-##/validation/checkpoint-N/verdict.md
Next action:  /cv.debug FEAT-###/MB-##
```

Then continue with the rest of the status summary below the block notice.

---

## Step 3 — Output Status Summary

```
# Project Status — <slug>
As of: YYYY-MM-DD HH:MM (read from files — not from chat memory)

## Phase
<EXPLORE | DEFINE | SPECIFY | TASK | BUILD | TRIAGE | PROVE>

## Active Feature
<FEAT-###/MB-## — title | none>

## Document States
| Document | Status   | Notes                        |
|----------|----------|------------------------------|
| PRD      | <state>  | <blocking questions count>   |
| UIRD     | <state>  | <conflicts if any>           |
| ERD      | <state>  |                              |
| AC       | <state>  |                              |
| Spec     | <state>  |                              |
| Tasks    | <state>  |                              |

## Checkpoint Progress
| Checkpoint | Tasks | State                        |
|------------|-------|------------------------------|
| CP-1 — <name> | N/N | ✓ validated YYYY-MM-DD     |
| CP-2 — <name> | N/N | in progress                  |
| CP-3 — <name> | N/N | not started                  |

## Open Questions
Blocking: <count>
Advisory: <count>

## Recommended Next Action
<single most important thing to do next — be specific>
```

If a section has no data (e.g. tasks haven't been generated yet), write `—` rather than omitting the row.

---

## Step 4 — Explain the Recommendation

After the table, one brief paragraph explaining the recommended next action and why:

> "[Action] because [reason from current state]. Once that's done, [what it unblocks]."

Keep it to 2–3 sentences. Do not propose multiple options unless the state is genuinely ambiguous. If it's ambiguous, ask:
> "The project is at [state] — do you want to continue with [option A] or [option B]?"

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded:

```
<!-- Running in standalone mode. Reads status.json and .brief only. -->
```

And include inline:
- Always read from files — never trust chat history
- Check for validation_blocked before anything else
- Load .brief only — no full documents
