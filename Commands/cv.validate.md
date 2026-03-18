# /cv.validate
<!-- cv.validate.md | Validation Agent — verifies working behavior at every checkpoint boundary. -->
<!-- Triggered automatically by cv.build at checkpoints. Also runs as final gate before /cv.review. -->
<!-- Loads as a SEPARATE AI context. No memory of writing the code. Adversarial by default. -->

---

## What This Command Does

`/cv.validate` loads the Validation Agent — a fresh AI context with no knowledge of how the code was written. Its job is to prove that the implementation works, not to assume it does. It compiles the project, runs it in a real environment, and interacts with it as a user would, verifying each AC criterion against observed behavior.

**This is not a test runner wrapper.** Tests can be written to pass against broken behavior. The Validation Agent must observe the running app.

**Two gates, both required:**
1. **Static** — project builds, tests pass, no type errors, no blocking lint failures
2. **Behavioral** — app runs in a real environment, user interactions produce the expected outcomes per AC

Both must pass before a checkpoint closes. Failing either triggers a hard stop.

**Gate:** Triggered automatically at every checkpoint boundary during `/cv.build`. Can also be run manually against any checkpoint.

---

## Invocation

```
/cv.validate FEAT-###/MB-## --checkpoint N    ← triggered by cv.build at checkpoint boundary
/cv.validate FEAT-###/MB-##                   ← validate all checkpoints for a sub-feature
```

---

## Step 1 — Load Validation Context

Read the following — do not load anything else:

1. `constitution.md` — project type, tech stack, build and run commands
2. `MB-##/ac.md` — Acceptance Criteria for this sub-feature
3. `MB-##/tasks.md` — the `verify:` field from each task in this checkpoint
4. Validation Agent brief from CLI: app endpoint (web) or emulator connection (mobile), test results, build output

**Do not load** the build conversation, spec, or any prior validation sessions. Start clean.

---

## Step 2 — Detect Project Type

Read `constitution.md` tech stack. Map to validation tooling:

| Project type | Build command | Run command | Agent tooling |
|---|---|---|---|
| Web (React, Next.js, Vue, Svelte, etc.) | `npm run build` | `npm run dev` / `npm start` | Browser automation (Playwright / browser tools) |
| React Native — Expo | `npx expo export` | `npx expo start` | iOS Simulator or Android Emulator |
| React Native — bare | platform build | `npx react-native run-ios` / `run-android` | iOS Simulator or Android Emulator |
| Flutter | `flutter build` | `flutter run` | iOS Simulator or Android Emulator |
| Node API (no UI) | `npm run build` | `npm start` | HTTP verification + browser if web UI present |

If the project type is not in this list, state it explicitly and halt:
> "Project type `[type]` is not yet supported by the Validation Agent. Add it to `constitution.md` with explicit build and run commands, or run validation manually."

---

## Step 3 — Phase 1: Static Verification

The CLI runs these before the Validation Agent is invoked. The agent receives the results:

1. **Build** — project compiles without errors
2. **Test suite** — all tests pass
3. **Type check** — no type errors (if applicable to the stack)
4. **Lint** — no blocking lint failures (warnings are noted but do not block)

If any static check fails, issue a hard stop immediately — do not proceed to behavioral verification:

```xml
<stop_signal>
  <gate>validate-static</gate>
  <checkpoint>N</checkpoint>
  <failure>CVVAL-BUILD-001</failure>
  <reason>[Build error / test failure / type error — exact output from CLI]</reason>
  <action>Route to /cv.debug. Fix the failure and re-run /cv.validate.</action>
</stop_signal>
```

---

## Step 4 — Phase 2: Behavioral Verification

Open the app at the provided endpoint (web) or connect to the emulator (mobile). Work through each AC criterion for this checkpoint.

**For each criterion:**

1. Navigate to the relevant screen or state
2. Perform the interaction described in the AC (`When:` field)
3. Observe the actual outcome
4. Compare to the expected outcome (`Then:` field)
5. Capture a screenshot: **before interaction**, **after interaction**, and the **success or error state**
6. Record pass or fail with specific evidence — not "it looked right" but exactly what was observed

**Interaction rules:**
- Interact as a real user would — tap, type, scroll, wait for loading states
- Do not inspect source code or network calls to infer behavior — observe the UI
- If a loading state never resolves, that is a failure
- If an error state appears that is not in the AC, flag it as an advisory (does not block unless it prevents the criterion from being verified)
- Test the happy path first, then any failure paths listed in the AC

---

## Step 5 — Issue Verdict

### PASS

All static checks passed. All AC criteria for this checkpoint observed and confirmed.

