import { NextResponse } from 'next/server';
import { getFundingRates } from '@/lib/bybit';
import { isCacheValid, getCache, setCache } from '@/lib/cache';

// Mock data for demo/offline mode
const MOCK_FUNDING_DATA = {
  positive: [
    { symbol: 'SATSUSDT', price: 0.00000045, funding: 0.1234, volume: 45000000 },
    { symbol: 'PEPEUSDT', price: 0.0000123, funding: 0.0891, volume: 89000000 },
    { symbol: 'WIFUSDT', price: 2.34, funding: 0.0654, volume: 120000000 },
    { symbol: 'BONKUSDT', price: 0.0000234, funding: 0.0543, volume: 67000000 },
    { symbol: 'FLOKIUSDT', price: 0.000189, funding: 0.0432, volume: 54000000 },
    { symbol: 'MEMECOINUSDT', price: 0.0234, funding: 0.0398, volume: 43000000 },
    { symbol: 'SHIBUSDT', price: 0.0000234, funding: 0.0345, volume: 78000000 },
    { symbol: 'PEOPLEUSDT', price: 0.0567, funding: 0.0312, volume: 32000000 },
    { symbol: 'LUNCUSDT', price: 0.000123, funding: 0.0287, volume: 28000000 },
    { symbol: 'TURBOUSDT', price: 0.00678, funding: 0.0256, volume: 24000000 },
    { symbol: 'ORDIUSDT', price: 45.67, funding: 0.0234, volume: 56000000 },
    { symbol: 'RATSUSDT', price: 0.000345, funding: 0.0212, volume: 19000000 },
    { symbol: 'CATIUSDT', price: 0.456, funding: 0.0198, volume: 17000000 },
    { symbol: 'NOTUSDT', price: 0.0089, funding: 0.0176, volume: 15000000 },
    { symbol: 'DOGSUSDT', price: 0.00067, funding: 0.0154, volume: 13000000 },
  ],
  negative: [
    { symbol: 'WLDUSDT', price: 2.34, funding: -0.0891, volume: 234000000 },
    { symbol: 'ARBUSDT', price: 0.89, funding: -0.0654, volume: 187000000 },
    { symbol: 'OPUSDT', price: 1.67, funding: -0.0543, volume: 156000000 },
    { symbol: 'STXUSDT', price: 1.89, funding: -0.0432, volume: 98000000 },
    { symbol: 'SEIUSDT', price: 0.45, funding: -0.0376, volume: 87000000 },
    { symbol: 'TIAUSDT', price: 5.67, funding: -0.0321, volume: 76000000 },
    { symbol: 'SUIUSDT', price: 3.45, funding: -0.0289, volume: 145000000 },
    { symbol: 'APTUSDT', price: 8.90, funding: -0.0254, volume: 134000000 },
    { symbol: 'INJUSDT', price: 23.45, funding: -0.0223, volume: 89000000 },
    { symbol: 'FETUSDT', price: 1.23, funding: -0.0198, volume: 78000000 },
    { symbol: 'RENDERUSDT', price: 6.78, funding: -0.0176, volume: 67000000 },
    { symbol: 'NEARUSDT', price: 5.12, funding: -0.0154, volume: 98000000 },
    { symbol: 'KASUSDT', price: 0.123, funding: -0.0143, volume: 56000000 },
    { symbol: 'PYTHUSDT', price: 0.345, funding: -0.0132, volume: 45000000 },
    { symbol: 'JUPUSDT', price: 0.789, funding: -0.0121, volume: 43000000 },
  ]
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';

  try {
    // Check cache
    if (isCacheValid('funding')) {
      const cached = getCache('funding');
      if (cached) {
        return NextResponse.json({
          success: true,
          data: type === 'all' ? cached : cached[type],
          cached: true,
          timestamp: Date.now()
        });
      }
    }

    // Fetch fresh data
    const data = await getFundingRates(15);

    // Update cache
    setCache('funding', data);

    return NextResponse.json({
      success: true,
      data: type === 'all' ? data : data[type],
      cached: false,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Funding API error:', error.message);

    // Return mock data on error for demo purposes
    return NextResponse.json({
      success: true,
      data: type === 'all' ? MOCK_FUNDING_DATA : MOCK_FUNDING_DATA[type],
      mock: true,
      timestamp: Date.now()
    });
  }
}
