// utils/testData.ts
export const BASE_URL = process.env.BASE_URL ?? 'https://test1.gotrade.goquant.io';

export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL ?? 'user25@goquant.io',
  password: process.env.TEST_USER_PASS ?? '60Re3G9KvvFl4Ihegxpi' 
};

export const TRADE_DEFAULTS = {
  symbol: 'BTC-USDT-SWAP',
  quantity: 2,
  duration: 10,
  price: 113900,
  interval: 2
};

export const RATIO_DEFAULTS = {
  firstSymbol: 'USDT-SGD',
  secondSymbol: 'USDC-SGD',
  firstRatio: 1,
  secondRatio: 1,
  threshold: 0.5
};

export default {
  BASE_URL, TEST_USER, TRADE_DEFAULTS, RATIO_DEFAULTS
};