```
VALIDATION PASS — FEAT-###/MB-## Checkpoint N
Agent: cv.validate
Verified: YYYY-MM-DD HH:MM
Project type: [web | react-native | flutter]

Static
  Build:      PASS
  Tests:      N passed, 0 failed
  Type check: PASS
  Lint:       PASS (N warnings, non-blocking)

Behavioral
  AC-001 — [Title]: PASS
    Observed: [exactly what happened when the AC interaction was performed]
    Evidence: validation/checkpoint-N/screenshots/ac-001-after.png

  AC-002 — [Title]: PASS
    Observed: [exactly what happened]
    Evidence: validation/checkpoint-N/screenshots/ac-002-after.png

Verdict: PASS — checkpoint N closes.
```

Write verdict to `MB-##/validation/checkpoint-N/verdict.md`. Notify CLI to advance checkpoint and update `status.json`.

### FAIL — Triage Brief

One or more checks failed. Output a triage brief for `/cv.debug`.

```
VALIDATION FAIL — FEAT-###/MB-## Checkpoint N
Agent: cv.validate
Blocked: YYYY-MM-DD HH:MM
Project type: [web | react-native | flutter]

Failure summary
  Failure type: build-failure | test-failure | type-error | behavioral-failure
  CVVAL code:   [see below]
  Blocking:     YES — no further work on this feature until resolved

Passing checks
  AC-001: PASS (verified)
  Build:  PASS
  Tests:  PASS

Failing checks
  AC-002 — [Title]: FAIL
    CVVAL: CVVAL-BEHAV-001
    Expected: [AC Then: field]
    Observed: [what actually happened in the running app]
    Evidence: validation/checkpoint-N/screenshots/ac-002-fail.png
    Likely location: [specific component, screen, or function based on observed behavior]

  AC-003 — [Title]: FAIL
    CVVAL: CVVAL-BEHAV-002
    Expected: [AC Then: field]
    Observed: [what actually happened]
    Evidence: validation/checkpoint-N/screenshots/ac-003-fail.png
    Likely location: [specific file or component]

Triage entry point
  Start with: [the most specific failure — component, function, or data flow that explains the observed behavior]
  Then check: [second most likely cause]

Status update: feature is now validation-blocked at checkpoint N.
```

Write verdict to `MB-##/validation/checkpoint-N/verdict.md`. CLI updates `status.json` to `validation-blocked`.

---

## CVVAL Codes

### Build and runtime failures
| Code | Meaning |
|------|---------|
| `CVVAL-BUILD-001` | Project failed to compile or build |
| `CVVAL-BUILD-002` | App failed to start or reach a ready state |
| `CVVAL-BUILD-003` | Emulator or simulator failed to launch |

### Static failures
| Code | Meaning |
|------|---------|
| `CVVAL-STATIC-001` | Test suite has failing tests |
| `CVVAL-STATIC-002` | Type errors present |
| `CVVAL-STATIC-003` | Blocking lint errors |

### Behavioral failures
| Code | Meaning |
|------|---------|
| `CVVAL-BEHAV-001` | AC criterion: interaction produced wrong outcome |
| `CVVAL-BEHAV-002` | AC criterion: expected UI element not found |
| `CVVAL-BEHAV-003` | AC criterion: loading state did not resolve |
| `CVVAL-BEHAV-004` | AC criterion: error state shown when success expected |
| `CVVAL-BEHAV-005` | AC criterion: navigation or routing failure |

---

## Step 6 — Hard Stop Enforcement

On any failure, output:

```xml
<stop_signal>
  <gate>validate-checkpoint</gate>
  <feature>FEAT-###/MB-##</feature>
  <checkpoint>N</checkpoint>
  <reason>[Summary of what failed]</reason>
  <action>Run /cv.debug with the triage brief above. Re-run /cv.validate after the fix.</action>
</stop_signal>
```

The CLI sets `status.json` to `validation-blocked`. No `/cv.build` task group can advance. No new tasks on this feature can begin. `/cv.debug` is the only command available for this feature until the block clears.

---

## Step 7 — Re-validation After Debug

When `/cv.debug` completes a fix, `/cv.validate` runs again for the same checkpoint. The agent loads fresh — it does not remember the previous failure or the fix. It re-runs both phases from the start.

If the fix introduced a regression in a previously passing criterion, that is a new failure. The triage brief is updated accordingly.

The block clears only when the full verdict is PASS for all criteria in the checkpoint.

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include:

```
<!-- Running in standalone mode. Hard stop enforcement requires CLI integration. -->
```

And include inline:
- Gate: project type must be identifiable from constitution.md
- Static verification must run before behavioral verification
- Verdict must be written to validation/checkpoint-N/verdict.md
- Any failure produces a hard stop and triage brief
