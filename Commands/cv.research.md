# /cv.research
<!-- cv.research.md | Gather knowledge and deposit findings to the artifact store. -->
<!-- Three modes: --deep (autonomous web research), --quick (conversational clarification), AI-initiated (automatic pre-generation). -->
<!-- Produces: RB-### Research Brief. Deposits implications to ledger tagged for downstream document slots. -->

---

## What This Command Does

`/cv.research` gathers knowledge at any point in the lifecycle and deposits findings where they belong. It is not a phase — it is a capability. Research can happen before Persona Building, during Feature Discovery, before generating a spec, or any time a gap in understanding is blocking good decisions.

**Three modes:**

- **`--deep`** — Autonomous multi-step research. The AI independently synthesizes sources and produces a structured Research Brief. Takes longer. Use when the team needs substantive domain understanding before making decisions.
- **`--quick`** — Conversational clarification. The AI answers questions and helps you think through an unfamiliar area. Fast, low-overhead. Use when you need to understand something before writing a document.
- **AI-initiated** — The AI automatically runs targeted research before certain generation commands. The user does not invoke this. The AI always announces what it checked and what it found.

**What research is not:**
- A way to defer decisions. Research produces inputs; the user makes the decisions.
- A replacement for `/cv.spike`. Research answers "what do we know." Spikes answer "is this technically feasible."
- Invisible. The AI never silently incorporates research findings. Everything found is surfaced and logged.

---

## Invocation

```
/cv.research --deep "topic"              ← autonomous multi-step research
/cv.research --quick "topic"             ← conversational clarification
/cv.research "topic"                     ← defaults to --quick
/cv.research --deep "topic" FEAT-###     ← scoped to a specific feature
/cv.research --deep "topic" PERS-###     ← scoped to a persona
```

---

## Mode 1 — Deep Research (`--deep`)

### Step 1 — Confirm Scope and Time-Box

Before starting, confirm the scope and surface what's already known:

> "I'll research [topic] — autonomously searching and synthesizing across multiple sources. This usually takes a few minutes.
>
> Before I start: is there anything you already know about this that I should treat as established? And is there a specific angle that matters most for [current phase context]?"

Wait for the user's answer. Note any constraints they give.

Then confirm the time-box:
> "Default time-box is unconstrained — I'll go until I have enough to give you a useful picture. Tell me if you want me to stay shallow and fast instead."

### Step 2 — Announce Intent

State what you're about to check and why, before running:

> "I'll be looking for:
> - [Category 1] — because [relevance to current work]
> - [Category 2] — because [relevance]
> - [Category 3] — because [relevance]
>
> Starting now..."

### Step 3 — Synthesize and Surface Findings

After research completes, present findings by category. For each finding:
- State it specifically (not vaguely: "there are challenges" → "studies show 40% of T2D patients in Southeast Asia use feature phones, not smartphones")
- Cite the source
- State confidence level: **high** / **medium** / **low**

> "Here's what I found:
>
> **[Category — e.g. User Behavior]**
>
> [F-001] [Finding — specific and concrete]
> Source: [URL or description]
> Confidence: high | medium | low
>
> [F-002] [Finding]
> Source: [source]
> Confidence: medium
> *Note: sourced from industry report, not primary research — treat as indicator.*
>
> ..."

### Step 4 — Surface Implications

After findings, state implications for the current work:

> "What this means for [feature / persona / document]:
>
> - [F-001] → [Specific implication for a document slot, e.g. 'the Persona needs a feature phone behavioral path — PERS:situation-response']
> - [F-002] → [Implication — e.g. 'the ERD needs an offline-first data sync model — ERD:signal:constraints']
> - [F-003] → conflicts with a decision already made: [what was decided, where]. I'll flag this."

If any finding conflicts with a locked document, stop immediately and route as a Surface event:
> "⚠️ Finding [F-###] conflicts with [document name] — [what was decided]. This needs resolution before I can proceed. Treating this as a Tier [1/2/3] Surface gap."

Then follow the Surface routing rules for that tier.

