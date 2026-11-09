import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { 
  Merchant, 
  FxQuote, 
  StagedConfirmation, 
  PaymentRequest, 
  PayPalTransaction, 
  LedgerEntry, 
  WebhookAndAuditEvent 
} from '../../types/index.js';

dotenv.config();

const { Pool } = pg;

// Dual-Engine DB: Tries PostgreSQL first; if unreachable, falls back to memory store
class DatabaseManager {
  private pool: pg.Pool | null = null;
  public isPostgres = false;

  // In-Memory Fallback tables with Map index for zero-friction local run/testing
  public merchants = new Map<string, Merchant>();
  public fx_quotes = new Map<string, FxQuote>();
  public staged_confirmations = new Map<string, StagedConfirmation>();
  public payment_requests = new Map<string, PaymentRequest>();
  public paypal_transactions = new Map<string, PayPalTransaction>();
  public ledger_entries = new Map<string, LedgerEntry>();
  public webhook_and_audit_events = new Map<string, WebhookAndAuditEvent>();

  constructor() {
    const connStr = process.env.DATABASE_URL;
    if (connStr && !connStr.includes('localhost:5432/vernacpay_global_disable_pg')) {
      try {
        this.pool = new Pool({
          connectionString: connStr,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
          connectionTimeoutMillis: 3000,
        });
      } catch (err) {
        console.warn('PostgreSQL pool creation failed, using memory engine:', err);
      }
    }
  }

