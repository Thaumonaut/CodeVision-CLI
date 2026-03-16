# /cv.bug

Goal: Fix a bug strictly without redesigning or expanding scope.

## Rules
- **Preconditions**: An approved `spec.md` and `tasks.md` must exist.
- **Scope Limit**: Fixes must not exceed 50 changed lines across all files. If the fix requires more, or if it changes public interfaces, schemas, or acceptance criteria, issue a `<stop_signal>` and recommend `/cv.change` (Spec §10.7).
- **Execution**: Provide patch-style edits (file path + diff-like blocks) or FILE blocks. Do not rewrite entire files unless the file is tiny.
- **Output**: After the fix is applied, run or propose automated verification. Log the fix to `ledger/decisions.md`.

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
