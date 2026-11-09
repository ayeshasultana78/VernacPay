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

## 3. Real Live Sandbox Payment Evidence (Phase 1B Verified)

### Evidence E-04: Real End-to-End Sandbox Payment & Capture
* **Timestamp:** November 9, 2026, 18:07 IST
* **Payment Rail:** PayPal Orders v2 (`https://api-m.sandbox.paypal.com/v2/checkout/orders`)
* **Spoken Utterance (Telugu):** *"న్యూయార్క్ లో ఉన్న సారా కి పోచంపల్లి పట్టు చీర కోసం 12,000 రూపాయల పేపాల్ ఆర్డర్ పంపండి"*
* **Stage 2 Locked Quote:** ₹12,000 INR → $142.86 USD (Reference rate: ₹84.00) | Auth Code: `#CNF-4253`
* **Stage 4 Live PayPal Order Created:**
  * **Order ID:** `2UW4029938037114Y`
  * **HATEOAS Approval Link:** `https://www.sandbox.paypal.com/checkoutnow?token=2UW4029938037114Y`
* **Real Buyer Approval:**
  * **Buyer Account:** `sb-pj4347w53813178@personal.example.com`
  * **Status Prior to Capture:** `APPROVED`
* **Real PayPal Capture Result:**
  * **HTTP 201 Response from PayPal Sandbox:** `captureOrder('2UW4029938037114Y')`
  * **PayPal Capture ID:** `38E641528Y025253B` (Format: genuine 17-character PayPal capture reference)
  * **Capture Status:** `COMPLETED`
* **Fail-Closed & Idempotency Proof:**
  * Calling capture before buyer approval returned: `[PayPal Capture 422] ORDER_NOT_APPROVED`.
  * Calling capture again after completion returned: `[PayPal Capture 422] ORDER_ALREADY_CAPTURED: Order already captured. If 'intent=CAPTURE' only one capture per order is allowed.`
  * Calling ledger updater twice with identical payload maintains idempotent state: `VERIFIED_PAID`.

---
*Evidence log updated on November 9, 2026. All claims grounded in live PayPal Sandbox API responses.*
