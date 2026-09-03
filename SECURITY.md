# ServiceDesk Security Architecture & Vulnerability Mitigation

## 1. Authentication & Credential Security
* **Password Hashing:** Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` with a cost factor of 10.
* **Token Protection:** Stateless JWT tokens signed with `HS256` containing only user ID and role claims, with explicit expiration windows.
* **Breach Protection:** Default seed accounts avoid breached passwords, utilizing strong multi-character credentials (`ServiceDesk2026!`).

---

## 2. Authorization & Tenant Isolation
* **Granular RBAC:** Express middleware (`protect` and `authorize('admin', 'agent')`) strictly controls route access.
* **Customer Data Partitioning:** Database queries for `customer` users automatically filter by `customer: req.user._id`, preventing unauthorized ticket enumeration.
* **Confidential Internal Notes Isolation:** Comments flagged as `isInternal: true` are scrubbed at the service layer before responding to customer queries.

---

## 3. File Upload & Static Asset Security
* **MIME Validation:** Multer enforces an allowlist of valid file formats (Images, PDF, TXT, LOG, CSV, JSON, ZIP, DOCX).
* **Filename Sanitization & Collision Prevention:** Uploaded files receive a unique timestamp and random 9-digit suffix to prevent directory traversal and file overwrites.
* **Size Quotas:** Strictly enforced 15MB file size limit per upload.

---

## 4. API & Network Security
* **CORS Origin Lockdown:** Cross-Origin Resource Sharing is configured to allow only trusted frontend origins (`CLIENT_URL`), preventing cross-site request forgery.
* **Injection Defense:** Mongoose object modeling enforces strict parameter schemas, protecting against NoSQL operator injection.
* **Zero Secrets in Source Control:** Database credentials, secrets, and API keys reside exclusively in `.env` and are barred from Git via `.gitignore`.
