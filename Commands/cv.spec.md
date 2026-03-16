# /cv.spec

Goal: Generate a fully verified Technical Specification combining an approved PRD and an approved ERD.

## Preconditions
- `prd.md` MUST be approved.
- `erd.md` MUST be approved.

## Workflow
1. Read both documents from `features/<feat>/`.
2. Break the implementation down into required endpoints, component trees, state mutations, and external integrations.
3. Validate this technical approach against the rules in `contracts/`.
4. Output the first draft of the `spec.md` with explicit mapping to PRD acceptance criteria.
5. Once reviewed and accepted by the user, write the complete Technical Specification to `features/<feat>/spec.md` and mark it approved in `approvals.toon`.

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
