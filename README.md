# ServiceDesk — Production-Grade Support & Operations Platform

> **Technical Project Assignment Submission**  
> **Candidate:** Hina Tariq  
> **Target Track:** Full-Stack Engineer / Software Engineer  
> **Primary Stack:** React 19 + TypeScript + Node.js + Express + MongoDB Atlas + Socket.IO + Docker  

---

## 🌐 Live Production Deployment

| Service | Live Public URL | Status |
| :--- | :--- | :--- |
| **Frontend Web App** | 🔗 [**https://servicedesk-f91a.vercel.app**](https://servicedesk-f91a.vercel.app) | **Live & Operational** |
| **Backend REST API** | 🔗 [**https://servicedesk-backened.vercel.app**](https://servicedesk-backened.vercel.app/api/v1/health) | **Live & Connected to MongoDB Atlas** |
| **GitHub Repository** | 🐙 [**https://github.com/muhammadmujtaba1617-tech/Servicedesk**](https://github.com/muhammadmujtaba1617-tech/Servicedesk) | **Public** |

---

ServiceDesk is a production-grade, multi-user service request and incident management platform engineered for modern software organizations. The system delivers a complete IT Service Management (ITSM) lifecycle featuring **role-based access control (RBAC)**, **controlled finite state machine workflows**, **dynamic SLA calculation and live countdown timers**, **confidential internal notes**, **real-time WebSocket event broadcasts**, **multipart file attachments**, **interactive analytics visualizations**, and **immutable audit logging**.

---

## 📑 Complete Documentation Directory

| Document | Purpose |
| :--- | :--- |
| 📐 [**ARCHITECTURE.md**](./ARCHITECTURE.md) | High-level system architecture, layered service architecture, finite state machine specification, and data models. |
| 🔌 [**API.md**](./API.md) | Comprehensive REST API specification with request/response envelopes and error code definitions. |
| 🔒 [**SECURITY.md**](./SECURITY.md) | Security controls, password hashing, JWT authentication, RBAC authorization, and customer data scrubbing. |
| 🧪 [**TESTING.md**](./TESTING.md) | Automated testing report (33/33 integration tests passing across 8 subsystems). |
| 🚀 [**DEPLOYMENT.md**](./DEPLOYMENT.md) | Step-by-step production deployment runbook (Docker Compose, Vercel + Render/Railway, Bare-Metal Linux). |
| ⚖️ [**DECISIONS.md**](./DECISIONS.md) | Architectural Decision Records (ADRs 01–07) covering technical trade-offs and design rationale. |
| 🔨 [**BUILD_LOG.md**](./BUILD_LOG.md) | Feature-by-feature implementation log and runtime root-cause analyses. |
| 🤖 [**AI_ENGINEERING_LOG.md**](./AI_ENGINEERING_LOG.md) | AI pair programming methodology, prompt engineering records, and QA verification logs. |
| 📊 [**SRS-Traceability.md**](./SRS-Traceability.md) | **100% Compliance Matrix** mapping all 20 Functional Requirements and 5 Non-Functional Requirements. |

---

## ⚡ Quick Start Guide

### 1. Local Development Mode

#### Prerequisites
* Node.js $\ge 20$
* MongoDB Connection (MongoDB Atlas URI already configured in backend `.env`)

#### Start Backend
```bash
cd servicedesk/backend
npm install
npm run dev
```
* Backend API & WebSockets live on: `http://localhost:3000`

#### Start Frontend
```bash
cd frontend
npm install
npm run dev
```
* Frontend application live on: `http://localhost:5173`

---

### 2. 1-Command Docker Deployment (Recommended)
```bash
docker compose up -d --build
```
* **Frontend Web App:** `http://localhost:80`
* **Backend REST API:** `http://localhost:3000`

---

## 🔑 Demo Accounts (with 1-Click Login)

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@example.com` | `ServiceDesk2026!` | Submit tickets, attach files, view personal ticket status, add public comments, close resolved tickets. |
| **Support Agent** | `agent@example.com` | `ServiceDesk2026!` | Triage queue, assign tickets, advance state machine, post private internal notes, monitor SLA timers. |
| **Administrator** | `admin@example.com` | `ServiceDesk2026!` | Full user/role management, interactive analytics, review immutable audit logs, configure SLA thresholds and operational hours. |

---

## 🧪 Running Automated Tests
```bash
cd servicedesk/backend
npm test
```
* **Status:** **33 Passed, 0 Failed (100% Pass Rate)**
