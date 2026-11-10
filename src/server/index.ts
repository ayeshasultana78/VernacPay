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

// 0. Render Deployment Health Check Endpoint
app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1. Health & Config Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const isLive = Boolean(process.env.PAYPAL_CLIENT_ID && !process.env.PAYPAL_CLIENT_ID.startsWith('mock-'));
  const hasGroq = Boolean(process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_') && !process.env.GROQ_API_KEY.startsWith('mock-'));
  const hasSarvam = Boolean(process.env.SARVAM_API_KEY && !process.env.SARVAM_API_KEY.includes('your_') && !process.env.SARVAM_API_KEY.startsWith('mock-'));

  res.json({
    status: 'HEALTHY',
    service: 'VernacPay-Global v2.0',
    environment: isLive ? 'PAYPAL_LIVE_SANDBOX' : 'SIMULATED_DEMO',
    mode: isLive ? 'LIVE' : 'DEMO',
    database_engine: db.isPostgres ? 'POSTGRESQL' : 'IN_MEMORY_PERSISTENT',
    database_connected: db.isPostgres,
    fx_rate: fxService.getCurrentRate('INR', 'USD'),
    providers: {
      paypal: {
        status: isLive ? 'CONFIGURED_LIVE_SANDBOX' : 'MOCK_FALLBACK',
        base_url: process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com',
      },
      postgres: {
        connected: db.isPostgres,
        engine: db.isPostgres ? 'MANAGED_POSTGRESQL' : 'IN_MEMORY',
      },
      sarvam: {
        status: hasSarvam ? 'CONFIGURED' : 'DEMO_PRESETS_ACTIVE',
        models: { stt: 'saaras:v3', tts: 'bulbul:v3' },
      },
      groq: {
        status: hasGroq ? 'CONFIGURED' : 'LOCAL_PARSER_ACTIVE',
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      },
    },
    sandbox_buyer: {
      email: process.env.PAYPAL_SANDBOX_BUYER_EMAIL || 'sb-pj4347w53813178@personal.example.com',
      password: process.env.PAYPAL_SANDBOX_BUYER_PASSWORD ? '••••••••' : '[Configured in Environment]',
    },
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

// --- Per-IP Rate Limiter for Voice Ingestion (15 req/min to protect hackathon quotas) ---
const ipRequestTimestamps = new Map<string, number[]>();
function checkRateLimit(ip: string, limit = 15, windowMs = 60 * 1000): boolean {
  const now = Date.now();
  const timestamps = (ipRequestTimestamps.get(ip) || []).filter(t => now - t < windowMs);
  if (timestamps.length >= limit) {
    return false;
  }
  timestamps.push(now);
  ipRequestTimestamps.set(ip, timestamps);
  return true;
}

// 9. Multilingual Voice Processing
app.post('/api/voice/process', upload.single('audio'), async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp, 15, 60 * 1000)) {
    return res.status(429).json({
      type: 'REJECTED',
      error: 'RATE_LIMIT_EXCEEDED',
      message_english: 'Rate limit: 15 voice requests per minute per judge to protect API quotas. Please wait a moment.',
      message_native: 'రేట్ పరిమితి దాటింది: API కోటాను రక్షించడానికి నిమిషానికి 15 అభ్యర్థనలు మాత్రమే అనుమతించబడతాయి. దయచేసి కొద్దిసేపు వేచి ఉండండి.',
    });
  }

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
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp, 20, 60 * 1000)) {
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Rate limit: 20 confirmations per minute per judge to protect API quotas. Please wait a moment.',
    });
  }
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

    if (eventType === 'INVOICING.INVOICE.PAID') {
      const resource = event.resource;
      const invoiceId = resource.id;
      const captureId = resource.payments?.[0]?.payment_id || `PAY_${Date.now()}`;

      await orchestrator.processVerifiedPaymentCapture({
        invoiceId,
        captureId,
        webhookEventId: eventId,
      });
    } else if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
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

