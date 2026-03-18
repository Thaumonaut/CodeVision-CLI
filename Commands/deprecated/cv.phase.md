# /cv.phase

Goal: Safely transition the project between distinct workflow phases (e.g. Discovery -> Engineering Design -> Implementation) (Spec §7).

## Rules
- Only transition when the required artifacts for the target phase are available and approved.
- Example: Transitioning to `ENG_DESIGN` requires an approved `prd.md`.
- Example: Transitioning to `IMPLEMENTATION` requires an approved `spec.md` and `checkpoints.toon`.
- If preconditions are missed, issue a `<stop_signal>` and list missing requirements.

## Workflow
1. Check preconditions for the requested phase.
2. If validated, update `status.toon` `phase` to the new phase.
3. Log the phase transition in `ledger/decisions.md`.
4. Run or propose the first canonical command for the new phase (e.g. `/cv.erd` for `ENG_DESIGN`, `/cv.tasks` for `IMPLEMENTATION`).

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
