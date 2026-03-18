# /cv.approve
<!-- cv.approve.md | Review and approve Define documents. Gates /cv.spec. -->
<!-- Run after /cv.write produces drafts and /cv.reconcile resolves any conflicts. -->

---

## What This Command Does

`/cv.approve` is the human gate between Define and Specify. The PM or lead reviews each compiled document — PRD, UIRD, ERD, AC — confirms it matches intent, and approves it. Only when all four documents are approved does `/cv.spec` become available.

This is not a rubber-stamp. Each document is presented for real review. The user can approve, request revisions, or deny. Denied or revised documents route back to `/cv.define` or `/cv.reconcile` — they do not silently become "approved enough."

**Gate:** All four documents must exist in Draft status (produced by `/cv.write`). Any detected UIRD/ERD conflicts must be resolved via `/cv.reconcile` first.

---

## Invocation

```
/cv.approve FEAT-###/MB-##          ← review and approve all four documents
/cv.approve FEAT-###/MB-## prd      ← review and approve a single document
```

---

## Step 1 — Gate Check

Before presenting any document:

1. Check that all four documents exist: `prd.md`, `uird.md`, `erd.md`, `ac.md`
2. Check `approvals.json` for current state — skip any already approved
3. Check `.brief` conflict block for unresolved UIRD/ERD conflicts

If any document is missing:
```xml
<stop_signal>
  <gate>approve</gate>
  <reason>FEAT-###/MB-## is missing [document]. Run /cv.write to compile all four documents before approving.</reason>
  <action>Run /cv.write FEAT-###/MB-##</action>
</stop_signal>
```

If UIRD/ERD conflicts are unresolved:
```xml
<stop_signal>
  <gate>approve</gate>
  <reason>FEAT-###/MB-## has [N] unresolved conflict(s) between UIRD and ERD. Approving conflicting documents locks in contradictions.</reason>
  <action>Run /cv.reconcile FEAT-###/MB-## to resolve conflicts first.</action>
</stop_signal>
```

---

## Step 2 — Present Documents for Review

Review documents in order: PRD → UIRD → ERD → AC.

For each document not yet approved:

### 2a — Signal Block Review

Present the Signal Block first:

