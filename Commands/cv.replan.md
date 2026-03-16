# /cv.replan

Goal: Make a non-breaking, light adjustment to `spec.md` or `tasks.md` discovered during implementation (Spec §11.4).

## Rules
- Used when developer discovers a minor gap or optimization in the spec that does NOT change behavior, scope, or contracts.
- **Workflow**: 
  1. Identify the specific spec section to revise.
  2. Inform the user of the minor change. No formal re-approval required for `replan`.
  3. Update `spec.md` and/or `tasks.md` directly.
  4. Optionally log this small change in `ledger/decisions.md`.

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
