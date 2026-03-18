# /cv.init
<!-- cv.init.md | Bootstraps a new CodeVision project. -->
<!-- Produces: mission.md, constitution.md, status.json, config.json, and folder structure. -->
<!-- No upstream gate. Everything else depends on this running first. -->

---

## What This Command Does

`/cv.init` turns a project idea into a CodeVision project with a defined north star and technical constitution. It runs two Q&A sessions:

1. **Mission Q&A** — captures what the product is, who it's for, what success looks like, and what it explicitly is not
2. **Constitution Q&A** — captures tech stack, project type, build commands, design system, and architecture non-negotiables

The constitution is critical — it tells the Validation Agent how to compile and run the app, and it tells every AI command what constraints to respect when generating code.

**Produces:**
- `mission.md` — the product north star, loaded by every command
- `constitution.md` — tech stack, build commands, design system, architecture rules
- `status.json` — initial project state (CLI-managed from here on)
- `config.json` — project mode and team configuration

---

## Invocation

```
/cv.init         ← run after cv init <slug> creates the folder structure
/cv.init <slug>  ← creates folder structure and runs init in one step
```

---

## Step 0 — Folder Structure

Determine the project slug. If not provided, ask:
> "What's the slug for this project? Lowercase, hyphens, no spaces. (e.g. `my-app`, `aiko-health`)"

Check whether `~/.codevision/projects/<slug>/` exists.

If not, output these commands and ask the user to run them (or run directly if shell tools are available):

```bash
mkdir -p ~/.codevision/projects/<slug>/{personas,chronicles,features,adrs,components,contracts}
mkdir -p ~/.codevision/projects/<slug>/ledger
touch ~/.codevision/projects/<slug>/ledger/ledger.md
touch ~/.codevision/projects/<slug>/components/registry.md
echo '{"state":"init","phase":"explore","active_feature":null,"validation_blocked":false}' \
  > ~/.codevision/projects/<slug>/status.json
echo "Project '<slug>' initialized at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

After confirming the folders exist, proceed immediately to Step 1.

---

## Step 1 — Check for Existing Mission

If `mission.md` already exists: read it and ask:
> "A mission already exists — do you want to update it, or start fresh? You can also leave it as-is and run `/cv.mission` to change it later."

If it does not exist: proceed to Step 2.

---

## Step 2 — Mission Warmup

> "Let's define your project's north star. This gets loaded by every command, so the clearer it is, the better the AI can stay on track. Don't worry about getting it perfect — you can update it anytime with `/cv.mission`.
>
> In your own words: what is this project and who is it for?"

Listen carefully. Extract any concrete signals (user type, problem, constraints). Reference what they said in every subsequent question — do not make them repeat themselves.

---

## Step 3 — Mission Q&A

**One question per turn. Stop after each question and wait.**

### Q1 — North Star (blocking)
> "How would you complete this: 'We're building [product] so that [user] can [outcome]'?"

Offer 3 reformulations of their warmup answer as options, plus `→ Custom — I'll write it`.

### Q2 — Problem Statement (blocking)
> "What specific problem does this solve, and why does it matter now?"

Options frame different urgency or problem types. Offer at least one option grounded in what they said in the warmup.

### Q3 — Target Users (blocking)
> "Who is the primary user — specifically?"

Don't accept "everyone." If the answer is vague, offer 3 concrete segmentations of what they described.

### Q4 — Success Signal (blocking)
> "How will you know in 6 months this worked? What does good look like?"

Options frame success as: usage metric / business outcome / qualitative signal / user story.

### Q5 — Non-Goals (advisory)
> "What is explicitly out of scope? What might people assume this does, but it won't — at least not yet?"

Frame it first: "Non-goals prevent scope creep and keep the AI from proposing things you don't want."

---

## Step 4 — Constitution Q&A

After mission fields are captured, transition:
> "Now let's define the technical constitution — the rules and constraints every AI command will follow when writing code. This also tells the Validation Agent how to build and run your app."

**One question per turn. Stop after each question and wait.**

### C1 — Project Type (blocking)
> "What kind of project is this?"

```
→ Web app — browser-based, any framework
→ Mobile — iOS and/or Android
→ Web + Mobile — shared codebase or separate
→ API / backend only — no UI
→ Custom — I'll describe it
```

### C2 — Tech Stack (blocking)

Ask based on the answer to C1.

**If web:**
> "What's your frontend framework?"
```
→ React / Next.js
→ Vue / Nuxt
→ Svelte / SvelteKit
→ Angular
→ Custom — I'll describe it
```
Then ask: "And your backend / API layer?"
```
→ Next.js API routes (same repo)
→ Node.js / Express / Fastify
→ Python / FastAPI / Django
→ Supabase / Firebase (BaaS)
→ Custom — I'll describe it
```

**If mobile:**
> "What's your mobile stack?"
```
→ React Native (Expo)
→ React Native (bare)
→ Flutter
→ Swift (iOS native)
→ Kotlin (Android native)
→ Custom — I'll describe it
```

**If web + mobile:**
Ask both sub-questions above.

