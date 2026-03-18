# Exploration Ledger
<!-- cv-artifact: ledger -->
<!-- cv-scope: [project | feature | sub-feature] -->
<!-- cv-feature: [FEAT-### | project] -->
<!-- append-only: true — entries are never deleted, only updated -->

---

## About This Ledger

This file is the source of truth during the Explore phase.
Every decision, insight, assumption, and open question from every
conversation is captured here before any document is written.

The AI writes to this file. Humans do not edit entries directly.
To contest or update an entry, use /cv.rewind or /cv.surface.

Documents are compiled FROM this ledger during Define.
The ledger always exists. Documents are its crystallized output.

---

## Entry Format

```
[PE-###] <content>
  date:    YYYY-MM-DD
  source:  persona-build | story-discovery | feature-discovery |
           details | surface | rewind | escalation
  session: <session description or command that produced this>
  actor:   <who provided this — pm / engineer / persona-sim / ai>
  status:  decided | open | assumed | deferred | contested | compiled
  tags:    [DOCUMENT_TYPE:SECTION:SLOT, ...]
  related: [PE-###, ...]
  note:    <optional — why this matters, context, or risk>
```

Tag format reference:
  PRD:signal:goal
  PRD:signal:scope
  PRD:signal:out-of-scope
  PRD:signal:constraints
  PRD:full:problem-statement
  PRD:full:scenarios
  PRD:full:edge-cases
  PRD:full:open-questions
  UIRD:signal:screens
  UIRD:signal:component-manifest
  UIRD:signal:state-list
  UIRD:full:flows
  UIRD:full:states
  UIRD:full:interactions
  ERD:signal:entities
  ERD:signal:relationships
  ERD:signal:constraints
  ERD:signal:migration-impact
  ERD:full:validation-rules
  ERD:full:lifecycle
  CHR:trigger
  CHR:journey
  CHR:emotional-moment
  CHR:success-signal
  CHR:failure-path
  CHR:features-implicated
  CHR:open-questions
  PERS:identity
  PERS:voice
  PERS:emotional-defaults
  PERS:situation-response
  PERS:never-do
  AC:criterion
  ADR:decision
  MAP:sub-feature
  MAP:dependency
  MAP:risk
  CONST:principle
  CONST:constraint

---

## Entries

<!-- New entries are appended below this line -->
<!-- Format: most recent at the bottom (append-only) -->

