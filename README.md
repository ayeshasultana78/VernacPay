# VernacPay-Global (VernacPay-AI v2.0)
### The Multilingual, Voice-Native Agentic Commerce & Cross-Border Export Operating System Built on PayPal

> **"Speak Your Language. Sell to the World. Protected by Deterministic AI."**
> 
> *Targeting PayPal AI Hackathon 2026: Best Use of PayPal + AI ($5,000) / Best Use of Agentic Commerce ($5,000) / $12,000 Grand Prize / Best Use of AG Grid ($5,000 1st Place Cash) / Best Use of Render ($1,000 Credits).*

---

## 1. Abstract & Real-World Problem

Over **15 million vernacular micro-exporters, artisans, handloom weavers, and independent tutors across India** possess world-class crafts and skills demanded by buyers in the United States, United Kingdom, and Europe. However, they remain excluded from direct global trade by a double friction: **language barriers** and **cross-border payment complexity**. 

While they naturally conduct business via voice in **Telugu, Hindi, Urdu, or code-mixed English**, cross-border trade requires navigating complex English-only dashboards to generate international invoices, convert domestic Indian Rupees (INR) to USD/EUR/GBP, attach international carrier tracking numbers to release payment reserves, and reconcile foreign exchange ledgers.

**VernacPay-Global** solves this by uniting **Sarvam AI Indic Speech Suite** (`Saaras` STT & `Bulbul` TTS) with **Anthropic Claude** and the **PayPal Developer Platform** (Orders v2, Invoicing v2 + QR, Shipment Tracking v1). A Hyderabad weaver can speak naturally in Telugu:
> *"న్యూయార్క్ లో ఉన్న సారా కి పోచంపల్లి పట్టు చీర కోసం 12,000 రూపాయల పేపాల్ ఇన్వాయిస్ పంపండి"* 
> *(Send a PayPal invoice to Sarah in New York for 12,000 rupees for a Pochampally silk saree)*

VernacPay-Global deterministically locks an illustrative USD quote ($142.86 USD @ 1 USD = ₹84.00 INR), validates the schema via **Zod**, and presents a bilingual confirmation card. Only after explicit merchant authorization does the system invoke PayPal Sandbox APIs to create a real **PayPal Invoice & QR Code**, register **Shipment Tracking (DHL/FedEx)** to accelerate funds access, or send **Invoice Reminders** — with all verified settlements streamed in real time to an **AG Grid Community** command center.

---

## 2. Signature Trust Principle & 5-Stage Architecture

```
+-----------------------------------------------------------------------------------------------------+
|                                 VERNACPAY-GLOBAL: 5-STAGE TRUST BOUNDARY                            |
+-----------------------------------------------------------------------------------------------------+

  [1. AI PROPOSES]  ──>  [2. SERVER VALIDATES]  ──>  [3. MERCHANT AUTHORIZES] ──> [4. PAYPAL PROCESSES] ──> [5. LEDGER VERIFIES]
  (Untrusted Speech)     (Zod + Locked FX Quote)    (Explicit Voice OR 1-Tap)     (Orders v2 / Invoices)    (Signed Webhook Lock)
```

### The 7 Unbreakable Engineering Rules:
1. **AI Proposes. Server Validates. Merchant Authorizes. PayPal Processes. The Ledger Verifies.** The LLM is an untrusted natural language parser; it never transitions payment states directly.
2. **Zero Secret Exposure:** `PAYPAL_CLIENT_SECRET`, `SARVAM_API_KEY`, and `ANTHROPIC_API_KEY` never touch the browser or LLM context.
3. **No Unconfirmed Mutations:** All financial mutations (`stage_invoice_with_qr`, `stage_invoice_reminder`, `stage_shipment_tracking`) require a `staged_confirmations` record (10-minute TTL) and explicit merchant authorization before invoking PayPal.
4. **Deterministic FX Math:** The LLM never calculates currency conversions. Spoken INR amounts are deterministically converted into USD using reference rates locked in PostgreSQL.
5. **Cryptographic Capture & Webhooks:** Payment state moves to `VERIFIED_PAID` only after server-side PayPal capture verification and webhook signature validation (`PAYPAL-TRANSMISSION-SIG`) with unique idempotency constraints.
6. **AG Grid Community Only:** Pure `ag-grid-community` and `ag-grid-react` implementation with zero unlicensed Enterprise trial watermarks.
7. **Prompt-Injection Immunity:** Transcripts are strictly untrusted; adversarial attempts to bypass authorization or execute mutations are immediately rejected and logged.

