# VERNACPAY-GLOBAL — REMEDIATION EVIDENCE LOG

**Document Version:** 1.0.0  
**Initial Baseline Date:** November 6, 2026  
**Auditor / Architect:** Senior FinTech & AI Systems Architect  
**Purpose:** Living evidence ledger documenting every code change, test execution, external API response, defect reproduction, and visual verification.

---

## 1. Initial Defect Reproduction Evidence (Pre-Remediation Baseline)

### Evidence E-01: PayPal Mock Generator Active
- **Inspection Command:** Environment inspection in Node.js
- **Observed Value:**
  ```env
  PAYPAL_CLIENT_ID=mock-paypal-sandbox-client-id
  PAYPAL_CLIENT_SECRET=mock-paypal-sandbox-client-secret
  ```
- **Result:** `paypalService.isMockCredentials()` returned `true`. All requests generate synthetic IDs (`INV2-R838K-Z4MQ-1089`) without contacting PayPal Sandbox.

---

### Evidence E-02: Webhook Random Fallback Bug in Source Code
- **Inspection:** `src/server/agent/orchestrator.ts` (Lines 290–305)
- **Observed Code:**
  ```typescript
  let target = txs.find(t => 
    (params.orderId && t.paypal_order_id === params.orderId) ||
    (params.invoiceId && t.paypal_invoice_id === params.invoiceId) ||
    (params.captureId && t.paypal_capture_id === params.captureId)
  );

  if (!target) {
    target = txs.find(t => t.status === 'AWAITING_BUYER');
  }
  ```
- **Result:** Confirmed defect. Unmatched webhook payloads capture the first unrelated pending order.

---

### Evidence E-03: Visual Defects Captured via Chrome DevTools Protocol
- **Inspection:** Edge Headless CDP Screenshots
- **Artifacts:**
  - `audit/screenshots/mobile_dashboard_active.png` (54,022 bytes)
    - *Observed Defect:* TrustBar chips overlap and clip at 390px viewport width (`1. AI Propos2. Server Valid...`).
  - `audit/screenshots/desktop_dashboard_active.png` (140,844 bytes)
    - *Observed Defect:* AG Grid columns compressed into narrow widths; headers truncated to `I...`, `Bu...`, `S...`, `P...`, `A...`.

---

## 2. Phase Execution Progress Table

| Phase | Description | Status | Files Modified | Tests Passed | Remaining Risks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Baseline** | Complete Inspection & Defect Verification | **COMPLETED** | Baseline docs generated | N/A | None |
| **Phase 1** | PayPal Sandbox Integration & Modes | **PLANNED (AWAITING APPROVAL)** | `paypalService.ts`, `index.ts`, `.env.example` | Pending | Need sandbox keys for live test |
| **Phase 2** | Payment Integrity & Webhook Security | **QUEUED** | `orchestrator.ts`, `index.ts` | Pending | - |
| **Phase 3** | Merchant Authentication & Authorization | **QUEUED** | `schema.sql`, `db.ts`, `index.ts` | Pending | - |
| **Phase 4** | PostgreSQL Persistence & Fail-Closed DB | **QUEUED** | `db.ts`, `schema.sql` | Pending | - |
| **Phase 5** | Environment Separation & Honest UI | **QUEUED** | `TopBar.tsx`, `CheckoutQrModal.tsx` | Pending | - |
| **Phase 6** | Responsive UI/UX & AG Grid Repair | **QUEUED** | `TrustBar.tsx`, `AgGridCommandCenter.tsx` | Pending | - |
| **Phase 7** | Comprehensive Test Suite & QA | **QUEUED** | `tests/*.test.ts` | Pending | - |
| **Phase 8** | Production Build & Deployment Prep | **QUEUED** | `render.yaml`, `package.json` | Pending | - |
| **Phase 9** | Final Verified Hackathon Demo | **QUEUED** | All verification evidence | Pending | - |

---
*Evidence log initialized on November 6, 2026. Zero source files modified prior to explicit user authorization.*