### Step 5 — Surface Open Questions

State what research didn't answer:

> "Things this research raised but didn't resolve:
> - [Question — what would answer it]
> - [Question]
>
> These will become the first questions in the next relevant session."

### Step 6 — Produce Research Brief

Output the complete `RB-###.md` as a code block:

```markdown
# Research Brief RB-### — [Topic]
<!-- cv-artifact: research-brief -->

id:           RB-###
date:         YYYY-MM-DD
mode:         deep
initiated-by: <config.json → author>
scope:        project | FEAT-### | PERS-### | [phase context]
topic:        [one sentence]
status:       complete

---

## Findings

### [Category]

[F-001] [Finding — specific, not vague]
Source: [URL | "interview batch 2" | "AI knowledge — unverified"]
Confidence: high | medium | low

[F-002] [Finding]
Source: [source]
Confidence: medium

---

## Implications
<!-- Each implication is deposited as a ledger entry. -->

[F-001] → [Implication — what this means for the project]
Ledger: PE-### (deposited with tags: [RESEARCH:implication, PERS:behavioral-defaults])

[F-002] → [Implication]
Ledger: PE-###

---

## Conflicts With Existing Artifacts
<!-- Populated when research contradicts a locked document. -->
<!-- Treated as a Surface event — classified and routed before proceeding. -->

- [What was found] vs [what was decided in locked document]
  Surface tier: [1/2/3] — [routing recommendation]

---

## Open Questions
<!-- Things the research raised but didn't answer. -->
<!-- Become first questions in the next relevant session. -->

- [Question — routes to /cv.persona, /cv.discover, /cv.define, etc.]
```

Instruct the user:
> "Save this as `research/RB-###.md` (project-scoped) or `features/FEAT-###/research/RB-###.md` (feature-scoped)."

---

## Mode 2 — Quick Research (`--quick`)

Quick mode is conversational. The AI answers questions, explains concepts, and helps the user build enough understanding to proceed — without autonomous web crawling.

### Step 1 — Understand the Need

> "What specifically do you need to understand, and what are you trying to decide with it?"

This scopes the conversation. A vague "tell me about PDF parsing" becomes "I need to understand PDF parsing well enough to write the ERD for the blood work upload feature."

### Step 2 — Explain and Respond

Answer questions in the context of the user's actual work. When explaining something technical to a PM, use concrete examples. When explaining something product-related to an engineer, reference the spec context.

Ask follow-up questions:
> "Does that make sense in the context of [their specific problem]?"
> "Does that change anything about how you were thinking about [document slot]?"

Continue until the user has what they need. Don't declare the session finished — let the user indicate they're ready to proceed.

### Step 3 — Summarize What Was Established

When the user is done, produce a compact Research Brief:

> "Here's what we established. I'll log this as RB-###."

The brief for `--quick` mode is shorter — skip the Findings format, just record what was clarified and what it means:

```markdown
# Research Brief RB-### — [Topic]
<!-- cv-artifact: research-brief -->

id:           RB-###
date:         YYYY-MM-DD
mode:         quick
initiated-by: <config.json → author>
scope:        [context]
topic:        [one sentence]
status:       complete

---

## What Was Clarified

[Summary of the key things established in plain language — 3–6 bullet points]

---

## Implications

[Implication → what it means for the next step]
Ledger: PE-### (deposited with tags: [relevant document slot tags])

---

## Open Questions

- [Anything that came up but wasn't resolved]
```

---

## Mode 3 — AI-Initiated Research

The AI runs targeted research automatically before certain generation commands. It does not ask permission — but it always announces what it checked before proceeding.

### Policy by Command

| Command | What the AI checks automatically |
|---------|----------------------------------|
| `/cv.spec` | Current library recommendations for the project's stack; regulatory requirements relevant to the feature domain; known implementation gotchas for the approach in the ERD |
| `/cv.write` (ERD) | Current schema patterns for the data shape; migration safety for the project's ORM; relevant compliance data model requirements |
| `/cv.write` (UIRD) | Current WCAG requirements for the component types in the manifest; known accessibility patterns for the interaction model |
| `/cv.tasks` | Current testing approach for the frameworks in use; known CI/CD considerations |
| `/cv.build` (checkpoint) | No automatic research — only on explicit `/cv.research` |

