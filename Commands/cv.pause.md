# /cv.pause

Goal: Safely pause work by recording current state and context (Spec §7.2).

## Workflow
1. Analyze unsaved work, the current task in progress, and any open blockers or unresolved bugs.
2. Read the current status from `status.toon`.
3. Update `status.toon` with:
   - `last_action`: what was just completed.
   - `next_action`: what needs to happen immediately upon resumption.
   - `blockers`: any open issues preventing progress.
4. Output a summary confirming the pause and issue a `<stop_signal>`.

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
