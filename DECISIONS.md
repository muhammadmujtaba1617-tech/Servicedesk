# ServiceDesk Architectural Decision Records (ADRs)

## ADR-01: Layered Backend Architecture (Controller - Service - Repository)
* **Status:** Accepted
* **Context:** The system requires maintainable, decoupled business logic that can be tested independently of Express HTTP routing.
* **Decision:** We structured the backend into distinct layers:
  * `controllers/`: HTTP parsing, status code handling, and JSON envelopes.
  * `services/`: Core business logic (state machine validation, SLA math, isolation rules).
  * `repositories/` & `models/`: Mongoose schemas, queries, and projection operations.
* **Consequences:** Ensures single-responsibility principle and testability via automated integration suites.

---

## ADR-02: Strict Finite State Machine Enforcement
* **Status:** Accepted
* **Context:** Support tickets must transition through an auditable workflow (`OPEN` $\rightarrow$ `TRIAGED` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `WAITING_FOR_CUSTOMER` $\rightarrow$ `RESOLVED` $\rightarrow$ `CLOSED`). Arbitrary jumps compromise SLA calculations and accountability.
* **Decision:** The backend enforces a lookup table of legal transitions (`LEGAL_TRANSITIONS`). Any illegal jump returns HTTP `400` with `{ code: "INVALID_STATUS_TRANSITION" }`.
* **Consequences:** Eliminates corrupted ticket states and guarantees that tickets are properly triaged and assigned before resolution.

---

## ADR-03: Room-Based Real-time WebSockets with Socket.IO
* **Status:** Accepted
* **Context:** Agents and customers require instant visibility into ticket creation, assignment, status progression, and new messages without manual browser refreshing.
* **Decision:** Integrated Socket.IO directly over the native Node.js HTTP server and partitioned events into scoped rooms (`role:agent`, `user:<id>`, `ticket:<id>`).
* **Consequences:** Minimal network overhead; events are only transmitted to relevant clients.

---

## ADR-04: Confidential Internal Notes with Zero Customer Leakage
* **Status:** Accepted
* **Context:** Support agents and administrators must collaborate privately on tickets without exposing internal diagnostics to customers.
* **Decision:** Embedded a single `comments` array with an `isInternal: Boolean` flag in `Ticket.js`. When a query originates from a user with `role: 'customer'`, the service layer strictly scrubs out all comments with `isInternal === true`.
* **Consequences:** Simplifies database schema while maintaining zero-leakage security boundaries.

---

## ADR-05: Dynamic Database-Backed SLA Configuration
* **Status:** Accepted
* **Context:** Enterprise SLAs vary across organizations and require runtime adjustments without server redeployment.
* **Decision:** SLA thresholds are stored in the MongoDB `settings` collection and queried dynamically during ticket creation and countdown calculations.
* **Consequences:** Administrators can alter Critical response targets (e.g. from 15m to 10m) on the fly via the Admin Settings Console.

---

## ADR-06: Multipart File Storage with Multer & Static Asset Pipeline
* **Status:** Accepted
* **Context:** Users need to attach diagnostic logs, screenshots, and PDFs to tickets.
* **Decision:** Implemented Multer disk storage with MIME type allowlists, 15MB file size limits, unique timestamp suffixes, and Express static file hosting at `/uploads`.
* **Consequences:** Resilient, fast local attachment management without requiring third-party cloud object storage during development.

---

## ADR-07: Vite ES Module TypeScript Type-Import Eradication
* **Status:** Accepted
* **Context:** Importing TypeScript interfaces in Vite without `type` specifiers causes Vite to emit runtime imports, resulting in `SyntaxError` crashes on the client.
* **Decision:** Mandated `import type { ... }` for all TypeScript interfaces and types across the frontend codebase.
* **Consequences:** Clean compilation with zero runtime bundling artifacts.
