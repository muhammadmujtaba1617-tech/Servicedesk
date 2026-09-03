# ServiceDesk REST API Specification

Base URL: `http://localhost:3000/api/v1` (or production URL)

---

## 1. Authentication Endpoints

### `POST /auth/register`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123!",
    "role": "customer"
  }
  ```
* **Success (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": { "id": "67...abc", "name": "Jane Doe", "email": "jane@example.com", "role": "customer" },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
  }
  ```

### `POST /auth/login`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "email": "customer@example.com",
    "password": "ServiceDesk2026!"
  }
  ```
* **Success (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "67...abc", "name": "Customer Jane", "email": "customer@example.com", "role": "customer" },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
  }
  ```

---

## 2. Ticket Management Endpoints

### `GET /tickets`
* **Access:** Authenticated (Customer sees own tickets; Agent/Admin see all)
* **Query Parameters:** `page=1`, `limit=10`, `status=in_progress`, `priority=critical`, `search=payment`
* **Success (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "_id": "67...123",
          "title": "Payment Gateway Timeout",
          "category": "Payment",
          "priority": "critical",
          "status": "in_progress",
          "customer": { "name": "Customer Jane", "email": "customer@example.com" },
          "assignedAgent": { "name": "Agent Smith" },
          "dueSLA": "2026-09-02T06:30:00.000Z",
          "createdAt": "2026-09-02T02:30:00.000Z"
        }
      ],
      "total": 42,
      "page": 1,
      "pages": 5
    }
  }
  ```

### `POST /tickets`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "title": "Database connection drop in US-East",
    "description": "PostgreSQL cluster is dropping active pooling connections",
    "category": "Infrastructure",
    "priority": "critical",
    "tags": ["db", "outage"]
  }
  ```
* **Success (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "67...456",
      "status": "open",
      "dueSLA": "2026-09-02T06:30:00.000Z",
      "createdAt": "2026-09-02T02:30:00.000Z"
    }
  }
  ```

### `PATCH /tickets/:id/status`
* **Access:** Authenticated (Enforces Finite State Machine)
* **Request Body:** `{ "status": "triaged" }`
* **Success (200 OK):** Returns updated ticket object.
* **Error (400 Bad Request):**
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_STATUS_TRANSITION",
      "message": "Status cannot transition from open to resolved"
    }
  }
  ```

### `POST /tickets/:id/assign`
* **Access:** Agent / Admin
* **Request Body:** `{ "agentId": "67...agentId" }`
* **Success (200 OK):** Auto-transitions status to `assigned` and returns updated ticket.

### `POST /tickets/:id/comments`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "content": "Diagnostic logs indicate memory pool exhaustion.",
    "isInternal": true
  }
  ```
* **Success (201 Created):** Returns added comment with author and timestamp.

### `POST /tickets/:id/attachments`
* **Access:** Authenticated
* **Content-Type:** `multipart/form-data` (`file` binary, max 15MB)
* **Success (201 Created):** Returns uploaded attachment metadata and static URL.

### `DELETE /tickets/:id/attachments/:attachmentId`
* **Access:** Uploader / Agent / Admin
* **Success (200 OK):** Removes attachment from ticket and deletes physical file from disk.

---

## 3. Analytics & System Intelligence

### `GET /analytics?days=30`
* **Access:** Agent / Admin
* **Success (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "summary": {
        "totalTickets": 120,
        "openTickets": 25,
        "resolvedTickets": 80,
        "slaComplianceRate": 92,
        "avgResolutionTime": 3.4
      },
      "volumeTrends": [ { "date": "Aug 26", "created": 12, "resolved": 10 } ],
      "priorityDistribution": [ { "priority": "CRITICAL", "count": 8 } ],
      "categoryDistribution": [ { "category": "Payment", "count": 34 } ],
      "agentPerformance": [ { "name": "Agent Smith", "assigned": 25, "resolved": 22, "resolutionRate": 88 } ]
    }
  }
  ```

---

## 4. Settings & SLA Policies

### `GET /settings`
* **Access:** Authenticated
* **Success (200 OK):** Returns SLA thresholds, category list, working hours, and automation rules.

### `PATCH /settings`
* **Access:** Admin only
* **Request Body:** Partial update of SLA thresholds or operational policies.
* **Success (200 OK):** Updates configuration and logs immutable audit record.
