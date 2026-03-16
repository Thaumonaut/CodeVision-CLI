# /cv.erd

Goal: Draft an Entity-Relationship Diagram (ERD) from an approved Product Requirement Document (PRD).

## Preconditions
- The PRD document MUST exist and have an 'approved' status in `approvals.toon`.
- The current phase MUST be Engineering Design (`ENG_DESIGN`).

## Workflow
1. Read the approved PRD for the current feature (`features/<feat>/prd.md`).
2. Identify all required data entities, types, and persistence boundaries required by the functional requirements.
3. Check `contracts/architecture.contract.md` (or equivalent) for database rules.
4. Output the proposed schema design. Include an ERD in Mermaid syntax (`mermaid erDiagram`).
5. Wait for user review. Once approved, write the schema out to `features/<feat>/erd.md`. Update `approvals.toon`.

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
