# /cv.implement

Goal: Output code to implement the next task(s) strictly within scope (Spec §10).

## Preconditions
Before this command runs, the following MUST be true:
- An approved `spec.md` (or `features/<feat>/spec.md`) exists.
- Checkpoints must be defined in `checkpoints.toon`.
- Open blocking assumptions must be resolved or waived.
> If any precondition is unmet, issue a `<stop_signal>` and halt.

## Rules
- Read `spec.md`, `tasks.md`, and relevant `contracts/` before changing code.
- No scope creep or silent "optimizations" (Spec §10.2). No "while I'm here" refactoring.
- Work task by task.

## Output
- Output implementation steps as clean patch instructions or FILE blocks.
- Update `checkpoints.toon` to mark task completion (if user agrees).
- Propose the automated verification or `/cv.review` step.

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
