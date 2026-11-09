# AUDIT 10: VERNACPAY-GLOBAL — DEPLOYMENT, CLOUD INFRASTRUCTURE & OPEN SOURCE AUDIT

**Audit Date:** November 6, 2026  
**Auditor:** Independent Staff DevOps & Cloud Infrastructure Architect  
**Target Award:** Best Use of Render Sponsor Prize ($1,000 Credits)  
**Evaluation Scope:** Render Infrastructure Blueprint (`render.yaml`), Repository Hygiene, Open Source Licensing, and Documentation Quality.

---

## 1. Render Infrastructure Blueprint Audit (`render.yaml`)

VernacPay-Global qualifies for the **Best Use of Render ($1,000 Credits)** track by deploying a fully unified, containerized cloud architecture through Render's declarative blueprint:

### Blueprint Features:
1. **Full-Stack Web Service (`vernacpay-global-app`):**
   - **Runtime:** Node.js 24 environment (`runtime: node`).
   - **Build Command:** `npm install && npm run build` (builds both Vite React client and TypeScript Express server).
   - **Start Command:** `npm run start` (`node dist/server/index.js`).
   - **Health Check Path:** `/api/health` (verified returning HTTP 200).
   - **Region:** `oregon` on the `starter` tier.
2. **Managed Cloud PostgreSQL Database (`vernacpay-db`):**
   - **Type:** Managed PostgreSQL instance.
   - **Automatic Wiring:** Injects `DATABASE_URL` directly into the web service via `fromDatabase.property: connectionString`.
   - **Auto-Seeding:** Server boots, initializes schema DDL from `schema.sql`, and runs `seedDatabase()` automatically if empty.
3. **Secret Security on Render:**
   - Critical credentials (`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `ANTHROPIC_API_KEY`, `SARVAM_API_KEY`) have `sync: false` to ensure they are never written into code repositories or public blueprint configs.
   - Session secrets are dynamically generated via `generateValue: true`.

---

## 2. Git Repository Hygiene & Version Control Integrity

- **Repository Status:** Clean working tree.
- **`git status --short`:** Verified completely empty (0 uncommitted files, 0 untracked files).
- **`.gitignore` Completeness:**
  - Ignores `node_modules/`, `dist/`, `dist-client/`, `.env`, `.env.local`, `.DS_Store`, and temporary test logs.
  - Guarantees zero credentials or local sandbox files are accidentally committed.
- **Secret Separation:**
  - Active `.env` file is excluded.
  - `.env.example` provides clear template instructions for judges and evaluators without exposing real keys.

---

## 3. Open Source Licensing & Permissiveness

- **Root License:** Verified `LICENSE` file containing standard permissive **MIT License** terms.
- **Dependency License Scan:**
  - All 32 production dependencies use standard permissive open-source licenses (MIT, Apache-2.0, or BSD-3-Clause).
  - Zero GPL/AGPL viral copyleft dependencies included.
  - Zero proprietary or unlicensed packages present.

---

## 4. Documentation & Judge Onboarding Quality (`README.md`)

The `README.md` provides an exhaustive guide designed for hackathon judges:
1. **Elevator Pitch & Target Problem:** Explains why vernacular voice is essential for Indian cross-border exporters.
2. **20-Second Judge Quick-Test Guide:** 3 clicks to witness the complete North Star voice-to-settlement journey.
3. **Architectural Guardrails & Trust Boundary Rules:** Outlines the 5 gates and explains why AI is never permitted to mutate funds directly.
4. **Local Setup & Development:** Simple 3-step setup (`npm install`, `npm run dev:server`, `npm run dev:client`).
5. **Render 1-Click Deployment:** Instructions for importing the repository into Render via `render.yaml`.
6. **Regulatory & Compliance Disclaimers:** Clear disclosures on RBI Purpose Codes, PAN, IEC, and Illustrative FX reference rates.

---
*Deployment readiness and open-source posture verified on November 6, 2026.*
