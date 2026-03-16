# /cv.review

Goal: Verify implementation against the spec's acceptance criteria and produce evidence for checkpoint closure (Spec §8/§10).

## Workflow
1. Read the current checkpoint from `checkpoints.toon` and the corresponding sections in `spec.md`.
2. Evaluate: Does the code match the acceptance criteria? Are edge cases handled?
3. Define the required evidence for the checkpoint.

## Outcomes
- **Accept**: If verification passes, append evidence (Test logs, screenshots) to `checkpoints.toon` under the current checkpoint. Mark it closed. Write an entry to `ledger/decisions.md`.
- **Reject**: If there's a violation or unmet criteria, issue a `<stop_signal>`. Recommend `/cv.bug` (if it's a small implementation error) or `/cv.change` (if the spec was poorly defined).

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
