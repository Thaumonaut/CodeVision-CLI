# /cv.tasks

Goal: turn approved plan/spec into an ordered task list.

Rules:
- Tasks must be small and testable.
- Each task should cite what spec requirement it satisfies.
- Include at least 1 verification step per task (manual or automated).

Outputs:
- Update `.cv/tasks.md` (or `.cv/tasks/<feature>.tasks.md` if preferred).
- If you need new acceptance details, stop and ask.

Never:
- start implementing; that’s /cv.implement

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
