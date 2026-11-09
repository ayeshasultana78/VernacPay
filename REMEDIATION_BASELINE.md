# VERNACPAY-GLOBAL — REMEDIATION BASELINE

**Document Version:** 1.0.0  
**Generated Date:** November 6, 2026  
**Auditor / Architect:** Senior FinTech & AI Systems Architect  
**Objective:** Independent, source-code verified baseline of all system components, security posture, API contracts, defects, and empirical failure points before Phase 1 remediation.

---

## 1. Executive Baseline Summary

| Assessment Pillar | Baseline Status | Key Identified Risks | Severity |
| :--- | :--- | :--- | :--- |
| **PayPal Sandbox Integration** | **100% Mock Generator** | Zero live network traffic to PayPal. Synthetic URLs 404 on Sandbox. | **CRITICAL** |
| **Webhook Processing** | **Vulnerable to Arbitrary Capture** | Random transaction fallback mutates unrelated orders. Zero event ID deduplication. | **CRITICAL** |
| **Merchant Authentication** | **Completely Unauthenticated** | Zero session verification. 4-digit `#CNF` codes brute-forceable in ~8 seconds. IDOR. | **CRITICAL** |
| **Database Persistence** | **Ephemeral In-Memory Fallback** | Silent fallback to JS Maps when Postgres is down. Process restart wipes all invoices. | **CRITICAL** |
| **Environment Separation** | **Deceptive UI Badging** | Header displays "SANDBOX" while running local mocks. No fail-closed semantics. | **HIGH** |
| **UI Responsiveness & AG Grid** | **Visual Defects Captured** | Mobile TrustBar chips overlap/bleed at 390px. AG Grid squishes 7/9 headers to `I...`, `Bu...`. | **MEDIUM** |
| **Render Cloud Deployment** | **NOT DEPLOYED / NOT VERIFIED** | `git remote` empty. No live public URL. | **HIGH** |

---

## 2. Exhaustive Defect Inventory (Code-Level Verification)

### DEF-01: PayPal Service Silent Fail-Open & Mock Generation
- **File:** `src/server/services/paypalService.ts`
- **Functions:** `isMockCredentials()`, `createOrder()`, `captureOrder()`, `createDraftInvoice()`, `sendInvoice()`, `generateInvoiceQrCode()`, `registerShipmentTracking()`, `verifyWebhookSignature()`
- **Verified Defect:**
  1. Default `.env` sets `PAYPAL_CLIENT_ID=mock-paypal-sandbox-client-id`.
  2. `isMockCredentials()` intercepts all calls and returns hardcoded synthetic responses without issuing HTTP requests.
  3. When live credentials are provided but fail (e.g. invalid secret or network timeout), `catch (err)` blocks silently swallow the error and return synthetic mock objects.
  4. Invoice approval URLs (`https://www.sandbox.paypal.com/invoice/p/#INV2-...`) do not exist on PayPal and return HTTP 404 when opened by buyers.
- **Severity:** **CRITICAL**
- **Proposed Correction:**
  - Introduce strict `APP_MODE: 'MOCK' | 'SANDBOX' | 'PRODUCTION'`.
  - In `SANDBOX` and `PRODUCTION`, remove synthetic mock fallbacks in `catch` blocks. Fail closed and rethrow structured PayPal API errors.
  - In `MOCK` mode, clearly watermark all returned data as `[SIMULATED - LOCAL MOCK]`.
- **Verification Method:** Unit test asserting that `createDraftInvoice()` in `SANDBOX` mode throws an error when given invalid credentials, rather than returning a synthetic invoice ID.

---

### DEF-02: Webhook Arbitrary Fallback Matching (Catastrophic Financial Defect)
- **File:** `src/server/agent/orchestrator.ts`
- **Function:** `processVerifiedPaymentCapture(params)` (Lines 290–305)
- **Verified Defect:**
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
  If a payment capture webhook arrives with an unknown, mismatched, or mistyped `orderId` or `invoiceId`, the system grabs the first unrelated pending order in `AWAITING_BUYER` and marks it `VERIFIED_PAID`.
