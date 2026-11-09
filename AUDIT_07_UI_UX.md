# AUDIT 07: VERNACPAY-GLOBAL — UI/UX DESIGN & ACCESSIBILITY AUDIT

**Audit Date:** November 6, 2026  
**Auditor:** Independent Staff Product Designer & Frontend Architect  
**Design Reference:** Calm Trust FinTech (Stripe, Linear, Mercury, Vercel)  
**Evaluation Scope:** Visual Hierarchy, Typography, Design Tokens, Micro-Interactions, Modal Workflows, and Responsive Breakpoints.

---

## 1. Design Direction: "Calm Trust" FinTech Review

VernacPay-Global rejects generic SaaS purple gradients in favor of dense, breathable, high-trust engineering aesthetics.

### Color Tokens (OKLCH via CSS Variables):
- **Base Canvas:** Deep Ink Navy (`--bg-base: oklch(0.15 0.04 255)`) in Dark Mode, crisp soft slate in Light Mode.
- **Brand Accent:** PayPal Blue (`oklch(0.62 0.20 245)` / `#0070E0`).
- **Semantic Badges:**
  - `VERIFIED_PAID`: Emerald green (`oklch(0.68 0.18 150)`).
  - `STAGED_CONFIRMATION`: Warm Amber (`oklch(0.76 0.16 75)`).
  - `AWAITING_BUYER / UNPAID`: Rose / Coral (`oklch(0.65 0.22 25)`).
- **Surface Elevation:** 1px hairline borders (`--border-subtle`), subtle backdrop blurs (`backdrop-blur-md`), and layered card shadows.

---

## 2. Typography & Indic Script Polish

- **Primary Interface:** Inter Variable (`font-sans`), clean and legible at 12px–14px data density.
- **Financial Monospace:** JetBrains Mono (`font-mono`) with `tabular-nums` ensuring currency figures, transaction hashes, and tracking IDs align vertically without layout shifting.
- **Indic Script Support:**
  - **Noto Sans Telugu:** Native preloading with `font-display: swap` and extended `line-height: 1.7` (`.font-telugu`) to prevent glyph clipping of complex Telugu sub-vowels (e.g., న్యూయార్క్, పట్టు చీర).
  - **Noto Sans Devanagari:** Optimized font metrics for Hindi/Urdu transliterations (`.font-devanagari`).

---

## 3. Core Component UX Walkthrough

### 1. TopBar & Header
- **Live Status Indicator:** Displays green pulsing status badge (`PayPal Sandbox Active`).
- **Live Illustrative FX Pill:** Real-time quote pill showing `1 USD = ₹84.00 INR (Ref Quote)` with info tooltip.
- **Language Switcher:** Quick toggle between Telugu (తెలుగు), Hindi (हिंदी), and English.
- **Compliance Badge:** Clickable badge opening the Indian Exporter Compliance Readiness Modal.

### 2. TrustBar (5-Stage Visual Trust Flow)
- Real-time indicator providing visual reassurance across the 5 trust stages:
  1. `AI PROPOSED (Untrusted)`
  2. `ZOD VALIDATED`
  3. `MERCHANT AUTHORIZED`
  4. `PAYPAL EXECUTED`
  5. `WEBHOOK VERIFIED & LEDGER LOCKED`
- Dynamically highlights active stage during processing with smooth animated transitions.

### 3. VoiceAgentPane (Split-Screen Left)
- **Audio Mic Control:** Tactile recording button with active waveform animation.
- **1-Click Indic Presets:** 4 quick-launch buttons for instant demo execution (Telugu Saree Invoice, Hindi Tracking, English Unpaid Reminder, Telugu Earnings Summary).
- **Staged Action Cards:** High-contrast confirmation cards displaying item name, spoken INR, settled USD, auth code (`#CNF-XXXX`), and live countdown timer (10:00 -> 00:00). Includes explicit green "Approve & Execute" and red "Cancel" buttons.

### 4. AgGridCommandCenter (Split-Screen Right)
- **KPI Summary Strip:** Instant figures for Total Verified (USD & INR), Pending Settlements, and Shipped Parcels.
- **Quick Filters:** 1-click filter buttons (`ALL`, `VERIFIED PAID`, `UNPAID`, `SHIPPED`).
- **Export Action:** Direct CSV export button streaming all ledger records to local disk.
- **Action Buttons in Grid:** Direct action buttons inside table cells (`View QR`, `Send Reminder`, `Add Tracking`).

### 5. CheckoutQrModal
- Opens high-resolution scannable PayPal QR code.
- Displays direct clickable link to PayPal Sandbox Invoice.
- Includes judge testing tool: **"Simulate PayPal Payment Capture"** allowing instant webhook verification without leaving the demo workspace.

### 6. TrustBoundaryDrawer
- Slide-out cryptographic ledger drawer accessible via bottom bar button or keyboard shortcut (`CMD+L`).
- Displays chronological SHA-256 audit logs with verification badges (`VERIFIED`, `REJECTED`, `PENDING`).

---

## 4. Accessibility & Responsiveness Audit

- **Keyboard Navigation:** Full support for `CMD+K` (Command Palette) to search orders, filter statuses, and trigger actions.
- **Focus Rings:** Explicit `:focus-visible` outline (`2px solid var(--border-focus)`) with `2px offset`.
- **Responsive Layout:**
  - **Desktop (>= 1024px):** Dual resizable split-pane workspace (`react-resizable-panels`).
  - **Tablet (768px - 1023px):** Stacked panel layout preserving full grid visibility and touch-friendly buttons.
  - **Mobile (< 768px):** Tabbed interface with swipeable panes between Voice Assistant and Ledger.

---
*UI/UX quality bar and accessibility verified on November 6, 2026.*