Then ask: "What's your database?"
```
→ PostgreSQL
→ MySQL / MariaDB
→ Supabase (Postgres-hosted)
→ Firebase Firestore
→ SQLite (mobile-local)
→ Custom — I'll describe it
```

### C3 — Build and Run Commands (blocking)
> "What commands build and run your project locally? These are what the Validation Agent uses to compile and start the app before verifying behavior."

Present likely defaults based on their stack, ask to confirm or adjust:
```
Build: [inferred from stack — e.g. "npm run build"]
Run:   [inferred — e.g. "npm run dev"]
Test:  [inferred — e.g. "npm test"]
```
> "Are these correct, or do you use different commands?"

### C4 — Design System (advisory)
> "Do you have a component library or design system to use?"

```
→ Tailwind CSS (utility-first, no component library)
→ shadcn/ui (Tailwind + Radix)
→ Material UI (MUI)
→ Native Base / Gluestack (React Native)
→ Custom design system — I'll describe it
→ None yet — skip for now
```

### C5 — Architecture Non-Negotiables (advisory)
> "Any rules the AI must always follow when writing code? These become hard constraints — the AI will not violate them."

Common examples:
```
→ Always use TypeScript strict mode
→ Never use class components (React)
→ All API calls go through a service layer, never directly from components
→ Follow feature-folder structure (not type-folder)
→ Custom — I'll list them
→ None yet — I'll add them later with /cv.mission
```

Accept multiple selections. These become the Non-Negotiables section of `constitution.md`.

---

## Step 5 — Mode and Sync

### Mode (blocking)
> "Are you working solo or with a team?"

```
→ Solo — approvals are self-signed, no notifications
→ Small team (2–4) — approval gates, light overhead
→ Larger team — separate PM and engineering tracks, formal handoffs
```

### Sync (advisory)
> "How do you want to back up and share your CodeVision artifacts?"

```
→ Git only — I'll manage my own remote
→ File sync — Dropbox, iCloud, or S3
→ Skip for now — set up later
```

---

## Step 6 — Pre-Write Recap

> "Here's what I'm about to write. Confirm before I generate the files."

Show:
- Mission fields (5) as they'll appear in `mission.md`
- Constitution summary: project type, stack, build/run commands, design system, non-negotiables
- Config: mode, sync

Wait for confirmation.

---

## Step 7 — Generate Files

Output all files as code blocks.

### `mission.md`

```markdown
# Mission — <slug>

## North Star
<one sentence>

## Problem Statement
<2–3 sentences>

## Target Users
<specific description>

## Success Signal
<how you'll know it worked>

## Non-Goals
<what this explicitly does not do>

---
_Last updated: YYYY-MM-DD via /cv.init_
```

### `constitution.md`

```markdown
# Constitution — <slug>
<!-- cv-artifact: constitution -->
<!-- Read by: Validation Agent (build/run commands), all AI commands (stack + non-negotiables) -->

## Project Type
<web | mobile-ios | mobile-android | mobile-cross-platform | api>

## Tech Stack
**Frontend:** <framework>
**Backend:** <framework / runtime>
**Database:** <database>
**Mobile:** <React Native / Flutter / Swift / Kotlin — if applicable>

## Build & Run
**Build:** <command>
**Run:**   <command>
**Test:**  <command>

## Design System
<component library, CSS approach, tokens>

## Architecture Principles
<one non-negotiable per line>

## Non-Negotiables
<rules the AI must never violate when writing code>

---
_Last updated: YYYY-MM-DD via /cv.init_
```

### `config.json`

```json
{
  "project": "<slug>",
  "mode": "individual | team",
  "sync": "git | file | none",
  "team": [
    { "slug": "<member>", "roles": ["pm", "dev"] }
  ],
  "created_at": "YYYY-MM-DDTHH:MM:SSZ",
  "codevision_version": "3.0.0"
}
```

### `status.json`

```json
{
  "state": "active",
  "phase": "explore",
  "active_feature": null,
  "validation_blocked": false,
  "last_command": "/cv.init",
  "last_updated": "YYYY-MM-DDTHH:MM:SSZ"
}
```

---

## Step 8 — Handoff

> "Project `<slug>` is initialized. Next steps:
>
> - `/cv.persona` — build your first persona (recommended before the first chronicle)
> - `/cv.chronicle` — define your first user journey if you already know the persona
> - `/cv.mission` — update the mission at any time without re-running init"

Output ledger entry:

```
LEDGER ENTRIES — append to ledger/ledger.md

[PE-001] Project initialized: <slug>
  date:   YYYY-MM-DD
  source: cli
  actor:  <config.json → author>
  status: decided
  tags:   []
  note:   Mode: <mode>. Stack: <stack summary>. Build: <build command>.
```

> The `actor` field uses the display name set during `cv init` (read from `config.json → author`). Always use this value for human-authored entries — never write "pm" literally.

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded:

```
<!-- Running in standalone mode. /cv.init has no upstream gates — standalone mode is fully functional. -->
```

Proceed normally. Include the full folder structure commands in Step 0 regardless.
