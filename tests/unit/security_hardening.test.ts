import { describe, it, expect, beforeEach } from 'vitest';
import { paypalService } from '../../src/server/services/paypalService.js';
import { orchestrator } from '../../src/server/agent/orchestrator.js';
import { db } from '../../src/server/db/db.js';
import { PayPalTransaction } from '../../src/types/index.js';

describe('VernacPay-Global: Security Hardening & Zero-Backdoor Guard Suite', () => {
  beforeEach(async () => {
    delete process.env.DEMO_MODE;
    process.env.NODE_ENV = 'test';
    await db.init();
    db.paypal_transactions.clear();
    db.ledger_entries.clear();
  });

  // --- Test 1: Unsigned Webhook Rejection ---
  describe('Webhook Cryptographic Signature Enforcement', () => {
    it('strictly rejects webhook when signature headers are missing', async () => {
      const res = await paypalService.verifyWebhookSignature({
        headers: {},
        rawBody: { event_type: 'PAYMENT.CAPTURE.COMPLETED' },
      });

      expect(res.verified).toBe(false);
      expect(res.message).toContain('Missing required PayPal webhook cryptographic signature headers');
    });

    it('strictly rejects webhook when transmission-sig is missing or empty', async () => {
      const res = await paypalService.verifyWebhookSignature({
        headers: {
          'paypal-transmission-id': 'trans_123',
          'paypal-transmission-time': '2026-11-11T12:00:00Z',
          'paypal-cert-url': 'https://api.sandbox.paypal.com/v1/certs/1',
          'paypal-auth-algo': 'SHA256withRSA',
        },
        rawBody: { event_type: 'PAYMENT.CAPTURE.COMPLETED' },
      });

      expect(res.verified).toBe(false);
      expect(res.message).toContain('Missing required PayPal webhook cryptographic signature headers');
    });

    it('strictly rejects webhook verification when PAYPAL_WEBHOOK_ID is mock in non-demo mode', async () => {
      // Overriding webhookId to mock
      (paypalService as any).webhookId = 'mock-paypal-sandbox-webhook-id';

      const res = await paypalService.verifyWebhookSignature({
        headers: {
          'paypal-transmission-id': 'trans_123',
          'paypal-transmission-time': '2026-11-11T12:00:00Z',
          'paypal-cert-url': 'https://api.sandbox.paypal.com/v1/certs/1',
          'paypal-auth-algo': 'SHA256withRSA',
          'paypal-transmission-sig': 'sig_xyz',
        },
        rawBody: { event_type: 'PAYMENT.CAPTURE.COMPLETED' },
      });

      expect(res.verified).toBe(false);
      expect(res.message).toContain('PAYPAL_WEBHOOK_ID is not configured');
    });
  });

  // --- Test 2: State Machine Integrity & Real Capture ID Requirement ---
  describe('Payment State Machine & Idempotency Guards', () => {
    it('refuses to mark transaction paid without a real capture ID', async () => {
      const tx: PayPalTransaction = {
        id: 'tx_sec_01',
        merchant_id: 'merchant_pochampally_weavers_01',
        paypal_order_id: 'ORDER_SEC_01',
        customer_name: 'Buyer One',
        customer_country: 'United States',
        item_name: 'Silk Saree',
        spoken_amount_inr: 12000,
        settlement_amount_usd: 142.86,
        settlement_currency: 'USD',
        paypal_rail: 'ORDER',
        shipment_status: 'NOT_SHIPPED',
        status: 'AWAITING_BUYER',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await db.saveTransaction(tx);

      // Attempting to capture without a captureId must throw error and NOT invent a fake ID
      await expect(
        orchestrator.processVerifiedPaymentCapture({
          orderId: 'ORDER_SEC_01',
        })
      ).rejects.toThrow('Missing real PayPal capture ID');

      // Ledger row remains untouched
      const saved = await db.getTransaction('tx_sec_01');
      expect(saved?.status).toBe('AWAITING_BUYER');
    });

    it('ignores unknown order IDs and writes nothing to the database or ledger', async () => {
      const res = await orchestrator.processVerifiedPaymentCapture({
        orderId: 'UNKNOWN_ORDER_999999',
        captureId: '38E641528Y025253B',
      });

      expect(res).toBeNull();
      const entries = await db.listLedgerEntries();
      expect(entries.length).toBe(0);
    });

    it('guarantees replayed capture events are no-ops with zero duplicate ledger writes', async () => {
      const tx: PayPalTransaction = {
        id: 'tx_sec_02',
        merchant_id: 'merchant_pochampally_weavers_01',
        paypal_order_id: 'ORDER_SEC_02',
        customer_name: 'Buyer Two',
        customer_country: 'United States',
        item_name: 'Brass Art',
        spoken_amount_inr: 4200,
        settlement_amount_usd: 50.00,
        settlement_currency: 'USD',
        paypal_rail: 'ORDER',
        shipment_status: 'NOT_SHIPPED',
        status: 'AWAITING_BUYER',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await db.saveTransaction(tx);

      // 1st Capture
      const first = await orchestrator.processVerifiedPaymentCapture({
        orderId: 'ORDER_SEC_02',
        captureId: 'CAP_REAL_1234567890',
        webhookEventId: 'WH_EVT_01',
      });
      expect(first?.status).toBe('VERIFIED_PAID');
      expect(first?.paypal_capture_id).toBe('CAP_REAL_1234567890');

      const ledger1 = await db.listLedgerEntries();
      expect(ledger1.length).toBe(1);

      // 2nd Capture (Replayed event)
      const second = await orchestrator.processVerifiedPaymentCapture({
        orderId: 'ORDER_SEC_02',
        captureId: 'CAP_REAL_1234567890',
        webhookEventId: 'WH_EVT_01',
      });
      expect(second?.status).toBe('VERIFIED_PAID');

      // Ledger count remains exactly 1 (Zero duplicate credits)
      const ledger2 = await db.listLedgerEntries();
      expect(ledger2.length).toBe(1);
    });
  });

  // --- Test 3: Production Startup Guards ---
  describe('Production Environment Startup Defense', () => {
    it('refuses to boot in production when DATABASE_URL is missing', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.DEMO_MODE;
      delete process.env.DATABASE_URL;

      // New database manager instance in production without DATABASE_URL
      const { DatabaseManager } = await import('../../src/server/db/db.js') as any;
      const testDb = new (db.constructor as any)();

      await expect(testDb.init()).rejects.toThrow('DATABASE_URL is not set in production');
    });

    it('refuses to execute fake token fallback in live mode', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.DEMO_MODE;

      (paypalService as any).clientId = 'test-live-paypal-client-id-0001';
      (paypalService as any).clientSecret = 'invalid_secret_for_test';
      (paypalService as any).cachedToken = null;

      await expect(paypalService.getAccessToken()).rejects.toThrow('PayPal OAuth Error');
    });
  });
});
