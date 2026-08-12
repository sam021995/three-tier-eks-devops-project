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

**Part B (deferred):** Helm chart + Kubernetes manifests. Deliberately
reordered to happen *after* Milestone 3 instead of right after Part A — see
note below. When picked back up, it will be written by hand rather than
generated, since writing the chart is itself the learning goal.

**Reordering note:** after testing Part A purely through Postman/curl, there
was no visible change at `http://localhost:3000` — which is expected (no
frontend work happened in Part A) but not obviously so if you're only
watching the browser. Doing Milestone 3 first gets a real, visible result
(an actual login page) before spending more time on infrastructure work
that, on its own, still produces nothing visible in the browser.

---

## Milestone 3 — Wire Employee Service → Auth

**Status:** Done
**PR:** phase1/milestone-3-wire-auth

**What we did:**
- `employee-service` now verifies JWTs itself via a shared `JWT_SECRET`
  (no network call to auth-service) - added `@require_auth` to all five
  `/api/employees*` routes, both reads and writes (reads were originally
  left public per the ADR, then deliberately widened to also require auth
  after discussion - see decision below).
- Frontend: added `AuthContext` + `LoginPage`, wired `api.js` to attach
  `Authorization: Bearer <token>` automatically when a token exists, and
  added a `ProtectedRoute` wrapper so every page except `/login` redirects
  there if not logged in.
- Local dev: replaced the single-target CRA `proxy` field with
  `setupProxy.js`, since the frontend now needs to reach two backend
  services instead of one.

**Decision: protect reads too, not just writes.** The original plan (and
first implementation) only gated writes, matching the ADR. After testing,
the page still showed data with no login at all - correct per that plan,
but not what was actually wanted. Widened `@require_auth` to the GET
routes too, so the API itself - not just the frontend page - requires a
valid token.

**Issues hit (see full details in the Issues Log):**
1. `react-hooks/exhaustive-deps` build failure after adding an auth guard
   inside a `useEffect` - fixed with `useCallback` and reordering the
   function declaration.
2. Frontend proxy silently 404'd on every API call - Express's
   `app.use(path, ...)` strips the mount path before the proxy ever sees
   it. Fixed by using `http-proxy-middleware`'s own `pathFilter` instead.
3. A `npm start` process from Milestone 1, still running unnoticed for the
   entire session since, was squatting on port 3000.

**DevOps callout:** the shared `JWT_SECRET` between `auth-service` and
`employee-service` was passed via plain `-e` flags for local testing only.
In a real deployment this belongs in a Kubernetes Secret referenced by
both Deployments' env - never typed on a command line or committed to a
values file. This is exactly the kind of secrets-management concern Phase 1
flagged early on; Part B (Helm, still deferred) is where it gets addressed
properly.

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
