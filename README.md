# VernacPay-Global (VernacPay-AI v2.0)
### The Multilingual, Voice-Native Agentic Commerce & Cross-Border Export Operating System Built on PayPal

> **"Speak Your Language. Sell to the World. Protected by Deterministic AI."**
> 
> *Targeting PayPal AI Hackathon 2026: Best Use of PayPal + AI ($5,000) / Best Use of Agentic Commerce ($5,000) / $12,000 Grand Prize / Best Use of AG Grid ($5,000 1st Place Cash) / Best Use of Render ($1,000 Credits).*

---

## 1. Abstract & Real-World Problem

Over **15 million vernacular micro-exporters, artisans, handloom weavers, and independent tutors across India** possess world-class crafts and skills demanded by buyers in the United States, United Kingdom, and Europe. However, they remain excluded from direct global trade by a double friction: **language barriers** and **cross-border payment complexity**. 

While they naturally conduct business via voice in **Telugu, Hindi, Urdu, or code-mixed English**, cross-border trade requires navigating complex English-only dashboards to generate international invoices, convert domestic Indian Rupees (INR) to USD/EUR/GBP, attach international carrier tracking numbers to release payment reserves, and reconcile foreign exchange ledgers.

**VernacPay-Global** solves this by uniting **Sarvam AI Indic Speech Suite** (`Saaras:v3` STT & `Bulbul:v3` TTS) with **Groq Function Calling** (`openai/gpt-oss-120b`, with optional Anthropic Claude adapter) and the **PayPal Developer Platform** (Orders v2 with instant scannable checkout QR and return URL capture). A Hyderabad weaver can speak naturally in Telugu:
> *"న్యూయార్క్ లో ఉన్న సారా కి పోచంపల్లి పట్టు చీర కోసం 12,000 రూపాయల పేపాల్ ఆర్డర్ పంపండి"* 
> *(Send a PayPal order to Sarah in New York for 12,000 rupees for a Pochampally silk saree)*

VernacPay-Global deterministically locks an illustrative USD quote ($142.86 USD @ 1 USD = ₹84.00 INR), validates the schema via **Zod**, and presents a bilingual confirmation card. Only after explicit merchant authorization does the system invoke PayPal Sandbox APIs to create a real **PayPal Sandbox Order & QR Code**, enabling the foreign buyer to scan and pay on PayPal Sandbox — with verified settlements committed to an **AG Grid Community** ledger.

---

## 2. Signature Trust Principle & 5-Stage Architecture

```
+-----------------------------------------------------------------------------------------------------+
|                                 VERNACPAY-GLOBAL: 5-STAGE TRUST BOUNDARY                            |
+-----------------------------------------------------------------------------------------------------+

  [1. AI PROPOSES]  ──>  [2. SERVER VALIDATES]  ──>  [3. MERCHANT AUTHORIZES] ──> [4. PAYPAL PROCESSES] ──> [5. LEDGER VERIFIES]
  (Untrusted Speech)     (Zod + Locked FX Quote)    (Explicit Voice OR 1-Tap)     (Orders v2 + Live QR)     (Return Capture / Webhook)
```

### The 7 Unbreakable Engineering Rules:
1. **AI Proposes. Server Validates. Merchant Authorizes. PayPal Processes. The Ledger Verifies.** The LLM is an untrusted natural language parser; it never transitions payment states directly.
2. **Zero Secret Exposure:** `PAYPAL_CLIENT_SECRET`, `SARVAM_API_KEY`, and `GROQ_API_KEY` never touch the browser or LLM context.
3. **No Unconfirmed Mutations:** All financial mutations (`stage_invoice_with_qr`) require a `staged_confirmations` record (10-minute TTL) and explicit merchant authorization before invoking PayPal.
4. **Deterministic FX Math:** The LLM never calculates currency conversions. Spoken INR amounts are deterministically converted into USD using reference rates locked on the server.
5. **Cryptographic Capture & Fail-Closed Protection:** Payment state moves to `VERIFIED_PAID` only after verified PayPal capture. In live mode, unapproved captures strictly fail closed with real PayPal errors.
6. **AG Grid Community Only:** Pure `ag-grid-community` and `ag-grid-react` implementation with zero unlicensed Enterprise trial watermarks.
7. **Prompt-Injection Immunity:** Transcripts are strictly untrusted; adversarial attempts to bypass authorization or execute mutations are immediately rejected and logged.

---

## 3. Product Evolution: `Previous` vs. `Initial` vs. `Now` vs. `After`

