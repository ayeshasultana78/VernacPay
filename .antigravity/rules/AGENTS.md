# VernacPay-Global: Architectural Guardrails & Mandatory Engineering Rules

## Core Signature Trust Principle
> **"AI Proposes → Server Validates → Merchant Authorizes → PayPal Processes → Ledger Verifies"**

The LLM is an untrusted natural language interface and semantic parser. It is NEVER an authoritative financial execution engine, never holds secrets, and never transitions payment states directly.

---

## Mandatory Engineering Rules

### 1. No Unconfirmed Mutations
Claude and agent tool calls must **NEVER** directly create PayPal invoices, orders, reminders, or tracking numbers. Every mutating financial action MUST create a `staged_confirmations` record (10-minute TTL) validated by Zod and wait for explicit merchant authorization (via voice *"Avunu / Haan / Yes"* or 1-tap UI button).

### 2. Read vs. Write Tool Segregation
- **Read-Only / UI Tools** (`check_payment_status`, `get_verified_summary`, `list_unpaid_invoices`, `filter_ag_grid_ledger`):
  Execute immediately after Zod validation and merchant tenancy checks.
- **Mutating Staged Tools** (`stage_invoice_with_qr`, `stage_invoice_reminder`, `stage_shipment_tracking`):
  Stage for human authorization only.

### 3. Production-Honest Claims & FX Accuracy
- **Illustrative Reference FX Quote**: Label all INR-to-USD conversions as an *"Illustrative Reference FX Quote"* (not a guaranteed PayPal bank settlement rate).
- **Shipment Tracking & Seller Protection**: State accurately that submitting shipment tracking *"supports PayPal Seller Protection and can help accelerate access to held funds"* (not an automatic instant release).
- **Indian Exporter Compliance Readiness**: Display clear regulatory readiness criteria for Indian merchants receiving international PayPal payments (PAN verification, linked Indian bank account, Export Purpose Code P0802/P0102, and Import Export Code (IEC) for physical goods).

### 4. Zero Secret Exposure
Never expose `PAYPAL_CLIENT_SECRET`, `ANTHROPIC_API_KEY`, `SARVAM_API_KEY`, or webhook keys to the client frontend or LLM context. All external API communication terminates at the trusted Express backend gateway.

### 5. Cryptographic Capture & Webhook Verification
Mark a transaction as `VERIFIED_PAID` only after:
1. Direct server-to-server PayPal capture verification (`COMPLETED`), AND/OR
2. Cryptographic PayPal Webhook signature verification (`PAYPAL-TRANSMISSION-SIG`) with idempotency keys (`PayPal-Request-Id`) and PostgreSQL UNIQUE constraints on `paypal_capture_id` and `webhook_event_id`.

### 6. AG Grid Community Exclusively
Use `ag-grid-community` and `ag-grid-react` cleanly so the UI renders flawlessly with zero unlicensed Enterprise trial watermarks or popups.

### 7. Prompt-Injection Immunity
All voice transcripts and buyer inputs are untrusted data.
- Never expose a `mark_as_paid` tool to the LLM.
- Disambiguate quantity vs. amount (e.g., "2 sarees for 12,000 rupees" -> quantity: 2, amount: 12000, never amount: 2).
- Reject prompt-injection patterns immediately with audit logging.
