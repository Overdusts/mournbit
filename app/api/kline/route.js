import { NextResponse } from 'next/server';
import { getKline } from '@/lib/bybit';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval') || 'D';
    const limit = searchParams.get('limit') || 200;

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    try {
        const kline = await getKline(symbol, interval, parseInt(limit));

        // Format for lightweight-charts
        // Bybit returns: [startTime, open, high, low, close, volume, turnover]
        // Time needs to be in seconds
        const formattedData = kline.map(item => ({
            time: parseInt(item[0]) / 1000,
            open: parseFloat(item[1]),
            high: parseFloat(item[2]),
            low: parseFloat(item[3]),
            close: parseFloat(item[4]),
        })).sort((a, b) => a.time - b.time);

        return NextResponse.json({ success: true, data: formattedData });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