---

## 3. Product Evolution: `Previous` vs. `Initial` vs. `Now` vs. `After`

| Dimension | 1. Previous (Status Quo) | 2. Initial Concept (v1 Draft) | 3. NOW (VernacPay-Global v2 Winner Build) | 4. After (Post-Hackathon Scale) |
| :--- | :--- | :--- | :--- | :--- |
| **Target User & Market Fit** | Artisans depend on export middlemen losing 30–50% margin. | Targeted domestic Indian tea stalls (mismatch since PayPal doesn't process domestic INR UPI). | **Vernacular Cross-Border Artisans, Weavers & Global Tutors** billing US/UK buyers in USD via PayPal. 100% authentic PayPal fit. | Multi-corridor exporter platform with WhatsApp voice integration. |
| **PayPal Breadth** | Manual payment links; unlogged shipping causes held funds. | Raw Orders v2 endpoint only. | **Invoicing v2 with scannable QR, Orders v2 checkout, Shipment Tracking v1, and Invoice Reminders.** | PayPal Payouts for local craft cooperatives + PayPal Pay Later. |
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

## 6. Local Setup & Quickstart

### Prerequisites
* Node.js 20+
* npm 10+

### Step 1: Clone & Install Dependencies
```bash
git clone https://github.com/vernacpay/vernacpay-global.git
cd vernacpay-global
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

## 7. The 3-Minute Live Hackathon Demo Walkthrough

1. **Act 1: Multilingual Voice → Illustrative FX → Live PayPal QR Code (0:00 - 1:15)**
   * Click **`🎤 [Telugu] Invoice Sarah ₹12,000 (Pochampally Saree)`** (or speak in Telugu).
   * Notice the instant bilingual subtitle (`న్యూయార్క్ లో ఉన్న సారా కి...` + English translation).
   * Notice the Trust Boundary Bar advances: `1. AI Proposes` → `2. Server Validates`.
   * Click **`[Approve & Send via PayPal Sandbox]`**.
   * The live **PayPal Invoicing QR code & Checkout modal** appears immediately with real Sandbox links.
   * Click **`[Simulate Buyer Sandbox Capture]`** → Verified webhook fires via SSE, and the AG Grid row turns emerald `VERIFIED_PAID`!

2. **Act 2: Post-Payment Fulfillment — Shipment Tracking (1:15 - 2:00)**
   * Click **`🎤 [Hindi] Add DHL tracking to Emma's paid order`**.
   * Notice the prompt clarifies that tracking supports PayPal Seller Protection.
   * Confirm the staged action → AG Grid updates Emma's row to `SHIPPED: DHL #9845123650`.

3. **Act 3: Voice-Controlled AG Grid & CSV Tax Export (2:00 - 2:45)**
   * Click **`🎤 [English] Filter grid to unpaid & remind David`**.
   * AG Grid filters itself via SSE `gridApi.setFilterModel()` to show only David's overdue invoice.
   * Click **`[Export Ledger CSV]`** to trigger instant client-side CSV download via AG Grid API.
   * Expand the **Trust & Cryptographic Verification Drawer** at the bottom to showcase the complete tamper-evident audit trail!

---

## 8. Deployment on Render

This project includes a declarative `render.yaml` Blueprint qualifying for the **Best Use of Render ($1,000 Credits)** prize track.

1. Connect this repository in the [Render Dashboard](https://dashboard.render.com).
2. Select **New Blueprint Instance**.
3. Render automatically provisions:
   * **Node.js Web Service** (`vernacpay-global-app`) running Express + Vite static assets.
   * **Managed PostgreSQL Database** (`vernacpay-db`) with automatic connection string injection.

---

## 9. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details. Visible in GitHub's top-level About section in compliance with Official Hackathon Rules.
