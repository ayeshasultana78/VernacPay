import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { orchestrator } from '../../src/server/agent/orchestrator.js';
import { db } from '../../src/server/db/db.js';
import { seedDatabase } from '../../src/server/db/seed.js';
import { fxService } from '../../src/server/services/fxService.js';
import { paypalService } from '../../src/server/services/paypalService.js';

describe('PayPal AI Hackathon 2026: Official Requirements Compliance Suite', () => {
  beforeEach(async () => {
    await db.init();
    await seedDatabase();
  });

  // --- Hackathon Requirement 1: North Star 20-Second Flow ---
  it('executes North Star flow: Voice -> Trust Boundary -> Staged Confirmation -> Sandbox QR -> VERIFIED_PAID', async () => {
    // 1. Spoken Telugu utterance received
    const turn1 = await orchestrator.processMerchantUtterance({
      transcript_native: 'న్యూయార్క్ లో ఉన్న సారా కి పోచంపల్లి పట్టు చీర కోసం 12,000 రూపాయల పేపాల్ ఇన్వాయిస్ పంపండి',
      transcript_english: 'Send a PayPal invoice to Sarah in New York for 12,000 rupees for a Pochampally silk saree',
      languageCode: 'te-IN',
      merchantId: 'merchant_lakshmi_crafts_01',
    });

    expect(turn1.type).toBe('CONFIRMATION_REQUIRED');
    expect(turn1.staged_confirmation).toBeDefined();
    expect(turn1.staged_confirmation?.status).toBe('PENDING_APPROVAL');
    expect(turn1.staged_confirmation?.spoken_amount_inr).toBe(12000);
    expect(turn1.staged_confirmation?.settlement_amount_usd).toBe(142.86);

    // 2. Explicit Merchant Approval
    const authCode = turn1.staged_confirmation!.auth_code;
    const turn2 = await orchestrator.executeConfirmedAction(authCode);

    expect(turn2.success).toBe(true);
    expect(turn2.transaction).toBeDefined();
    expect(turn2.transaction?.status).toBe('AWAITING_BUYER');
    expect(turn2.qr_code_base64).toBeDefined();

    // 3. Cryptographically Verified Payment Capture
    const turn3 = await orchestrator.processVerifiedPaymentCapture({
      invoiceId: turn2.transaction!.paypal_invoice_id,
    });

    expect(turn3).not.toBeNull();
    expect(turn3?.status).toBe('VERIFIED_PAID');
    expect(turn3?.paypal_capture_id).toBeDefined();

    // Verify written to immutable ledger
    const ledger = await db.listLedgerEntries();
    const entry = ledger.find(e => e.paypal_reference_id === turn3?.paypal_capture_id);
    expect(entry).toBeDefined();
    expect(entry?.amount_usd).toBe(142.86);
    expect(entry?.amount_inr).toBe(12000);
  });

  // --- Hackathon Requirement 2: Post-Payment Fulfillment (Tracking & Reminder) ---
  it('executes Shipment Tracking upload to support PayPal Seller Protection', async () => {
    const turn1 = await orchestrator.processMerchantUtterance({
      transcript_native: 'Emma ke paid order mein DHL tracking number 9845123650 add karo',
      transcript_english: 'Add DHL tracking number 9845123650 to Emma paid order',
      languageCode: 'hi-IN',
      merchantId: 'merchant_lakshmi_crafts_01',
    });

    expect(turn1.staged_confirmation).toBeDefined();
    expect(turn1.staged_confirmation?.tool_name).toBe('stage_shipment_tracking');

    const authCode = turn1.staged_confirmation!.auth_code;
    const turn2 = await orchestrator.executeConfirmedAction(authCode);

    expect(turn2.success).toBe(true);
    expect(turn2.transaction?.shipment_status).toBe('SHIPPED');
    expect(turn2.transaction?.carrier_code).toBe('DHL');
    expect(turn2.transaction?.tracking_number).toBe('9845123650');
  });

  it('executes Overdue Invoice Reminder via PayPal Invoicing v2', async () => {
    const turn1 = await orchestrator.processMerchantUtterance({
      transcript_native: 'David ko uske baki invoice ka reminder bhej do',
      transcript_english: 'Send invoice reminder to David for overdue payment',
      languageCode: 'hi-IN',
      merchantId: 'merchant_lakshmi_crafts_01',
    });

    expect(turn1.staged_confirmation).toBeDefined();
    expect(turn1.staged_confirmation?.tool_name).toBe('stage_invoice_reminder');

    const authCode = turn1.staged_confirmation!.auth_code;
    const turn2 = await orchestrator.executeConfirmedAction(authCode);
    expect(turn2.success).toBe(true);
  });

  // --- Hackathon Requirement 3: Mandatory Open Source Compliance ---
  it('strictly satisfies Open-Source Compliance (MIT License, .env.example, render.yaml)', () => {
    const rootDir = path.resolve(__dirname, '../..');
    
    // 1. Root LICENSE file exists and is MIT
    const licensePath = path.join(rootDir, 'LICENSE');
    expect(fs.existsSync(licensePath)).toBe(true);
    const licenseContent = fs.readFileSync(licensePath, 'utf8');
    expect(licenseContent).toContain('MIT License');

    // 2. .env.example exists with sanitized placeholders
    const envExamplePath = path.join(rootDir, '.env.example');
    expect(fs.existsSync(envExamplePath)).toBe(true);
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    expect(envContent).toContain('PAYPAL_CLIENT_ID');
    expect(envContent).toContain('PAYPAL_BASE_URL');

    // 3. render.yaml Blueprint exists for Render Sponsor Prize
    const renderPath = path.join(rootDir, 'render.yaml');
    expect(fs.existsSync(renderPath)).toBe(true);
    const renderContent = fs.readFileSync(renderPath, 'utf8');
    expect(renderContent).toContain('vernacpay-global-app');
    expect(renderContent).toContain('vernacpay-db');
  });

  // --- Hackathon Requirement 4: AG Grid Community Only (Zero Watermarks) ---
  it('guarantees zero unlicensed AG Grid Enterprise imports across codebase', () => {
    const clientDir = path.resolve(__dirname, '../../src/client');
    const files = fs.readdirSync(clientDir, { recursive: true }) as string[];
    
    for (const f of files) {
      if (typeof f === 'string' && (f.endsWith('.ts') || f.endsWith('.tsx'))) {
        const content = fs.readFileSync(path.join(clientDir, f), 'utf8');
        expect(content).not.toContain('ag-grid-enterprise');
      }
    }
  });
});
