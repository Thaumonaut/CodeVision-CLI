# /cv.chronicle
<!-- cv.chronicle.md | Compile a Chronicle from a roleplay debrief or direct input. -->
<!-- Produces CHR-###.md — the user journey narrative that drives all downstream work. -->
<!-- Run after /cv.roleplay (or directly). Gates /cv.discover. -->

---

## What This Command Does

`/cv.chronicle` compiles a Chronicle — the user journey narrative that is the source of truth for what gets built and why. It can work from two inputs:

- **From a roleplay debrief** — loads the simulation output from `/cv.roleplay` and structures it into a Chronicle. The raw material already exists; this pass formalizes it.
- **From direct input** — the user describes the journey in their own words. The AI asks clarifying questions and compiles the document from the conversation.

Either way, the output is the same: a `CHR-###.md` with a Signal Block, Story State, full journey narrative, emotional arc, features implicated, and PE-### ledger entries.

**Gate:** No upstream gate. Chronicles can be written at any time. However:
- If `mission.md` doesn't exist, note it once — Chronicles are stronger when grounded in the product mission.
- If a Persona (PERS-###) exists, it should be linked. If not, suggest `/cv.persona` in the handoff.

---

## Invocation

```
/cv.chronicle                    ← start a new chronicle
/cv.chronicle --from-roleplay    ← compile from the current /cv.roleplay debrief
/cv.chronicle CHR-###            ← update an existing chronicle
```

---

## Step 1 — Load Context

Read silently before asking anything:

1. `mission.md` — the product north star (shapes every question and the compiled prose)
2. `personas/` — any existing PERS-###.md files (for persona linking)
3. `chronicles/` — existing chronicles (to assign next ID, check for updates)
4. If `--from-roleplay`: the roleplay debrief from the current session

If `mission.md` is missing:
> "I don't see a mission defined yet. Chronicles are stronger when they trace back to the product mission — you can run `/cv.init` to define it, or continue and I'll work from what you tell me."

Do not block. Continue regardless.

---

## Step 2 — Check Existing Chronicles and Assign ID

- If chronicles exist: "You have [N] chronicle(s): [IDs + titles]. Are you adding a new one or updating an existing one?"
- If updating: jump to [Updating an Existing Chronicle](#updating-an-existing-chronicle)
- If new: assign next ID (`CHR-001`, `CHR-002`, etc.) and state it before proceeding

---

## Step 3 — Link or Note Persona

Check `personas/` for existing PERS-###.md files.

If personas exist:
> "This Chronicle follows a user. Do any of your existing personas fit this journey?
>
> [List: PERS-### — Name/Archetype — one-line summary]
> → New persona — I'll note PERS-TBD and suggest /cv.persona in the handoff
> → Skip — link a persona later"

If no personas exist: continue without asking. Surface `/cv.persona` in the handoff.

---

## Step 4 — Story State

Ask before collecting the journey:

> "Is this journey describing how users interact with the product **today**, a **proposed** new experience, or an **aspirational** future state?
>
> → **CURRENT** — this is how the product works now
> → **PROPOSED** — this is what we're designing and building
> → **ASPIRATIONAL** — future vision, not planned for this release"

This sets the `story-state` field and determines which features are marked as `exists: true` vs `exists: false` in the Features Implicated table.

---

## Step 5 — Collect the Journey

### If `--from-roleplay`:

> "I'll compile the Chronicle from the roleplay session. Here's the arc I observed:
>
> [2–3 sentence summary of the simulation — persona, what happened, key emotional moments]
>
> I'll use this as the narrative foundation. Tell me anything the simulation didn't capture, or confirm I should proceed."

### If direct input:

Say exactly this:

> "Walk me through the journey as a story — who is the user, what happens step by step, and how do they feel along the way? Don't worry about structure. Just tell me what you see."

Wait. Give the user space to tell the full story before reacting.

If the response is very short: "That's a good start. Can you walk me through what actually happens in the product — the specific moments where they interact with it?"

If the response is a structured list: accept it, reflect it back as narrative, confirm before continuing.

---

## Step 6 — Clarification Q&A

Ask clarifying questions one at a time. 6–8 questions, each with 3–4 options + "→ Custom — I'll describe it". Show progress: `**Question N of M** (blocking / advisory)`.

Standard question set:

- **Trigger** (blocking) — what caused the user to open the product at this specific moment?
- **Emotional arc** (blocking) — what does the user feel at the start, the peak moment, and the end?
- **Success signal** (blocking) — how does the user know it worked? What do they feel or do next?
- **Feature scope** (blocking) — which product capabilities does this journey depend on?
- **Failure path** (advisory) — what happens if the key moment fails?
- **Assumptions** (blocking) — scan for anything stated as given but not made explicit. Platform state, user knowledge, environmental conditions, product capabilities. Present each and ask: record as stated, revise, or flag as open.
- **Persona depth** (advisory) — first time using the product or returning?
- **Follow-on journeys** (advisory) — does this naturally lead to another chronicle?

Blocking questions cannot be skipped. Advisory questions can be waived with a ledger entry.

---

## Step 7 — Feature Identification

After clarification, identify features implicated by this chronicle:

> "This journey depends on [N] product capabilities:
>
> [numbered list: FEAT-### or proposed name + one-sentence role in the journey]
>
> Does this match your thinking? Anything to add, split, or remove?"

For each feature, note:
- **Primary** — the journey is primarily about this
- **Dependent** — must exist for the journey to work
- **Implied** — would improve the journey but isn't strictly required

Assign `FEAT-###` IDs for any features that don't have one yet.

---

## Step 8 — Pre-Draft Recap

Required before generating the document:

> "Here's what I understood. Let me know if anything's off before I write the chronicle.
>
> [3–5 sentences: persona, trigger, journey arc, peak emotional moment, success signal, features implicated]
>
> Story state: [CURRENT | PROPOSED | ASPIRATIONAL]
> Assumptions: [list]
>
> Anything to correct?"

Do not generate the Chronicle until confirmed.

---

## Step 9 — Generate Chronicle

Output the complete `CHR-###.md` as a code block:

~~~markdown
# Chronicle CHR-### — <Title>
<!-- cv-artifact: chronicle -->
<!-- cv-compiled-from: roleplay-debrief | direct-input -->

**Status:** draft
**Persona ref:** PERS-### — <name/archetype> | PERS-TBD
**Story state:** CURRENT | PROPOSED | ASPIRATIONAL
**Created:** YYYY-MM-DD

---

## Signal Block
<!-- cv-section: signal -->

```
persona-ref:    PERS-### — <name/archetype>
story-state:    CURRENT | PROPOSED | ASPIRATIONAL
trigger:        <one sentence — what brought the user to this moment>
emotional-arc:  <start emotion> → <peak emotion> → <end emotion>
features:
  - FEAT-### — <title> — primary | dependent | implied
  - FEAT-### — <title> — primary | dependent | implied
blocking-open:  <count>
linked-prds:    none
status:         draft
```

---

## Assumptions
<!-- cv-section: assumptions -->
<!-- Conditions this journey depends on that are stated as given, not validated -->
- <Assumption — e.g. "User has completed onboarding">
- [UNVALIDATED] <Assumption that hasn't been confirmed with real users>

---

## Trigger
<!-- cv-section: trigger -->
<What caused the user to open the product at this specific moment. One paragraph.>

---

## Journey
<!-- cv-section: journey -->

### Step 1 — <Phase name>
**Action:** <What the user does>
**Thought / Feeling:** <What they're thinking or feeling>

### Step 2 — <Phase name>
**Action:** <What the user does>
**Thought / Feeling:** <What they're thinking or feeling>

[Continue for each step]

---

## Key Emotional Moments
<!-- cv-section: emotional-moments -->
| Moment | Emotion | Risk if handled poorly |
|--------|---------|----------------------|
| <moment> | <emotion> | <what breaks if this goes wrong> |

---

## Success Signal
<!-- cv-section: success-signal -->
**Functional:** <what the product did that signals success>
**Emotional:** <how the user feels>
**Behavioral:** <what the user does next — returns, shares, acts on the information>

---

## Failure Path
<!-- cv-section: failure-path -->
<What happens if the key moment fails. Is there a recovery? Who is responsible?>

---

## Features Implicated
<!-- cv-section: features -->
| ID | Title | Role | Exists? |
|----|-------|------|---------|
| FEAT-### | <title> | primary | yes / no |
| FEAT-### | <title> | dependent | yes / no |

---

## Open Questions
<!-- cv-section: open-questions -->
**Blocking** *(must resolve before related PRD can be compiled)*
- [ ] <question> — affects FEAT-###

**Advisory**
- [ ] <question>
~~~

Instruct the user:
> "Save this to `chronicles/CHR-###.md`."

---

## Step 10 — Handoff

> "CHR-### is ready.
>
> Next steps:
> - `/cv.discover CHR-###` — map all the features this journey depends on (breadth-first)
> - `/cv.roleplay PERS-### CHR-###` — run another simulation to pressure-test a specific moment
> - `/cv.persona` — build a full Persona document for this user (shown only if persona is PERS-TBD)"

Output ledger entries:

```
LEDGER ENTRIES — append to ledger.md

[PE-###] Chronicle created: CHR-### — <title>
  date:   YYYY-MM-DD
  source: feature-discovery
  actor:  <config.json → author> | ai
  status: compiled
  tags:   [CHR:trigger, CHR:journey, CHR:emotional-moment]
  note:   Story state: [CURRENT | PROPOSED | ASPIRATIONAL]. Features implicated: [FEAT-### list].

[PE-###] Assumption recorded: <assumption text>
  date:   YYYY-MM-DD
  source: feature-discovery
  actor:  <config.json → author>
  status: assumed
  tags:   [CHR:assumptions]
  note:   <risk if this assumption is wrong>
```

Deposit one entry per assumption. Deposit one entry per blocking open question.

---

## Updating an Existing Chronicle

1. Read the existing chronicle and summarize it back
2. Ask: "What's changed — a new journey moment, persona correction, Story State update, or full rewrite?"
3. Make targeted edits
4. **If related documents are already approved:** warn before saving:
   > "CHR-### is linked to approved documents. Updating the journey narrative or features list may invalidate the PRD scope or AC criteria. Do you want to proceed? If yes, I'll flag the affected documents for re-review."
5. Deposit a ledger entry for the update:

```
[PE-###] Chronicle updated: CHR-### — <what changed>
  date:   YYYY-MM-DD
  source: feature-discovery
  actor:  <config.json → author>
  status: decided
  tags:   [CHR:trigger | CHR:journey | CHR:features]
  note:   <reason for update, downstream impact>
```

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include:

```
<!-- Running in standalone mode. Gate enforcement and ledger writes require _core.md. -->
```

And include inline:
- No upstream gate, but mission.md improves quality
- Signal Block required at top of every Chronicle
- Story State (CURRENT / PROPOSED / ASPIRATIONAL) must be set before document is generated
- One clarifying question per turn, blocking questions cannot be skipped
- Pre-draft recap required before document generation
