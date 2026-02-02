import { NextResponse } from 'next/server';
import { getAllWalletsActivity, generateMockWalletData } from '@/lib/etherscan';
import { isCacheValid, getCache, setCache } from '@/lib/cache';

export async function GET() {
  try {
    // Check cache
    if (isCacheValid('wallets')) {
      const cached = getCache('wallets');
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          cached: true,
          timestamp: Date.now()
        });
      }
    }

    // Fetch fresh data from Etherscan
    const data = await getAllWalletsActivity();

    // If we got real data, cache and return it
    if (data && data.length > 0) {
      setCache('wallets', data);
      return NextResponse.json({
        success: true,
        data,
        cached: false,
        timestamp: Date.now()
      });
    }

    // No API key or API failed - use realistic mock data
    const mockData = generateMockWalletData();

    return NextResponse.json({
      success: true,
      data: mockData,
      mock: true,
      message: 'Using demo data. Add ETHERSCAN_API_KEY for live tracking.',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Wallets API error:', error);

    // Return mock data on error
    const mockData = generateMockWalletData();

    return NextResponse.json({
      success: true,
      data: mockData,
      mock: true,
      timestamp: Date.now()
    });
  }
}
