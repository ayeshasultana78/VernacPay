import { db } from './db.js';
import { 
  Merchant, 
  PayPalTransaction, 
  LedgerEntry, 
  WebhookAndAuditEvent 
} from '../../types/index.js';

export async function seedDatabase() {
  await db.init();
  console.log('[Seed] Seeding realistic artisan cross-border export demo records...');

  // 1. Primary Demo Merchant: Lakshmi Handlooms & Crafts (Hyderabad, India)
  const defaultMerchant: Merchant = {
    id: 'merchant_lakshmi_crafts_01',
    name: 'Lakshmi Devi',
    business_name: 'Lakshmi Handlooms & Crafts (Hyderabad, India)',
    email: 'lakshmi.handlooms@sandbox.vernacpay.com',
    default_language: 'te-IN',
    default_settlement_currency: 'USD',
    created_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
  };
  await db.saveMerchant(defaultMerchant);

  // 2. Focused Cross-Border Artisan Exporter Records
  const demoTransactions: PayPalTransaction[] = [
    {
      id: 'tx_sarah_01',
      merchant_id: defaultMerchant.id,
      paypal_order_id: '8XY92019AB1234567',
      paypal_invoice_id: 'INV2-SRH-NY-12000',
      paypal_capture_id: 'CAP_8XY92019AB_01',
      customer_name: 'Sarah Jenkins',
      customer_country: 'United States (New York)',
      item_name: 'Pochampally Handwoven Silk Saree (Pure Zari Ikat)',
      spoken_amount_inr: 12000.00,
      settlement_amount_usd: 142.86,
      settlement_currency: 'USD',
      paypal_rail: 'INVOICE',
      carrier_code: 'DHL',
      tracking_number: 'DHL9845123650',
      shipment_status: 'SHIPPED',
      status: 'VERIFIED_PAID',
      qr_code_base64: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://www.sandbox.paypal.com/invoice/p/#INV2-SRH-NY-12000',
      approval_url: 'https://www.sandbox.paypal.com/invoice/p/#INV2-SRH-NY-12000',
      created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: 'tx_david_02',
      merchant_id: defaultMerchant.id,
      paypal_invoice_id: 'INV2-DVD-CH-9000',
      customer_name: 'David Miller',
      customer_country: 'United States (Chicago)',
      item_name: 'Kalamkari Hand-Painted Wall Hanging (Tree of Life)',
      spoken_amount_inr: 9000.00,
      settlement_amount_usd: 107.14,
      settlement_currency: 'USD',
      paypal_rail: 'INVOICE',
      carrier_code: undefined,
      tracking_number: undefined,
      shipment_status: 'NOT_SHIPPED',
      status: 'AWAITING_BUYER', // Overdue / Unpaid
      qr_code_base64: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://www.sandbox.paypal.com/invoice/p/#INV2-DVD-CH-9000',
      approval_url: 'https://www.sandbox.paypal.com/invoice/p/#INV2-DVD-CH-9000',
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'tx_emma_03',
      merchant_id: defaultMerchant.id,
      paypal_order_id: '5TR71044KL7788990',
      paypal_invoice_id: 'INV2-EMA-LD-16800',
      paypal_capture_id: 'CAP_5TR71044KL_01',
      customer_name: 'Emma Watson',
      customer_country: 'United Kingdom (London)',
      item_name: 'Lost-Wax Cast Brass Nataraja Craft (12 inch Temple Finish)',
      spoken_amount_inr: 16800.00,
      settlement_amount_usd: 200.00,
      settlement_currency: 'USD',
      paypal_rail: 'ORDER',
      carrier_code: undefined,
      tracking_number: undefined,
      shipment_status: 'NOT_SHIPPED', // Verified paid, awaiting shipment tracking
      status: 'VERIFIED_PAID',
      qr_code_base64: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://www.sandbox.paypal.com/checkoutnow?token=5TR71044KL7788990',
      approval_url: 'https://www.sandbox.paypal.com/checkoutnow?token=5TR71044KL7788990',
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    }
  ];

  for (const tx of demoTransactions) {
    await db.saveTransaction(tx);
  }

  // 3. Authoritative Immutable Ledger Entries
  const demoLedgerEntries: LedgerEntry[] = [
    {
      id: 'ledg_sarah_01',
      merchant_id: defaultMerchant.id,
      paypal_transaction_id: 'tx_sarah_01',
      event_type: 'PAYMENT_CAPTURE',
      amount_inr: 12000.00,
      amount_usd: 142.86,
      currency: 'USD',
      paypal_reference_id: 'CAP_8XY92019AB_01',
      description: 'Captured PayPal Sandbox payment for Sarah Jenkins (Pochampally Saree) @ Illustrative FX 84.00',
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: 'ledg_emma_03',
      merchant_id: defaultMerchant.id,
      paypal_transaction_id: 'tx_emma_03',
      event_type: 'PAYMENT_CAPTURE',
      amount_inr: 16800.00,
      amount_usd: 200.00,
      currency: 'USD',
      paypal_reference_id: 'CAP_5TR71044KL_01',
      description: 'Captured PayPal Sandbox payment for Emma Watson (Brass Nataraja Craft) @ Illustrative FX 84.00',
      created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    }
  ];

  for (const l of demoLedgerEntries) {
    await db.addLedgerEntry(l);
  }

  // 4. Initial Trust Boundary Audit Trail
  const demoAuditEvents: WebhookAndAuditEvent[] = [
    {
      id: 'aud_init_01',
      webhook_event_id: 'WH-EVT-1001-DEMO',
      stage_name: '5. WEBHOOK VERIFIED & LEDGER LOCKED',
      action_name: 'PAYMENT.CAPTURE.COMPLETED',
      verification_status: 'SUCCESS',
      details: 'Cryptographically verified capture for Sarah Jenkins: $142.86 USD (₹12,000 INR). Signature matched PAYPAL-CERT-URL.',
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: 'aud_init_02',
      webhook_event_id: 'WH-EVT-1002-DEMO',
      stage_name: '4. PAYPAL API EXECUTED',
      action_name: 'create_shipment_tracking',
      verification_status: 'SUCCESS',
      details: 'Carrier registered: DHL #9845123650. Supports PayPal Seller Protection and accelerates funds access.',
      timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    },
    {
      id: 'aud_init_03',
      webhook_event_id: 'WH-EVT-1003-DEMO',
      stage_name: '5. WEBHOOK VERIFIED & LEDGER LOCKED',
      action_name: 'PAYMENT.CAPTURE.COMPLETED',
      verification_status: 'SUCCESS',
      details: 'Cryptographically verified capture for Emma Watson: $200.00 USD (₹16,800 INR). Ledger entry locked.',
      timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    }
  ];

  for (const aud of demoAuditEvents) {
    await db.recordAuditEvent(aud);
  }

  console.log('[Seed] Database seeded with Lakshmi Handlooms & Crafts demo records & audit logs.');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
