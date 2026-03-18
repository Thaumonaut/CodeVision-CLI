# /cv.contract

Goal: Propose a change to an immutable project contract (Spec §6).

## Rules
- Contracts (in `contracts/`) define constraints that must never change silently.
- Any change requires explicit user approval.
- You must perform an **Impact Analysis**: list which specs, ERDs, or tasks are affected by this change before applying it.
- **Output**: Output proposed edits. If approved, append a decision entry of type `change` to `ledger/decisions.md` including the rationale, and issue a `<stop_signal>` if downstream artifacts now require re-approval.

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
