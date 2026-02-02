import axios from 'axios';
import { INTERVAL_MAP } from './utils';

const BYBIT_BASE_URL = 'https://api.bybit.com/v5';

// Create axios instance with timeout
const api = axios.create({
  timeout: 15000, // 15 second timeout
  headers: {
    'Accept': 'application/json',
  }
});

// Fetch all USDT perpetual tickers
export async function getAllTickers() {
  try {
    const response = await api.get(`${BYBIT_BASE_URL}/market/tickers`, {
      params: { category: 'linear' }
    });

    if (response.data.retCode !== 0) {
      throw new Error(response.data.retMsg);
    }

    return response.data.result.list.filter(t => t.symbol.endsWith('USDT'));
  } catch (error) {
    console.error('Error fetching tickers:', error.message);
    throw error;
  }
}

// Fetch kline (candlestick) data for a specific symbol
export async function getKline(symbol, interval, limit = 2) {
  try {
    const bybitInterval = INTERVAL_MAP[interval] || interval;
    const response = await api.get(`${BYBIT_BASE_URL}/market/kline`, {
      params: {
        category: 'linear',
        symbol,
        interval: bybitInterval,
        limit
      }
    });

    if (response.data.retCode !== 0) {
      throw new Error(response.data.retMsg);
    }

    return response.data.result.list;
  } catch (error) {
    console.error(`Error fetching kline for ${symbol}:`, error.message);
    return null;
  }
}

// Calculate price change percentage
export function calcPriceChange(currentPrice, oldPrice) {
  if (!oldPrice || oldPrice === 0) return 0;
  return ((currentPrice - oldPrice) / oldPrice) * 100;
}

// Get top gainers and losers for a specific timeframe
export async function getGainersLosers(timeframe = '1d', limit = 10) {
  const tickers = await getAllTickers();

  // For 24h, use the built-in price24hPcnt
  if (timeframe === '1d') {
    const processed = tickers.map(t => ({
      symbol: t.symbol,
      price: parseFloat(t.lastPrice),
      change: parseFloat(t.price24hPcnt) * 100,
      volume: parseFloat(t.turnover24h)
    })).filter(t => !isNaN(t.change) && t.volume > 0);

    const sorted = processed.sort((a, b) => b.change - a.change);

    return {
      gainers: sorted.slice(0, limit),
      losers: sorted.slice(-limit).reverse()
    };
  }

  // For other timeframes, we need to fetch kline data
  // To avoid too many requests, we'll batch and sample
  const topByVolume = tickers
    .map(t => ({
      symbol: t.symbol,
      price: parseFloat(t.lastPrice),
      volume: parseFloat(t.turnover24h)
    }))
    .filter(t => t.volume > 100000) // Filter low volume coins
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 100); // Top 100 by volume

  // Fetch kline data for top coins (batch to avoid rate limits)
  const results = [];
  const batchSize = 10;

  for (let i = 0; i < topByVolume.length; i += batchSize) {
    const batch = topByVolume.slice(i, i + batchSize);
    const promises = batch.map(async (coin) => {
      const kline = await getKline(coin.symbol, timeframe, 2);
      if (kline && kline.length >= 2) {
        // Kline format: [startTime, open, high, low, close, volume, turnover]
        const currentClose = parseFloat(kline[0][4]);
        const prevClose = parseFloat(kline[1][4]);
        return {
          symbol: coin.symbol,
          price: currentClose,
          change: calcPriceChange(currentClose, prevClose),
          volume: coin.volume
        };
      }
      return null;
    });

    const batchResults = await Promise.all(promises);
    results.push(...batchResults.filter(r => r !== null));

    // Small delay between batches to respect rate limits
    if (i + batchSize < topByVolume.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  const sorted = results.sort((a, b) => b.change - a.change);

  return {
    gainers: sorted.slice(0, limit),
    losers: sorted.slice(-limit).reverse()
  };
}

// Get funding rates
export async function getFundingRates(limit = 15) {
  const tickers = await getAllTickers();

  const processed = tickers
    .map(t => ({
      symbol: t.symbol,
      price: parseFloat(t.lastPrice),
      funding: parseFloat(t.fundingRate) * 100, // Convert to percentage
      volume: parseFloat(t.turnover24h)
    }))
    .filter(t => !isNaN(t.funding) && t.volume > 100000);

  const sortedByFunding = [...processed].sort((a, b) => b.funding - a.funding);

  return {
    positive: sortedByFunding.slice(0, limit),
    negative: sortedByFunding.slice(-limit).reverse()
  };
}

// Get volume data with 7-day history for exclusion calculation
export async function getVolumeData() {
  const tickers = await getAllTickers();

  return tickers.map(t => ({
    symbol: t.symbol,
    price: parseFloat(t.lastPrice),
    volume: parseFloat(t.turnover24h),
    change24h: parseFloat(t.price24hPcnt) * 100
  })).filter(t => t.volume > 0);
}

// Calculate excluded coins based on 7-day volume pattern
// This identifies coins that consistently appear in top volume (always high volume = useless signal)
export async function calculateExcludedCoins() {
  // For MVP, we'll use a static list of always-high-volume coins
  // In production, this would fetch 7 days of historical data
  const ALWAYS_HIGH_VOLUME = [
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT',
    'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'DOTUSDT', 'LINKUSDT',
    'MATICUSDT', 'LTCUSDT', 'ATOMUSDT', 'UNIUSDT', 'APTUSDT',
    'ARBUSDT', 'OPUSDT', 'NEARUSDT', 'FILUSDT', 'TRXUSDT'
  ];

  return ALWAYS_HIGH_VOLUME;
}

// Get unusual volume (filtered)
export async function getUnusualVolume(excludedCoins, timeframe = '1d', limit = 10) {
  const volumeData = await getVolumeData();

  // Filter out excluded coins
  const filtered = volumeData.filter(t => !excludedCoins.has(t.symbol));

  // Sort by volume
  const sortedByVolume = filtered.sort((a, b) => b.volume - a.volume);

  // Get top volume coins that are gaining vs losing
  const gaining = sortedByVolume.filter(t => t.change24h > 0).slice(0, limit);
  const losing = sortedByVolume.filter(t => t.change24h < 0).slice(0, limit);

  return {
    gaining,
    losing,
    excludedCount: excludedCoins.size
  };
}
