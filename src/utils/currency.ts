import { SupportedCurrency, CurrencyRate } from '../types/travel';

export const CURRENCY_RATES: Record<SupportedCurrency, CurrencyRate> = {
  USD: { code: 'USD', symbol: '$', rateFromUsd: 1, label: 'USD ($)' },
  EUR: { code: 'EUR', symbol: '€', rateFromUsd: 0.92, label: 'EUR (€)' },
  GBP: { code: 'GBP', symbol: '£', rateFromUsd: 0.79, label: 'GBP (£)' },
  INR: { code: 'INR', symbol: '₹', rateFromUsd: 86.5, label: 'INR (₹)' },
  JPY: { code: 'JPY', symbol: '¥', rateFromUsd: 152.0, label: 'JPY (¥)' },
  AUD: { code: 'AUD', symbol: 'A$', rateFromUsd: 1.55, label: 'AUD (A$)' },
  CAD: { code: 'CAD', symbol: 'C$', rateFromUsd: 1.41, label: 'CAD (C$)' },
};

export function formatPriceInCurrency(
  amountUsd: number,
  targetCurrency: SupportedCurrency
): string {
  if (amountUsd === 0) return 'Free';
  const curr = CURRENCY_RATES[targetCurrency] || CURRENCY_RATES.USD;
  const converted = amountUsd * curr.rateFromUsd;

  if (curr.code === 'JPY' || curr.code === 'INR') {
    return `${curr.symbol}${Math.round(converted).toLocaleString()}`;
  }

  return `${curr.symbol}${converted.toFixed(2)}`;
}