> "**PRD — Signal Block**
>
> ```yaml
> [Signal Block content from prd.md]
> ```
>
> This is the machine-readable contract for the spec generator. Does this accurately capture what we defined?
>
> → **Approve Signal Block** — looks correct, proceed to full document
> → **Revise** — [describe what's wrong]
> → **Reject** — this document needs to go back to /cv.define"

If the Signal Block is revised: update it inline, deposit the change as a ledger entry, re-present.

### 2b — Full Document Review

After the Signal Block is confirmed, present the full document:

> "**PRD — Full Document**
>
> [Full document content]
>
> Ready to approve this document?
>
> → **Approve** — PRD is locked
> → **Minor revision** — [describe] — I'll update and re-present
> → **Return to /cv.define** — [specific slot or question that needs more work"

### 2c — On Approve

Record approval:

```json
// Update to approvals.json
{
  "prd": {
    "status": "approved",
    "by": "[actor from session context or 'user']",
    "at": "YYYY-MM-DDTHH:MM:SSZ",
    "note": null
  }
}
```

Deposit a ledger entry:
```
[PE-###] PRD approved for FEAT-###/MB-##
  date:   YYYY-MM-DD
  source: define
  actor:  <config.json → author>
  status: decided
  tags:   [PRD:signal:goal]
  note:   Approved at /cv.approve. Spec generation unblocked when all four docs approved.
```

### 2d — On Rejection or Revision Request

If the user rejects a document or requests substantial revision:

> "PRD returned to draft. What needs to change?
>
> → [Describe the specific problem]
>
> I'll note this and route you to `/cv.define FEAT-###/MB-## --resume` to address it. The approval session can resume once the revision is complete."

Deposit the rejection as a ledger entry:
```
[PE-###] PRD returned to draft: FEAT-###/MB-##
  date:   YYYY-MM-DD
  source: define
  actor:  <config.json → author>
  status: open
  tags:   [PRD:signal:goal]
  note:   Rejected at /cv.approve. Reason: [user's description]. Run /cv.define to resolve.
```

Do not continue to the next document. End the session and route to `/cv.define`.

---

## Step 3 — AC Special Review

Acceptance Criteria gets a more focused review because these criteria become the exact verification targets for the Validation Agent.

For each criterion, ask:

> "**AC-### — [Title]**
>
> ```
> Given: [precondition]
> When:  [action]
> Then:  [expected outcome]
> Verify: [automated | manual | ai-review]
> ```
>
> Two questions:
> 1. Is this criterion testable by the Validation Agent in a running app? If not, it needs a more specific 'Then' statement.
> 2. Is the 'Then' outcome observable — something you can see in the UI or measure — or is it implementation-internal?
>
> → **Approve** — criterion is specific and observable
> → **Revise 'Then'** — the outcome is too vague to verify behaviorally
> → **Remove** — this criterion is covered by another AC"

Flag any criterion whose `Then:` cannot be verified by the Validation Agent:
> "This criterion may be difficult to verify behaviorally: '[Then statement]'. The Validation Agent verifies by interacting with a running app — if the outcome isn't visible in the UI, it can't confirm it. Consider revising to an observable outcome."

---

## Step 4 — Full Approval Check

After all four documents are approved:

> "All four documents are approved for FEAT-###/MB-##.
>
> | Document | Status | Approved by | At |
> |----------|--------|-------------|-----|
> | PRD      | ✓ approved | [actor] | [time] |
> | UIRD     | ✓ approved | [actor] | [time] |
> | ERD      | ✓ approved | [actor] | [time] |
> | AC       | ✓ approved | [actor] | [time] |
>
> `/cv.spec` is now unblocked for FEAT-###/MB-##."

Trigger `.brief` regeneration:

```
.BRIEF UPDATE — write to features/FEAT-###/MB-##/.brief

## Document Status
| Document | Status  | Approved by |
|----------|---------|-------------|
| PRD      | approved | [actor]    |
| UIRD     | approved | [actor]    |
| ERD      | approved | [actor]    |
| AC       | approved | [actor]    |
| Spec     | pending  | —          |
| Tasks    | pending  | —          |

[Updated Signal Blocks from approved documents]
```

---

## Step 5 — Handoff

> "Next steps:
> - `/cv.spec FEAT-###/MB-##` — generate the technical spec from these approved documents
> - `/cv.approve FEAT-###/MB-## [doc]` — re-approve a specific document if revision is needed later
> - `/cv.rewind FEAT-###/MB-##` — if a fundamental assumption needs to be revisited"

Output final ledger entries:

```
LEDGER ENTRIES — append to features/FEAT-###/ledger.md

[PE-###] All Define documents approved: FEAT-###/MB-##
  date:   YYYY-MM-DD
  source: define
  actor:  <config.json → author>
  status: decided
  tags:   [PRD:signal:goal, UIRD:signal:screens, ERD:signal:entities, AC:criterion]
  note:   /cv.spec is now unblocked.
```

---

## Partial Approval State

If only some documents are approved when the session ends:

```json
{
  "prd":  { "status": "approved", "by": "jacob", "at": "..." },
  "uird": { "status": "approved", "by": "jacob", "at": "..." },
  "erd":  { "status": "draft",    "by": null,    "at": null  },
  "ac":   { "status": "draft",    "by": null,    "at": null  }
}
```

> "PRD and UIRD are approved. ERD and AC are still in draft. `/cv.spec` will remain blocked until all four are approved. Resume with `/cv.approve FEAT-###/MB-##` when ready."

---

## Standalone Mode Bootstrap

If `_core.md` is not loaded, include:

```
<!-- Running in standalone mode. approvals.json write requires CLI. -->
```

And include inline:
- Gate: all four documents must exist in draft status
- UIRD/ERD conflicts must be resolved before approval
- Signal Block review required before full document review
- AC criteria must be observable by the Validation Agent (behavioral, not implementation-internal)
- Partial approval is valid — /cv.spec gates on all four