  async init(): Promise<void> {
    if (this.pool) {
      try {
        const client = await this.pool.connect();
        try {
          const __dirname = path.dirname(fileURLToPath(import.meta.url));
          const schemaPath = path.join(__dirname, 'schema.sql');
          if (fs.existsSync(schemaPath)) {
            const sql = fs.readFileSync(schemaPath, 'utf8');
            await client.query(sql);
          }
          this.isPostgres = true;
          console.log('[DB] PostgreSQL connected and schema verified.');
          return;
        } finally {
          client.release();
        }
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production' && process.env.DEMO_MODE !== 'true') {
          throw new Error(`[CRITICAL] Production database connection failed: ${err.message}. Refusing to start in memory mode when DEMO_MODE is not true.`);
        }
        console.warn(`[DB] PostgreSQL not reachable (${err.message}). Using high-performance Memory/SQLite fallback engine.`);
        this.isPostgres = false;
      }
    } else if (process.env.NODE_ENV === 'production' && process.env.DEMO_MODE !== 'true') {
      throw new Error('[CRITICAL] DATABASE_URL is not set in production. Set DATABASE_URL or set DEMO_MODE=true.');
    }
    console.log('[DB] Running with in-memory authoritative store.');
  }

  async query(text: string, params: any[] = []): Promise<{ rows: any[] }> {
    if (this.isPostgres && this.pool) {
      return this.pool.query(text, params);
    }
    // Return empty array for raw arbitrary SQL in fallback mode
    return { rows: [] };
  }

  // --- Merchant Methods ---
  async getMerchant(id: string): Promise<Merchant | undefined> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('SELECT * FROM merchants WHERE id = $1', [id]);
      return res.rows[0];
    }
    return this.merchants.get(id);
  }

  async saveMerchant(m: Merchant): Promise<void> {
    if (this.isPostgres && this.pool) {
      await this.pool.query(
        `INSERT INTO merchants (id, name, business_name, email, default_language, default_settlement_currency, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET 
           name = EXCLUDED.name,
           business_name = EXCLUDED.business_name,
           email = EXCLUDED.email,
           default_language = EXCLUDED.default_language,
           default_settlement_currency = EXCLUDED.default_settlement_currency`,
        [m.id, m.name, m.business_name, m.email, m.default_language, m.default_settlement_currency, m.created_at]
      );
    }
    this.merchants.set(m.id, m);
  }

  // --- FX Quote Methods ---
  async saveFxQuote(q: FxQuote): Promise<void> {
    if (this.isPostgres && this.pool) {
      await this.pool.query(
        `INSERT INTO fx_quotes (id, base_currency, quote_currency, exchange_rate, spoken_amount_inr, settlement_amount_usd, expires_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [q.id, q.base_currency, q.quote_currency, q.exchange_rate, q.spoken_amount_inr, q.settlement_amount_usd, q.expires_at, q.created_at]
      );
    }
    this.fx_quotes.set(q.id, q);
  }

  async getFxQuote(id: string): Promise<FxQuote | undefined> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('SELECT * FROM fx_quotes WHERE id = $1', [id]);
      return res.rows[0];
    }
    return this.fx_quotes.get(id);
  }

  // --- Staged Confirmation Methods ---
  async saveStagedConfirmation(c: StagedConfirmation): Promise<void> {
    if (this.isPostgres && this.pool) {
      await this.pool.query(
        `INSERT INTO staged_confirmations 
         (id, auth_code, merchant_id, tool_name, payload, validation_hash, fx_quote_id, spoken_amount_inr, settlement_amount_usd, customer_name, customer_email, item_name, paypal_rail, status, expires_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status`,
        [
          c.id, c.auth_code, c.merchant_id, c.tool_name, JSON.stringify(c.payload),
          c.validation_hash, c.fx_quote_id || null, c.spoken_amount_inr || null,
          c.settlement_amount_usd || null, c.customer_name || null, c.customer_email || null,
          c.item_name || null, c.paypal_rail, c.status, c.expires_at, c.created_at
        ]
      );
    }
    this.staged_confirmations.set(c.id, c);
  }

  async getStagedConfirmation(idOrAuthCode: string): Promise<StagedConfirmation | undefined> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        'SELECT * FROM staged_confirmations WHERE id = $1 OR auth_code = $1',
        [idOrAuthCode]
      );
      if (res.rows[0]) {
        const row = res.rows[0];
        return {
          ...row,
          payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
          spoken_amount_inr: row.spoken_amount_inr ? Number(row.spoken_amount_inr) : undefined,
          settlement_amount_usd: row.settlement_amount_usd ? Number(row.settlement_amount_usd) : undefined,
        };
      }
      return undefined;
    }
    for (const item of this.staged_confirmations.values()) {
      if (item.id === idOrAuthCode || item.auth_code === idOrAuthCode) {
        return item;
      }
    }
    return undefined;
  }

  async listPendingStagedConfirmations(merchantId: string): Promise<StagedConfirmation[]> {
    const now = new Date().toISOString();
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `SELECT * FROM staged_confirmations 
         WHERE merchant_id = $1 AND status = 'PENDING_APPROVAL' AND expires_at > $2
         ORDER BY created_at DESC`,
        [merchantId, now]
      );
      return res.rows.map(r => ({
        ...r,
        payload: typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload,
        spoken_amount_inr: r.spoken_amount_inr ? Number(r.spoken_amount_inr) : undefined,
        settlement_amount_usd: r.settlement_amount_usd ? Number(r.settlement_amount_usd) : undefined,
      }));
    }
    return Array.from(this.staged_confirmations.values())
      .filter(c => c.merchant_id === merchantId && c.status === 'PENDING_APPROVAL' && c.expires_at > now)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // --- Transactions & AG Grid Data ---
  async saveTransaction(t: PayPalTransaction): Promise<void> {
    if (this.isPostgres && this.pool) {
      await this.pool.query(
        `INSERT INTO paypal_transactions
         (id, merchant_id, payment_request_id, paypal_order_id, paypal_invoice_id, paypal_subscription_id, paypal_capture_id, customer_name, customer_country, item_name, spoken_amount_inr, settlement_amount_usd, settlement_currency, paypal_rail, qr_code_base64, approval_url, carrier_code, tracking_number, shipment_status, dispute_id, dispute_status, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
         ON CONFLICT (id) DO UPDATE SET
           paypal_capture_id = COALESCE(EXCLUDED.paypal_capture_id, paypal_transactions.paypal_capture_id),
           carrier_code = COALESCE(EXCLUDED.carrier_code, paypal_transactions.carrier_code),
           tracking_number = COALESCE(EXCLUDED.tracking_number, paypal_transactions.tracking_number),
           shipment_status = COALESCE(EXCLUDED.shipment_status, paypal_transactions.shipment_status),
           dispute_id = COALESCE(EXCLUDED.dispute_id, paypal_transactions.dispute_id),
           dispute_status = COALESCE(EXCLUDED.dispute_status, paypal_transactions.dispute_status),
           status = EXCLUDED.status,
           updated_at = EXCLUDED.updated_at`,
        [
          t.id, t.merchant_id, t.payment_request_id || null, t.paypal_order_id || null,
          t.paypal_invoice_id || null, t.paypal_subscription_id || null, t.paypal_capture_id || null,
          t.customer_name, t.customer_country || 'United States', t.item_name,
          t.spoken_amount_inr, t.settlement_amount_usd, t.settlement_currency,
          t.paypal_rail, t.qr_code_base64 || null, t.approval_url || null,
          t.carrier_code || null, t.tracking_number || null, t.shipment_status || 'NOT_SHIPPED',
          t.dispute_id || null, t.dispute_status || null, t.status, t.created_at, t.updated_at
        ]
      );
    }
    this.paypal_transactions.set(t.id, t);
  }

  async getTransaction(id: string): Promise<PayPalTransaction | undefined> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('SELECT * FROM paypal_transactions WHERE id = $1', [id]);
      if (res.rows[0]) {
        const r = res.rows[0];
        return {
          ...r,
          spoken_amount_inr: Number(r.spoken_amount_inr),
          settlement_amount_usd: Number(r.settlement_amount_usd),
        };
      }
      return undefined;
    }
    return this.paypal_transactions.get(id);
  }

  async findTransactionByOrderId(orderId: string): Promise<PayPalTransaction | undefined> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('SELECT * FROM paypal_transactions WHERE paypal_order_id = $1', [orderId]);
      if (res.rows[0]) {
        const r = res.rows[0];
        return {
          ...r,
          spoken_amount_inr: Number(r.spoken_amount_inr),
          settlement_amount_usd: Number(r.settlement_amount_usd),
        };
      }
      return undefined;
    }
    for (const t of this.paypal_transactions.values()) {
      if (t.paypal_order_id === orderId) return t;
    }
    return undefined;
  }

  async listTransactions(merchantId?: string): Promise<PayPalTransaction[]> {
    if (this.isPostgres && this.pool) {
      const query = merchantId 
        ? 'SELECT * FROM paypal_transactions WHERE merchant_id = $1 ORDER BY created_at DESC'
        : 'SELECT * FROM paypal_transactions ORDER BY created_at DESC';
      const params = merchantId ? [merchantId] : [];
      const res = await this.pool.query(query, params);
      return res.rows.map(r => ({
        ...r,
        spoken_amount_inr: Number(r.spoken_amount_inr),
        settlement_amount_usd: Number(r.settlement_amount_usd),
      }));
    }
    let list = Array.from(this.paypal_transactions.values());
    if (merchantId) {
      list = list.filter(t => t.merchant_id === merchantId);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // --- Immutable Ledger ---
  async addLedgerEntry(entry: LedgerEntry): Promise<void> {
    if (this.isPostgres && this.pool) {
      await this.pool.query(
        `INSERT INTO ledger_entries
         (id, merchant_id, paypal_transaction_id, event_type, amount_inr, amount_usd, currency, paypal_reference_id, description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          entry.id, entry.merchant_id, entry.paypal_transaction_id || null, entry.event_type,
          entry.amount_inr, entry.amount_usd, entry.currency, entry.paypal_reference_id,
          entry.description, entry.created_at
        ]
      );
    }
    this.ledger_entries.set(entry.id, entry);
  }

  async listLedgerEntries(merchantId?: string): Promise<LedgerEntry[]> {
    if (this.isPostgres && this.pool) {
      const query = merchantId 
        ? 'SELECT * FROM ledger_entries WHERE merchant_id = $1 ORDER BY created_at DESC'
        : 'SELECT * FROM ledger_entries ORDER BY created_at DESC';
      const params = merchantId ? [merchantId] : [];
      const res = await this.pool.query(query, params);
      return res.rows.map(r => ({
        ...r,
        amount_inr: Number(r.amount_inr),
        amount_usd: Number(r.amount_usd),
      }));
    }
    let list = Array.from(this.ledger_entries.values());
    if (merchantId) {
      list = list.filter(e => e.merchant_id === merchantId);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // --- Audit Events ---
  async recordAuditEvent(ev: WebhookAndAuditEvent): Promise<void> {
    if (this.isPostgres && this.pool) {
      await this.pool.query(
        `INSERT INTO webhook_and_audit_events
         (id, webhook_event_id, stage_name, action_name, verification_status, details, raw_payload, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (webhook_event_id) DO NOTHING`,
        [
          ev.id, ev.webhook_event_id || null, ev.stage_name, ev.action_name,
          ev.verification_status, ev.details, JSON.stringify(ev.raw_payload || {}), ev.timestamp
        ]
      );
    }
    this.webhook_and_audit_events.set(ev.id, ev);
  }

  async listAuditEvents(limit = 50): Promise<WebhookAndAuditEvent[]> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        'SELECT * FROM webhook_and_audit_events ORDER BY timestamp DESC LIMIT $1',
        [limit]
      );
      return res.rows.map(r => ({
        ...r,
        raw_payload: typeof r.raw_payload === 'string' ? JSON.parse(r.raw_payload) : r.raw_payload,
      }));
    }
    return Array.from(this.webhook_and_audit_events.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

export const db = new DatabaseManager();
