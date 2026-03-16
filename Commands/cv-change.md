# /cv.change

Goal: handle scope/requirements changes safely.

Rules:
- Do not implement the change directly.
- First: clarify what’s changing and why.
- Second: identify which contracts/spec sections/tasks are affected.
- Third: propose updated wording for the spec.

Outputs:
- Update `.cv/spec.md` and add a decision entry in `.cv/ledger/decisions.md`.
- If tasks exist, propose updates to `.cv/tasks.md`.

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
