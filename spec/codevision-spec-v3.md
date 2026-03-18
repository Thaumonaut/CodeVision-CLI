# CodeVision — Master Specification v3
**Version:** 3.0.0-draft  
**Status:** DRAFT  
**Data format policy:** TOON-first for structured data with dual-read migration compatibility during v2 to v3 transition

> This document is the authoritative specification for CodeVision v3.  
> Where this document conflicts with prior specs, this document wins.

---

## Section 00 — Overview and Philosophy

### 0.1 Purpose
[empty]

### 0.2 Core Promise
[empty]

### 0.3 Zoom-In Mental Model
[empty]

### 0.4 Documents as Compiled Understanding
[empty]

### 0.5 Stalagmite and Crystal Duality
[empty]

### 0.6 Solo and Team Philosophy
[empty]

---

## Section 01 — Lifecycle Model

### 1.1 Canonical Lifecycle
Explore → Define → Specify → Task → Build → Surface → Prove

### 1.2 Phase Definitions
#### 1.2.1 Explore
[empty]

#### 1.2.2 Define
[empty]

#### 1.2.3 Specify
[empty]

#### 1.2.4 Task
[empty]

#### 1.2.5 Build
[empty]

#### 1.2.6 Surface
[empty]

#### 1.2.7 Prove
[empty]

### 1.3 Phase Leads and Authority
[empty]

### 1.4 Phase Outputs and Required Artifacts
[empty]

---

## Section 02 — Phase Transitions and Rewind

### 2.1 Transition Trigger Model
AI-proposed, human-confirmed transition contract.

### 2.2 Forward Preconditions by Phase
[empty]

### 2.3 Backward Transition Rules
[empty]

### 2.4 Rewind Tier Classification
Tier 1 implementation-local  
Tier 2 spec-contract revision  
Tier 3 discovery assumption failure

### 2.5 Ghost Work Prevention
Unlinked branch and artifact linkage enforcement.
[empty]

### 2.6 Unaffected Work Continuation Rules
[empty]

---

## Section 03 — System Surfaces and Boundaries

### 3.1 CLI Surface
#### 3.1.1 Responsibilities
[empty]
#### 3.1.2 Prohibited Reasoning Scope
[empty]

### 3.2 AI Command Surface
#### 3.2.1 Responsibilities
[empty]
#### 3.2.2 Prohibited Authority Scope
[empty]

### 3.3 Web Surface
#### 3.3.1 Responsibilities
[empty]
#### 3.3.2 MVP Scope Boundary
M7 and later by policy.
[empty]

### 3.4 Shared Artifact Store
Single source of truth across all surfaces.
[empty]

---

## Section 04 — Team Mode and Individual Mode

### 4.1 Role Model
PM owns Explore and Define  
Engineering owns Specify through Build  
Shared accountability in Surface and Prove

### 4.2 Handoff Gate
[empty]

### 4.3 Escalation Path
[empty]

### 4.4 Individual Mode Collapse Rules
[empty]

### 4.5 Approval and Accountability Boundaries
[empty]

---

## Section 05 — AI Role and Behavioral Contract

### 5.1 Explore Role
Facilitator, not form filler.
[empty]

### 5.2 Define Role
Compiler, not author.
[empty]

### 5.3 Specify and Task Role
Generator, not decision maker.
[empty]

### 5.4 Build Role
Implementer with junior engineer behavior model.
[empty]

### 5.5 Surface Role
Classifier, not scope changer.
[empty]

### 5.6 Prove Role
Evidence-driven reviewer.
[empty]

### 5.7 Next-Step Guidance Mandate
AI must propose next valid action after each phase output.
[empty]

### 5.8 Conservative Default Behavior
Slow down, ask, escalate.
[empty]

---

## Section 06 — Token Efficiency and Context Loading

### 6.1 Brief-First Context Model
One-call default using `.brief`.
[empty]

### 6.2 Named Section Fetching
`cv fetch <feature> <document:section>`
[empty]

### 6.3 Signal Block Contract
[empty]

### 6.4 CLI Precompute and AI Read-Time Model
[empty]

### 6.5 Command Context Policy Table
[empty]

---

## Section 07 — Artifact Taxonomy and Ownership

### 7.1 Canonical Artifact Classes
Ledger, Persona, Chronicle, Feature Map, PRD+, UIRD+, ERD+, AC, SFS-v2, ADR, Brief
[empty]

### 7.2 Authorship Policy by Artifact Slot
Human-authored, AI-compiled, CLI-derived.
[empty]

### 7.3 Locking Model
Draft, lock-ready, locked, reopened.
[empty]

### 7.4 Append-Only Files
[empty]

### 7.5 Derived Files and Regeneration Rules
[empty]

---

## Section 08 — Schemas and Templates Index

### 8.1 Schema Pack Index
[empty]

### 8.2 Template Pack Index
[empty]

### 8.3 Required vs Optional Slot Policy
[empty]

### 8.4 Signal Block vs Full Context Policy
[empty]

---

## Section 09 — Command Taxonomy and Contracts

### 9.1 Lifecycle Command Matrix
[empty]

### 9.2 Continuity and Change Commands
[empty]

### 9.3 Command Preconditions and Output Guarantees
[empty]

### 9.4 Deprecated and Aliased Commands
[empty]

---

## Section 10 — CLI Contracts

### 10.1 Core Commands
`init`, `init-feature`, `fetch`, `status`, `lint`

### 10.2 Ledger Operations
`ledger add`, `ledger tag`, `ledger status`

### 10.3 Validation
`validate`, `validate --brief`

### 10.4 Import and Export
[empty]

### 10.5 Deterministic Regeneration Triggers
[empty]

---

## Section 11 — Migration Model v2 to v3

### 11.1 Compatibility Policy
Dual-read transition, v3-write target.
[empty]

### 11.2 Artifact Migration Map
[empty]

### 11.3 TOON and JSON Interop Policy
TOON-first with compatibility adapters where required.
[empty]

### 11.4 Command Compatibility and Deprecation Schedule
[empty]

### 11.5 Safety and Rollback Policy
[empty]

---

## Section 12 — Gates and Milestones

### 12.1 Milestone Matrix M1 through M8
[empty]

### 12.2 Gate Pass Conditions
[empty]

### 12.3 Gate Failure and Rewind Triggers
[empty]

### 12.4 Fixture and Regression Requirements
[empty]

---

## Section 13 — Governance Preserved from v2

### 13.1 Git Branch Model
To be preserved from v2 with light update.
[empty]

### 13.2 Approval Model and Schema
To be preserved from v2 with v3 naming normalization.
[empty]

### 13.3 Stop Signal Contract
To be preserved from v2.
[empty]

### 13.4 CVVAL Rules and Severity Model
To be preserved and expanded.
[empty]

### 13.5 Waiver Schema and Blocker Semantics
To be preserved with v3 compatibility notes.
[empty]

---

## Appendix A — Open Questions
[empty]

## Appendix B — Examples and Worked Flows
[empty]

## Appendix C — Glossary
[empty]