| Dimension | 1. Previous (Status Quo) | 2. Initial Concept (v1 Draft) | 3. NOW (VernacPay-Global v2 Winner Build) | 4. After (Post-Hackathon Scale) |
| :--- | :--- | :--- | :--- | :--- |
| **Target User & Market Fit** | Artisans depend on export middlemen losing 30–50% margin. | Targeted domestic Indian tea stalls (mismatch since PayPal doesn't process domestic INR UPI). | **Vernacular Cross-Border Artisans, Weavers & Global Tutors** billing US/UK buyers in USD via PayPal. 100% authentic PayPal fit. | Multi-corridor exporter platform with WhatsApp voice integration. |
| **PayPal Breadth** | Manual payment links; unlogged shipping causes held funds. | Raw Orders v2 endpoint only. | **Orders v2 with Dynamic QR & Synchronous Return Capture (Proven Live on Sandbox).** *Invoicing v2 & Tracking v1 staged as roadmap architecture.* | PayPal Payouts for local craft cooperatives + PayPal Pay Later. |
| **Currency & FX Handling** | Manual calculations; quoting wrong currencies. | Treated USD as an awkward demo limitation. | **Dual-Currency FX Engine:** Spoken INR converted into transparent illustrative USD quotes ($142.86 USD @ 84.00) with locked TTL. | Automated treasury hedging & forward FX alerts. |
| **Post-Payment Lifecycle** | Untracked packages; payments frozen on hold. | Stopped after checkout link creation. | **Post-Payment Fulfillment:** Voice-driven DHL/FedEx tracking release (`create_shipment_tracking`) and overdue invoice reminders (`send_invoice_reminder`). | Automated India Post / DHL courier webhook sync. |
| **Merchant Interface** | Handwritten paper notebooks (*Bahi-Khata*). | Basic plain HTML table. | **Bilingual Voice + Touch PWA** with **AG Grid Community Command Center**, live SSE Trust Boundary Inspector, and CSV export. | Offline-first mobile app + voice note bot. |

---

## 4. Production-Honest Regulatory Compliance

### Indian Exporter Compliance Readiness (RBI & DGFT):
To receive commercial PayPal cross-border export payments in India, merchants must satisfy:
* **PAN Verification:** Verified with PayPal India to comply with PMLA & RBI guidelines.
* **Auto-Withdrawal Bank Account:** Linked Indian INR bank account with daily auto-sweeps within 24–48 hours.
* **RBI Purpose Code:** Inward remittances are tagged with an export Purpose Code (e.g. `P0102` for Handloom & Handicrafts) for automated Foreign Inward Remittance Certificate (FIRC) generation.
* **Import Export Code (IEC):** 10-digit DGFT code required on commercial invoices for physical goods export.

*Disclaimer: Currency conversions are provided as an Illustrative Reference FX Quote (1 USD = ₹84.00 INR reference). Actual bank settlement rates may vary based on PayPal receiving fees and bank conversion margins. Submitting shipment tracking supports PayPal Seller Protection and can help accelerate access to held funds (it does not constitute an instant guarantee).*

---

## 5. Live Split-Screen Command Center Features

1. **Top Status Bar:**
   * Live `[PAYPAL SANDBOX LIVE]` verified badge.
   * Active FX Ticker (`1 USD = ₹84.00 INR Illustrative Quote`).
   * Language Selector (`Telugu తెలుగు | Hindi हिंदी | English`).
   * **1-Click Judge Utterance Simulator Chips** — Test live Telugu, Hindi, and English voice workflows with 1 click without needing a microphone!

2. **Left Pane — Voice & Trust Agent:**
   * Animated Voice Orb with dynamic audio waveform rings.
   * **Bilingual Subtitle Strip:** Native script transcript (Telugu/Hindi) on top, live English translation below for international judges.
   * **Dual-Mode Staged Confirmation Card:** Displays Buyer, Item, Spoken Base (₹ INR), Illustrative PayPal Amount ($ USD), and supports both voice confirmation (*"Avunu / Haan / Yes"*) and 1-tap emerald `[Approve & Send via PayPal Sandbox]`.

3. **Right Pane — AG Grid Community Financial Command Center:**
   * 4 Real-time KPI Cards: Total Verified USD, Spoken INR Total, Pending Invoices, and Shipments Dispatched.
   * AG Grid Community Table: Filterable, sortable, custom status badges, inline DHL/FedEx shipment tracking buttons, and `[View QR]`.
   * **Voice-Controlled Grid API:** SSE events dynamically trigger `gridApi.setFilterModel()` and `gridApi.exportDataAsCsv()`.

4. **Bottom Drawer — Live Cryptographic Audit Log:**
   * Real-time SSE stream visualizing every security gate crossed with timestamps, Zod verification hashes, and cryptographic webhook signatures.

---

## 6. What Existed Before October 1, 2026 and What Changed Since

> In strict compliance with the **PayPal AI Hackathon 2026 Official Rules** regarding projects started or containing code prior to the hackathon window:

* **What Existed Before October 1, 2026:**
  * An early architectural exploration of voice commerce for domestic Indian street vendors using local INR payment mocks. It lacked international payment rails, had no cross-border FX quoting, lacked cryptographic webhook verification, had no live AI function calling, and used simple unverified HTML tables.
* **Significant Updates Built After October 1, 2026 for the PayPal AI Hackathon:**
  1. **Full Pivot to Global Cross-Border Export Commerce:** Shifted 100% of the platform architecture to Indian artisans, handloom weavers, and craft exporters billing international buyers in USD via the **PayPal Developer Platform**.
  2. **Real PayPal Sandbox Integration (Orders v2 Rail):** Built live PayPal Sandbox authentication, dynamic order creation with live HATEOAS approval links, instant scannable QR generation (`QRCode.toDataURL`), and synchronous `/api/paypal/return` capture.
  3. **Sarvam AI Indic Speech Suite (`saaras:v3` & `bulbul:v3`):** Upgraded from experimental drafts to live Sarvam v3 STT/TTS with natural speaker mapping for Telugu (`kavitha`), Hindi (`aditya`), and English (`simran`), with honest disclosure that Urdu audio is unsupported by Sarvam Bulbul.
  4. **Groq LLM Function Calling Agent (`openai/gpt-oss-120b`):** Implemented high-speed agentic tool-calling with a strict 5-stage Trust Boundary (`AI Proposes -> Server Validates -> Merchant Authorizes -> PayPal Processes -> Ledger Verifies`).
  5. **Deterministic FX Engine:** Hardened server-side FX calculation (1 USD = ₹84.00 INR reference) with 10-minute quote locks and zero LLM arithmetic hallucinations.
  6. **AG Grid Community Financial Command Center:** Built an interactive, responsive ledger using pure `ag-grid-community` (zero unlicensed enterprise watermarks) with real-time SSE stream updates and voice-driven filtering.
  7. **PostgreSQL Persistence & Fail-Closed Production Guards:** Integrated PostgreSQL with Knex migrations and connection pooling. App refuses to start in-memory when deployed to production.
  8. **Judge Test Panel & Rate Limiting:** Built a dedicated 1-click test card with pre-configured PayPal Sandbox personal buyer credentials and 15 req/min per-IP rate limiting to safeguard provider quotas.

---

## 7. Verification Evidence: What is Real vs. What is Simulated

| Capability | Status | Evidence / Verification Details |
| :--- | :--- | :--- |
| **PayPal Orders v2 Creation** | **LIVE REAL** | Real HTTP 201 calls to `https://api-m.sandbox.paypal.com/v2/checkout/orders` returning live `token` and HATEOAS approval links. Live deployment Order: `62D41517T2589423P`. |
| **PayPal Buyer Checkout & QR** | **LIVE REAL** | Scannable Base64 QR code rendering the live PayPal Sandbox checkout URL; allows real sandbox buyer payment. Tested live on mobile and desktop. |
| **PayPal Payment Capture** | **LIVE REAL** | Synchronous capture via `/api/paypal/return` with real PayPal capture reference `0ER40279291956133` recorded on live PostgreSQL ledger (`ledg_a7939e74053f41fa`). |
| **Fail-Closed Capture Guard** | **LIVE REAL** | Attempting capture prior to buyer authorization returns real PayPal HTTP 422 `ORDER_NOT_APPROVED`. |
| **Sarvam Indic Speech-to-Text** | **LIVE REAL** | Real `saaras:v3` speech recognition for Telugu, Hindi, and Indian English with Sarvam Translate API. |
| **Sarvam Indic Text-to-Speech** | **LIVE REAL** | Real `bulbul:v3` audio synthesis for Telugu (`kavitha`), Hindi (`aditya`), and English (`simran`). |
| **Urdu Audio Support** | **HONESTLY UNSUPPORTED** | Transparently labeled Text-Only intent. Sarvam Bulbul does not support Urdu audio synthesis. |
| **Agentic LLM Function Calling** | **LIVE REAL** | Groq `openai/gpt-oss-120b` (with optional Anthropic Claude adapter) generating Zod-compliant tool calls. |
| **Prompt Injection Defense** | **LIVE REAL** | Adversarial attacks (bypass auth, override ledger) are intercepted and rejected at Gate 1. |
| **Database Persistence** | **LIVE REAL** | Authoritative Managed PostgreSQL engine on Render (`vernacpay-db`); all rows survive service restarts. |
| **AG Grid Integration** | **LIVE REAL** | Pure AG Grid Community v32; sortable, filterable, CSV exportable with zero watermarks. |
| **Invoicing v2 / Tracking v1** | **PENDING / ROADMAP** | Staged in code architecture; Orders v2 selected as verified primary rail for universal sandbox reliability. |

---

## 8. Hackathon Judge & Reviewer Test Credentials

To test the complete end-to-end checkout flow as an international buyer:
* **Live App URL:** [https://vernacpay-global-app.onrender.com/](https://vernacpay-global-app.onrender.com/) *(Free instance: please allow ~30-45s for initial wake-up)*
* **PayPal Sandbox Personal Buyer Email:** `sb-pj4347w53813178@personal.example.com`
* **PayPal Sandbox Personal Buyer Password:** `[Placeholder: Set via PAYPAL_SANDBOX_BUYER_PASSWORD / Provided in Portal]`

---

## 9. Local Setup & Quickstart

### Prerequisites
* Node.js 20+
* npm 10+

### Step 1: Clone & Install Dependencies
```bash
git clone https://github.com/ayeshasultana78/VernacPay.git
cd VernacPay
npm install
```

### Step 2: Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(The system runs out-of-the-box with mock/simulated sandbox credentials and an in-memory/embedded database if PostgreSQL is not locally running).*

### Step 3: Seed Authoritative Database
```bash
npm run db:seed
```
Seeds demo records for **Lakshmi Handlooms & Crafts** (Pochampally saree for Sarah, overdue invoice for David, brass craft for Emma).

### Step 4: Run the Vitest Guardrail Suite
```bash
npm run test
```
Verifies:
* Quantity vs. price disambiguation (`2 sarees for ₹12,000` -> `quantity: 2, amount: 12000`).
* Zero unconfirmed mutations (0 unapproved PayPal calls).
* Idempotent capture & webhook deduplication (0 duplicate ledger writes).
* Prompt-injection resistance against 7 adversarial attacks.

### Step 5: Start Development Server
```bash
# In terminal:
npm run dev
```
Open **`http://localhost:5173`** (or `http://localhost:3000`) in your browser.

---

## 10. The 3-Minute Live Hackathon Demo Walkthrough

1. **Act 1: Multilingual Voice → Illustrative FX → Real PayPal Orders v2 QR Code (0:00 - 1:15)**
   * Click **`🎤 [Telugu] Order for Sarah ₹12,000 (Pochampally Saree)`** (or speak naturally in Telugu).
   * Notice the instant bilingual subtitle (`న్యూయార్క్ లో ఉన్న సారా కి...` + English translation).
   * Notice the Trust Boundary Bar advances: `1. AI Proposes` → `2. Server Validates` ($142.86 USD locked quote).
   * Click **`[Approve & Send via PayPal Sandbox]`**.
   * A real **PayPal Orders v2** transaction is created on PayPal Sandbox (`token=...`), and the scannable **PayPal Checkout QR Code** appears with direct sandbox checkout link.
   * Reviewer or buyer opens the link or scans the QR, signs in with `sb-pj4347w53813178@personal.example.com`, and clicks **Complete Purchase**.
   * PayPal redirects to `/api/paypal/return` where synchronous capture is executed, flipping the AG Grid row to **`VERIFIED_PAID`** with spoken confirmation!

2. **Act 2: Voice-Controlled AG Grid & CSV Tax Export (1:15 - 2:00)**
   * Click **`🎤 [Telugu] Check verified ledger earnings`**.
   * The agent speaks the verified totals in Telugu and displays the bilingual breakdown.
   * Click **`[Export Ledger CSV]`** to trigger instant client-side CSV download via AG Grid Community API.
   * Expand the **Trust & Cryptographic Verification Drawer** at the bottom to showcase the complete tamper-evident audit trail!

---

## 11. Deployment on Render

This project includes a declarative `render.yaml` Blueprint qualifying for the **Best Use of Render ($1,000 Credits)** prize track.

1. Connect this repository in the [Render Dashboard](https://dashboard.render.com).
2. Select **New Blueprint Instance**.
3. Render automatically provisions:
   * **Node.js Web Service** (`vernacpay-global-app`) running Express + Vite static assets.
   * **Managed PostgreSQL Database** (`vernacpay-db`) with automatic connection string injection.

---

## 12. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details. Visible in GitHub's top-level About section in compliance with Official Hackathon Rules.
