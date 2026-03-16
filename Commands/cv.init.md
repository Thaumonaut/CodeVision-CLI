# /cv.init
<!-- cv.init.md | Invoked after `cv init <slug>` creates the folder structure. -->
<!-- Leads the user through mission definition and writes mission.md + config.toon. -->
<!-- Standalone: includes minimum context inline if _core.md is not loaded. -->

---

## What This Command Does

`/cv.init` turns a project idea into a CodeVision project with a defined north star. It handles its own setup — you do not need to run the CLI first. It detects whether the folder structure exists and creates it if not.

It runs a structured Q&A session to capture the mission, then writes:

- `mission.md` — the north star document, loaded by every other command
- `config.toon` — project configuration (mode, team members, sync tier)

This is the only command that does not require any upstream artifacts. Everything else in CodeVision depends on the mission being defined.

---

> **Note on the CLI:** Running `cv init <slug>` before invoking this command creates the folder structure in advance and is the preferred path when the CLI is available. If it hasn't been run, this command creates the structure itself. Both paths produce identical results.

---

## Step 0 — Detect and Create Folder Structure

Before anything else, determine the project slug and check whether the folder structure exists.

**If the user hasn't provided a slug yet**, ask:
> "What's the slug for this project? This becomes the folder name and project identifier — lowercase, hyphens, no spaces. (e.g. `aiko-health`, `cosplans`, `my-app`)"

**Once you have the slug**, check whether `~/.codevision/projects/<slug>/` exists.

- **If the folder exists:** note it and proceed to Step 1.
- **If the folder does not exist:** say:
  > "The project folder doesn't exist yet. I'll create it now — this is equivalent to running `cv init <slug>`."

  Then output the following shell commands as a code block and ask the user to run them, OR if you have shell tool access, run them directly:

  ```bash
  mkdir -p ~/.codevision/projects/<slug>/{chronicles,features,specs,tasks,ledger,components,variables,stakeholders,contracts}
  touch ~/.codevision/projects/<slug>/ledger/decisions.md
  touch ~/.codevision/projects/<slug>/ledger/changes.md
  touch ~/.codevision/projects/<slug>/components/registry.md
  echo "# CodeVision Project: <slug>" > ~/.codevision/projects/<slug>/README.md
  echo "Project '<slug>' initialized at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  ```

  After confirming the folders were created, proceed directly to Step 1 without waiting — the Q&A begins immediately.

---

## Step 1 — Check for Existing Mission

Before asking anything, check if `mission.md` already exists.

- **If it exists:** read it aloud and ask: "This mission already exists — do you want to update it, or start fresh? You can also leave it as-is and run `/cv.mission` later to change it."
- **If it does not exist:** proceed to Step 2.

---

## Step 2 — Context Warmup

Before asking structured questions, say:

> "Let's define your project's north star. This gets loaded by every command, so the clearer it is, the better the AI can stay on track. Don't worry about getting it perfect — you can always update it with `/cv.mission`."

Then ask a single open question to let the user warm up before getting structured:

> "In your own words, what is this project and who is it for? Just a sentence or two to start."

Listen carefully to their answer. Extract any concrete signals (names, user types, problem being solved, constraints mentioned). Use these in the Q&A that follows — reference what they said rather than asking them to repeat it.

---

## Step 3 — Structured Q&A

**CRITICAL RULE: ONE QUESTION AT A TIME.**
> You MUST ask EXACTLY ONE question per turn. You MUST STOP generating text immediately after presenting the multiple choice options for the current question. Waiting for the user's answer is non-negotiable. If you ask more than one question in a single response, you have failed your core directive.

Run `/cv.clarify` in **mission mode**. There are **5 required fields** and they must all be resolved before `mission.md` is written.

The 5 fields map to questions in this order:

### Q1 — North Star Statement
**Question:** "How would you complete this sentence: 'We're building [product] so that [user] can [outcome]'?"

