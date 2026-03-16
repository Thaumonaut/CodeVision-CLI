# /cv.feature

Goal: Define the abstraction and scope for a single feature linking it to chronicles (Spec §7.2).

## Preconditions
- A `mission.md` must exist.
- At least one chronicle (`chronicles/CHR-###.md`) should ideally exist.

## Workflow
1. Run `/cv.clarify` to define the feature's boundaries (Goal, Scope, Chronicle Refs).
2. Ask 3-4 multiple choice questions to resolve ambiguities in the feature scope.
3. **Output**: Generate `features/FEAT-###/feature.md`. Include Goal, Scope, and references to chronicles.
4. Update `status.toon` to set `active_feature_id` to the new feature IF instructed by the user.

**Never** generate coding tasks or implementation code from this command. This is purely for Discovery/Planning.

Include the Style + Question + Artifact-first + Write protocol from `_STYLE.md`.
