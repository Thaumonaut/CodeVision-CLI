# /cv.change

Goal: Classify and safely route a scope or requirements change request (Spec §11).

## Rules
- **Do not implement the change directly.** Evaluate first.
- Clarify what is changing and why.
- Identify the class of change and route accordingly:
  - **Clarification** (no behavioral change): Update wording. No re-approval needed.
  - **Spec Change** (alters behavior/scope): Issue a `<stop_signal>` and tell the user to run `/cv.replan`.
  - **Contract Change** (alters immutable rule): Issue a `<stop_signal>` and tell the user to run `/cv.respec`.

## Impact Analysis
If the change affects contracts, specs, or tasks, you must list the affected downstream artifacts before proceeding.

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