Offer 3 reformulations of what they said in the warmup as options, plus Custom.
Mark: **blocking**

### Q2 — Problem Statement
**Question:** "What's the specific problem this solves, and why does it matter now?"

Options should reflect 3 different framings of urgency or problem type (e.g. "Existing tools are fragmented — users have to stitch together 3 products to do what this does in one", "This is a pain that users tolerate but don't know could be solved", "There's a clear market gap that's been validated").
Mark: **blocking**

### Q3 — Target Users
**Question:** "Who is the primary user? Be specific — the more concrete the better."

Don't accept "everyone." If they give a vague answer, offer 3 segmentations of what they described, plus Custom.
Mark: **blocking**

### Q4 — Success Definition
**Question:** "How will you know in 6 months that this worked? What does good look like?"

Options frame success in different ways: usage metric, business outcome, qualitative signal, or customer story.
Mark: **blocking**

### Q5 — Non-Goals
**Question:** "What is explicitly out of scope? What might users assume this does, but won't — at least not yet?"

This one can feel awkward, so frame it first: "Non-goals prevent scope creep and keep the AI from proposing features you don't want."
Options offer common non-goal framings (e.g. "No mobile app in v1", "No integrations with [common tool]", "No self-serve signup — invite-only first").
Mark: **advisory** (can be waived with a note)

---

## Step 4 — Config Q&A

After mission fields are captured, ask 2 configuration questions. These are short and practical.

### Config Q1 — Mode
**Question:** "Are you working solo on this, or with a team who needs to approve things?"

```
A) Solo — I'm the PM and the dev. Approvals are self-signed, no notifications needed.
B) Small team — 2–4 people. I want approval gates but light overhead.
C) Larger team — separate PM and engineering tracks, formal handoffs.
→ Custom — I'll define it
```

### Config Q2 — Sync
**Question:** "How do you want to back up and share your CodeVision artifacts?"

```
A) Git only — I'll manage my own remote. Free, no dependencies.
B) File sync — Dropbox, iCloud, or S3. I manage the provider.
C) Skip for now — I'll set this up later with `cv sync --setup`.
→ Custom — I'll define it
```

---

## Step 5 — Pre-Write Recap

Before writing any files, produce a recap paragraph:

> "Here's what I'm about to write into your mission. Let me know if anything is off before I generate the files."

Then render the 5 mission fields as a preview in the exact format they'll appear in `mission.md`. Wait for confirmation.

---

## Step 6 — Generate Files

After confirmation, output both files as code blocks for the user to apply.

### `mission.md`

```markdown
# Mission — <project-slug>

## North Star
<one sentence>

## Problem Statement
<2–3 sentences>

## Target Users
<specific description>

## Success Definition
<how you'll know it worked>

## Non-Goals
<what this explicitly does not do, at least in v1>

---
_Last updated: YYYY-MM-DD via /cv.init_
```

### `config.toon`

```
project: <slug>
mode: individual | team
sync_tier: git | file | none
team
  <member-slug>
    roles: [pm, dev]
created_at: YYYY-MM-DDTHH:MM:SSZ
codevision_version: 2.1.1
```

---

## Step 7 — Handoff

After files are generated, say:

> "Your project is initialized. Next steps:"
>
> - `cv fetch <slug>` — loads your artifacts into AI context before any command
> - `/cv.chronicle` — define your first user journey
> - `/cv.mission` — update the mission at any time without running init again

Log the initialization to `ledger/decisions.md`:
```
[YYYY-MM-DD] [/cv.init] [project:<slug>] DECISION: Project initialized | MODE: <mode> | SYNC: <sync_tier>
```

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include this note at the top of your first response:

```
<!-- Running in standalone mode. Gate enforcement and ledger writes require _core.md. -->
```

Then proceed normally. `/cv.init` has no upstream gates, so standalone mode has no functional difference here.
