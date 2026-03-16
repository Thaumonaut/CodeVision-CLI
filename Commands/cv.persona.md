# /cv.persona
<!-- cv.persona.md | Create and edit user persona documents. -->
<!-- Personas are reusable across chronicles, PRDs, and user research. -->
<!-- Standalone: includes minimum context inline if _core.md is not loaded. -->

---

## What This Command Does

`/cv.persona` defines a user persona as a structured document that can be referenced by any chronicle, PRD, or research plan. Personas are not user stories — they are reusable character definitions that give the team a shared understanding of who they are building for.

Every chronicle should reference a persona. Every persona should be grounded in real research signals or explicitly flagged as assumed.

Invocation:
```
/cv.persona                   ← create a new persona
/cv.persona PERS-###          ← review or edit an existing persona
/cv.persona list              ← list all personas in the project
```

Personas live at:
```
~/.codevision/projects/<slug>/stakeholders/PERS-###.md
```

---

## Gate Check

No upstream gate. Personas can be created at any time — before or after chronicles. If a chronicle references a persona that doesn't exist yet, suggest creating one now or flagging the reference as `PERS-TBD`.

---

## Step 1 — Check for Existing Personas

Before starting, check `stakeholders/` for existing persona files.

- **If none exist:** say "This will be your first persona — **PERS-001**. Let's build it."
- **If personas exist:** list them by ID and name and ask: "Are you adding a new persona, or updating an existing one?"
- **If `/cv.persona list`:** print the full list with ID, name, and one-line summary. No Q&A. Stop.

