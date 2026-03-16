# /cv.tasks

Goal: Break an approved spec into ordered, verifiable tasks and checkpoints (Spec §8).

## Preconditions
- The feature's `spec` status in `approvals.toon` MUST be `approved`. If it is not, issue a `<stop_signal>`.

## Workflow
1. Read the approved spec document.
2. Group the required work into Checkpoints. A Checkpoint (e.g., CP-01) is a verifiable unit of trust (Spec §8.1).
3. Under each checkpoint, define small, testable Tasks (e.g., T-001).
4. Specify what Evidence is required to close each checklist (e.g., 3 unit tests passing, UI screenshot).

## Output
- Output the Checkpoints and Tasks as a list in Markdown. 
- Write `.cv/checkpoints.toon` to establish the ledger of open work.
- Output a markdown task list `tasks.md` with empty checkboxes.

Never start implementing code directly from this command. Implementation belongs strictly to `/cv.implement`.

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
