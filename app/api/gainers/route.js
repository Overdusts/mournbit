import { NextResponse } from 'next/server';
import { getGainersLosers } from '@/lib/bybit';
import { isCacheValid, getCache, setCache } from '@/lib/cache';

// Mock data (fallback) needs to enough to fill the screen (30 items)
const MOCK_GAINERS_DATA = {
  gainers: [
    { symbol: 'PEPEUSDT', price: 0.0000145, change: 24.5, volume: 234000000 },
    { symbol: 'WIFUSDT', price: 2.89, change: 18.3, volume: 189000000 },
    { symbol: 'BONKUSDT', price: 0.0000312, change: 15.7, volume: 156000000 },
    { symbol: 'FLOKIUSDT', price: 0.000234, change: 12.4, volume: 134000000 },
    { symbol: 'ORDIUSDT', price: 52.34, change: 11.2, volume: 98000000 },
    { symbol: 'SATSUSDT', price: 0.00000056, change: 9.8, volume: 87000000 },
    { symbol: 'CATIUSDT', price: 0.534, change: 8.6, volume: 76000000 },
    { symbol: 'NOTUSDT', price: 0.0112, change: 7.4, volume: 65000000 },
    { symbol: 'DOGSUSDT', price: 0.00089, change: 6.2, volume: 54000000 },
    { symbol: 'TURBOUSDT', price: 0.00823, change: 5.1, volume: 43000000 },
    { symbol: 'PEOPLEUSDT', price: 0.034, change: 4.8, volume: 33000000 },
    { symbol: 'MEMEUSDT', price: 0.023, change: 4.5, volume: 29000000 },
    { symbol: 'BOMEUSDT', price: 0.012, change: 4.2, volume: 25000000 },
    { symbol: '1000RATSUSDT', price: 0.156, change: 3.9, volume: 22000000 },
    { symbol: 'GALAUSDT', price: 0.045, change: 3.7, volume: 21000000 },
    { symbol: 'JUPUSDT', price: 1.12, change: 3.5, volume: 89000000 },
    { symbol: 'PYTHUSDT', price: 0.45, change: 3.2, volume: 45000000 },
    { symbol: 'JTOUSDT', price: 3.45, change: 2.9, volume: 34000000 },
    { symbol: 'WUSDT', price: 0.67, change: 2.7, volume: 28000000 },
    { symbol: 'ENAUSDT', price: 0.89, change: 2.5, volume: 56000000 },
    { symbol: 'TNSRUSDT', price: 0.56, change: 2.3, volume: 12000000 },
    { symbol: 'ZEUSUSDT', price: 0.45, change: 2.1, volume: 11000000 },
    { symbol: 'MEWUSDT', price: 0.0045, change: 1.9, volume: 19000000 },
    { symbol: 'SLERFUSDT', price: 0.34, change: 1.8, volume: 15000000 },
    { symbol: 'POPCATUSDT', price: 0.56, change: 1.7, volume: 14000000 },
    { symbol: 'MANTAUSDT', price: 1.23, change: 1.6, volume: 18000000 },
    { symbol: 'ALTUSDT', price: 0.34, change: 1.5, volume: 17000000 },
    { symbol: 'DYMUSDT', price: 3.45, change: 1.4, volume: 16000000 },
    { symbol: 'PIXELUSDT', price: 0.45, change: 1.3, volume: 15000000 },
    { symbol: 'STRKUSDT', price: 1.23, change: 1.2, volume: 45000000 },
  ],
  losers: [
    { symbol: 'WLDUSDT', price: 2.12, change: -12.8, volume: 245000000 },
    { symbol: 'ARBUSDT', price: 0.78, change: -9.4, volume: 198000000 },
    { symbol: 'OPUSDT', price: 1.45, change: -8.2, volume: 178000000 },
    { symbol: 'STXUSDT', price: 1.56, change: -7.1, volume: 145000000 },
    { symbol: 'SEIUSDT', price: 0.38, change: -6.3, volume: 134000000 },
    { symbol: 'TIAUSDT', price: 4.89, change: -5.7, volume: 123000000 },
    { symbol: 'SUIUSDT', price: 2.98, change: -5.2, volume: 187000000 },
    { symbol: 'APTUSDT', price: 7.65, change: -4.8, volume: 156000000 },
    { symbol: 'INJUSDT', price: 20.12, change: -4.3, volume: 98000000 },
    { symbol: 'FETUSDT', price: 1.08, change: -3.9, volume: 87000000 },
    { symbol: 'RNDRUSDT', price: 7.89, change: -3.8, volume: 76000000 },
    { symbol: 'NEARUSDT', price: 5.67, change: -3.7, volume: 65000000 },
    { symbol: 'LINKUSDT', price: 13.45, change: -3.6, volume: 54000000 },
    { symbol: 'AVAXUSDT', price: 34.56, change: -3.5, volume: 43000000 },
    { symbol: 'MATICUSDT', price: 0.56, change: -3.4, volume: 32000000 },
    { symbol: 'DOTUSDT', price: 6.78, change: -3.3, volume: 21000000 },
    { symbol: 'ADAUSDT', price: 0.45, change: -3.2, volume: 19000000 },
    { symbol: 'XRPUSDT', price: 0.52, change: -3.1, volume: 89000000 },
    { symbol: 'BNBUSDT', price: 567.89, change: -3.0, volume: 45000000 },
    { symbol: 'SOLUSDT', price: 145.67, change: -2.9, volume: 345000000 },
    { symbol: 'TONUSDT', price: 6.78, change: -2.8, volume: 34000000 },
    { symbol: 'KASUSDT', price: 0.12, change: -2.7, volume: 23000000 },
    { symbol: 'IMXUSDT', price: 1.45, change: -2.6, volume: 12000000 },
    { symbol: 'HBARUSDT', price: 0.08, change: -2.5, volume: 11000000 },
    { symbol: 'VETUSDT', price: 0.034, change: -2.4, volume: 10000000 },
    { symbol: 'ICPUSDT', price: 8.90, change: -2.3, volume: 9000000 },
    { symbol: 'FILUSDT', price: 4.56, change: -2.2, volume: 8000000 },
    { symbol: 'ATOMUSDT', price: 5.67, change: -2.1, volume: 7000000 },
    { symbol: 'ETCUSDT', price: 23.45, change: -2.0, volume: 6000000 },
    { symbol: 'LDOUSDT', price: 1.89, change: -1.9, volume: 5000000 },
  ]
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get('timeframe') || '1d';
  const limit = parseInt(searchParams.get('limit')) || 30; // Default to 30 items

  // Create a unique cache key that includes the limit
  const cacheKey = `gainers_${timeframe}_${limit}`;

  try {
    // Check cache
    if (isCacheValid(cacheKey, timeframe)) {
      const cached = getCache(cacheKey);
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          timeframe,
          limit,
          cached: true,
          timestamp: Date.now()
        });
      }
    }

    // Fetch fresh data with Dynamic Limit
    const data = await getGainersLosers(timeframe, limit);

    // Update cache
    setCache(cacheKey, data, timeframe);

    return NextResponse.json({
      success: true,
      data,
      timeframe,
      limit,
      cached: false,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Gainers API error:', error.message);

    // Return large mock data on error (sliced to requested limit)
    const mockData = {
      gainers: MOCK_GAINERS_DATA.gainers.slice(0, limit),
      losers: MOCK_GAINERS_DATA.losers.slice(0, limit)
    };

    return NextResponse.json({
      success: true,
      data: mockData,
      timeframe,
      limit,
      mock: true,
      timestamp: Date.now()
    });
  }
}
