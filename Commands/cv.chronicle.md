# /cv.chronicle
<!-- cv.chronicle.md | Defines a user journey / epic as a Chronicle document. -->
<!-- Story-first. Calls /cv.clarify in Mode B after the story is told. -->
<!-- Standalone: includes minimum context inline if _core.md is not loaded. -->

---

## What This Command Does

`/cv.chronicle` captures a user journey as a Chronicle — the narrative source of truth that links user experience to product features. Chronicles are not requirements. They are stories. They exist to make sure the team builds the right thing for the right person in the right emotional context.

Every PRD should trace back to a Chronicle. Every feature that lacks one is a feature built without a user in mind.

Invocation:
```
/cv.chronicle              ← start a new chronicle for the active project
/cv.chronicle CHR-###      ← review or update an existing chronicle
```

---

## Gate Check

`/cv.chronicle` has **no upstream gate** — chronicles can be written at any time. However:

- If `mission.md` exists, read it before starting. It shapes every question.
- If `mission.md` does not exist, say: "I don't see a mission defined yet. Chronicles are stronger when they trace back to the product mission. You can run `/cv.init` to define it now, or continue and add it later."
- If `product.md` exists, read it silently. It will shape questions, generated prose, and feature identification throughout the session. Do not narrate the read — just use it.
- If `product.md` does not exist, say once: "I don't see a product description yet. Chronicles are much stronger when they're grounded in a specific product — you can run `/cv.product` to define it, or continue and I'll ask for the key context inline." Do not repeat this warning. Do not block.

If `product.md` is missing, collect the minimum product context inline during Step 4 (Story Prompt) — ask the user to describe the product in one sentence before they tell the story. Store this temporarily as `[product-inline]` and use it throughout the session.

Do not block. Continue regardless.

---

## Step 1 — Load Product Context

Before asking anything, check for `product.md`.

- **If it exists:** read it silently. Extract and hold:
  - Product name and type
  - Core user action
  - AI role in the product
  - Tone and voice
  - What the product does not do (non-features)

  Every chronicle produced in this session will be framed around this product. The product name appears in the chronicle header. The voice shapes the prose. The non-features are checked against implicated features — anything outside scope is flagged `[OUT OF SCOPE — confirm]` rather than silently included.

- **If it does not exist:** the Gate Check warning already surfaced this. Proceed. If the user didn't define a product inline during the gate check prompt, ask before the story:
  > "Before we write the story — in one sentence, what is the product this journey is happening in?"
  Hold this as `[product-inline]` and use it throughout.

---

## Step 2 — Check for Existing Chronicles

Before starting, check whether any chronicles exist in `chronicles/`.

- **If none exist:** proceed to Step 5. This is the first one.
- **If chronicles exist:** say "You already have [N] chronicle(s): [list IDs + titles]. Are you adding a new one, or updating an existing one?"

