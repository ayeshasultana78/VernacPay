import { z } from 'zod';

// --- Mutating Tool Schemas (Require Explicit Merchant Authorization) ---

export const StageInvoiceWithQrSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_email: z.string().email().optional().default('buyer.sandbox@vernacpay.com'),
  item_name: z.string().min(1, 'Item name is required'),
  quantity: z.number().int().positive().default(1),
  spoken_amount_inr: z.number().positive('Spoken amount in INR must be positive'),
  settlement_currency: z.string().default('USD'),
});

export const StageInvoiceReminderSchema = z.object({
  invoice_id: z.string().optional(),
  customer_name: z.string().optional(),
  note: z.string().optional().default('Friendly reminder: PayPal cross-border invoice payment overdue.'),
}).refine(data => data.invoice_id || data.customer_name, {
  message: 'Either invoice_id or customer_name must be provided',
});

export const StageShipmentTrackingSchema = z.object({
  customer_name: z.string().optional(),
  order_id: z.string().optional(),
  invoice_id: z.string().optional(),
  carrier: z.enum(['DHL', 'FEDEX', 'UPS', 'IND_POST']),
  tracking_number: z.string().min(4, 'Tracking number must be at least 4 characters'),
}).refine(data => data.customer_name || data.order_id || data.invoice_id, {
  message: 'Customer name or order/invoice reference must be provided',
});

// --- Read-Only & UI Tool Schemas (Immediate Execution after Zod Validation) ---

export const CheckPaymentStatusSchema = z.object({
  customer_name: z.string().optional(),
  order_id: z.string().optional(),
  invoice_id: z.string().optional(),
});

export const GetVerifiedSummarySchema = z.object({
  time_period: z.enum(['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'ALL_TIME']).default('ALL_TIME'),
  currency: z.string().default('ALL'),
});

export const ListUnpaidInvoicesSchema = z.object({
  filter_type: z.enum(['ALL_UNPAID', 'OVERDUE_INVOICES']).default('ALL_UNPAID'),
});

export const FilterAgGridLedgerSchema = z.object({
  action: z.enum(['FILTER', 'SORT', 'EXPORT_CSV', 'RESET']),
  filter_field: z.string().optional(),
  filter_value: z.string().optional(),
  sort_field: z.string().optional(),
  sort_direction: z.enum(['asc', 'desc']).optional(),
  speech_summary: z.string().optional(),
});

// Full Tool Registry Specification for Claude / LLM function calling
export const TOOL_DEFINITIONS = [
  {
    name: 'stage_invoice_with_qr',
    description: 'Stage a PayPal Invoicing v2 cross-border invoice with scannable QR code and illustrative FX conversion. Requires explicit merchant approval.',
    parameters: {
      type: 'object',
      properties: {
        customer_name: { type: 'string', description: 'Name of the buyer (e.g. Sarah)' },
        customer_email: { type: 'string', description: 'Buyer email (optional)' },
        item_name: { type: 'string', description: 'Item or export goods description (e.g. Pochampally Silk Saree)' },
        quantity: { type: 'integer', description: 'Item quantity (e.g. 2)' },
        spoken_amount_inr: { type: 'number', description: 'Amount spoken by merchant in INR (e.g. 12000)' },
        settlement_currency: { type: 'string', description: 'Settlement currency (default USD)' },
      },
      required: ['customer_name', 'item_name', 'spoken_amount_inr'],
    },
  },
  {
    name: 'stage_invoice_reminder',
    description: 'Stage an official PayPal invoice reminder (Invoicing v2 /remind) for an overdue invoice. Requires explicit merchant approval.',
    parameters: {
      type: 'object',
      properties: {
        invoice_id: { type: 'string', description: 'PayPal Invoice ID if known' },
        customer_name: { type: 'string', description: 'Name of the overdue customer (e.g. David)' },
        note: { type: 'string', description: 'Optional reminder note' },
      },
    },
  },
  {
    name: 'stage_shipment_tracking',
    description: 'Stage shipping tracking upload to PayPal (DHL, FedEx, UPS, IndiaPost) to support PayPal Seller Protection and accelerate funds access. Requires explicit merchant approval.',
    parameters: {
      type: 'object',
      properties: {
        customer_name: { type: 'string', description: 'Customer whose order has shipped (e.g. Emma)' },
        order_id: { type: 'string', description: 'PayPal Order ID if specified' },
        carrier: { type: 'string', enum: ['DHL', 'FEDEX', 'UPS', 'IND_POST'], description: 'Shipping carrier' },
        tracking_number: { type: 'string', description: 'Tracking ID (e.g. DHL9845123650)' },
      },
      required: ['carrier', 'tracking_number'],
    },
  },
  {
    name: 'check_payment_status',
    description: 'Query payment status from the verified PostgreSQL ledger and PayPal API. Executes immediately (Read-Only).',
    parameters: {
      type: 'object',
      properties: {
        customer_name: { type: 'string', description: 'Customer name' },
        order_id: { type: 'string', description: 'PayPal Order ID' },
        invoice_id: { type: 'string', description: 'PayPal Invoice ID' },
      },
    },
  },
  {
    name: 'get_verified_summary',
    description: 'Calculate verified totals (USD and INR) directly from the authoritative ledger. Executes immediately (Read-Only).',
    parameters: {
      type: 'object',
      properties: {
        time_period: { type: 'string', enum: ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'ALL_TIME'] },
        currency: { type: 'string', description: 'Filter currency' },
      },
    },
  },
  {
    name: 'list_unpaid_invoices',
    description: 'Query all pending, unpaid invoices from the ledger. Executes immediately (Read-Only).',
    parameters: {
      type: 'object',
      properties: {
        filter_type: { type: 'string', enum: ['ALL_UNPAID', 'OVERDUE_INVOICES'] },
      },
    },
  },
  {
    name: 'filter_ag_grid_ledger',
    description: 'Filter, sort, or export the AG Grid merchant table in real time via SSE. Executes immediately (UI view only).',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['FILTER', 'SORT', 'EXPORT_CSV', 'RESET'] },
        filter_field: { type: 'string', description: 'Column to filter by (e.g. status, customer_name)' },
        filter_value: { type: 'string', description: 'Filter match value (e.g. VERIFIED_PAID, AWAITING_BUYER)' },
        sort_field: { type: 'string', description: 'Column to sort' },
        sort_direction: { type: 'string', enum: ['asc', 'desc'] },
        speech_summary: { type: 'string', description: 'Natural language summary to speak to merchant' },
      },
      required: ['action'],
    },
  },
];
