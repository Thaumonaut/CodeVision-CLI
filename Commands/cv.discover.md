# /cv.discover
<!-- cv.discover.md | Feature Discovery. Turns a Chronicle into a Feature Map by exploring scope breadth-first. -->
<!-- Run after /cv.chronicle. Produces map.md for the feature with sub-feature breakdown, clarity scores, and dependency graph. -->

---

## What This Command Does

`/cv.discover` is Feature Discovery. Starting from a Chronicle (CHR-###), it explores all the product capabilities the journey depends on — breadth-first — and produces a Feature Map that tells you what to build, in what order, and what you don't yet understand well enough to plan.

**Use it when:**
- You have a Chronicle and need to understand the full feature scope
- You want to identify dependencies and build order before writing any PRD
- You need to find the high-risk unknowns before committing to a plan

**Gate:** Requires at least one Chronicle (CHR-###) to exist. `/cv.discover` is not an idea-capture tool — that's `/cv.story` + `/cv.chronicle`. Run those first.

---

## Invocation

```
/cv.discover CHR-###              ← feature discovery for a specific chronicle
/cv.discover FEAT-### CHR-###     ← scoped to a known feature, referencing a chronicle
```

---

## Step 1 — Load Context

Read the specified Chronicle. Extract:

- The features listed in the "Features Implicated" section — these are the starting scope
- The user's journey steps — each step may imply sub-capabilities not explicitly listed
- The success signal — constraints on what "done" means
- The failure path — constraints on what the product must never do

If no CHR-### is specified and only one Chronicle exists, use it and confirm:
> "I'll use CHR-001 — [title]. Is that right?"

If the Chronicle's "Features Implicated" section is empty or missing, say:
> "The Chronicle doesn't have a features list yet. Walk me through the journey briefly and I'll identify what features are implied."

---

## Step 2 — Establish Feature Scope

Present the features extracted from the Chronicle:

> "Based on CHR-### [title], I can see [N] features this journey depends on:
>
> [numbered list: feature title + one-sentence role in the journey]
>
> Before we explore each one, are there features you already know about that aren't on this list? Or anything here that's out of scope for this release?"

Accept additions and removals. Confirm the working list before proceeding.

Assign a `FEAT-###` ID to any feature that doesn't have one yet. Note it:
> "I'll call this one **FEAT-002** for now — you can rename it later."

---

## Step 3 — Feature Discovery Loop

For each feature in the list, run a focused exploration. Go breadth-first — cover every feature at least once before going deep on any.

For each feature, ask:

**A — What it does (if not clear):**

> "Tell me about [Feature] — what does it actually do in the context of this journey?"

If the feature was described in the Chronicle, skip this and use that description.

**B — Sub-feature breakdown:**

After getting a sense of the feature, identify the sub-features — the distinct capabilities within it that could be built and shipped independently.

> "I see [N] distinct capabilities within [Feature]:
>
> - **MB-01** — [name]: [what it does]
> - **MB-02** — [name]: [what it does]
> - **MB-03** — [name]: [what it does]
>
> Does this match your mental model? Anything to split, merge, or rename?"

Name sub-features as MB-## (Milestone Blocks). Accept corrections.

**C — Clarity check:**

For each sub-feature, assess clarity on a 0–100 scale:

- **≥ 80** — ready to plan. The what, who, and success signal are understood.
- **60–79** — needs detail. The shape is clear but specifics are missing. Run `/cv.details` before planning.
- **< 60** — needs discovery or a spike. Fundamental questions are unanswered.

State the clarity score openly:
> "MB-02 is at about 65% clarity — I know what it does but not how it handles [specific unknown]. That needs resolution before we can plan it."

**D — Dependencies:**

Ask about upstream and downstream dependencies:

> "Does [MB-##] depend on anything else being built first? And does anything else depend on it?"

Note all dependencies in both directions.

**E — Risk flag:**

Flag anything that could invalidate the plan if discovered late:

> "MB-03 has a spike-level risk — [specific technical or product unknown]. If we plan it now without resolving that, we might have to replan. I'd recommend a spike before committing."

---

## Step 4 — Proactive Surface Pass

After covering all features, do one proactive pass to surface things the user may not have thought to mention:

**Shared state:** "Is there any state shared between [Feature A] and [Feature B]? For example, [specific shared entity implied by the Chronicle]."

**Edge cases from the failure path:** "The failure path mentions [X]. Which sub-feature owns that case? Is it in scope?"

**Implicit dependencies:** "I noticed [Feature C] references [data entity] — does that mean [Feature D] has to exist first?"

**Scope creep risks:** "One risk I see: [MB-##] could easily expand into [adjacent scope]. Is that explicitly out of scope for this version?"

Deposit anything surfaced here to the ledger.

---

## Step 5 — Pre-Map Recap

Before generating the Feature Map, produce a recap:

> "Here's what I understood. Let me know if anything's off before I generate the map."
>
> [One paragraph: chronicle this discovery is scoped to, features identified, total sub-features, most critical dependencies, highest-risk items]
>
> [Recommended starting point: "I'd recommend starting with MB-## because [reason — e.g. it unblocks everything downstream]."]
>
> "Anything to correct?"

Do not generate the map until confirmed.

---

## Step 6 — Generate Feature Map

Output the complete `map.md` as a code block:

```markdown
# Feature Map — FEAT-###: <Feature Title>
<!-- cv-artifact: feature-map -->
<!-- cv-compiled-from: ledger tags MAP:* + /cv.discover session -->

**Status:** draft
**Chronicle ref:** CHR-### — <title>
**Created:** YYYY-MM-DD

---

## Signal Block
<!-- cv-section: signal -->

```
feature:         FEAT-### — <title>
chronicle-ref:   CHR-### — <title>
overall-clarity: <0–100>%
sub-features:    <count>
ready-to-plan:   <count> (clarity ≥ 80%)
needs-detail:    <count> (clarity 60–79%)
needs-discovery: <count> (clarity < 60%)
spike-required:  <count> — [MB-## IDs]
blocking-deps:   [MB-## IDs with unresolved upstream deps]
recommended-start: MB-## — <reason>
```

---

## Sub-Feature Overview

| ID | Title | Tier | Clarity | Status | Depends On | Risk |
|----|-------|------|---------|--------|------------|------|
| MB-01 | <title> | 1/2/3 | <0-100>% | ready / needs-detail / spike | — | LOW |
| MB-02 | <title> | 1/2/3 | <0-100>% | ready / needs-detail / spike | MB-01 | MED |

---

## Sub-Feature Details

### MB-01 — <Title>

**Tier:** 1 (micro) | 2 (feature) | 3 (epic)
**Clarity:** <0-100>% — <what's known vs what's missing>
**Risk:** LOW | MEDIUM | HIGH — <reason>

**What we know:**
- <Decided behavior or scope item>

**What's still open:**
- <Open question or unknown>

**Dependencies:**
- Depends on: <MB-## — what it needs from that sub-feature, or "none">
- Blocks: <MB-## — what can't start until this is done, or "nothing">

**Recommendation:** <Plan now / Detail first / Spike required / Defer>

---

[Repeat for each sub-feature]

---

## Dependency Graph

```
MB-01 ——————————————————————————————————————— ready to plan
  │
  └──▶ MB-02 ——————————————————————————————— ready after MB-01 data model locked
  │
  └──▶ MB-03 (SPIKE FIRST) ————————————————— high risk, explore before planning

MB-04 ——————————————————————————————————————— independent, ready to plan
```

---

## Spike Recommendations

<If any sub-features require spikes:>

**MB-## — <Title> — SPIKE REQUIRED**

*Why:* <Specific unknown that could invalidate the plan>
*Time-box:* <suggested hours>
*What to answer:* <specific question the spike must resolve>
*Output:* <artifact or decision the spike should produce>

---

## Open Questions

**Blocking** *(must resolve before any sub-feature can plan)*
- [ ] <Question>

**Per-sub-feature:**
- MB-##: <question>

**Advisory:**
- [ ] <Question>

---

## Recommended Order

**Phase 1 — Foundation:**
1. MB-## — <reason: unblocks everything downstream>

**Phase 2 — Core:**
2. MB-## — <reason>
3. MB-## — <reason: can run in parallel>

**Phase 3 — Polish:**
4. MB-## — <reason: depends on Phase 2>

**Deferred:**
- MB-## — <reason: v1.1 or later>
```

Instruct the user:
> "Save this to `features/FEAT-###/map.md`. Then run `/cv.details MB-##` to go deep on the highest-clarity sub-feature, or run a spike if any are flagged."

---

## Step 7 — Handoff

After the map is generated, output ledger entries and suggest next steps:

> "FEAT-### Feature Map is ready. [N] sub-features across [N] tiers. I'd start with [MB-## — reason]."
>
> Next steps:
> - `/cv.details FEAT-###/MB-##` — go deep on a specific sub-feature to reach planning clarity
> - `/cv.discover FEAT-### CHR-###` — re-run if the scope shifts significantly
> - `/cv.compile FEAT-###/MB-##` — once a sub-feature reaches ≥ 80% clarity and all blocking questions are resolved

Output ledger entries:

```
LEDGER ENTRIES — append to features/FEAT-###/ledger.md

[PE-###] Feature Map created for FEAT-###
  date:   YYYY-MM-DD
  source: feature-discovery
  actor:  ai
  status: compiled
  tags:   [MAP:sub-feature:MB-01, MAP:sub-feature:MB-02, MAP:dependency, MAP:risk]

[PE-###] <key decision or assumption surfaced during discovery>
  date:   YYYY-MM-DD
  source: feature-discovery
  actor:  ai
  status: decided | assumed | open
  tags:   [PRD:signal:scope]
  note:   <why this matters>
```

Deposit one entry per significant decision, assumption, or open question surfaced during the session.

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include:

```
<!-- Running in standalone mode. Gate enforcement and ledger writes require _core.md. -->
```

And include inline:
- Gate: requires CHR-### to exist. If none exists, say so and suggest `/cv.story` + `/cv.chronicle` first.
- Sub-feature clarity scale: ≥ 80% = plan now, 60–79% = detail first, < 60% = spike or discovery needed
- Pre-map recap required before generating the map