### Announcement Format

The AI always announces before generating:

> "Before generating, I'm checking [N] things that affect this output:
>
> - [What and why — e.g. 'Current PDF parsing library support for React Native — the ERD implies a specific approach']
> - [What and why]
>
> [checks run — typically fast]
>
> Found: [summary of what was found]
>
> [If nothing significant] Nothing that changes the approach. Proceeding.
>
> [If something significant] Found something worth flagging before I generate: [specific finding and implication]. [Route accordingly — Surface if it conflicts with locked document, otherwise deposit to ledger and note it inline in the generated output]"

### Conflict Routing

If AI-initiated research finds a conflict with a locked document (CVVAL-017):

> "⚠️ Research found a conflict with a locked document before I could generate.
>
> **Found:** [finding]
> **Conflicts with:** [document name] — [what was decided, and when]
>
> I can't generate until this is resolved. This is a Tier [1/2/3] Surface gap.
> Run `/cv.triage` to classify and route it, or tell me how you want to handle it."

Do not silently incorporate conflicting findings into the generated output.

---

## Confidence Levels

Apply to every finding in a Research Brief:

**High** — sourced from peer-reviewed literature, official documentation, regulatory text, or directly validated user research. Safe to use as a basis for product decisions.

**Medium** — sourced from reputable secondary sources, industry reports, or partially validated research. Treat as a strong indicator, not a definitive fact. Validate before making irreversible decisions.

**Low** — sourced from AI general knowledge (unverified), anecdotal reports, or sources with unclear methodology. Treat as an assumption that needs validation. Do not make irreversible product decisions based on low-confidence findings alone.

When citing AI general knowledge, always note it explicitly:
> *"Source: AI knowledge — unverified. Treat as Low confidence until confirmed against authoritative source."*

---

## Ledger Integration

Research findings that have implications for downstream documents must be deposited to the ledger. Use dual tags — the `RESEARCH:*` tag plus the target document slot:

```
LEDGER ENTRIES — append to [scope]/ledger.md

[PE-###] <Finding that has a downstream implication>
  date:    YYYY-MM-DD
  source:  research
  actor:   ai
  status:  decided | assumed | open
  tags:    [RESEARCH:implication, PERS:behavioral-defaults]
  related: [RB-###]
  note:    Source: [citation]. Confidence: high | medium | low.

[PE-###] <Open question raised by research>
  date:    YYYY-MM-DD
  source:  research
  actor:   ai
  status:  open
  tags:    [RESEARCH:open-question, PRD:signal:scope]
  related: [RB-###]
  note:    To be resolved before [document] can be compiled.
```

**Research ledger tags:**

```
RESEARCH:finding:competitive      RESEARCH:finding:domain
RESEARCH:finding:user-needs       RESEARCH:finding:technical
RESEARCH:finding:process          RESEARCH:finding:regulatory
RESEARCH:implication              RESEARCH:conflict
RESEARCH:open-question
```

Implication entries always carry dual tags so they flow into the correct document slots during Define compilation.

---

## Validation Codes

```
CVVAL-016  More than 50% of Persona behavioral claims are sourced from
           low-confidence or unverified research findings.
           Severity: warning — does not block, flags for validation

CVVAL-017  AI-initiated research found a conflict with a locked document.
           Severity: blocking — must resolve via /cv.triage before generation proceeds
```

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded:

```
<!-- Running in standalone mode. /cv.research is fully functional in standalone. -->
```

Include inline:
- `--deep` announces intent before running, synthesizes by category, states confidence per finding
- `--quick` is conversational — continues until the user is ready to proceed
- AI-initiated always announces findings before generating; conflicts with locked documents route as Surface events before generation proceeds
- Every finding with a downstream implication gets a ledger entry with dual tags
- Never silently incorporate research findings into generated output
