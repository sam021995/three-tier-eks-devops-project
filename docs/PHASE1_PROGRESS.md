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

**Status:** Done
**PR:** phase1/milestone-1-repo-restructure

**What we did:**
Moved `app/backend` → `services/employee-service` (via `git mv`, so history
follows the files), updated `.github/workflows/app-deploy.yml` to build from
the new path, and fixed the README's layout section and workflow filenames
to match reality. No application logic changed — this was purely establishing
the `services/` convention from ADR 0001.

**What we achieved / learned:**
Verified locally with `docker build` + `docker run` from the new path before
pushing, hitting `/api/health` to confirm the moved service actually boots —
not just that the Dockerfile builds. Confirmed `/api/employees` fails locally
as expected (no reachable database), which is a useful failure mode to
recognize rather than mistake for a real bug. This is the local
build-and-run loop we'll repeat before every push from here on.

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
