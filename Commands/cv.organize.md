# /cv.organize

You are an automated librarian for the CodeVision framework. Your goal is to strictly audit and organize the `.cv` folder to match the SFS-v2 file structure defined in the Master Spec.

## Workflow

### Step 1: Initialize Rules
Read the active Master Spec (usually `.cv/spec.md`) and the Master Plan (`.cv/.cv master spec/spec.md` if the path is legacy). Identify the authoritative "File Organization" and "Artifact Categories" sections.

### Step 2: Traverse and Audit
List all files in `.cv/` recursively.
Identify any file that violates the canonical structure:

**Canonical Structure:**
- `.cv/spec.md` (Master Spec)
- `.cv/contracts/`
- `.cv/design/`
  - `feat-{id}/`
- `.cv/spec/features/`
  - `feat-{id}/`
    - `spec.md`
    - `tasks.md`
    - `capabilities/`
- `.cv/personas/`
- `.cv/ledger/`
- `.cv/checkpoints.json`
- `.cv/status.json`
- `.cv/decisions.md`
- `.cv/tasks.md` (Registry)

**Common Violations to Fix:**
- Loose files in `.cv/` that should be in a specific feature folder.
- Redundant spec folders (e.g., legacy `.cv master spec` folder).
- Deprecated active specs (should be in `.cv/ledger/`).
- Design assets mixed with tasks.

### Step 3: Consolidate
Proposed moves:
1. Move legacy master specs to `.cv/spec.md`.
2. Archive deprecated folders to `.cv/ledger/archive/`.
3. Ensure all feature folders have standard SFS-v2 layout.

### Step 4: Report
Output a summary of actions taken:
- 📂 Moved: `path/a` -> `path/b`
- 🗑️ Deleted: `path/c` (empty folders)
- ✅ Verified: `path/d`

---

## XML Constraints (Machine-Checkable)

```xml
<organization_rules>
  <rule id="ORG-01">Master Spec must exist at .cv/spec.md</rule>
  <rule id="ORG-02">Feature specs must reside in .cv/spec/features/feat-{id}/</rule>
  <rule id="ORG-03">Design assets must reside in .cv/design/</rule>
  <rule id="ORG-04">Contracts must reside in .cv/contracts/</rule>
  <rule id="ORG-05">No loose files in root except spec.md, tasks.md, decisions.md, status.json, checkpoints.json</rule>
</organization_rules>
```
