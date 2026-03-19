# CodeVision Gems — Explore Phase (Web-Based)

These are Google Gemini Gem instruction files that let a PM run the CodeVision Explore phase workflow entirely in a browser — no IDE, no CLI, no dev environment required.

---

## What Are These Gems?

CodeVision is a structured product development framework with an **Explore phase** that happens before any code is written. The Explore phase produces five types of artifacts:

- **Mission** — the product north star and technical constitution
- **Persona** — a behavioral model of a specific user
- **Roleplay** — a simulated user session that surfaces emotional moments and product gaps
- **Chronicle** — the user journey narrative compiled from that simulation
- **Feature Map** — the full scope breakdown of every capability the journey depends on

Normally these are run as slash commands inside an IDE (like Cursor or VS Code) using the CodeVision CLI. These Gems let a PM do the same work from Google Gemini's web interface — then hand the artifacts off to the engineering team when the Explore phase is complete.

---

## How to Set Up a Gem

1. Go to [gemini.google.com](https://gemini.google.com)
2. Open **Settings** (gear icon) → **Gems** → **New Gem**
3. Give the Gem a name (e.g. "CodeVision Init")
4. Open the corresponding `.gem.md` file from this folder, copy the entire contents, and paste it into the **Instructions** field
5. Save the Gem
6. Repeat for each Gem you need

You'll end up with up to 5 Gems, one per command. You don't have to create all of them upfront — create each one as you reach that step in the workflow.

---

## The Workflow: Explore Phase from Start to Finish

The Explore phase follows this sequence:

```
CodeVision Init
      ↓
CodeVision Persona
      ↓
CodeVision Roleplay
      ↓
CodeVision Chronicle
      ↓
CodeVision Discover
```

Each step produces one or more artifact documents and a **Context Pack** — a small text block you copy from one Gem session and paste into the next to carry the project state forward.

### Step 1 — Init
Run the **CodeVision Init** Gem. It walks you through Mission Q&A and Constitution Q&A, then outputs `mission.md` and `constitution.md`. Save these to your notes or a shared Google Doc.

### Step 2 — Persona
Run the **CodeVision Persona** Gem. Paste the Context Pack from Step 1. It builds a `PERS-001.md` document through guided Q&A — a behavioral model of your primary user, including a Voice & Behaviour Profile that powers the simulation in the next step.

### Step 3 — Roleplay
Run the **CodeVision Roleplay** Gem. Paste the Context Pack from Step 2 (and optionally the full PERS-001.md). The AI enters the persona's perspective and you play the product. The simulation surfaces emotional moments, friction points, and product gaps you wouldn't find from a document alone.

### Step 4 — Chronicle
Run the **CodeVision Chronicle** Gem. Paste the Context Pack from Step 3 (which includes the roleplay debrief). It compiles the simulation into a structured `CHR-001.md` — the user journey narrative with trigger, journey steps, emotional arc, success signal, failure path, and features implicated.

### Step 5 — Discover
Run the **CodeVision Discover** Gem. Paste the Context Pack from Step 4 (and the full CHR-001.md). It turns the chronicle into a Feature Map — breadth-first exploration of every feature the journey depends on, with sub-feature breakdown, clarity scores, dependency graph, and recommended build order.

---

## How the Context Pack Works

The Context Pack is a small text block the Gem outputs at the end of each session. It looks like this:

```
---CODEVISION CONTEXT PACK---
project: my-app
mission: We're building MyApp so that busy parents can track their child's health without calling the doctor for every question.
phase: explore
last-command: cv.init
personas:
  - PERS-001: Cami — The Chronic Manager — overwhelmed by fragmented health information
chronicles:
  - CHR-001: "First Symptom Check" (PROPOSED) — features: [FEAT-001, FEAT-002]
roleplay-debrief: "Cami hesitated at onboarding and nearly closed the app when asked for her child's date of birth before seeing any value."
---END CONTEXT PACK---
```

**To use it:** At the start of each new Gem session, when the Gem asks "Do you have a Context Pack?", paste the full block including the `---` delimiters. The Gem will extract the project state and pick up where you left off.

Each Gem adds its own section to the Context Pack before handing off. By the time you reach Discover, the Context Pack contains the full picture of what's been decided.

---

## What You're Producing

By the end of the Explore phase, you'll have:

| File | What It Is |
|------|-----------|
| `mission.md` | North star, problem statement, target users, success signal, non-goals |
| `constitution.md` | Tech stack, project type, design system, architecture rules |
| `PERS-001.md` | Full persona with Voice & Behaviour Profile |
| `CHR-001.md` | User journey narrative with features implicated |
| `map.md` | Feature Map with sub-features, clarity scores, and recommended build order |

These are the inputs the engineering team needs to start building. All artifact formats are fully compatible with the CodeVision CLI — the dev team can pick up exactly where you left off.

---

## Handoff to Engineering

When the Explore phase is complete:

1. Share your Context Pack and all artifact documents (mission.md, constitution.md, PERS-001.md, CHR-001.md, map.md) with the engineering team
2. They'll run `cv init` in their IDE to set up the project structure
3. They'll import your artifacts and continue from there — no re-doing anything, no information loss

The Gems are a testing and planning tool. The CLI is the build tool. They produce the same artifacts, so handoff is seamless.

---

## Tips for Getting the Most Out of the Gems

- **Save your artifact documents as you go.** Copy each output to a Google Doc or Notion page. Don't rely on the Gem's chat history.
- **Save the Context Pack at the end of every session.** It's the only thing carrying state between sessions — if you lose it, you'll need to re-paste the documents manually.
- **The Roleplay step is the most valuable one.** Don't skip it. The simulation surfaces things you won't find in any other step.
- **The Persona's Voice & Behaviour Profile is what makes Roleplay work.** Be specific when the Persona Gem asks about how your user speaks and reacts.
- **You can run multiple Personas, Roleplays, and Chronicles.** The Context Pack supports multiple entries in each section. Just run the Gem again and the new artifact gets added.
