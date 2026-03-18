# /cv.debug
<!-- cv.debug.md | Fix a validation failure or reported bug, strictly within scope. -->
<!-- Primary entry point: Validation Agent triage brief. Also handles direct bug reports. -->
<!-- Fix loop ends with /cv.validate re-run, not human judgment. -->

---

## What This Command Does

`/cv.debug` fixes a specific, identified failure. It always enters from a concrete failure description — either a Validation Agent triage brief (the primary path) or a direct bug report. It does not browse the codebase for things to improve. It fixes the stated failure and stops.

The fix loop: diagnose → implement fix → re-run `/cv.validate` → if PASS, unblock. If FAIL, loop again. The loop ends when the Validation Agent passes, not when the fix looks correct to the implementing AI.

**Scope limit:** If a fix requires changing public interfaces, document schemas, AC criteria, or more than ~50 lines across files, it has escalated beyond a debug fix. Issue a stop signal and route to `/cv.triage` for proper classification.

---

## Invocation

```
/cv.debug FEAT-###/MB-##                    ← debug from Validation Agent triage brief
/cv.debug FEAT-###/MB-## "bug description"  ← debug from a direct description
```

---

## Step 1 — Load Failure Context

### If entering from Validation Agent:

Read `MB-##/validation/checkpoint-N/verdict.md`. Extract:
- Which AC criterion failed
- What was expected vs what was observed
- The CVVAL code
- The triage entry point (most likely file/component)
- Which criteria passed (do not touch those)

State the failure clearly before proposing anything:

> "Entering debug from Validation Agent failure — Checkpoint [N]:
>
> **Failed:** AC-### — [criterion title]
> **CVVAL:** [code]
> **Expected:** [AC Then: field]
> **Observed:** [what the agent saw in the running app]
> **Likely location:** [file or component from triage brief]
>
> I'll fix this specific failure. I will not touch the passing criteria."

### If entering from direct bug report:

Ask one focused question before proceeding:

> "What exactly is happening versus what should happen? Be as specific as possible — what did you do, what did you see, what did you expect?"

Then read `MB-##/.brief` and `MB-##/tasks.md` to locate the relevant task and AC criterion.

---

## Step 2 — Scope Check

Before touching any code, confirm the fix is within debug scope:

A debug fix:
- Changes implementation code only — not spec, not AC, not task definitions
- Does not require new components or new entities
- Does not change a public interface, API contract, or data schema
- Is localized — the failing behavior has a specific, identifiable cause

If any of these are violated:

```xml
<stop_signal>
  <gate>debug-scope</gate>
  <reason>This failure cannot be fixed within debug scope. [Reason: requires spec change / new component / schema change / etc.]</reason>
  <action>Route to /cv.triage FEAT-###/MB-## to classify this as Tier 1, 2, or 3. Do not attempt an inline fix.</action>
</stop_signal>
```

---

## Step 3 — Diagnose

Identify the root cause before writing any code. State it explicitly:

> "Root cause: [specific reason the observed behavior diverges from expected — traced to a specific file, function, or logic branch]"

If the root cause is not clear:

> "The failure is in [component/screen] but I need to see [specific section] to trace it further."

Fetch only what's needed:
```
cv fetch FEAT-###/MB-## spec:capabilities  → if the capability spec is needed
cv fetch constitution                       → if an architectural rule is relevant
```

Do not load the full spec or PRD unless the diagnosis specifically requires it.

---

## Step 4 — Implement the Fix

Output the fix as targeted patch edits or FILE blocks:

- **Patch style** (preferred for small changes): show exactly which lines change
- **FILE block** (for larger changes): full file content with `save to:` path

Rules:
- Fix only what caused the failure — nothing else
- If you notice an adjacent bug or improvement while reading the code, note it separately:
  > "Noticed: [adjacent issue] in [file]. Not touching it now — flag for a separate debug session if needed."
- Do not refactor surrounding code
- Do not add error handling for scenarios that aren't in the AC
- Do not "improve" the implementation beyond what makes the failing criterion pass

After the fix:

> "Fix applied.
>
> What changed:
> - `[file]:[line range]` — [what changed and why this fixes the observed failure]
>
> **Re-run validation:** `/cv.validate FEAT-###/MB-## --checkpoint [N]`
>
> The Validation Agent will confirm whether this resolves AC-###."

---

## Step 5 — Re-Validation Loop

The fix is not complete until the Validation Agent passes. State this explicitly — do not tell the user the bug is fixed.

After `/cv.validate` runs:

### If PASS:

> "Validation passed. ✓
>
> AC-### — [criterion]: now PASS
> Feature is no longer `validation-blocked`.
>
> Returning to `/cv.build FEAT-###/MB-##` — Checkpoint [N] can now advance."

### If FAIL (same criterion):

> "Validation still failing on AC-###.
>
> New observation: [what the Validation Agent saw this time]
>
> Previous fix addressed [what it addressed] but the root cause was [updated diagnosis]. Let me revise."

Loop back to Step 3 with the updated failure context. Do not repeat the same fix.

### If FAIL (different criterion — regression):

> "Validation passed AC-### but the fix introduced a regression:
>
> **New failure:** AC-### — [criterion]
> **Observed:** [what broke]
>
> The fix needs to be revised to not affect [the now-failing criterion]."

Loop back to Step 3 with both failures in scope.

---

## Step 6 — Ledger Entry

When the debug loop closes with a PASS:

```
LEDGER ENTRIES — append to features/FEAT-###/ledger.md

[PE-###] Debug fix applied: FEAT-###/MB-## — <failure title>
  date:   YYYY-MM-DD
  source: triage
  actor:  <config.json → author> | ai
  status: decided
  tags:   [AC:criterion]
  note:   CVVAL-[code]. Root cause: [one sentence]. Fix: [one sentence]. Validated: checkpoint [N] PASS.
```

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include:

```
<!-- Running in standalone mode. Validation gate enforcement requires CLI integration. -->
```

And include inline:
- Primary entry: Validation Agent triage brief from MB-##/validation/checkpoint-N/verdict.md
- Scope limit: implementation code only, no spec/AC/schema changes, ~50 lines max
- Fix loop ends with /cv.validate PASS — not human judgment
- Regression on re-validate = new failure, loop again
