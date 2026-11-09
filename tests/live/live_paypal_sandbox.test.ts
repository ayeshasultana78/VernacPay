import { describe, it, expect, beforeAll } from 'vitest';
import dotenv from 'dotenv';
import { paypalService } from '../../src/server/services/paypalService.js';

dotenv.config();

describe('[LIVE INTEGRATION] Real PayPal Sandbox API', () => {
  let accessToken: string;
  let createdOrderId: string;

  beforeAll(async () => {
    // Acquire real OAuth2 bearer token
    accessToken = await paypalService.getAccessToken();
  });

  it('generates a real PayPal Sandbox OAuth2 token', () => {
    expect(accessToken).toBeDefined();
    expect(accessToken.length).toBeGreaterThan(20);
    expect(accessToken).not.toContain('mock');
    expect(accessToken).not.toContain('simulated');
  });

  it('creates a REAL Orders v2 on PayPal Sandbox (HTTP 201)', async () => {
    const order = await paypalService.createOrder({
      customerName: 'Sarah Jenkins (Live Test)',
      itemName: 'Pochampally Handwoven Silk Saree',
      quantity: 1,
      amountUsd: 142.86,
    });

    expect(order.id).toBeDefined();
    expect(order.id.length).toBeGreaterThan(10);
    expect(order.status).toBe('CREATED');
    expect(order.approval_url).toContain('https://www.sandbox.paypal.com/checkoutnow?token=');
    expect(order.approval_url).toContain(order.id);

    createdOrderId = order.id;
    console.log('[LIVE TEST] PayPal Sandbox Order ID:', order.id);
    console.log('[LIVE TEST] Approval URL:', order.approval_url);
  });

  it('fetches the live order details from PayPal Sandbox', async () => {
    expect(createdOrderId).toBeDefined();
    const liveOrder = await paypalService.getOrder(createdOrderId);
    expect(liveOrder.id).toBe(createdOrderId);
    expect(liveOrder.status).toBe('CREATED');
    expect(liveOrder.intent).toBe('CAPTURE');
  });

  it('strictly FAILS CLOSED if capture is attempted before buyer approval', async () => {
    expect(createdOrderId).toBeDefined();
    let errorCaught: any = null;
    try {
      await paypalService.captureOrder(createdOrderId);
    } catch (err: any) {
      errorCaught = err;
    }
    expect(errorCaught).not.toBeNull();
    expect(errorCaught.message).toContain('ORDER_NOT_APPROVED');
    console.log('[LIVE TEST] Verified Fail-Closed Capture Protection:', errorCaught.message);
  });
});