- **Severity:** **CRITICAL**
- **Proposed Correction:**
  - Delete `if (!target) target = txs.find(t => t.status === 'AWAITING_BUYER');`.
  - If no transaction matches the verified PayPal resource ID, reject the event immediately (HTTP 404 / 422) and log a security audit event without altering ledger or transaction states.
- **Verification Method:** Test sending a webhook payload with an unknown Order ID (`ORDER-UNKNOWN-999`) and asserting that zero transactions change status.

---

### DEF-03: Webhook Event Deduplication Missing
- **File:** `src/server/agent/orchestrator.ts` & `src/server/index.ts`
- **Function:** `app.post('/api/paypal/webhook')` & `processVerifiedPaymentCapture()`
- **Verified Defect:**
  - Webhook payloads contain an `id` field (e.g. `WH-EVT-12345`).
  - Although `webhook_and_audit_events` schema contains `webhook_event_id VARCHAR(100) UNIQUE`, the incoming webhook ID is never verified for previous existence before executing payment capture logic.
  - Repeated deliveries can cause duplicate ledger state transitions.
- **Severity:** **HIGH**
- **Proposed Correction:**
  - Before processing, query database for `webhook_event_id`. If found, immediately return HTTP 200 `{ status: 'ALREADY_PROCESSED' }` without re-executing capture.
- **Verification Method:** Dispatch identical webhook payload twice; verify second call returns 200 with no duplicate ledger entry.

---

### DEF-04: Unauthenticated Financial Mutation Endpoints
- **File:** `src/server/index.ts`
- **Endpoints:** `POST /api/staged/confirm`, `POST /api/staged/cancel`, `POST /api/sandbox/simulate-capture`
- **Verified Defect:**
  - Routes accept raw JSON without requiring an authenticated session, cookie, JWT, or merchant token.
  - Anyone on the network can POST to `/api/staged/confirm` with an auth code to commit money movement.
  - `/api/sandbox/simulate-capture` is unauthenticated and can be triggered by anyone.
- **Severity:** **CRITICAL**
- **Proposed Correction:**
  - Implement merchant authentication with secure server-side session tokens.
  - Add authentication middleware to all `/api/staged/*` and `/api/orders/*` routes.
  - Restrict `/api/sandbox/simulate-capture` strictly to `APP_MODE === 'MOCK'`.
- **Verification Method:** Attempt `POST /api/staged/confirm` without auth cookie/token; assert HTTP 401 Unauthorized.

---

### DEF-05: 4-Digit Confirmation Code Brute-Force & IDOR
- **File:** `src/server/agent/orchestrator.ts`
- **Functions:** `processMerchantUtterance()` & `executeConfirmedAction()`
- **Verified Defect:**
  - Staged confirmation authorization codes are generated as:
    `const authCode = #CNF-${Math.floor(1000 + Math.random() * 9000)};`
  - Only 9,000 combinations exist.
  - There is zero rate limiting on `/api/staged/confirm`.
  - `executeConfirmedAction` does not verify if the requesting merchant owns the staged confirmation record.
- **Severity:** **CRITICAL**
- **Proposed Correction:**
  - Upgrade authorization code to an 8-character cryptographically secure token:
    `#CNF-${crypto.randomBytes(4).toString('hex').toUpperCase()}` (4.29 billion combinations).
  - Enforce merchant ID ownership matching (`staged.merchant_id === authenticatedMerchant.id`).
  - Add rate limiting (max 5 failed attempts per IP per minute).
- **Verification Method:** Test cross-merchant confirmation attempt; assert HTTP 403 Forbidden.

---

