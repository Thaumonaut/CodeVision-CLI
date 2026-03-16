# CodeVision — Product Vision & Architecture

> *Version 0.1 — Working document. Not a spec.*

---

## What CodeVision Is

CodeVision is a spec-driven development framework that bridges the gap between product planning and engineering implementation. It works for solo developers and cross-functional teams, operates through a CLI, an AI command layer, and a web interface — all sharing the same artifact store.

The core promise: **a feature defined by a PM can be implemented by an AI with a clear, auditable chain of decisions between them.**

---

## The Two Users

### Individual Developer
Uses CodeVision as a disciplined thinking partner. The CLI and AI commands replace ad-hoc notes, scattered tasks, and context-lost conversations. They plan, implement, and validate inside one system without needing a web UI.

### PM + Engineering Team
Uses the web interface for planning and the CLI/AI layer for implementation. PMs never need to learn commands — the web UI guides them through the same workflow. Engineers pull from the same artifact store. Approvals and handoffs happen inside the system.

---

## The Big Flow

```
DISCOVER              DEFINE                 BUILD                 SHIP
─────────────────     ──────────────────     ──────────────────    ──────────
PM writes chronicle   PM writes PRD          Dev writes ERD        AI implements
  (user journey)        (requirements)         (data model)          (with tasks)
                      AI assists/refines     AI generates spec     AI validates
                      Team approves          Tasks generated       Export to IDE
                      ↓                      ↓                     ↓
                      Handoff gate           Dev confirmed ready   Review + merge
```

Every arrow is a gate. The system enforces them. You can't generate a spec without an approved PRD + ERD. You can't implement without approved tasks.

---

## The Three Surfaces

### 1. CLI (`cv`)
File system operator and context loader. Does not reason — executes.

```bash
cv init <slug>                   # create project structure, hand off to AI
cv fetch FEAT-001                # load feature artifacts into AI context
cv import prd FEAT-001 --from gdocs <url>   # convert Google Doc → markdown
cv export prd FEAT-001 --to gdocs           # push markdown → Google Doc
cv lint                          # validate structure, check gates
cv status                        # print project state without AI
cv validate FEAT-001             # run post-implementation checks
```

**CLI owns:** folder creation, file ops, Google Docs sync, git hooks, linting, validation runners.

### 2. AI Command Layer (`/cv.*`)
Reasoning and conversation layer. Invoked inside an AI chat (Claude, Cursor, VS Code extension, etc.).

The AI can call CLI commands as shell tools for repeatable file operations. The CLI loads context. The AI thinks.

**AI owns:** mission Q&A, chronicle definition, PRD authoring/refinement, spec generation, task breakdown, implementation, review, change management.

### 3. Web Interface
The PM surface. Mirrors the AI command layer exactly — same workflow, no commands to remember. Presents each stage as a guided wizard. Supports manual authoring with AI assist on demand.

**Web UI owns:** PM onboarding, chronicle/PRD authoring, approval workflows, team visibility, handoff to engineering.

---

## The Artifact Store

Lives at `~/.codevision/` (local, per machine). Markdown-first. Exportable.

```
~/.codevision/
  config.json                          ← global config, auth tokens, IDE hooks

  projects/
    <slug>/
      mission.md                       ← 3–5 sentence north star, always consulted
      status.json                      ← current phase, active scope, paused state

      chronicles/
        CHR-001.md                     ← user journey narrative, feature refs

      features/
        FEAT-001/
          feature.md                   ← abstraction: goal, scope, chronicle refs
          prd.md                       ← PM-authored requirements
          erd.md                       ← dev-authored data model (from PRD)
          approvals.json               ← who approved what and when

      specs/
        FEAT-001.spec.md               ← AI-generated from PRD + ERD

      tasks/
        FEAT-001.tasks.md              ← ordered, verifiable task list

      ledger/
        decisions.md                   ← structured log of every decision
        changes.md                     ← change records with classification

      contracts/                       ← product, architecture, design, security
      components/
        registry.md
      variables/
        tokens.md
        naming.md
      stakeholders/
        <slug>.md
```

---

## The Approval Model

Approvals are first-class. They live in `approvals.json` per feature:

```json
{
  "prd": {
    "status": "approved",
    "by": "jacob",
    "at": "2025-03-09T14:00:00Z",
    "note": "Approved with minor scope reduction on v2 items"
  },
  "erd": { "status": "pending" },
  "spec": { "status": "draft" }
}
```

`cv lint` reads this and blocks downstream commands if gates aren't met. The web UI surfaces pending approvals as notifications. Individual mode skips team approval but still records self-approval for audit trail.

---

## Google Docs Integration

PMs often have existing PRDs in Google Docs. The CLI handles the bridge:

```bash
cv import prd FEAT-001 --from gdocs <url>   # one-time or watched
cv export prd FEAT-001 --to gdocs           # publish back after AI refinement
```

The AI never touches the sync — it always reads clean local markdown. This keeps token usage predictable and the AI focused on reasoning, not file I/O.

---

## AI Implementation

CodeVision is an all-in-one tool. The AI doesn't just plan — it implements.

The implementation loop:
```
/cv.implement FEAT-001
  → AI reads spec + tasks
  → Implements task by task as FILE blocks
  → /cv.validate runs CLI checks after each task
  → /cv.review verifies against acceptance criteria
  → Results logged to ledger
```

