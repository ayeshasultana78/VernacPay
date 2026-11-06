import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './db/db.js';
import { seedDatabase } from './db/seed.js';
import { sarvamService, DEMO_PRESETS } from './services/sarvamService.js';
import { orchestrator } from './agent/orchestrator.js';
import { auditService } from './services/auditService.js';
import { paypalService } from './services/paypalService.js';
import { fxService } from './services/fxService.js';
import { LanguageCode } from '../types/index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per Hackathon blueprint
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Endpoints ---

// 1. Health & Config
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    service: 'VernacPay-Global v2.0',
    environment: 'PAYPAL_SANDBOX',
    fx_rate: fxService.getCurrentRate('INR', 'USD'),
    timestamp: new Date().toISOString(),
  });
});

// 2. Server-Sent Events (SSE) Stream
app.get('/api/sse', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  auditService.registerClient(res);

  // Send initial connection ping
  res.write(`event: connected\ndata: ${JSON.stringify({ connected: true, time: new Date().toISOString() })}\n\n`);
});

// 3. Merchant Profile
app.get('/api/merchant', async (req: Request, res: Response) => {
  const merchant = await db.getMerchant('merchant_pochampally_weavers_01');
  res.json(merchant || {
    id: 'merchant_pochampally_weavers_01',
    name: 'Srinivasa Rao',
    business_name: 'Pochampally Heritage Weaves & Global Crafts',
    email: 'merchant.srinivas@sandbox.vernacpay.com',
    default_language: 'te-IN',
    default_settlement_currency: 'USD',
  });
});

// 4. Transactions for AG Grid
app.get('/api/transactions', async (req: Request, res: Response) => {
  const list = await db.listTransactions();
  res.json(list);
});

// 5. Authoritative Ledger
app.get('/api/ledger', async (req: Request, res: Response) => {
  const entries = await db.listLedgerEntries();
  res.json(entries);
});

// 6. Cryptographic Audit Events
app.get('/api/audit-events', async (req: Request, res: Response) => {
  const events = await db.listAuditEvents(50);
  res.json(events);
});

// 7. Pending Staged Confirmations
app.get('/api/staged-confirmations', async (req: Request, res: Response) => {
  const pending = await db.listPendingStagedConfirmations('merchant_pochampally_weavers_01');
  res.json(pending);
});

// 8. Demo Presets List
app.get('/api/demo-presets', (req: Request, res: Response) => {
  res.json(DEMO_PRESETS);
});

// 9. Multilingual Voice Processing
app.post('/api/voice/process', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const languageCode = (req.body.languageCode || 'te-IN') as LanguageCode;
    const presetKey = req.body.presetKey;
    const directTranscript = req.body.transcript;

    let transcriptResult;

    if (presetKey && DEMO_PRESETS[presetKey]) {
      transcriptResult = await sarvamService.transcribeAudio({ presetKey });
    } else if (directTranscript) {
      const translation = await sarvamService.translateToEnglish(directTranscript, languageCode);
      transcriptResult = {
        transcript_native: directTranscript,
        transcript_english_translation: translation,
        detected_language: languageCode,
      };
    } else if (req.file) {
      transcriptResult = await sarvamService.transcribeAudio({
        audioBuffer: req.file.buffer,
        mimeType: req.file.mimetype,
        languageCode,
      });
    } else {
      // Default fallback demo utterance
      transcriptResult = await sarvamService.transcribeAudio({ presetKey: 'telugu_order' });
    }

    const merchantId = 'merchant_pochampally_weavers_01';
    const turnResponse = await orchestrator.processMerchantUtterance({
      transcript_native: transcriptResult.transcript_native,
      transcript_english: transcriptResult.transcript_english_translation,
      languageCode: transcriptResult.detected_language,
      merchantId,
    });

    res.json({
      ...turnResponse,
      transcript_native: transcriptResult.transcript_native,
      transcript_english: transcriptResult.transcript_english_translation,
      detected_language: transcriptResult.detected_language,
    });
  } catch (err: any) {
    console.error('[Voice Process Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

// 10. Confirm Staged Financial Action (Explicit Merchant Authorization)
app.post('/api/staged/confirm', async (req: Request, res: Response) => {
  try {
    const { authCode } = req.body;
    if (!authCode) {
      return res.status(400).json({ error: 'authCode is required' });
    }

    const result = await orchestrator.executeConfirmedAction(authCode);
    res.json(result);
  } catch (err: any) {
    console.error('[Confirm Staged Error]:', err);
    res.status(400).json({ error: err.message });
  }
});

// 11. Cancel Staged Confirmation
app.post('/api/staged/cancel', async (req: Request, res: Response) => {
  try {
    const { authCode } = req.body;
    const staged = await db.getStagedConfirmation(authCode);
    if (staged) {
      staged.status = 'CANCELLED';
      await db.saveStagedConfirmation(staged);
      await auditService.recordStage({
        stage: '3. MERCHANT AUTHORIZED',
        actionName: 'cancel_staged_action',
        status: 'WARNING',
        details: `Merchant cancelled staged confirmation ${authCode}.`,
      });
    }
    res.json({ success: true, message: 'Action cancelled.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Simulate Sandbox Payment Capture (Helper for judges / video recording)
app.post('/api/sandbox/simulate-capture', async (req: Request, res: Response) => {
  try {
    const { orderId, invoiceId } = req.body;
    const updatedTx = await orchestrator.processVerifiedPaymentCapture({
      orderId,
      invoiceId,
    });
    if (!updatedTx) {
      return res.status(404).json({ error: 'No matching transaction to capture' });
    }
    res.json({ success: true, transaction: updatedTx });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 13. PayPal Webhook Receiver
app.post('/api/paypal/webhook', async (req: Request, res: Response) => {
  try {
    const verification = await paypalService.verifyWebhookSignature({
      headers: req.headers as Record<string, string>,
      rawBody: req.body,
    });

    if (!verification.verified) {
      await auditService.recordStage({
        stage: '5. WEBHOOK VERIFIED & LEDGER LOCKED',
        actionName: 'webhook_signature_check',
        status: 'REJECTED',
        details: 'Rejected unverified PayPal webhook signature.',
      });
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;
    const eventType = event.event_type;
    const eventId = event.id;

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
      const resource = event.resource;
      const orderId = resource.id || resource.supplementary_data?.related_ids?.order_id;
      const captureId = resource.id;

      await orchestrator.processVerifiedPaymentCapture({
        orderId,
        captureId,
        webhookEventId: eventId,
      });
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('[Webhook Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Production Static Assets Serving ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(__dirname, '../../dist-client');
app.use(express.static(clientDistPath));

app.get('*', (req: Request, res: Response) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>VernacPay-Global</title></head>
          <body style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h2>VernacPay-Global Backend Server Active</h2>
            <p>Vite development server runs at <a href="http://localhost:5173">http://localhost:5173</a></p>
          </body>
        </html>
      `);
    }
  });
});

// --- Server Startup & Auto-Seeding ---
async function startServer() {
  await db.init();
  // Auto-seed if database is empty
  const existing = await db.listTransactions();
  if (existing.length === 0) {
    await seedDatabase();
  }

  app.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 VernacPay-Global (VernacPay-AI v2.0) Server Live!`);
    console.log(`📍 Port: http://localhost:${port}`);
    console.log(`🛡️  Trust Boundary: AI Proposes -> Server Validates -> Merchant Authorizes -> PayPal Processes -> Ledger Verifies`);
    console.log(`======================================================\n`);
  });
}

startServer().catch(err => {
  console.error('[Startup Error]:', err);
});
