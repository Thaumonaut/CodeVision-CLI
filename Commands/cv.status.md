# /cv.status

Goal: Rehydrate context from the artifact store and summarize current state (Spec §5.10).

## Workflow (Recovery Protocol)
When asked for status or recovering from interruption:
1. Load `ledger/decisions.md`, `approvals.toon` (if inside a feature), `status.toon`, and `checkpoints.toon`.
2. Do not trust your chat history memory. Rehydrate solely from files.
3. Emit a recovery summary outlining:
   - What phase we are in
   - Who is the active lead
   - Active feature / checkpoint progressing
   - Any open blockers or blocking assumptions

**Output:** A short plain-text summary and a proposal for the next action. Do NOT force a transition. Wait for user direction.

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