**Validation is separate from review:**
- `cv validate` = automated: tests, lint, type checks, file existence
- `/cv.review` = AI-assisted: does this match the acceptance criteria?

Both are required before a feature is marked done.

**Export to other AI tools** is a CLI operation:
```bash
cv export spec FEAT-001 --format cursor    # Cursor-compatible context file
cv export tasks FEAT-001 --format claude   # Claude Projects document
cv export tasks FEAT-001 --format copilot  # GitHub Copilot workspace
```

The spec and tasks are portable. CodeVision doesn't lock you into one AI.

---

## The Complete Command Set

### CLI Commands
| Command | Purpose |
|---|---|
| `cv init <slug>` | Create folder structure, hand off to /cv.init |
| `cv fetch <artifact>` | Load files into AI context |
| `cv import prd FEAT-### --from gdocs` | Convert Google Doc → markdown |
| `cv export prd FEAT-### --to gdocs` | Push markdown → Google Doc |
| `cv export spec FEAT-### --format <tool>` | Export for other AI tools |
| `cv lint` | Validate structure and gate conditions |
| `cv validate FEAT-###` | Run post-implementation automated checks |
| `cv status` | Print project state |

### AI Commands — Setup
| Command | Purpose |
|---|---|
| `/cv.init` | Mission Q&A after folder creation |
| `/cv.mission` | Update mission if direction changes |

### AI Commands — Product Planning (PM-facing)
| Command | Purpose |
|---|---|
| `/cv.chronicle` | Define a user journey / epic |
| `/cv.feature` | Define feature abstraction, link to chronicles |
| `/cv.prd` | Guided Q&A to author or refine a PRD |

### AI Commands — Work Planning (Dev-facing)
| Command | Purpose |
|---|---|
| `/cv.erd` | Draft ERD from approved PRD |
| `/cv.spec` | Generate spec from approved PRD + ERD |
| `/cv.tasks` | Break spec into ordered, verifiable tasks |
| `/cv.vars` | Update tokens / naming rules |
| `/cv.component` | Define / register a reusable component |

### AI Commands — Execution
| Command | Purpose |
|---|---|
| `/cv.implement` | Work through tasks, output FILE blocks |
| `/cv.review` | Verify implementation against acceptance criteria |
| `/cv.bug` | Narrow fix with minimal scope change |

### AI Commands — Change Management
| Command | Purpose |
|---|---|
| `/cv.change` | Classify and route a change |
| `/cv.replan` | Light spec adjustment from implementation learnings |
| `/cv.respec` | Major spec revision |
| `/cv.pause` | Pause with full context capture |
| `/cv.continue` | Resume deterministically |
| `/cv.status` | Rehydrate and summarize current state |
| `/cv.phase` | Navigate between phases |
| `/cv.invite` | Codify a stakeholder perspective |

---

## Team vs Individual Mode

The system adapts based on `config.json`:

```json
{
  "mode": "team",           // or "individual"
  "approvals_required": ["prd", "spec"],
  "roles": {
    "jacob": ["pm", "dev"]
  }
}
```

**Individual mode:**
- Approvals auto-self-sign
- No notification layer
- Web UI optional
- Simpler status output

**Team mode:**
- Approval gates enforced
- Web UI surfaces pending reviews
- Ledger entries include actor
- Roles determine which commands are surfaced in web UI

The CLI and AI command set is identical in both modes. Only enforcement and visibility differ.

---

## The Web Interface — PM Journey

The web UI is not a dashboard — it's a guided workflow. A PM opens it and sees:

```
Your projects → Active chronicles → Features needing attention
```

Each feature has a clear state: Draft / In Review / Approved / In Progress / Done.

The PM authoring flow (no commands):
1. **New chronicle** → AI asks 4 guided questions → draft created → PM edits inline
2. **New feature** → PM describes it → AI generates feature.md + draft PRD structure
3. **Refine PRD** → PM writes, AI assists on demand ("help me add edge cases")
4. **Approve** → one-click or request teammate review
5. **Handoff** → system notifies dev that FEAT-### is ready for ERD

The web UI writes to the same `~/.codevision/` store (or a cloud-synced equivalent for teams). Engineers see the same artifacts in their CLI. There is no translation layer.

---

## What Makes This Different

| | CodeVision | Traycer | Linear/Jira |
|---|---|---|---|
| PM + dev in one tool | ✓ | Partial | ✗ |
| AI implements, not just plans | ✓ | ✓ | ✗ |
| Portable artifacts (markdown) | ✓ | ✗ | ✗ |
| Export to other AI tools | ✓ | ✗ | ✗ |
| Google Docs sync | ✓ | ✗ | Partial |
| Gate-enforced handoffs | ✓ | Partial | Manual |
| Works solo + team | ✓ | Team | Both |
| Token-efficient (CLI loads context) | ✓ | ✗ | N/A |

---

## Open Questions (Parking Lot)

- Cloud sync strategy for team mode (git repo vs dedicated backend vs Dropbox)
- Web UI hosting (self-hosted, SaaS, or both)
- Authentication model for team approvals
- VS Code / Cursor extension scope (read-only context loader vs full command surface)
- Pricing model if SaaS (individual free, team paid?)

---

*Next step: rewrite command files starting with `/cv.init`, `/cv.chronicle`, `/cv.feature`, `/cv.prd`*
