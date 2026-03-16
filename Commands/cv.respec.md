# /cv.respec

Goal: Handle a major revision that alters scope, breaks a contract, or significantly changes behavior (Spec §11.4).

## Rules
- When a change is classified as a "respec", the existing approved `spec.md` is invalidated.
- **Workflow**:
  1. Draft the required changes to `prd.md` or `spec.md`.
  2. You MUST update `approvals.toon` changing the feature status from `approved` back to `draft`.
  3. Issue a `<stop_signal>` indicating that work is halted until the new spec goes through the `/cv.review` and approval cycle again.
  4. Write the rationale for the respec into `ledger/decisions.md`.

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
