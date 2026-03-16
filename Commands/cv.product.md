# /cv.product
<!-- cv.product.md | Define and edit the product description document. -->
<!-- product.md lives alongside mission.md and is loaded by every command that produces user-facing artifacts. -->
<!-- Standalone: includes minimum context inline if _core.md is not loaded. -->

---

## What This Command Does

`/cv.product` captures a structured description of the product being built. Unlike `mission.md` — which describes the *why* — `product.md` describes the *what*: what the product is, how it works, what it feels like to use, and what makes it distinct.

This document is loaded automatically by `/cv.chronicle`, `/cv.persona`, `/cv.prd`, and any other command that produces user-facing content. It ensures that chronicles are written in the context of a real product — not an abstract idea — and that AI outputs stay consistent with what is actually being built.

`product.md` lives at:
```
~/.codevision/projects/<slug>/product.md
```

Invocation:
```
/cv.product           ← create or update the product description
/cv.product review    ← read back the current product.md and ask what to update
```

---

## Gate Check

No upstream gate. However:
- `/cv.product` should ideally be run after `/cv.init` (mission defined) and before `/cv.chronicle` (so chronicles have product context).
- If `mission.md` exists, read it before starting — the product description should be consistent with the mission.
- If `product.md` already exists, jump to [Updating an Existing Product Description](#updating-an-existing-product-description).

---

## Step 1 — Source Check

Before asking questions, ask where the product description is coming from. Use the native UI widget if available.

**Question:** "Where should we start?"

```
A) I'll describe it — I have a clear picture in my head
B) I have an existing document or notes to base it on — I'll paste or share it
C) The product is still early — let's define it through Q&A
→ Custom — I'll define it
```

- **Option A or C:** Run the full Q&A from Step 2.
- **Option B:** Accept the input first, extract all signals, then run clarification only on fields that are missing or ambiguous.

---

## Step 2 — Product Q&A

Run one question at a time. Always use the native UI widget if available. If not, follow plain text format rules: question on its own line, blank line, then each option on its own line.

Total questions: **9** (6 blocking, 3 advisory). Show progress on every question.

---

### Q1 — Product Name and Type *(blocking)*

**Question:** "What is the product called, and what kind of product is it?"

```
A) Mobile app (iOS and/or Android)
B) Web application (browser-based)
C) Mobile + web (cross-platform)
D) API or developer tool
→ Custom — I'll define it
```

After the choice, ask: "And the name?"

---

### Q2 — One-Line Description *(blocking)*

**Question:** "How would you describe this product in one sentence to someone who has never heard of it?"

Do not offer options — this should come from the user in their own words. If the answer is too vague (e.g. "it's a health app"), ask: "What specifically does it do for the user, and what makes it different from just searching Google?"

---

### Q3 — Core User Action *(blocking)*

**Question:** "What is the primary thing a user does in this product — the action that is at the centre of every session?"

```
A) Consult — they come with a question or problem and get an answer or recommendation
B) Track — they log or monitor something over time to see patterns or progress
C) Connect — they communicate with someone (a care team, peers, AI)
D) Learn — they read, watch, or explore content to build understanding
→ Custom — it's a combination or something else
```

---

### Q4 — AI Role *(blocking)*

**Question:** "How does AI show up in this product — what does it actually do?"

```
A) Conversational assistant — the AI is the primary interface, like a doctor you can talk to
B) Decision support — the AI works in the background and surfaces recommendations or flags
C) Content generation — the AI produces personalised plans, summaries, or explanations
D) All of the above at different points in the user journey
→ Custom — I'll define it
```

---

### Q5 — Target Platform and Context *(blocking)*

**Question:** "Where and when do users typically engage with this product?"

```
A) Mobile-first, on the go — used in moments of need, often urgently
B) Mobile-first, at home — used as part of a daily routine, not urgently
C) Desktop/web primary — used in planned sessions, likely longer
D) Mixed — different user types engage in different contexts
→ Custom — I'll define it
```

---

### Q6 — Tone and Voice *(blocking)*

**Question:** "If this product were a person, how would you describe their communication style?"

```
A) Warm and plain-spoken — like a trusted friend who happens to know a lot about health
B) Professional and clear — like a good GP: thorough, direct, reassuring without being casual
C) Empowering and motivational — like a coach who believes in what you're capable of
D) Neutral and informational — factual, unobtrusive, lets the user draw their own conclusions
→ Custom — I'll define it
```

---

### Q7 — Key Differentiators *(advisory)*

**Question:** "What makes this product meaningfully different from the closest alternatives a user might already use?"

Accept free-form. If they give more than 3, ask: "Which of these would make a user choose this over the alternative in a direct comparison?"

---

### Q8 — What the Product Does Not Do *(advisory)*

**Question:** "What should this product explicitly not do — either for scope reasons, ethical reasons, or because it would make it worse?"

Frame it: "Non-features are as important as features — they prevent scope creep and keep the product focused."

Accept free-form. If they're unsure, offer prompts: "For example: does it diagnose? Does it replace a doctor? Does it store data indefinitely? Does it give advice without context?"

---

### Q9 — Current Stage *(advisory)*

**Question:** "Where is the product right now?"

```
A) Concept — no code written, still defining what it is
B) Early development — core features being built, not yet live
C) Live — users are actively using it, iterating based on feedback
D) Scaling — established product, expanding to new users or features
→ Custom — I'll define it
```

---

## Step 3 — Pre-Draft Recap

Required before generating. Format:

> "Here's what I'm about to write for **[Product Name]**. Let me know if anything's off."
>
> [2–3 sentences: what it is, who uses it, what the AI does, what it feels like]
>
> "Stage: [concept / early development / live / scaling]"
>
> "Anything to correct?"

---

## Step 4 — Generate Product Document

Output the complete `product.md` as a code block using this schema:

```markdown
# Product — <Product Name>
<!-- product.md | Loaded by /cv.chronicle, /cv.persona, /cv.prd, and any command that produces user-facing content. -->
<!-- Update this file with /cv.product whenever the product definition changes. -->

## Identity

**Name:** <product name>

**Type:** <mobile app / web app / cross-platform / API>

**Stage:** <concept / early development / live / scaling>

**One-line description:** <what it is and what makes it different — one sentence>

---

## What It Does

**Core user action:** <the primary thing a user does in every session>

**AI role:** <what the AI actually does — conversational, decision support, content generation, etc.>

**Key features:** *(high-level, not a full feature list)*
- <Feature or capability 1>
- <Feature or capability 2>
- <Feature or capability 3>

---

## Target Context

**Primary platform:** <mobile-first / desktop-first / mixed>

**Typical usage context:** <when and where users engage — on the go, at home, in planned sessions>

**Target user:** <brief description — link to PERS-### if personas exist>

---

## Tone and Voice

**Voice:** <warm and plain-spoken / professional and clear / empowering / neutral — pick one>

**Communication principles:**
- <Principle 1 — e.g. "Speaks plainly — no medical jargon without explanation">
- <Principle 2 — e.g. "Leads with what the user can control, not what they've lost">
- <Principle 3 — e.g. "Never over-hedges — gives actionable answers, not just referrals">

---

## Differentiators

- <What makes this meaningfully different from the closest alternative>
- <Second differentiator>

---

## What This Product Does Not Do

- <Explicit non-feature or out-of-scope capability>
- <Second non-feature>

---

## Chronicles

| ID | Title | Persona |
|---|---|---|
| CHR-### | <Chronicle title> | PERS-### |

---
_Product by: <author> | Created: YYYY-MM-DD | Last updated: YYYY-MM-DD_
```

---

## Step 5 — Handoff

After the document is generated, say:

> "`product.md` is ready. It will be automatically loaded by `/cv.chronicle`, `/cv.persona`, and `/cv.prd` from now on."
>
> - `/cv.chronicle` — write a user journey grounded in this product
> - `/cv.product review` — update this document as the product evolves

Log the creation:
```
[YYYY-MM-DD] [/cv.product] [project:<slug>] DECISION: product.md created | STAGE: <stage> | VOICE: <voice>
```

---

## Updating an Existing Product Description

If `product.md` already exists when `/cv.product` is invoked:

1. Read it back as a brief summary: name, type, stage, one-liner, voice.
2. Ask: "What's changed — a new feature, a pivot, a tone correction, or something else?"
3. Make targeted edits only. Do not rewrite sections that weren't mentioned.
4. **If chronicles reference this product:** note after saving:
   > "Chronicles that reference this product may need to be reviewed if the core product definition has changed. Run `/cv.clarify CHR-###` to check any that are in draft."
5. Log the update with a brief note on what changed.

---

## How `/cv.chronicle` Uses This Document

When `product.md` is loaded during a chronicle session, it shapes the session in three ways:

1. **Framing questions** — clarification questions reference the product's actual capabilities. If the product does not diagnose, the chronicle should not describe Aiko as diagnosing.
2. **Generated prose** — the chronicle's journey beats and emotional moments use the product's defined voice. A "warm and plain-spoken" product produces different prose than a "professional and clear" one.
3. **Feature identification** — features implicated by the chronicle are checked against what is described in `product.md`. Features that don't exist yet are flagged as `[NEW]` rather than assumed to exist.

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include:

```
<!-- Running in standalone mode. Gate enforcement and ledger writes require _core.md. -->
```

And include inline:
- No upstream gate — but run after `/cv.init` for best results
- Always use native UI widget for multiple choice if available; if not, each option on its own line with a blank line before the first option
- Pre-draft recap required before generating the document
