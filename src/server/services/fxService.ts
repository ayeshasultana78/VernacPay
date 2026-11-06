import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';
import { FxQuote } from '../../types/index.js';

export class FxService {
  private defaultInrToUsdRate: number;

  constructor() {
    this.defaultInrToUsdRate = parseFloat(process.env.FX_INR_TO_USD_RATE || '84.00');
  }

  getCurrentRate(baseCurrency = 'INR', quoteCurrency = 'USD'): number {
    if (baseCurrency === 'INR' && quoteCurrency === 'USD') {
      return this.defaultInrToUsdRate;
    }
    if (baseCurrency === 'USD' && quoteCurrency === 'INR') {
      return 1 / this.defaultInrToUsdRate;
    }
    if (baseCurrency === 'INR' && quoteCurrency === 'EUR') {
      return this.defaultInrToUsdRate * 1.08; // approximate cross-rate
    }
    if (baseCurrency === 'INR' && quoteCurrency === 'GBP') {
      return this.defaultInrToUsdRate * 1.28;
    }
    return this.defaultInrToUsdRate;
  }

  // Deterministic calculation: Spoken INR -> USD Settlement
  convertInrToUsd(spokenAmountInr: number): {
    settlementAmountUsd: number;
    exchangeRate: number;
  } {
    const rate = this.defaultInrToUsdRate;
    const usd = Math.round((spokenAmountInr / rate) * 100) / 100;
    return {
      settlementAmountUsd: usd,
      exchangeRate: rate,
    };
  }

  // Create and lock a 10-minute FX Quote
  async createLockedQuote(params: {
    spokenAmountInr: number;
    quoteCurrency?: string;
    ttlMinutes?: number;
  }): Promise<FxQuote> {
    const quoteCurrency = params.quoteCurrency || 'USD';
    const rate = this.getCurrentRate('INR', quoteCurrency);
    const ttl = params.ttlMinutes || 10;
    const settlementAmountUsd = Math.round((params.spokenAmountInr / rate) * 100) / 100;

    const quote: FxQuote = {
      id: `fxq_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
      base_currency: 'INR',
      quote_currency: quoteCurrency,
      exchange_rate: rate,
      spoken_amount_inr: params.spokenAmountInr,
      settlement_amount_usd: settlementAmountUsd,
      expires_at: new Date(Date.now() + ttl * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };

    await db.saveFxQuote(quote);
    return quote;
  }
}

export const fxService = new FxService();
