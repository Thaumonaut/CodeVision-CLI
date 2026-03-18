# /cv.spec
<!-- cv.spec.md | Generate technical spec from approved Define documents. -->
<!-- Loads .brief as primary context. Generates Human Summary first, then capability blocks. -->
<!-- Gates /cv.tasks. -->

---

## What This Command Does

`/cv.spec` generates the technical specification for a sub-feature from its four approved Define documents. It does not invent requirements — it translates approved decisions into an implementable, structured spec. The spec is the contract between the Define phase and the Build phase.

The spec opens with a Human Summary: a PM-readable plain-language description written by the AI and confirmed by the user before any technical content is generated. This ensures the spec reflects the right intent before encoding it into capability blocks.

**The AI does not author the spec. It compiles it.** Every capability in the spec must trace back to an AC criterion, a Chronicle step, and an approved document.

**Gate:** All four Define documents (PRD, UIRD, ERD, AC) must be approved for this sub-feature.

---

## Invocation

```
/cv.spec FEAT-###/MB-##    ← generate spec for a sub-feature
```

---

## Step 1 — Gate Check

Check `approvals.json`:

```json
{
  "prd":  { "status": "approved" },
  "uird": { "status": "approved" },
  "erd":  { "status": "approved" },
  "ac":   { "status": "approved" }
}
```

If any document is not approved:
```xml
<stop_signal>
  <gate>spec</gate>
  <reason>[document] for FEAT-###/MB-## is not approved. All four Define documents must be approved before spec generation.</reason>
  <action>Run /cv.approve FEAT-###/MB-## to complete the approval process.</action>
</stop_signal>
```

---

## Step 2 — Load Context

Load in this order:
1. `MB-##/.brief` — Signal Blocks from all four approved documents (primary context)
2. `MB-##/ac.md` — full Acceptance Criteria (required — spec references AC IDs directly)
3. `chronicles/CHR-###.md` Signal Block — for Chronicle step references
4. `personas/PERS-###.md` Signal Block — for persona consistency checks
5. `constitution.md` — tech stack, design system, architecture non-negotiables

Load full documents only if the Signal Block content is insufficient to write a specific capability. State the fetch explicitly if needed:
> "I need the full UIRD flows section to specify the authentication capability — fetching it now."

---

## Step 3 — Generate Human Summary

Before any technical content, write a Human Summary — a plain-language description a PM can read in 30 seconds:

