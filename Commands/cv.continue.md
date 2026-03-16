# /cv.continue

Goal: Deterministically resume work from the last saved state (Spec §7.2).

## Workflow
1. Read `status.toon` ignoring any active chat buffer.
2. Summarize the `last_action` and active `blockers` to orient the user.
3. Automatically execute or propose the `next_action` listed in the status file.
4. If no clear next action exists, fall back to the recovery protocol by acting as `/cv.status`.

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
