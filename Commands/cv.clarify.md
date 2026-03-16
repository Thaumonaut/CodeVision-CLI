# /cv.clarify
<!-- cv.clarify.md | Cross-cutting clarification engine. Used by other commands and invokable standalone. -->
<!-- Resolves open questions in any artifact one question at a time, with multiple choice + reasoning. -->

---

## What This Command Does

`/cv.clarify` scans an artifact for open questions and ambiguities, then resolves them through structured conversation. It is invoked automatically by `/cv.prd` and `/cv.erd` after initial draft, and can be called manually at any point:

```
/cv.clarify             ← scan the active artifact for the current feature
/cv.clarify prd         ← clarify a specific artifact type
/cv.clarify FEAT-003    ← clarify a specific feature's active artifact
```

It has two modes with different flows. The mode is detected automatically from context.

---

## Two Modes

### Mode A — Artifact Clarification
Used when working from an existing or draft document (PRD, ERD, spec, feature.md).

Flow: `scan artifact → ask questions → pre-draft recap → confirm → update document`

### Mode B — Chronicle Entry Mode
Used when the user is describing a user journey for the first time — there is no structured document yet.

Flow: `story input → questions referencing the story → pre-draft recap → document generation`

Reversing this order — asking structured questions before hearing the story — produces generic outputs. Always get the story first in chronicle mode.

---

## Core Rules (Apply to Both Modes)

These rules are non-negotiable and apply regardless of which command is calling `/cv.clarify`.

**1. One question at a time.**
Never present a list of questions. Never say "I have a few things to clarify." Ask question 1. Wait for the answer. Then ask question 2. The conversation should feel like an interview, not a form.

**2. Every question gets multiple choice.**
Format every question with 3–4 labeled options plus a final option:

```
→ Custom — I'll define it
```

Options are never bare labels. Each one carries **inline reasoning** that explains what choosing it implies. The reasoning makes the choice feel real, not abstract.

Good option example:
```
A) Anxious — they're seeing elevated numbers without context and that's scary
```

Bad option example:
```
A) Anxious
```

**3. Always show progress.**
Every question must include a progress indicator. This is required, not optional:

```
**Question N of M** (blocking / advisory)
```

If M is not yet known (dynamic scan), show `?` until the count is determined:
```
**Question 1 of ~5** (blocking)
```

**4. Classify every question.**
- **Blocking** — must be resolved before the document can be generated. Cannot be skipped.
- **Advisory** — improves quality but can be deferred. Can be waived with a note.

If the user tries to skip a blocking question, surface a stop signal:

```xml
<stop_signal>
  <gate>clarify:blocking</gate>
  <reason>This question must be answered before the document can be generated.</reason>
  <action>Answer the question, or let me know if you want to change the scope of this feature.</action>
</stop_signal>
```

**5. Build on prior answers.**
Each question should reference what the user has already said. Don't ask in a vacuum. If they mentioned "Marcus" in the story, say "Marcus" in the question. If they said "triglycerides 210," use that number. This makes the clarification feel like a real conversation.

**6. Mandatory pre-draft recap.**
After all questions are resolved, produce a pre-draft recap before writing any document. Format:

> "Here's what I understood from our conversation. Let me know if anything is off before I generate the [document type]."
>
> [Short paragraph — 3–5 sentences — summarizing all key decisions in natural prose.]
>
> Anything to correct?

Do not generate the document until the user confirms the recap. In the web UI, the Generate button is gated behind this review card.

---

## Mode A — Artifact Clarification Flow

### Step 1 — Scan
Read the target artifact. Identify:
- Fields that are empty or placeholder
- Statements that are ambiguous enough to produce two different designs
- Assumptions that are unstated and load-bearing
- Blocking open questions flagged in the document itself (marked `[OPEN]` or similar)

Classify each as blocking or advisory.

### Step 2 — Count
Determine the question count before asking Q1. Show the total in the progress indicator from the start.

If the artifact is clean and there are no open questions:

> "The [artifact] looks well-defined — I didn't find any blocking questions. There are [N] advisory items worth reviewing if you'd like, or you can proceed to [next command]."

### Step 3 — Ask
One question per turn. Blocking questions first, advisory questions after.

Each question follows this structure:

```
**Question N of M** (blocking)

[Context sentence referencing the document or prior answer]

[The question, stated plainly]

A) [Label — reasoning explaining what this choice implies]
B) [Label — reasoning]
C) [Label — reasoning]
D) [Label — reasoning]  ← include if genuinely needed; 3 is often enough
→ Custom — I'll define it
```

### Step 4 — Pre-Draft Recap
After all questions are answered, produce the recap paragraph (see Core Rules §6).

### Step 5 — Update Document
After confirmation, output the updated artifact as a code block. Note every change made relative to the draft with a brief changelog:

```
Changes from draft:
- §3 Acceptance Criteria: added file size limit (25MB) based on Q2
- §5 Edge Cases: added escalation path for critically abnormal results based on Q4
```

---

## Mode B — Chronicle Entry Mode

This mode is invoked when a user runs `/cv.chronicle` or says something like "I want to document a user journey."

### Step 1 — Story First
Before asking any structured questions, say:

> "Walk me through the journey as a story — who is the user, what happens, how do they feel at each step? Don't worry about structure. Just tell me what you see."

Then wait. Don't prompt with bullet points or structure. Let the story arrive naturally.

### Step 2 — Extract Signals
From the story, extract:
- The user persona (name or archetype, if mentioned)
- The emotional arc (anxious → curious → confident, etc.)
- The trigger event (what caused them to open the product)
- The key interaction moments
- The success signal (how does the journey end?)
- Any open questions or missing moments

### Step 3 — Clarifying Questions
Now ask questions, but reference the story at every turn. Frame them as "I want to make sure I understood..." rather than "I need to know..."

Typical question set for a chronicle (5–7 questions):

1. **Persona depth** (advisory) — who exactly is this user and what's their relationship with the product?
2. **Trigger** (blocking) — what specifically caused them to open the product at this moment?
3. **Emotional moment** (advisory) — what's the highest-stakes emotional moment in the journey?
4. **Feature boundaries** (blocking) — what features does this journey depend on? Are any of them unclear or in scope debate?
5. **Success signal** (blocking) — how does the user know the journey succeeded? What do they feel or do next?
6. **Escalation** (advisory) — what happens if something goes wrong at the key moment?
7. **Follow-on journeys** (advisory) — does this journey naturally lead to another one?

### Step 4 — Pre-Draft Recap
Same as Mode A. Required before generating the chronicle document.

### Step 5 — Generate Chronicle
Output the full chronicle using the CHR schema. See `chronicles/` document schema for the required fields.

---

## Waiver Handling

If a user wants to skip an advisory question:

> "Noted — I'll mark this as open and flag it for review before the spec is generated. Do you want to add a note about why it's being deferred?"

Log the waiver:
```
[YYYY-MM-DD] [WAIVER] [FEAT-###] SKIPPED: <question topic> | WAIVED BY: <actor> | RISK: <acknowledged risk>
```

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include this at the top of your first response:

```
<!-- Running in standalone mode. Full gate enforcement requires _core.md. -->
```

Then include this inline summary of the gate rules relevant to clarification:
- Blocking questions cannot be skipped
- Pre-draft recap is required before document generation
- Progress indicator (Question N of M) is required on every question

Proceed normally.