If updating, jump to [Updating an Existing Chronicle](#updating-an-existing-chronicle).

---

## Step 3 — Check for Existing Personas

Before assigning an ID or asking for the story, check `stakeholders/` for existing persona files.

- **If personas exist:** surface them before proceeding. Use the native UI widget if available:

  > "I found [N] persona(s) in this project. Does this chronicle follow one of them, or is it a new persona?"

  Present each persona as an option (ID + name + one-line description), plus:
  - `→ New persona — I'll define them during or after this chronicle`
  - `→ Skip — I'll link a persona later`

  If the user selects an existing persona: pre-fill all persona fields from that document. Skip any clarification questions whose answers are already in the persona file. Note at the top of the generated chronicle: `Persona ref: PERS-###`.

  If the user selects **New persona**: continue normally — the persona Q&A can happen via `/cv.persona` after the chronicle is written, or the chronicle can be written with a `PERS-TBD` reference.

- **If no personas exist:** continue without asking. Do not prompt the user to create one now — surface it in the handoff at Step 8 instead.

---

## Step 4 — Assign Chronicle ID

Determine the next CHR ID from the existing count:
- No chronicles → this will be `CHR-001`
- N chronicles exist → this will be `CHR-0NN+1`

Tell the user the ID before asking for the story:
> "This will be Chronicle **CHR-001**. Let's write it."

---

## Step 5 — Story Prompt

This is the most important step. Do not skip it. Do not add structure. Do not ask for bullet points.

Say exactly this (or a close natural paraphrase):

> "Walk me through the journey as a story — who is the user, what happens step by step, and how do they feel along the way? Don't worry about structure. Just tell me what you see."

Then wait. Give the user space to tell the full story before reacting.

**If the user gives a very short response** (one or two sentences), gently invite more:
> "That's a good start. Can you walk me through what actually happens in the product — the specific moments where they interact with it?"

**If the user gives a structured list instead of a story**, accept it but reflect it back as narrative:
> "Got it. Let me restate that as a story before we dig in — you can tell me if anything's off."

---

## Step 6 — Run /cv.clarify in Chronicle Mode

After the story, invoke `/cv.clarify` in **Mode B**. Follow the Mode B flow exactly:

1. Extract signals from the story (persona, trigger, emotional arc, key moments, success signal, open questions)
2. Ask clarifying questions one at a time, referencing the story at each turn
3. Typical question set (6–8 questions — classify each as blocking or advisory):
   - **Trigger** (blocking) — what caused the user to open the product at this specific moment?
   - **Feature scope** (blocking) — which product features does this journey depend on?
   - **Persona depth** (advisory) — how familiar is this user with the product? First time or returning?
   - **Emotional high point** (advisory) — what's the most charged moment emotionally? What does the user feel?
   - **Success signal** (blocking) — how does the user know it worked? What do they feel or do next?
   - **Failure path** (advisory) — what happens if the key moment fails? Is there an escalation path?
   - **Assumptions** (blocking) — scan the story and all answers so far for anything stated as given but not made explicit. Present each candidate assumption and ask whether it should be recorded, revised, or flagged as open. Common categories: device/platform state (notifications enabled, app installed), user knowledge (knows a feature exists, has prior context), environmental conditions (network access, clinical referral pathway), product capabilities (feature is built and working). Always ask this — even clean-seeming stories have hidden assumptions worth surfacing.
   - **Follow-on journeys** (advisory) — does this naturally lead to another journey?

All `/cv.clarify` core rules apply here: one question per turn, multiple choice with reasoning, progress indicator, blocking questions cannot be skipped, pre-draft recap before document generation.

**Multiple choice formatting rules (required):**
- **Always use the native UI multiple choice widget** (`ask_user_input_v0`) when available — never present options as plain text if the tool is accessible in the current environment.
- **If the tool is unavailable** and options must be rendered as plain text in chat, each option must be on its own line with a blank line between the question and the first option. Never run options together. Format exactly as:

  ```
  **Question N of M** (blocking)

  [Question text]

  A) Option one — reasoning
  B) Option two — reasoning
  C) Option three — reasoning
  → Custom — I'll define it
  ```

---

## Step 7 — Feature Identification

After clarification, identify the features implicated by this chronicle. These become the Chronicle's `features` list and will generate `FEAT-###` IDs.

Ask:

> "This journey touches on [N] distinct product capabilities. Let me list what I identified — does this match what you're thinking, or are there things to add or split?"

Present the list with brief descriptions. Let the user confirm or adjust.

For each confirmed feature, note whether it is:
- **Primary** — the journey is primarily about this feature
- **Dependent** — this feature must exist for the journey to work
- **Implied** — this feature would make the journey better but isn't strictly required

These will map to PRD priorities later.

---

## Step 8 — Pre-Draft Recap

Required before generating any document. Follow the `/cv.clarify` pre-draft recap format:

> "Here's what I understood from our conversation. Let me know if anything is off before I write the chronicle."
>
> [3–5 sentence paragraph: persona, trigger, journey arc, key emotional moment, success signal, features implicated]
>
> [One sentence listing confirmed assumptions, e.g. "Assumptions: notifications enabled, user is a first-time Aiko user."]
>
> "Anything to correct?"

Do not generate the chronicle until the user confirms.

---

## Step 9 — Generate Chronicle

Output the complete `CHR-###.md` as a code block using this schema:

```markdown
# Chronicle CHR-### — <Title>
<!-- chronicles/CHR-###.md -->
<!-- Product: <product name> | product.md ref: [loaded | inline | none] -->

## Persona

**Name / Archetype:** <name or archetype>

**Age:** <age or range>

**Relationship to product:** <new user / returning user / power user>

**Health context:** <relevant background if applicable>

**Tech comfort:** <low / medium / high>

**Persona ref:** <PERS-### if a persona document exists, otherwise "undefined">

**Product:** <product name — from product.md or inline definition>

## Assumptions
<!-- Conditions this journey depends on that are stated as given, not validated -->
- <Assumption 1 — e.g. "Notifications are enabled on the user's device">
- <Assumption 2 — e.g. "User has completed onboarding">
<!-- If an assumption is contested or unvalidated, flag it: -->
- [UNVALIDATED] <Assumption — e.g. "User is willing to share medical history on first session">

## Trigger
<What caused the user to open the product at this specific moment. One paragraph.>

## Journey

### 1. <Phase name>
<What the user does and feels. 2–4 sentences.>

### 2. <Phase name>
<What the user does and feels. 2–4 sentences.>

[Continue for each phase]

## Key Emotional Moment
<The highest-stakes moment in the journey. What the user feels. What's at risk if it goes wrong.>

## Success Signal
<How the user knows the journey succeeded. What they feel, say, or do next.>

## Failure Path
<What happens if the key moment fails. Is there an escalation? Who is responsible?>

## Features Implicated
| ID | Title | Role |
|---|---|---|
| FEAT-001 | <name> | Primary |
| FEAT-002 | <name> | Dependent |

## User Research Questions
<!-- Questions to ask real users to validate or challenge this chronicle -->
<!-- Organised by research method. Remove methods not relevant to this chronicle. -->

**Screener** *(who to recruit)*
- <Characteristic 1 that makes someone the right participant for this journey>
- <Characteristic 2>

**Discovery interviews** *(open-ended, validate the problem space)*
- <Question that probes whether this trigger is real and common>
- <Question that tests the emotional framing — does the user actually feel this way?>
- <Question that surfaces alternatives — what do they do instead of using the product?>

**Usability / concept testing** *(validate specific product moments)*
- <Question or task that tests the key interaction in the journey>
- <Question that probes the most fragile moment — where trust is won or lost>

**Post-launch validation** *(confirm the success signal is measurable)*
- <Metric or behaviour that would confirm the success signal in real usage data>
- <Follow-up question to ask users who completed the journey>

## Open Questions
<!-- Blocking questions that weren't resolved during clarification -->
- [ ] [OPEN] <question> — needs resolution before FEAT-### PRD can be approved

---
_Chronicle by: <author> | Created: YYYY-MM-DD | Status: draft_
```

---

## Step 10 — Handoff

After the chronicle is generated, say:

> "CHR-### is ready. Next steps:"
>
> - `/cv.feature FEAT-###` — define the feature abstraction for each implicated feature
> - `/cv.prd FEAT-###` — start writing requirements for the primary feature
> - `/cv.clarify CHR-###` — come back to resolve any open questions
> - `/cv.persona` — create a persona document for this user if one doesn't exist yet (shown only if persona was `PERS-TBD`)

Log the chronicle creation:
```
[YYYY-MM-DD] [/cv.chronicle] [CHR-###] DECISION: Chronicle created | FEATURES: FEAT-001, FEAT-002 | OPEN: N blocking questions
```

---

## Updating an Existing Chronicle

If the user wants to update a chronicle:

1. Read the existing chronicle aloud (summary, not verbatim)
2. Ask: "What's changed — is this a new journey moment, a persona correction, or a full rewrite?"
3. Make targeted edits based on the answer
4. **If the chronicle has an approved linked PRD:** warn before saving:
   > "CHR-### is linked to an approved PRD. Updating the chronicle will revert PRD-001 to `review` status and require re-approval before the spec can be generated. Do you want to proceed?"
5. Log the update to `ledger/decisions.md`

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include this note:

```
<!-- Running in standalone mode. Gate enforcement and ledger writes require _core.md. -->
```

And include inline:
- Chronicle has no upstream gate (but needs mission.md for quality)
- Chronicle edits after linked PRD is approved revert PRD to `review` status
- The clarification sub-routine rules: one question per turn, multiple choice with reasoning, progress indicator (Question N of M), blocking questions cannot be skipped, pre-draft recap required before generation
