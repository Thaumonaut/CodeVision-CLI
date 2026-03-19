# CodeVision CLI

**Spec-driven development for AI-assisted software engineering.**

CodeVision bridges the gap between product understanding and engineering implementation. It gives AI tools like Claude, Cursor, and Copilot a structured workflow — so they stay on track, remember decisions, and build what you actually meant.

---

## How It Works

Most AI-assisted development fails because plans are implicit, state lives in conversation memory, and "done" means "it runs" instead of "it matches the intent." CodeVision fixes this with a seven-phase lifecycle:

```
EXPLORE → DEFINE → SPECIFY → TASK → BUILD → TRIAGE → PROVE
```

Every phase has a defined owner, a specific AI role, and explicit completion conditions. State lives in files — not in chat memory — so any session can be resumed deterministically. The AI facilitates, compiles, generates, and builds. You make every decision.

---

## Requirements

- Node.js v18 or higher
- An AI tool (Claude, Cursor, Copilot, Windsurf, or similar)

---

## Installation

```sh
curl -fsSL https://raw.githubusercontent.com/Thaumonaut/CodeVision-CLI/refs/heads/main/install.sh | sh
```

This downloads the CLI, installs dependencies, registers the `cv` command, and downloads all AI command files. If CodeVision is already installed, it upgrades to the latest version instead.

**Manually updating:**

```sh
cv upgrade
```

---

## Quick Start

**1. Create a project folder and run setup:**

```sh
mkdir my-app && cd my-app
cv init
```

This scaffolds the artifact store and installs CodeVision commands into your AI tool's command directory.

**2. Run `/cv.init` inside your AI tool:**

```
/cv.init
```

This walks you through defining your project's mission and technical constitution — the north star and constraints that every subsequent AI command will follow.

**3. Build your first persona:**

```
/cv.persona
```

**4. Then follow the lifecycle:**

```
/cv.roleplay    → simulate the user experience
/cv.chronicle   → capture the user journey
/cv.discover    → map the features needed
/cv.define      → go deep on each sub-feature
/cv.write       → compile PRD, UIRD, ERD, and AC documents
/cv.approve     → lock documents before specifying
/cv.spec        → generate the technical spec
/cv.tasks       → break the spec into a task list
/cv.build       → implement with checkpoint validation
```

At any point: `/cv.status` to check where you are, `/cv.continue` to resume after a break.

---

## Commands

### Flow Commands
Phase-gated. The AI always proposes the next one — you rarely need to remember them.

| Command | Phase | What it does |
|---|---|---|
| `/cv.init` | Explore | Define mission and technical constitution |
| `/cv.persona` | Explore | Build a user persona |
| `/cv.roleplay` | Explore | Simulate the user experience in persona mode |
| `/cv.chronicle` | Explore | Capture the user journey as a Chronicle |
| `/cv.discover` | Explore | Map features from a Chronicle (breadth-first) |
| `/cv.define` | Define | Go deep on a sub-feature (depth-first Q&A) |
| `/cv.write` | Define | Compile PRD, UIRD, ERD, and AC from the ledger |
| `/cv.reconcile` | Define | Resolve UIRD/ERD conflicts |
| `/cv.approve` | Define | Lock documents before spec generation |
| `/cv.spec` | Specify | Generate technical spec from locked documents |
| `/cv.tasks` | Task | Break spec into ordered, verifiable tasks |
| `/cv.build` | Build | Implement tasks with checkpoint validation |
| `/cv.validate` | Prove | Run automated checks (tests, lint, type-check) |

### Ambient Commands
Available at any point — triggered by need, not sequence.

| Command | What it does |
|---|---|
| `/cv.status` | Show current phase, document states, and next action |
| `/cv.continue` | Resume after a break or new session |
| `/cv.research` | Gather knowledge and deposit findings to the artifact store |
| `/cv.clarify` | Resolve open questions in any artifact |
| `/cv.triage` | Classify and route a gap found during build |
| `/cv.debug` | Fix a scoped bug with explicit constraints |
| `/cv.help` | Show all commands and what each one does |

---

## Supported AI Tools

CodeVision installs its command files into whichever AI tool you use:

| Tool | Command directory |
|---|---|
| Claude Code | `.claude/commands/codevision/` |
| Cursor | `.cursor/rules/codevision/` |
| Windsurf | `.windsurf/rules/codevision/` |
| RooCode | `.roo/rules/codevision/` |
| KiloCode | `.kilocode/rules/codevision/` |
| GitHub Copilot | `.github/copilot-instructions.md` (appended) |
| ChatGPT Codex | `AGENTS.md` (appended) |

Select your tool(s) during `cv init`. To add a tool later, re-run `cv init --force`.

---

## CLI Reference

```sh
cv init [name]         # Setup wizard — scaffolds project, installs command files
cv fetch [slug]        # Show which artifact files to load into AI context
cv status [slug]       # Print current project state
cv lint [slug]         # Validate structure and check for blocks
cv upgrade             # Update CLI and command files from GitHub
cv upgrade --check     # Check if an update is available
```

---

## How State Works

CodeVision stores all artifacts in `.cv/` inside your project (or `~/.codevision/projects/<slug>/` if you prefer to keep them outside the repo). Every AI command reads from these files — never from chat memory. You can close a conversation, switch tools, or come back days later and run `/cv.continue` to pick up exactly where you left off.

---

## License

MIT
