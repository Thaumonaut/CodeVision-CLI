# /cv.define
<!-- cv.define.md | Depth-first sub-feature exploration. Fills ledger entries until ≥ 80% clarity. -->
<!-- Run after /cv.discover identifies sub-features. Gates /cv.write. -->

---

## What This Command Does

`/cv.define` goes deep on a single sub-feature (MB-##). Starting from whatever ledger entries already exist, it asks targeted questions about missing slots — one at a time — until the clarity threshold is reached. Every answer becomes a ledger entry. No documents are written here; the ledger is the artifact.

**Use it when:**
- A sub-feature on the Feature Map is at 60–79% clarity (needs detail)
- You are about to run `/cv.write` and want to ensure no blocking gaps remain
- A new open question has been added to the ledger and must be resolved

**Gate:** Requires a Feature Map (`map.md`) with the target sub-feature listed. Run `/cv.discover` first.

**Output:** Ledger entries tagged for all four Define document slots. Clarity score ≥ 80%. No unresolved blocking questions.

---

## Invocation

```
/cv.define FEAT-###/MB-##           ← define a specific sub-feature
/cv.define FEAT-###/MB-## --resume  ← resume a previous session (pre-populates from ledger)
```

---

## Step 1 — Load Existing Context

Read in this order:
1. `FEAT-###/map.md` — sub-feature description, known clarity score, known dependencies
2. `FEAT-###/ledger.md` — all existing entries tagged for this MB-##
3. `chronicles/CHR-###.md` — the Chronicle this feature derives from (for persona and journey context)
4. `personas/PERS-###.md` Signal Block — for persona consistency checks

Build a slot coverage map from the ledger. For each required slot, mark it as:
- **Covered** — at least one `decided` or `compiled` entry with this tag exists
- **Assumed** — an entry exists with `status: assumed` — needs confirmation
- **Open** — an entry exists with `status: open` — blocking if tagged `:signal:`
- **Empty** — no entries for this slot

---

## Step 2 — Calculate Opening Clarity Score

Clarity is a hybrid score (0–100):

**Floor: slot coverage** — % of required Signal Block slots that are Covered or Assumed:
```
Required slots:
  PRD:  goal, scope, out-of-scope, success-metric, persona-ref, chronicle-ref    (6)
  UIRD: screens, states, key-flows, component-manifest                            (4)
  ERD:  entities, relations, migration-impact                                     (3)
  AC:   minimum 3 criteria defined                                                (3)
  Total required: 16 slots
```

**Ceiling adjustment:** AI judgment on answer quality — a slot marked Covered with a vague single-word answer counts less than a well-reasoned entry. Reduce the floor score by up to 15 points for low-quality coverage.

State the score explicitly:
> "MB-## is currently at **[N]% clarity**. [N] slots are covered, [N] are assumed, [N] are empty. I need to resolve [N] blocking questions and fill [N] empty required slots before `/cv.write` can run."

---

## Step 3 — Question Loop

Work through missing and assumed slots in priority order:

**Priority 1 — Blocking open questions** (status: open, tagged `:signal:`)
**Priority 2 — Empty required Signal Block slots** (nothing in the ledger)
**Priority 3 — Assumed entries** (need confirmation before compiling)
**Priority 4 — Advisory open questions** (non-blocking, improve quality)

For each question:

1. **Ask one question at a time.** Never present a list of questions.
2. **Provide 3–4 options** with inline reasoning, plus `→ Custom — I'll describe it`:

```
**Question [N] — [slot name]** (blocking / advisory)

[Context: why this matters for the PRD/UIRD/ERD]

→ [Option A] — [one-sentence reason this is a valid choice]
→ [Option B] — [one-sentence reason this is a valid choice]
→ [Option C] — [one-sentence reason this is a valid choice]
→ Custom — I'll describe it

Progress: [N]% clarity · [N] blocking questions remaining
```

3. **After each answer:** deposit a ledger entry, update the slot coverage map, recalculate clarity score.
4. **Surface cross-document implications as they arise:**
   > "That answer affects the ERD too — if [decision], then the data model needs [implication]. Should I note that as an ERD entry?"

5. **Flag assumptions:** if the user skips or gives a vague answer, deposit it as `status: assumed` and note the risk:
   > "I'll mark that as assumed for now. Risk: if [X] turns out to be wrong, the [PRD/UIRD/ERD] may need revision."

---

## Step 4 — Clarity Threshold Check

After each answer, check whether the threshold is reached:

**Threshold: ≥ 80% clarity AND zero unresolved blocking questions**

If threshold is reached:
> "MB-## has reached **[N]% clarity**. All blocking questions are resolved. The ledger is ready for `/cv.write`."

If threshold is not yet reached after all Priority 1–2 questions:
> "MB-## is at **[N]% clarity** — [N] points short of the threshold. The remaining gaps are: [list]. Want to fill them now, or defer and mark them as assumed?"

If the user chooses to defer:
- Deposit each deferred item as `status: deferred`
- Recalculate — deferred items count as 50% of their slot value toward the score
- If threshold is still not reached, state clearly: "The sub-feature cannot be compiled at this clarity level. `/cv.write` will be blocked."

---

## Step 5 — Dependency Check

Before closing the session, surface any dependencies uncovered during the Q&A:

> "Based on what we defined, MB-## depends on:
> - [MB-## — specific thing it needs from that sub-feature]
>
> And these sub-features cannot start until MB-## is defined:
> - [MB-## — what it needs from this one]
>
> Does this match your understanding? Should I update the Feature Map dependencies?"

If dependencies have changed, output an updated dependency block for `map.md`.

---

## Step 6 — Handoff

> "Definition session complete for FEAT-###/MB-##.
>
> **Clarity:** [N]%
> **Slots covered:** [N]/16 required
> **Blocking questions:** 0 remaining
> **Assumed entries:** [N] — confirm before locking
>
> Next steps:
> - `/cv.write FEAT-###/MB-##` — compile PRD, UIRD, ERD, and AC from these ledger entries
> - `/cv.define FEAT-###/MB-##` — continue if any slots are still below threshold
> - `/cv.define FEAT-###/MB-##` — run on the next sub-feature in the dependency order"

Output all ledger entries from this session:

```
LEDGER ENTRIES — append to features/FEAT-###/ledger.md

[PE-###] <decision or answer>
  date:   YYYY-MM-DD
  source: define
  actor:  <config.json → author>
  status: decided | assumed | deferred
  tags:   [PRD:signal:goal, ...]
  note:   <optional context or risk>
```

---

## Slot → Tag Reference

Use this to tag every ledger entry correctly:

```
PRD:signal:goal              → what this feature enables for the user
PRD:signal:scope             → in-scope items
PRD:signal:out-of-scope      → excluded items with reasons
PRD:signal:success-metric    → measurable signal of success
PRD:signal:persona-ref       → which persona this serves
PRD:signal:chronicle-ref     → which Chronicle step this maps to
PRD:signal:constraints       → hard constraints (tech, legal, resource)
PRD:full:problem-statement   → narrative problem context
PRD:full:scenarios           → user scenarios beyond the chronicle
PRD:full:assumptions         → what we're treating as true without validation

UIRD:signal:screens          → named screens or surfaces
UIRD:signal:states           → UI states (idle, loading, empty, error, success, offline)
UIRD:signal:key-flows        → named user flows
UIRD:signal:component-manifest → reuse vs new components
UIRD:full:flows              → step-by-step flow detail
UIRD:full:interactions       → hover, tap, animation, transitions
UIRD:full:accessibility      → a11y requirements

ERD:signal:entities          → entity names with key attribute summary
ERD:signal:relations         → relationships between entities
ERD:signal:migration-impact  → additive | modifying | destructive
ERD:signal:constraints       → data validation rules
ERD:full:lifecycle           → create/update/delete behavior
ERD:full:integration-points  → external systems or APIs

AC:criterion                 → a single Given/When/Then acceptance criterion
```

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include:

```
<!-- Running in standalone mode. Gate enforcement requires _core.md. -->
```

And include inline:
- Gate: requires map.md with the target sub-feature listed
- Clarity threshold: ≥ 80% AND zero unresolved blocking questions
- One question at a time — never present a list
- Every answer must produce a ledger entry before the next question
- Deferred items count as 50% of slot value toward clarity score
