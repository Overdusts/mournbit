import { NextResponse } from 'next/server';
import { getUnusualVolume, calculateExcludedCoins } from '@/lib/bybit';
import {
  isCacheValid,
  getCache,
  setCache,
  getExcludedCoins,
  setExcludedCoins,
  isExclusionListStale
} from '@/lib/cache';

// Mock data for demo/offline mode
const MOCK_VOLUME_DATA = {
  gaining: [
    { symbol: 'PEPEUSDT', price: 0.0000145, volume: 234000000, change24h: 24.5 },
    { symbol: 'WIFUSDT', price: 2.89, volume: 189000000, change24h: 18.3 },
    { symbol: 'BONKUSDT', price: 0.0000312, volume: 156000000, change24h: 15.7 },
    { symbol: 'FLOKIUSDT', price: 0.000234, volume: 134000000, change24h: 12.4 },
    { symbol: 'ORDIUSDT', price: 52.34, volume: 98000000, change24h: 11.2 },
    { symbol: 'SATSUSDT', price: 0.00000056, volume: 87000000, change24h: 9.8 },
    { symbol: 'CATIUSDT', price: 0.534, volume: 76000000, change24h: 8.6 },
    { symbol: 'NOTUSDT', price: 0.0112, volume: 65000000, change24h: 7.4 },
    { symbol: 'DOGSUSDT', price: 0.00089, volume: 54000000, change24h: 6.2 },
    { symbol: 'TURBOUSDT', price: 0.00823, volume: 43000000, change24h: 5.1 },
  ],
  losing: [
    { symbol: 'WLDUSDT', price: 2.12, volume: 245000000, change24h: -12.8 },
    { symbol: 'ARBUSDT', price: 0.78, volume: 198000000, change24h: -9.4 },
    { symbol: 'OPUSDT', price: 1.45, volume: 178000000, change24h: -8.2 },
    { symbol: 'STXUSDT', price: 1.56, volume: 145000000, change24h: -7.1 },
    { symbol: 'SEIUSDT', price: 0.38, volume: 134000000, change24h: -6.3 },
    { symbol: 'TIAUSDT', price: 4.89, volume: 123000000, change24h: -5.7 },
    { symbol: 'SUIUSDT', price: 2.98, volume: 187000000, change24h: -5.2 },
    { symbol: 'APTUSDT', price: 7.65, volume: 156000000, change24h: -4.8 },
    { symbol: 'INJUSDT', price: 20.12, volume: 98000000, change24h: -4.3 },
    { symbol: 'FETUSDT', price: 1.08, volume: 87000000, change24h: -3.9 },
  ],
  excludedCount: 20
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get('timeframe') || '1d';

  try {
    // Update excluded coins if stale
    if (isExclusionListStale()) {
      const excluded = await calculateExcludedCoins();
      setExcludedCoins(excluded);
    }

    // Check cache with timeframe
    if (isCacheValid('volume', timeframe)) {
      const cached = getCache('volume');
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          timeframe,
          cached: true,
          timestamp: Date.now()
        });
      }
    }

    // Get excluded coins
    const excludedCoins = getExcludedCoins();

    // Fetch fresh data
    const data = await getUnusualVolume(excludedCoins, timeframe, 10);

    // Update cache
    setCache('volume', data, timeframe);

    return NextResponse.json({
      success: true,
      data,
      timeframe,
      cached: false,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Volume API error:', error.message);

    // Return mock data on error for demo purposes
    return NextResponse.json({
      success: true,
      data: MOCK_VOLUME_DATA,
      timeframe,
      mock: true,
      timestamp: Date.now()
    });
  }
}
