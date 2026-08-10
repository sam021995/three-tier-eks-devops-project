# Phase 1 Progress Log

Tracks what was done and learned at each milestone of the microservices
migration (see [ADR 0001](adr/0001-phase1-microservices.md) for the overall
plan). One entry per milestone, updated as each is completed and merged.

---

## Milestone 0 — Design (ADR)

**Status:** Done
**PR:** phase1/milestone-0-adr

**What we did:**
Wrote [ADR 0001](adr/0001-phase1-microservices.md) defining the Phase 1
service boundaries (employee-service, auth-service, notification-service,
api-gateway), who owns what data, how services are allowed to talk to each
other, and the repo layout convention going forward.

**What we achieved / learned:**
A written decision record to build against, instead of figuring out
boundaries as we go. The key rule that came out of it: no service touches
another service's database, ever — that's the rule that actually forces
independence rather than a monolith split across folders.

---

## Milestone 1 — Repo restructure

**Status:** Not started

---

## Milestone 2 — Auth Service (new)

**Status:** Not started

---

## Milestone 3 — Wire Employee Service → Auth

**Status:** Not started

---

## Milestone 4 — API Gateway

**Status:** Not started

---

## Milestone 5 — Event bus infra

**Status:** Not started

---

## Milestone 6 — Employee Service publishes events

**Status:** Not started

---

## Milestone 7 — Notification Service (new)

**Status:** Not started

---

## Milestone 8 — Observability pass

**Status:** Not started

---

## Milestone 9 — Per-service CI/CD

**Status:** Not started
