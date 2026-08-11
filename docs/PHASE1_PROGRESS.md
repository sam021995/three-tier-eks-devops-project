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

**Status:** In progress — Part A done (standalone app + local Docker test)
**PR:** phase1/milestone-2-auth-service

**What we did (Part A):**
Built `services/auth-service` from scratch: Flask app with `/api/auth/register`,
`/api/auth/login` (issues a JWT signed with a shared HS256 secret), and
`/api/auth/verify` (a manual-testing helper — employee-service will verify
tokens itself later using the shared secret, not by calling this endpoint,
per ADR 0001's "no unnecessary service-to-service calls" principle). User
data lives in SQLite rather than MySQL — a genuinely separate data store
from employee-service, per ADR 0001's "no shared database" rule.

**What we achieved / learned:**
Built and ran the image locally, then exercised every path before writing
any deployment manifests: health check, register, login, verify with a
valid token, verify with no token, login with a wrong password, and
registering a duplicate username. All behaved correctly on the first try —
no issues to log this time.

**Part B (next):** Helm chart + Kubernetes manifests, deployed to the dev
cluster standalone (still not wired to employee-service — that's Milestone 3).

---

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