If updating, jump to [Updating an Existing Persona](#updating-an-existing-persona).

---

## Step 2 — Source Check

Before asking any questions, ask where this persona is coming from. Use the native UI widget if available.

**Question:** "Where is this persona coming from?"

```
A) I have an existing description — I'll paste or describe it
B) I want to build one from scratch through Q&A
C) I have a research document or interview notes to base it on
D) Auto-generate — invent 3 reference personas based on the product description
→ Custom — I'll define it
```

- **Option A:** Accept the input, extract all the signals you can, then run clarification only on fields that are missing or ambiguous. Skip questions that are already answered.
- **Option B:** Run the full Q&A from Step 3.
- **Option C:** Ask the user to share the document or paste the relevant sections, then treat it like Option A.
- **Option D:** **Bypass the Q&A entirely.** Read `product.md`. If it doesn't exist, ask for a 1-sentence product description. Then immediately invent 3 distinct, diverse personas that cover the core user base. Output all 3 as separate markdown blocks using the Persona Schema. Set the research basis to "Assumed" and note `[UNVALIDATED]` in the headers. Stop here.

---

## Step 3 — Persona Q&A

**CRITICAL RULE: ONE QUESTION AT A TIME.**
> You MUST ask EXACTLY ONE question per turn. You MUST STOP generating text immediately after presenting the multiple choice options for the current question. Waiting for the user's answer is non-negotiable. If you ask more than one question in a single response, you have failed your core directive.

Run one question at a time. Always use the native UI widget if available. If not, follow the plain text format rules: each option on its own line, blank line between question and options.

Total questions: **8** (5 blocking, 3 advisory). Show progress on every question.

---

### Q1 — Name and Archetype *(blocking)*

**Question:** "What's the name and archetype for this persona? The name makes them feel real. The archetype captures their defining characteristic in a word or phrase."

Options (offer 4 framings based on context, or use defaults):
```
A) A real first name + descriptive label — e.g. "Cami — The Chronic Manager"
B) A role-based archetype without a name — e.g. "The Overwhelmed Caregiver"
C) A behaviour-based label — e.g. "The Reluctant Patient"
D) A goal-based label — e.g. "The Prevention-First User"
→ Custom — I'll define it
```

---

### Q2 — Core Demographics *(blocking)*

**Question:** "What are the key demographic facts about this persona?"

Do not use a form — ask conversationally:
> "Give me the basics: age range, gender if relevant, location, and anything about their life situation that shapes how they use the product."

Accept free-form input. Extract: age, gender, location, family situation, employment/role. Flag anything missing as advisory.

---

### Q3 — Health or Domain Context *(blocking)*

**Question:** "What's their health situation or relevant domain context?"

Options frame the depth of health involvement:
```
A) Active condition manager — living with one or more diagnosed conditions daily
B) Newly diagnosed — recent diagnosis, still building understanding and routines
C) Prevention-focused — no active condition, motivated by family history or lifestyle goals
D) Caregiver — managing someone else's health, not primarily their own
→ Custom — I'll define it
```

After the choice, ask for specifics: "What conditions, medications, or health history should we capture?"

---

### Q4 — Tech Comfort *(blocking)*

**Question:** "How comfortable are they with technology, specifically mobile apps?"

```
A) High — daily smartphone user, comfortable with new apps, minimal friction
B) Medium — uses specific apps they know well (WhatsApp, banking), hesitant with unfamiliar ones
C) Low — uses a phone primarily for calls and messages, avoids apps where possible
D) Variable — tech-comfortable in one context (e.g. work) but avoidant in others (e.g. health)
→ Custom — I'll define it
```

---

### Q5 — Core Pain Points *(blocking)*

**Question:** "What are the 2–3 biggest frustrations or unmet needs this persona has — specifically in the context of what your product addresses?"

Accept free-form. If they give more than 3, ask: "Which of these are the most defining — the ones they'd complain about first?"

---

### Q6 — Motivations and Goals *(advisory)*

**Question:** "What does this persona actually want? Not what they say they want — what would make their life measurably better?"

```
A) Control — they want to feel in charge of their own health decisions
B) Simplicity — they want a clear, manageable routine without information overload
C) Reassurance — they want to feel like things are okay and someone is watching out for them
D) Connection — they want to feel understood and not alone in what they're managing
→ Custom — I'll define it
```

---

### Q7 — Behaviours and Habits *(advisory)*

**Question:** "What does their daily life actually look like? What apps, services, or people do they rely on for health information today?"

Accept free-form. Look for: existing tools, trusted sources, social channels (WhatsApp groups, family networks), and workarounds they use for problems the product could solve.

---

### Q8 — Research Basis *(advisory)*

**Question:** "Is this persona based on real research, or is it assumed for now?"

```
A) Based on interviews or surveys — I can reference specific research
B) Synthesised from secondary research — industry data, reports, or analogous studies
C) Assumed — based on product intuition, not validated yet
D) Partially validated — some aspects are researched, others are assumed
→ Custom — I'll define it
```

If assumed or partially validated, flag the persona with `[UNVALIDATED]` in the document header. This does not block anything — it just makes the assumption visible.

---

## Step 4 — Pre-Draft Recap

Required before generating the document. Format:

> "Here's what I'm about to write for **[Name]**. Let me know if anything's off."
>
> [2–3 sentence summary: who they are, their core context, their defining pain point and motivation]
>
> "Research basis: [validated / assumed / partially validated]"
>
> "Anything to correct?"

Do not generate the document until confirmed.

---

## Step 5 — Generate Persona Document

Output the complete `PERS-###.md` as a code block using this schema:

```markdown
# Persona PERS-### — <Name>
<!-- stakeholders/PERS-###.md -->
<!-- Research basis: validated | assumed | partially validated -->

## Identity

**Name / Archetype:** <name — archetype label>

**Age:** <age or range>

**Gender:** <if relevant to product context>

**Location:** <city, country, or region>

**Life situation:** <household, dependents, employment — 1–2 sentences>

---

## Health & Domain Context

**Primary context:** <active condition manager / newly diagnosed / prevention-focused / caregiver>

**Conditions:** <diagnosed conditions, if any>

**Medications:** <current medications, if known>

**Medical history:** <relevant history>

**Family history:** <relevant family health background>

---

## Behaviours & Tech Profile

**Tech comfort:** <low / medium / high> — <one sentence explaining what that means for this person>

**Primary apps/tools:** <what they use daily>

**Health information sources:** <where they turn for health advice today>

**Workarounds:** <what they do now instead of using a product like yours>

---

## Pain Points

1. <Most defining pain point — the one they'd name first>
2. <Second pain point>
3. <Third pain point, if applicable>

---

## Motivations & Goals

**What they want:** <the real underlying goal, not the surface request>

**What success looks like:** <a concrete picture of their life if the product works>

**What they fear:** <what would make them distrust or abandon the product>

---

## Quote
> "<A one-sentence quote in their voice that captures their defining mindset>"

---

## Chronicles Featuring This Persona

| ID | Title |
|---|---|
| CHR-### | <Chronicle title> |

---

## Research Notes
<!-- Document what is validated vs assumed -->
- **Validated:** <what we know from research>
- **Assumed:** <what we're treating as true but haven't confirmed>
- **To validate:** <open research questions about this persona>

---
_Persona by: <author> | Created: YYYY-MM-DD | Status: draft_
_Research basis: validated | assumed | partially validated_
```

---

## Step 6 — Handoff

After the persona is generated, say:

> "PERS-### is ready. Next steps:"
>
> - `/cv.chronicle` — reference this persona when writing a new chronicle
> - `/cv.persona PERS-###` — come back to update as you learn more from research
> - Add the persona ID to any existing chronicles that this persona fits

Log the creation. If batch-creating via Option D, log all 3:
```
[YYYY-MM-DD] [/cv.persona] [PERS-###] DECISION: Persona created | NAME: <name> | BASIS: <validated/assumed>
```

---

## Updating an Existing Persona

1. Read the current persona aloud as a brief summary (identity, pain points, research basis)
2. Ask: "What's changed — new research, a correction, or a scope update?"
3. Make targeted edits. Do not rewrite sections that weren't mentioned.
4. **If the persona is referenced by approved PRDs:** warn before saving:
   > "PERS-### is referenced by approved documents. Significant changes to core attributes may affect how those documents were written. Do you want to flag them for review?"
5. Log the update with a brief note on what changed.

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include:

```
<!-- Running in standalone mode. Gate enforcement and ledger writes require _core.md. -->
```

And include inline:
- No upstream gate — personas can be created at any time
- Always use native UI widget for multiple choice if available; if not, each option on its own line with a blank line before the first option
- Pre-draft recap required before generating the document
