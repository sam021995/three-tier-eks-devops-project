# ADR 0001: Phase 1 Microservices Decomposition

## Status
Accepted

## Context

The app is currently a 3-tier monolith: one Flask backend, one MySQL database,
one React frontend. The goal is to learn real microservices/DevOps patterns
by decomposing it, working toward 12-15 services across three phases. Phase 1
introduces the foundational patterns — service boundaries, auth, a gateway,
and event-driven communication — with the smallest set of services that can
teach all of them.

## Decision

Phase 1 introduces three services plus a gateway and an event bus:

- **employee-service** — the existing backend, restructured but not
  functionally rewritten yet
- **auth-service** — new
- **notification-service** — new
- **api-gateway** — new, single entry point for the frontend

### Service boundaries & data ownership

| Service | Owns | Exposes |
|---|---|---|
| employee-service | `employees` table (MySQL) | REST CRUD; publishes `employee.created` / `employee.updated` / `employee.deleted` events |
| auth-service | user/credential store (separate from employee data) | REST login endpoint; issues JWTs |
| notification-service | nothing persistent (stateless consumer) | none; subscribes to employee-service's events |
| api-gateway | nothing (stateless) | routes `/api/auth/*` → auth-service, `/api/employees/*` → employee-service; validates JWTs on protected routes before forwarding |

No service reads or writes another service's tables directly. This is the
single most important rule of the whole exercise — it's what actually forces
services to be independent, rather than being a distributed monolith.

### Communication patterns

- **Frontend → Gateway**: synchronous REST, always.
- **Gateway → Auth/Employee services**: synchronous REST.
- **Employee Service → Notification Service**: asynchronous, via an event
  bus. No service ever calls another service directly just to notify it —
  that always goes through the bus. This is what decouples them: employee-service
  doesn't know or care that notification-service exists.

### Repo layout convention

```
services/
  employee-service/
  auth-service/
  notification-service/
  api-gateway/
```

Each service gets its own Dockerfile, its own dependency manifest, its own
Helm templates, and (from Milestone 9 onward) its own CI workflow.

### Rejected alternatives

- **Self-hosted Kafka in-cluster** — more realistic for large-scale shops,
  but the operational overhead (broker sizing, storage, KRaft/Zookeeper) isn't
  worth it for a 3-service phase with low event volume. SNS+SQS gets the same
  decoupling lesson at far lower operational cost. Revisit if Phase 2/3
  introduces multiple consumers needing replay or high fan-out.
- **Shared database across services** — rejected outright. It's the most
  common way tutorials fake "microservices" while still being a monolith
  underneath, and it would defeat the point of this exercise.

## Consequences

- More moving parts to deploy and monitor than the current monolith — each
  milestone will be deployed and verified independently rather than all at
  once.
- Distributed tracing becomes necessary sooner rather than later: once a
  user-facing request spans 2+ services (Milestone 3 onward), debugging
  without it gets genuinely hard. Addressed in Milestone 8.
- CI/CD complexity increases as services multiply. Addressed in Milestone 9
  by splitting the single `app-deploy.yml` into independent per-service
  pipelines.
