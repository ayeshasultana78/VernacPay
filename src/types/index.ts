export type LanguageCode = 'te-IN' | 'hi-IN' | 'ur-IN' | 'en-IN';

export interface Merchant {
  id: string;
  name: string;
  business_name: string;
  email: string;
  default_language: LanguageCode;
  default_settlement_currency: string;
  created_at: string;
}

export interface FxQuote {
  id: string;
  base_currency: string;
  quote_currency: string;
  exchange_rate: number;
  spoken_amount_inr: number;
  settlement_amount_usd: number;
  expires_at: string;
  created_at: string;
}

export type StagedStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'CANCELLED' | 'EXPIRED';

export interface StagedConfirmation {
  id: string;
  auth_code: string; // e.g. #CNF-8921
  merchant_id: string;
  tool_name: string;
  payload: any;
  validation_hash: string;
  fx_quote_id?: string;
  spoken_amount_inr?: number;
  settlement_amount_usd?: number;
  customer_name?: string;
  customer_email?: string;
  item_name?: string;
  paypal_rail: 'ORDER' | 'INVOICE' | 'SUBSCRIPTION' | 'TRACKING' | 'REMINDER' | 'DISPUTE_REFUND';
  status: StagedStatus;
  expires_at: string;
  created_at: string;
}

export interface PaymentRequest {
  id: string;
  merchant_id: string;
  customer_name: string;
  customer_email: string;
  item_description: string;
  quantity: number;
  spoken_amount_inr: number;
  settlement_amount_usd: number;
  settlement_currency: string;
  paypal_resource_type: 'ORDER' | 'INVOICE' | 'SUBSCRIPTION';
  created_at: string;
}

export type TransactionStatus = 
  | 'VERIFIED_PAID' 
  | 'PENDING_APPROVAL' 
  | 'AWAITING_BUYER' 
  | 'SUBSCRIPTION_ACTIVE' 
  | 'REFUNDED' 
  | 'DISPUTED'
  | 'CANCELLED';

export interface PayPalTransaction {
  id: string;
  merchant_id: string;
  payment_request_id?: string;
  paypal_order_id?: string;
  paypal_invoice_id?: string;
  paypal_subscription_id?: string;
  paypal_capture_id?: string;
  customer_name: string;
  customer_country?: string;
  item_name: string;
  spoken_amount_inr: number;
  settlement_amount_usd: number;
  settlement_currency: string;
  paypal_rail: 'ORDER' | 'INVOICE' | 'SUBSCRIPTION';
  qr_code_base64?: string;
  approval_url?: string;
  carrier_code?: string;
  tracking_number?: string;
  shipment_status?: 'NOT_SHIPPED' | 'SHIPPED' | 'DELIVERED';
  dispute_id?: string;
  dispute_status?: string;
  status: TransactionStatus;
  created_at: string;
  updated_at: string;
}

export interface LedgerEntry {
  id: string;
  merchant_id: string;
  paypal_transaction_id?: string;
  event_type: 'PAYMENT_CAPTURE' | 'INVOICE_SENT' | 'SUBSCRIPTION_CREATED' | 'REFUND_ISSUED';
  amount_inr: number;
  amount_usd: number;
  currency: string;
  paypal_reference_id: string;
  description: string;
  created_at: string;
}

export type TrustBoundaryStage = 
  | '1. AI PROPOSED (Untrusted)' 
  | '2. ZOD SCHEMA VALIDATED' 
  | '3. MERCHANT AUTHORIZED' 
  | '4. PAYPAL API EXECUTED' 
  | '5. WEBHOOK VERIFIED & LEDGER LOCKED';

export interface WebhookAndAuditEvent {
  id: string;
  webhook_event_id?: string;
  stage_name: TrustBoundaryStage;
  action_name: string;
  verification_status: 'SUCCESS' | 'WARNING' | 'REJECTED' | 'PENDING';
  details: string;
  raw_payload?: any;
  timestamp: string;
}

export interface VoiceTranscriptResult {
  transcript_native: string;
  transcript_english_translation: string;
  detected_language: LanguageCode;
  confidence?: number;
}
