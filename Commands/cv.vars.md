# /cv.vars

Goal: Manage shared tokens, naming rules, and design variables to maintain architectural and UI consistency.

## Rules
- Avoid ad-hoc naming.
- Prefer adding a token over sprinkling magic/hardcoded values in implementation.
- You are not just writing code; you are maintaining a design language.

## Workflow
- Verify `variables/tokens.md` and/or `variables/naming.md` (or similar) exist.
- Update the variables files with the new token or convention.
- If a change affects existing code or specifications, issue a `<stop_signal>` and note the follow-ups required.

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
