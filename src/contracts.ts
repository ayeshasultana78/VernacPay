import { z } from 'zod';

export const LanguageCodeSchema = z.enum(['te-IN', 'hi-IN', 'en-IN']);
export type LanguageCode = z.infer<typeof LanguageCodeSchema>;

export const TrustStageNumberSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);
export type TrustStageNumber = z.infer<typeof TrustStageNumberSchema>;

export const TrustStageStateSchema = z.enum(['idle', 'active', 'done', 'blocked']);
export type TrustStageState = z.infer<typeof TrustStageStateSchema>;

export const TrustStageEventSchema = z.object({
  runId: z.string(),
  stage: TrustStageNumberSchema,
  state: TrustStageStateSchema,
  label: z.string().optional(),
  reason: z.string().optional(),
  timestamp: z.string().default(() => new Date().toISOString()),
});
export type TrustStageEvent = z.infer<typeof TrustStageEventSchema>;

export const StagedKindSchema = z.enum(['invoice', 'reminder', 'tracking']);
export type StagedKind = z.infer<typeof StagedKindSchema>;

export const FxQuoteSchema = z.object({
  baseCurrency: z.string().default('INR'),
  quoteCurrency: z.string().default('USD'),
  rate: z.number().default(84.00),
  spokenAmountInr: z.number(),
  settlementAmountUsd: z.number(),
  expiresAt: z.string(),
});
export type FxQuote = z.infer<typeof FxQuoteSchema>;

export const StagedConfirmationEventSchema = z.object({
  id: z.string(),
  authCode: z.string(), // e.g. #CNF-8921
  kind: StagedKindSchema,
  payload: z.record(z.any()),
  customerName: z.string(),
  customerEmail: z.string().optional(),
  itemName: z.string(),
  quantity: z.number().int().positive().default(1),
  spokenAmountInr: z.number().optional(),
  settlementAmountUsd: z.number().optional(),
  fxQuote: FxQuoteSchema.optional(),
  expiresAt: z.string(),
  status: z.enum(['PENDING_APPROVAL', 'APPROVED', 'CANCELLED', 'EXPIRED']).default('PENDING_APPROVAL'),
});
export type StagedConfirmationEvent = z.infer<typeof StagedConfirmationEventSchema>;

export const PaymentStatusSchema = z.enum(['VERIFIED_PAID', 'UNPAID', 'STAGED']);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const LedgerRowSchema = z.object({
  id: z.string(),
  referenceId: z.string(), // PayPal invoice or order id
  customerName: z.string(),
  customerCountry: z.string().default('United States (New York)'),
  itemDescription: z.string(),
  spokenAmountInr: z.number(),
  settlementAmountUsd: z.number(),
  status: PaymentStatusSchema,
  carrierCode: z.enum(['DHL', 'FEDEX', 'UPS', 'IND_POST']).optional(),
  trackingNumber: z.string().optional(),
  shipmentStatus: z.enum(['NOT_SHIPPED', 'SHIPPED', 'DELIVERED']).default('NOT_SHIPPED'),
  qrCodeUrl: z.string().optional(),
  approvalUrl: z.string().optional(),
  updatedAt: z.string().default(() => new Date().toISOString()),
});
export type LedgerRow = z.infer<typeof LedgerRowSchema>;

export const LedgerUpdateEventSchema = z.object({
  row: LedgerRowSchema,
  op: z.enum(['add', 'update']),
});
export type LedgerUpdateEvent = z.infer<typeof LedgerUpdateEventSchema>;

export const FilterGridEventSchema = z.object({
  filterModel: z.record(z.any()).optional(),
  quickFilter: z.string().optional(),
  exportCsv: z.boolean().optional(),
  label: z.string().optional(),
});
export type FilterGridEvent = z.infer<typeof FilterGridEventSchema>;

export const TranscriptEventSchema = z.object({
  original: z.string(),
  english: z.string(),
  lang: LanguageCodeSchema,
  audioBase64: z.string().optional(),
});
export type TranscriptEvent = z.infer<typeof TranscriptEventSchema>;

export const ErrorEventSchema = z.object({
  code: z.string(),
  message: z.string(),
});
export type ErrorEvent = z.infer<typeof ErrorEventSchema>;