> "Here's the Human Summary for FEAT-###/MB-##. This goes at the top of the spec so any stakeholder can understand what is being built without reading the technical details.
>
> ---
> **[Feature Title]**
>
> [3–5 sentences. What this feature does for the user. What problem it solves. What the user can do after it ships that they couldn't do before. No technical terms unless unavoidable. Reference the persona and Chronicle trigger if helpful.]
>
> **Persona:** [PERS-### name/archetype]
> **Chronicle:** CHR-### — [trigger summary]
> **Scope:** [2–3 bullet points: what is in scope, what is explicitly not]
>
> ---
>
> Does this accurately represent what we're building? Confirm before I generate the technical capabilities."

Wait for confirmation. If the user requests changes, revise and re-present. Do not generate capability blocks until the Human Summary is confirmed.

---

## Step 4 — Build Capability Map

From the AC document and UIRD/ERD Signal Blocks, identify the capabilities this spec must define:

- Each AC criterion maps to at least one capability
- Each UIRD screen maps to at least one capability
- Each ERD entity interaction maps to at least one capability

Group related AC criteria under a single capability where they share the same implementation surface. Present the capability list for confirmation:

> "I see [N] capabilities in the approved documents:
>
> - **CAP-01** — [name]: covers AC-001, AC-002 — [one sentence: what it does]
> - **CAP-02** — [name]: covers AC-003 — [one sentence: what it does]
>
> Does this grouping look right before I write the full spec?"

Adjust based on feedback.

---

## Step 5 — Generate Capability Blocks

For each capability, generate a block using the SFS-v2 format. Generate one capability at a time and wait for confirmation before the next if the user requests review — otherwise generate all and present at the end.

### SFS-v2 Capability Block Format

```markdown
## CAP-## — <Capability Title>

**Chronicle ref:** CHR-### Step [#] — <step description>
**Persona ref:** PERS-### — <name> — <one-line behavioral note relevant to this capability>

### What It Does
<2–4 sentences. What this capability does, from the user's perspective. No implementation detail.>

### Acceptance Criteria
<!-- These are the exact criteria the Validation Agent will verify in the running app -->
- **AC-###** — <Given / When / Then summary> — verify: [automated | behavioral | both]
- **AC-###** — <Given / When / Then summary> — verify: [automated | behavioral | both]

### Screens and Components
<!-- From UIRD Signal Block -->
**Screens:** [ScreenName, ScreenName]
**Reuse:** [ComponentName@version — how it's used here]
**New:** [ComponentName — what it does, key props/behavior]

### Data
<!-- From ERD Signal Block -->
**Entities:** [EntityName — what operations this capability performs on it]
**Mutations:** [create | read | update | delete — which and under what conditions]
**Constraints:** [any ERD constraints this capability must respect]
**Migration impact:** additive | modifying | destructive

### States
<!-- From UIRD Signal Block — all states this capability must handle -->
| State | Trigger | UI behavior |
|-------|---------|-------------|
| idle | default | <what the user sees> |
| loading | [action] | <what the user sees> |
| empty | no data | <what the user sees> |
| error | [failure condition] | <what the user sees> |
| success | [completion] | <what the user sees> |

### Key Flows
<!-- From UIRD Signal Block -->
**[FlowName]:** [step-by-step description of the primary path through this capability]

### Persona Consistency Note
<!-- Behaviors this capability must respect from the persona profile -->
<One sentence: what the persona would and would not do in this capability, grounded in the Voice & Behaviour Profile. E.g. "Cami will not read a wall of text — error messages must be one line, actionable.">

### Implementation Notes
<!-- Constraints and non-negotiables for the engineer — not suggestions -->
- [Constraint from constitution.md tech stack or design system]
- [Architectural rule that applies here]
- [Edge case that must be handled — derived from AC failure path or ERD constraint]
```

---

## Step 6 — Persona Consistency Pass

After all capabilities are drafted, run a consistency check across the full spec:

> "Persona consistency check against PERS-### ([name]):
>
> - [CAP-##]: [specific behavior that aligns with or risks violating the persona profile]
> - [CAP-##]: [specific behavior that aligns or risks]
>
> One potential issue: [CAP-##] assumes [behavior] — but the persona profile says [they would never do X | they respond to Y with Z]. Recommend: [specific adjustment]."

Surface issues for confirmation. Do not silently change spec content — flag and ask.

---

## Step 7 — Generate spec.md

Output the complete `spec.md` as a code block:

~~~markdown
# Spec — FEAT-###/MB-##: <Feature Title>
<!-- cv-artifact: spec -->
<!-- cv-compiled-from: prd.md + uird.md + erd.md + ac.md -->

**Status:** draft
**Chronicle ref:** CHR-### — <title>
**Persona ref:** PERS-### — <name/archetype>
**Generated:** YYYY-MM-DD

---

## Signal Block
<!-- cv-section: signal -->

```
feature:       FEAT-###/MB-## — <title>
capabilities:  <count>
ac-covered:    <count> of <total> AC criteria
persona-ref:   PERS-###
chronicle-ref: CHR-###
status:        draft
```

---

## Human Summary
<!-- cv-section: summary -->

[Confirmed Human Summary text]

---

## Capabilities
<!-- cv-section: capabilities -->

[All CAP-## blocks]

---

## Open Implementation Questions
<!-- cv-section: open-questions -->
<!-- Questions the spec could not answer — must resolve before /cv.tasks -->
- [ ] <question> — affects CAP-##
~~~

Instruct the user:
> "Save this to `MB-##/spec.md`. Review and approve it to unblock `/cv.tasks`."

---

## Step 8 — Handoff

> "Spec ready for FEAT-###/MB-##. [N] capabilities covering [N] AC criteria.
>
> Next steps:
> - Review and approve the spec (run `/cv.approve FEAT-###/MB-## spec`)
> - `/cv.tasks FEAT-###/MB-##` — generate the ordered task list once approved
> - `/cv.rewind` — if reviewing the spec reveals a Define document needs revision"

Output ledger entry:

```
LEDGER ENTRIES — append to features/FEAT-###/ledger.md

[PE-###] Spec generated: FEAT-###/MB-##
  date:   YYYY-MM-DD
  source: define
  actor:  ai
  status: compiled
  tags:   [AC:criterion]
  note:   [N] capabilities. Human Summary confirmed. [N] open implementation questions.
```

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include:

```
<!-- Running in standalone mode. Gate enforcement requires _core.md. -->
```

And include inline:
- Gate: all four Define documents must be approved in approvals.json
- Human Summary must be confirmed before capability blocks are generated
- Every capability must reference at least one AC criterion, one Chronicle step, and one UIRD screen
- Persona consistency pass required after all capabilities are drafted
