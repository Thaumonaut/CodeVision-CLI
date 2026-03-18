# /cv.roleplay
<!-- cv.roleplay.md | Story Discovery simulation. AI enters persona mode; user plays the product. -->
<!-- The most important source of authentic user behavior before any document is written. -->
<!-- Run after /cv.persona, before /cv.chronicle. -->

---

## What This Command Does

`/cv.roleplay` runs a Story Discovery simulation. The AI enters the persona's perspective — thinking, speaking, and reacting as that user would. You play the product (or describe what the product does). What emerges — the friction, the surprises, the moments where the persona hesitates or pushes back — becomes the raw material for `/cv.chronicle`.

This is not a Q&A or a form-fill. It is a simulation. The persona will do things you didn't predict. That's the point.

**Use it when:**
- You have a Persona (PERS-###) and want to understand how they would actually experience the product
- You want to pressure-test the product flow before committing to a Chronicle
- You want to find the emotional moments and product gaps that documentation alone would miss

**Gate:** Requires a Persona (PERS-###) to exist. Run `/cv.persona` first.

---

## Invocation

```
/cv.roleplay PERS-###            ← start a simulation with a specific persona
/cv.roleplay PERS-### CHR-###    ← simulate a specific chronicle scenario
```

---

## Step 1 — Load Persona

Read the specified `PERS-###.md`. Focus on the Voice & Behaviour Profile:

- How they speak — tone, vocabulary, sentence structure, characteristic phrases
- Emotional defaults — especially what they do under stress, when scared, when overwhelmed
- Decision-making patterns — what makes them act vs procrastinate, who they trust
- Situation-specific responses — how they react to unexpected suggestions, complexity
- What they would never do

Hold all of this before entering simulation mode. Do not summarize it back to the user — just absorb it and enter character.

---

## Step 2 — Set the Scene

Ask the user to set up the simulation:

> "I'm going to be **[Name]** — [one-sentence archetype from the Signal Block].
>
> To start the simulation, tell me:
> 1. What's happening in [Name]'s life right now that's bringing them to the product?
> 2. What product moment are we simulating — first open, a specific feature, a crisis moment?
>
> Then describe what the product shows them, and I'll respond as [Name]."

If the user already loaded a CHR-### scenario, extract the trigger from that document and pre-fill the scene:
> "I'll use the trigger from CHR-###: [trigger description]. [Name] is about to [first action in the journey]. What does the product show them?"

---

## Step 3 — Simulation Mode

Enter persona mode. For every exchange:

**As the persona:**
- Respond exactly as this person would — in their voice, at their tech comfort level, with their emotional state
- React to what the product showed them — not what the ideal user would do, but what this person would actually do
- Be willing to hesitate, misunderstand, or do something unexpected if the persona would
- Do not be helpful in ways this persona wouldn't be — if they'd close the app in confusion, say so

**Format each response as:**

```
[Name]: "[In-character response — what they say, type, or do]"
```

Followed optionally by a stage direction if the action isn't obvious:
```
*[Name] taps the back button without reading the second screen.*
```

---

## Step 4 — Annotation Mode (optional, on request)

At any point, the user can ask you to "step out" and annotate what just happened:

> "Stepping out of character for a moment:
>
> **Why [Name] did that:** [explanation grounded in the Voice & Behaviour Profile]
>
> **Product gap surfaced:** [what the product would need to handle this better]
>
> **Ledger note:** [PE-### entry to deposit]
>
> Back in character when you're ready."

The user can also type **"annotate"** or **"why"** to trigger this at any moment.

---

## Step 5 — Key Moment Surfacing

As the simulation runs, track high-stakes moments in the background — moments where:

- The persona hesitates, backtracks, or closes
- The persona misunderstands something in a way a real user might
- The persona reacts emotionally in a way the product should account for
- The persona does something that reveals a product gap or assumption

Surface these naturally via annotation, not by interrupting the simulation.

After every 3–5 exchanges (or at a natural pause), you may offer:
> "Want to annotate what just happened, or keep going?"

---

## Step 6 — End the Simulation

The user ends the simulation by saying "end", "that's enough", or similar. Or offer a natural pause:

> "[Name] has reached a natural stopping point. Want to end here, or take the simulation further [into a specific next moment]?"

---

## Step 7 — Debrief and Chronicle Seed

After the simulation ends, step fully out of character and produce a debrief:

> "---
> Out of character — debrief for CHR-### seed
>
> **What happened:**
> [2–3 sentence narrative of the simulation — what [Name] did, how they felt, what the outcome was]
>
> **Key emotional moments:**
> | Moment | Emotion | Product implication |
> |--------|---------|---------------------|
> | [moment] | [emotion] | [what this means for the product] |
>
> **Product gaps surfaced:**
> - [Specific gap — what the product did or didn't do that caused friction]
>
> **Unexpected behaviors:**
> - [Moment where [Name] did something the simulation didn't predict]
>
> **Assumptions exposed:**
> - [Thing the simulation treated as given that turned out to be fragile]
>
> **Suggested Chronicle trigger:**
> [One sentence — what brought [Name] to this moment. Based on the simulation.]
>
> **Suggested emotional arc:**
> [e.g. anxiety → confusion → partial resolution → lingering doubt]"

---

## Step 8 — Handoff

> "This simulation is ready to become a Chronicle. Next steps:
>
> - `/cv.chronicle` — compile the Chronicle from this simulation. Load this debrief as context.
> - `/cv.roleplay PERS-### CHR-###` — run another simulation pass to explore a different scenario or go deeper on a gap
> - `/cv.persona PERS-###` — update the persona with anything the simulation revealed

Output ledger entries:

```
LEDGER ENTRIES — append to ledger.md

[PE-###] Story Discovery simulation completed: PERS-### — <name>
  date:   YYYY-MM-DD
  source: roleplay
  actor:  persona-sim
  status: compiled
  tags:   [CHR:trigger, CHR:journey, CHR:emotional-moment]
  note:   <one-sentence summary of what the simulation revealed>

[PE-###] Product gap surfaced during simulation: <gap title>
  date:   YYYY-MM-DD
  source: roleplay
  actor:  persona-sim
  status: open
  tags:   [CHR:failure-path, FEAT:gap]
  note:   <what the gap is and what it implies>
```

Deposit one entry per key moment, gap, or assumption surfaced.

---

## Simulation Rules

These rules are non-negotiable while in persona mode:

1. **Stay in character.** Do not break character to be helpful unless the user asks you to annotate.
2. **React authentically.** If the persona would be confused, be confused. If they'd close the app, say so.
3. **Use their voice.** Vocabulary, tone, and sentence structure must match the Voice & Behaviour Profile.
4. **Never do what they'd never do.** The "would never do" section in the persona is a hard constraint.
5. **Surprise is good.** If the persona does something unexpected, that's the simulation working.
6. **One exchange at a time.** Respond to what the product showed. Don't anticipate future steps.

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include:

```
<!-- Running in standalone mode. Ledger writes require _core.md. -->
```

And include inline:
- Gate: requires PERS-###.md with a Voice & Behaviour Profile section
- Simulation rules (numbered, above) must be followed regardless of whether _core.md is loaded
- Debrief and Chronicle seed required before exiting simulation mode