// 14. PayPal Return URL Handler (Fallback for Webhook Delay / Direct Buyer Capture)
app.get('/api/paypal/return', async (req: Request, res: Response) => {
  try {
    const orderId = (req.query.token || req.query.orderId) as string;
    const payerId = req.query.PayerID as string;

    if (!orderId) {
      return res.status(400).send('Missing PayPal Order Token');
    }

    // Capture payment synchronously
    const captureResult = await paypalService.captureOrder(orderId);

    // Process verified capture in orchestrator with idempotency
    const updatedTx = await orchestrator.processVerifiedPaymentCapture({
      orderId,
      captureId: captureResult.capture_id,
    });

    // Notify connected UI via audit service
    await auditService.recordStage({
      stage: '5. WEBHOOK VERIFIED & LEDGER LOCKED',
      actionName: 'return_url_capture',
      status: 'SUCCESS',
      details: `PayPal return URL captured synchronously for Order ${orderId} (Payer: ${payerId || 'Sandbox Buyer'}).`,
    });

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Successful - VernacPay-Global</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #07111F; color: #F8FAFC; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: #0D1929; border: 1px solid rgba(24, 201, 149, 0.3); border-radius: 16px; padding: 32px; max-width: 440px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            .icon { width: 56px; height: 56px; background: rgba(24, 201, 149, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #18C995; font-size: 28px; }
            h1 { font-size: 20px; margin: 0 0 8px; color: #18C995; }
            p { font-size: 14px; color: #94A3B8; margin: 0 0 20px; line-height: 1.5; }
            .badge { display: inline-block; background: #162840; padding: 6px 12px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #38BDF8; margin-bottom: 24px; }
            a { display: inline-block; background: #18C995; color: #020617; font-weight: 600; text-decoration: none; padding: 10px 24px; border-radius: 10px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✓</div>
            <h1>Payment Verified via PayPal Sandbox</h1>
            <p>Your cross-border payment has been captured and cryptographically recorded on the exporter's immutable ledger.</p>
            <div class="badge">Order ID: ${orderId}</div>
            <div>
              <a href="/?payment_success=true&order_id=${orderId}">Return to VernacPay Dashboard</a>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error('[PayPal Return Error]:', err);
    res.status(500).send('Error processing payment capture: ' + err.message);
  }
});

// 14b. PayPal Cancel URL Handler (Buyer cancelled on PayPal Checkout)
app.get('/api/paypal/cancel', async (req: Request, res: Response) => {
  try {
    const orderId = (req.query.token || req.query.orderId) as string;
    if (orderId) {
      const txs = await db.listTransactions();
      const tx = txs.find(t => t.paypal_order_id === orderId || t.id === orderId);
      if (tx) {
        tx.status = 'CANCELLED';
        tx.updated_at = new Date().toISOString();
        await db.saveTransaction(tx);
        await auditService.recordStage({
          stage: '4. PAYPAL API EXECUTED',
          actionName: 'order_cancellation',
          status: 'WARNING',
          details: `Buyer cancelled PayPal checkout for Order ${orderId}. Row updated to CANCELLED.`,
        });
      }
    }

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Cancelled - VernacPay-Global</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #07111F; color: #F8FAFC; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: #0D1929; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 32px; max-width: 440px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            .icon { width: 56px; height: 56px; background: rgba(239, 68, 68, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #EF4444; font-size: 28px; }
            h1 { font-size: 20px; margin: 0 0 8px; color: #EF4444; }
            p { font-size: 14px; color: #94A3B8; margin: 0 0 20px; line-height: 1.5; }
            .badge { display: inline-block; background: #162840; padding: 6px 12px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #F87171; margin-bottom: 24px; }
            a { display: inline-block; background: #334155; color: #F8FAFC; font-weight: 600; text-decoration: none; padding: 10px 24px; border-radius: 10px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✕</div>
            <h1>PayPal Checkout Cancelled</h1>
            <p>Buyer chose to cancel or return from PayPal checkout. The transaction has been updated to CANCELLED on the ledger.</p>
            ${orderId ? `<div class="badge">Order ID: ${orderId}</div>` : ''}
            <div>
              <a href="/?order_cancelled=true">Return to VernacPay Dashboard</a>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (err: any) {
    res.status(500).send('Error processing cancellation: ' + err.message);
  }
});

// 15. Real-Time Order Polling Fallback (For instant UI updates while webhook travels)
app.get('/api/paypal/order-status/:orderId', async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.orderId);
    const txs = await db.listTransactions();
    const tx = txs.find(t => t.paypal_order_id === orderId || t.id === orderId);

    if (tx && tx.status === 'VERIFIED_PAID') {
      return res.json({ status: 'VERIFIED_PAID', transaction: tx });
    }

    // Check with live PayPal
    const liveOrder = await paypalService.getOrder(orderId);
    if (liveOrder && (liveOrder.status === 'COMPLETED' || liveOrder.status === 'APPROVED')) {
      const updatedTx = await orchestrator.processVerifiedPaymentCapture({
        orderId,
        captureId: liveOrder.purchase_units?.[0]?.payments?.captures?.[0]?.id || `CAP_${orderId}`,
      });
      return res.json({ status: 'VERIFIED_PAID', transaction: updatedTx });
    }

    res.json({ status: tx?.status || 'AWAITING_BUYER', liveStatus: liveOrder?.status || 'UNKNOWN' });
  } catch (err: any) {
    res.status(200).json({ status: 'AWAITING_BUYER', note: err.message });
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

  // Startup warm check
  console.log('[Startup Warm Check] Verifying system readiness...');
  try {
    const isLive = Boolean(process.env.PAYPAL_CLIENT_ID && !process.env.PAYPAL_CLIENT_ID.startsWith('mock-'));
    if (isLive) {
      await paypalService.getAccessToken();
      console.log('  ✓ PayPal Sandbox OAuth connection verified');
    } else {
      console.log('  ! PayPal running in mock credentials mode');
    }
  } catch (err: any) {
    console.warn('  ✗ PayPal Sandbox warm check failed:', err.message);
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