### DEF-06: Silent In-Memory Storage Degradation
- **File:** `src/server/db/db.ts`
- **Functions:** `constructor()`, `init()`
- **Verified Defect:**
  - If `DATABASE_URL` is unreachable, `db.ts` catches the error and silently switches to in-memory JavaScript Maps (`this.isPostgres = false`).
  - When the process restarts (e.g. container reboot on Render), all stored transactions and invoices disappear.
- **Severity:** **CRITICAL**
- **Proposed Correction:**
  - Check `APP_MODE`. In `SANDBOX` or `PRODUCTION`, if PostgreSQL connection fails during `init()`, log a fatal error and process.exit(1) (fail closed).
  - Permit in-memory fallback ONLY in `APP_MODE === 'MOCK'`.
- **Verification Method:** Start server in `APP_MODE=SANDBOX` with invalid `DATABASE_URL`; verify process crashes immediately with explicit configuration error.

---

### DEF-07: Deceptive Environment Badging in UI
- **File:** `src/client/components/TopBar.tsx` (Lines 40–43)
- **Verified Defect:**
  - Hardcodes `<span ...>SANDBOX</span>` with an animated glowing dot, even when the server runs on local mock generators.
- **Severity:** **HIGH**
- **Proposed Correction:**
  - Expose `/api/config` from backend returning `{ appMode: 'MOCK' | 'SANDBOX' | 'PRODUCTION', isLivePayPal: boolean }`.
  - Render unambiguous badges:
    - `MOCK`: `[LOCAL DEMO SIMULATOR]` (Amber / Warning styling).
    - `SANDBOX`: `[PAYPAL LIVE SANDBOX]` (Blue styling).
    - `PRODUCTION`: `[LIVE PAYMENTS]` (Emerald styling).
- **Verification Method:** Verify frontend TopBar badge matches backend `/api/config` response.

---

### DEF-08: Visual Breakdown on Mobile (TrustBar Chip Overlap)
- **File:** `src/client/components/TrustBar.tsx` (Lines 88–120)
- **Verified Defect:**
  - Uses `grid grid-cols-5` inside a 390px viewport.
  - All 5 stage chips collide, overlap, and bleed text over each other (empirically confirmed in `audit/screenshots/mobile_dashboard_active.png`).
- **Severity:** **MEDIUM**
- **Proposed Correction:**
  - Make TrustBar responsive: on mobile (`< 768px`), render a compact horizontal active-stage stepper or single active-stage pill with previous/next indicator.
- **Verification Method:** Capture 390px mobile screenshot via CDP; verify zero text collisions or overlapping chips.

---

### DEF-09: AG Grid Header Squishing on Desktop
- **File:** `src/client/components/AgGridCommandCenter.tsx` (Lines 68–71, 180–230)
- **Verified Defect:**
  - `params.api.sizeColumnsToFit()` called without `minWidth` on all columns forces 7 out of 9 headers to collapse into 3-letter truncations (`I...`, `Bu...`, `S...`, `P...`, `A...`).
- **Severity:** **MEDIUM**
- **Proposed Correction:**
  - Set explicit `minWidth` on every ColDef (`minWidth: 140` for IDs, `minWidth: 130` for customers, `minWidth: 220` with `flex: 1` for products).
  - Enable horizontal scrollbar when container width is exceeded.
- **Verification Method:** Capture 1440x900 desktop screenshot via CDP; verify all column headers are fully legible without truncation.

---

### DEF-10: Render Deployment Not Verified
- **File:** `render.yaml` & Git Configuration
- **Verified Defect:**
  - `git remote -v` is empty. The project has never been linked or deployed to Render.
- **Severity:** **HIGH**
- **Proposed Correction:**
  - Prepare clean git commit, verify `render.yaml` build scripts (`npm run build` client + server), and document deployment steps. Classify deployment as `NOT DEPLOYED` until a live URL is tested.
- **Verification Method:** Run full production build (`npm run build`); verify zero build errors.
