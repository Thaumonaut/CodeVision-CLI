# /cv.persona
<!-- cv.persona.md | Build a Persona document through guided Q&A. -->
<!-- Personas are the behavioral model used during /cv.story simulations and for consistency checks across all downstream documents. -->
<!-- Standalone: includes minimum context inline if _core.md is not loaded. -->

---

## What This Command Does

`/cv.persona` builds a Persona document through guided Q&A and deposits every answer to the Exploration Ledger with `PERS:*` tags. The compiled document is not just a profile — it is a **behavioral model**. The Voice & Behaviour Profile section is what the AI loads when entering persona mode in `/cv.story`.

Every chronicle should reference a persona. Every persona should be grounded in real research signals or explicitly flagged as assumed.

Invocation:
```
/cv.persona                   ← create a new persona
/cv.persona PERS-###          ← review or update an existing persona
/cv.persona list              ← list all personas in the project
```

Personas live at:
```
~/.codevision/projects/<slug>/personas/PERS-###.md
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

### Q3 — Domain Context *(blocking)*

**Question:** "What's their relevant context for this product — what's going on in their life or work that makes this product matter to them?"

Generate 4 options grounded in the product context (read from `mission.md` or `product.md` if available). Options should reflect plausible relationships a user could have to this product domain. Do not make them health-specific unless the product is health-related.

After the choice, ask for specifics: "What additional context — history, situation, or background — should we capture about this person in relation to the product?"

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
# Persona PERS-### — <Name> — <Archetype>
<!-- cv-artifact: persona -->
<!-- cv-compiled-from: ledger tags PERS:* -->
<!-- cv-persona: enforce -->
<!-- personas/PERS-###.md -->
<!-- Research basis: validated | assumed | partially validated -->

## Signal Block
<!-- cv-section: signal -->

```
archetype:      <one-word or short label — e.g. "Chronic-Cami", "Anxious-Marcus">
age:            <number>
location:       <city, country>
primary-pain:   <one sentence — the single most important pain point>
primary-goal:   <one sentence — what success looks like for them>
behavioral-summary: <one sentence — how they make decisions and respond to stress>
chronicles:     <CHR-### — Title, or "none yet">
research-basis: <unvalidated | partially-validated | validated>
```

---

## Identity
<!-- cv-slot: identity -->

**Name / Archetype:** <name — archetype label>

**Age:** <age or range>

**Location:** <city, country, or region>

**Life situation:** <household, dependents, employment — 1–2 sentences>

---

## Domain Context
<!-- cv-slot: domain-context -->

<Relevant context for how this persona relates to the product — what's going on in their life or work that makes this product matter. 2–3 sentences.>

---

## Behaviours & Tech Profile
<!-- cv-slot: tech-profile -->

**Tech comfort:** <low / medium / high> — <one sentence explaining what that means for this person>

**Primary apps/tools:** <what they use daily>

**Information sources:** <where they turn for advice or information today>

**Workarounds:** <what they do now instead of using a product like yours>

---

## Pain Points
<!-- cv-slot: pain-points -->

1. <Most defining pain point — specific enough that a product feature could directly address it>
2. <Second pain point>
3. <Third pain point, if applicable>

---

## Motivations & Goals
<!-- cv-slot: motivations -->

**What they want:** <the real underlying goal, not the surface request>

**What success looks like:** <a concrete picture of their life if the product works>

**What they fear:** <what would make them distrust or abandon the product>

---

## Quote
> "<A one-sentence quote in their voice that captures their defining mindset>"

---

## Voice & Behaviour Profile
<!-- cv-section: voice -->
<!-- This section is loaded by /cv.story when entering persona mode. -->
<!-- Specific enough to constrain behavior, not just descriptive. -->

### How They Speak
<!-- cv-slot: voice-speech -->

- <Tone and register — formal / casual / hesitant / direct>
- <Vocabulary — clinical vs informal, technical vs lay terms>
- <Sentence structure — long/short, trailing off, assertive>
- <Characteristic phrases or patterns>

### Emotional Defaults
<!-- cv-slot: emotional-defaults -->

| State | Behavior |
|-------|----------|
| Base state | <How they present when things are normal> |
| Under stress | <First response to stress — avoidance, practicality, panic?> |
| When scared | <How fear manifests — quiet, chatty, dismissive?> |
| When reassured | <How they respond to good news or calming information> |
| When overwhelmed | <What they do when there's too much information> |
| When resistant | <How they push back without being confrontational> |

### Decision-Making Patterns
<!-- cv-slot: decision-patterns -->

- <Who/what they trust — people over information? Experience over data?>
- <What factors matter — cost, convenience, social proof, authority?>
- <What makes them procrastinate vs act immediately>
- <Who they consult before making a key decision>

### Situation-Specific Responses
<!-- cv-slot: situation-responses -->

**When the product suggests something they didn't expect:**
<Specific behavioral description — what they say, what they do, what they do next.>

**When the conversation gets too complex or technical:**
<Specific behavioral description>

**When the product asks them to do something that feels like effort:**
<Specific behavioral description>

### What <Name> Would Never Do
<!-- cv-slot: never-do -->

- <Thing they would never say or do — with brief reason why>
- <Thing they would never say or do>
- <Thing they would never say or do>

---

## Chronicles Featuring This Persona
<!-- cv-section: chronicles -->

| ID | Title | Story State |
|----|-------|-------------|
| CHR-### | <Chronicle title> | PROPOSED / CURRENT / ASPIRATIONAL |

---

## Research Notes
<!-- cv-section: research -->

| Claim | Validation Status | Source |
|-------|-------------------|--------|
| <specific claim about this persona> | validated / assumed / to-validate | <source or reason> |

**Still to validate:**
- <specific thing that needs user research>

---
_Persona by: <config.json → author> | Created: YYYY-MM-DD | Status: draft_
_Research basis: validated | assumed | partially validated_
```

---

## Step 6 — Handoff

After the persona is generated, output ledger entries and suggest the next step:

> "PERS-### is ready. The Voice & Behaviour Profile is what powers simulation — the more specific it is, the more useful `/cv.story` will be."
>
> Next steps:
> - `/cv.story PERS-###` — run a Story Discovery simulation with this persona. This is the recommended next step.
> - `/cv.chronicle` — reference this persona when writing a new chronicle (if skipping simulation)
> - `/cv.persona PERS-###` — return to update as you learn more from research

Output ledger entries:

```
LEDGER ENTRIES — append to ledger.md

[PE-###] Persona created: <name> — <archetype>
  date:   YYYY-MM-DD
  source: persona-build
  actor:  ai
  status: compiled
  tags:   [PERS:identity, PERS:voice, PERS:emotional-defaults, PERS:never-do]
  note:   Research basis: <validated/assumed/partially-validated>
```

If batch-creating via Option D, log all 3 personas.

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
