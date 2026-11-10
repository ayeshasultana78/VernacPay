// VernacPay-Global Authoritative PostgreSQL Schema
// Embedded as TypeScript constant to guarantee execution in production environments (Render/Docker)
// where non-TypeScript files (schema.sql) are not automatically emitted to dist/ by tsc.

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS merchants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    default_language VARCHAR(10) NOT NULL DEFAULT 'te-IN',
    default_settlement_currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fx_quotes (
    id VARCHAR(64) PRIMARY KEY,
    base_currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    quote_currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    exchange_rate NUMERIC(12, 4) NOT NULL,
    spoken_amount_inr NUMERIC(12, 2) NOT NULL,
    settlement_amount_usd NUMERIC(12, 2) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staged_confirmations (
    id VARCHAR(64) PRIMARY KEY,
    auth_code VARCHAR(32) UNIQUE NOT NULL,
    merchant_id VARCHAR(64) NOT NULL,
    tool_name VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    validation_hash VARCHAR(64) NOT NULL,
    fx_quote_id VARCHAR(64),
    spoken_amount_inr NUMERIC(12, 2),
    settlement_amount_usd NUMERIC(12, 2),
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    item_name VARCHAR(255),
    paypal_rail VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_requests (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    item_description TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    spoken_amount_inr NUMERIC(12, 2) NOT NULL,
    settlement_amount_usd NUMERIC(12, 2) NOT NULL,
    settlement_currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    paypal_resource_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS paypal_transactions (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL,
    payment_request_id VARCHAR(64),
    paypal_order_id VARCHAR(100),
    paypal_invoice_id VARCHAR(100),
    paypal_subscription_id VARCHAR(100),
    paypal_capture_id VARCHAR(100) UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_country VARCHAR(100) DEFAULT 'United States',
    item_name VARCHAR(255) NOT NULL,
    spoken_amount_inr NUMERIC(12, 2) NOT NULL,
    settlement_amount_usd NUMERIC(12, 2) NOT NULL,
    settlement_currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    paypal_rail VARCHAR(50) NOT NULL,
    qr_code_base64 TEXT,
    approval_url TEXT,
    carrier_code VARCHAR(50),
    tracking_number VARCHAR(100),
    shipment_status VARCHAR(50) NOT NULL DEFAULT 'NOT_SHIPPED',
    dispute_id VARCHAR(100),
    dispute_status VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_entries (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL,
    paypal_transaction_id VARCHAR(64),
    event_type VARCHAR(50) NOT NULL,
    amount_inr NUMERIC(12, 2) NOT NULL,
    amount_usd NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    paypal_reference_id VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webhook_and_audit_events (
    id VARCHAR(64) PRIMARY KEY,
    webhook_event_id VARCHAR(100) UNIQUE,
    stage_name VARCHAR(100) NOT NULL,
    action_name VARCHAR(100) NOT NULL,
    verification_status VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    raw_payload JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_paypal_order ON paypal_transactions(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_paypal_invoice ON paypal_transactions(paypal_invoice_id);
CREATE INDEX IF NOT EXISTS idx_staged_status ON staged_confirmations(status);
CREATE INDEX IF NOT EXISTS idx_ledger_merchant ON ledger_entries(merchant_id);
`;
