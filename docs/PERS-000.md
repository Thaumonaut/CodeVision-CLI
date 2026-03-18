# Persona [PERS-###] — [Name] — [Archetype]
<!-- cv-artifact: persona -->
<!-- cv-compiled-from: ledger tags PERS:* -->
<!-- cv-persona: enforce -->
<!--
  The cv-persona: enforce annotation tells any AI command that loads
  this file to flag story beats, reactions, or dialogue that are
  inconsistent with the Voice & Behaviour Profile section.
-->

**Status:** draft | review | locked
**Research basis:** unvalidated | partially-validated | validated
**Author:** [name]
**Created:** YYYY-MM-DD
**Last updated:** YYYY-MM-DD

---

## Signal Block
<!-- cv-section: signal -->
<!--
  Loaded by cv fetch personas/PERS-### by default.
  Keep this section under 200 words.
-->

```
archetype:      [one-word label, e.g. "Chronic-Cami", "Anxious-Marcus"]
age:            [number]
location:       [city, country]
primary-pain:   [one sentence — the single most important pain point]
primary-goal:   [one sentence — what success looks like for them]
behavioral-summary: [one sentence — how they make decisions and respond to stress]
chronicles:     [CHR-### — Title, CHR-### — Title]
research-basis: [unvalidated | partially-validated | validated]
```

---

## Full Profile
<!-- cv-section: full -->

### Identity
<!-- cv-slot: identity -->

| Field | Value |
|-------|-------|
| Name / Archetype | [Name — Archetype-Label] |
| Age | [age] |
| Date of Birth | [YYYY-MM-DD] |
| Gender | [gender] |
| Location | [city, country] |
| Life situation | [2–3 sentences about daily life, responsibilities, pressures] |

---

### Domain Context
<!-- cv-slot: domain-context -->
<!--
  Product-specific health, financial, professional, or other
  domain context relevant to how this persona uses the product.
-->

[Describe relevant domain context here — medical history, financial
situation, professional context, etc. depending on the product.]

---

### Tech Profile
<!-- cv-slot: tech-profile -->

| Field | Value |
|-------|-------|
| Tech comfort | Low / Medium / High |
| Primary apps | [apps they use daily] |
| Health / domain info sources | [where they get information] |
| Relevant behaviors | [workarounds, habits, patterns] |

---

### Pain Points
<!-- cv-slot: pain-points -->
<!--
  Numbered. Each one should be specific enough that a product feature
  could directly address it. Not generic ("wants better health") but
  specific ("runs out of medication because she restocks reactively").
-->

1. **[Pain point title]** — [specific description of the problem and
   when/how it manifests]

2. **[Pain point title]** — [specific description]

3. **[Pain point title]** — [specific description]

---

### Motivations & Goals
<!-- cv-slot: motivations -->

**What they want:**
[What success looks like for this person — not feature-level but
life-level. What does "this product works" feel like to them?]

**What success looks like:**
[Concrete, behavioral — what are they doing differently when the
product is working well for them?]

**What they fear:**
[Specific fears about using the product or about their situation
that the product must not trigger]

---

### Quote
<!-- cv-slot: quote -->

> "[Direct quote in their voice that captures their primary
>  motivation or pain. Should sound exactly like them.]"

---

## Voice & Behaviour Profile
<!-- cv-section: voice -->
<!--
  This section is the behavioral model used during Story Discovery
  simulation. The AI loads this section when playing this persona.
  Every sub-section should be specific enough to constrain behavior,
  not just descriptive.
-->

### How They Speak
<!-- cv-slot: voice-speech -->
<!--
  Describe linguistic patterns, vocabulary level, sentence structure,
  filler phrases, how they express uncertainty, how they express
  enthusiasm. Specific enough that AI-generated dialogue in their
  voice would be recognizable.
-->

- [Describe tone and register]
- [Describe vocabulary — clinical vs informal, technical vs lay terms]
- [Describe sentence structure — long/short, trailing off, etc.]
- [List characteristic phrases or patterns if relevant]
- [Describe how they contextualize things — through family, work, etc.]

### Emotional Defaults
<!-- cv-slot: emotional-defaults -->

| State | Behavior |
|-------|----------|
| Base state | [How they present when things are normal] |
| Under stress | [First response to stress — avoidance, practicality, panic?] |
| When scared | [How fear manifests — quiet, chatty, dismissive?] |
| When reassured | [How they respond to good news or calming information] |
| When overwhelmed | [What they do when there's too much information] |
| When resistant | [How they push back without being confrontational] |

### Decision-Making Patterns
<!-- cv-slot: decision-patterns -->
<!--
  These should be predictive — if you know these patterns, you can
  predict how this persona will respond to a product decision.
-->

- [Who/what they trust — people over information? Experience over data?]
- [What factors matter — cost, convenience, social proof, authority?]
- [How they respond to "just do this one thing" framing]
- [What makes them procrastinate vs act immediately]
- [Who they consult before making a health/financial/key decision]

### Situation-Specific Responses
<!-- cv-slot: situation-responses -->
<!--
  Key product moments where the persona's behavior is critical.
  These are the moments most likely to make or break the experience.
  Each situation should reference a moment in one of their Chronicles.
-->

**When [key product moment 1]:**
[Specific behavioral description — what they say, what they do,
what they don't say, what they do next. Specific enough to simulate.]

**When [key product moment 2]:**
[Specific behavioral description]

**When [key product moment 3]:**
[Specific behavioral description]

**When the product suggests something they didn't expect:**
[Specific behavioral description]

**When the conversation gets too complex or technical:**
[Specific behavioral description]

### What [Name] Would Never Do
<!-- cv-slot: never-do -->
<!--
  Negative constraints are as important as positive ones.
  These prevent the AI from producing in-character behavior that
  would actually be out of character.
-->

- [Thing they would never say or do — with brief reason why]
- [Thing they would never say or do]
- [Thing they would never say or do]
- [Thing they would never say or do]

---

## Research Notes
<!-- cv-section: research -->

| Claim | Validation Status | Source / Method |
|-------|-------------------|-----------------|
| [specific claim about this persona] | validated / assumed / to-validate | [how it was validated or why it's assumed] |
| [specific claim] | validated / assumed / to-validate | [source] |
| [specific claim] | validated / assumed / to-validate | [source] |

**Still to validate:**
- [specific thing that needs user research]
- [specific thing that needs user research]

---

## Chronicles Featuring This Persona
<!-- cv-section: chronicles -->

| ID | Title | Story State |
|----|-------|-------------|
| CHR-### | [Title] | PROPOSED / CURRENT / ASPIRATIONAL |

---

## Ledger References
<!-- cv-section: ledger-refs -->
<!--
  Entries from the Exploration Ledger that informed this persona.
  Populated automatically by cv.compile.
-->

[PE-### through PE-###] — Persona Building session YYYY-MM-DD

---

*Persona template v1.0 — CodeVision v3*
*Compiled by: [author] | Status: [status]*
