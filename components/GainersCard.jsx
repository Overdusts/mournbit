'use client';

import { useState, useEffect } from 'react';
import { formatPrice, formatPercent, cleanSymbol } from '@/lib/utils';
import ChartModal from './ChartModal';
import CoinIcon from './CoinIcon';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function GainersCard() {
  const [data, setData] = useState({ gainers: [], losers: [] });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1d');
  const [selectedCoin, setSelectedCoin] = useState(null);

  const fetchData = async (tf) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/gainers?timeframe=${tf}`);
      const result = await response.json();
      if (result.success) setData(result.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData(timeframe);
    const i = setInterval(() => fetchData(timeframe), 60000);
    return () => clearInterval(i);
  }, [timeframe]);

  const CoinList = ({ coins, style, type }) => {
    const isGainer = type === 'gainers';
    const colorClass = isGainer ? 'text-gain' : 'text-loss';

    return (
      <div className="flex flex-col h-full bg-black/20">
        {/* Column Headers */}
        <div className="grid grid-cols-[24px_1fr_80px_60px] gap-2 px-3 py-2 border-b border-white/5 text-[9px] text-muted font-mono uppercase tracking-wider sticky top-0 bg-[#0e1014] z-10 shadow-sm">
          <div className="text-center opacity-50">#</div>
          <div>Asset</div>
          <div className="text-right">Price</div>
          <div className="text-right">24h%</div>
        </div>

        {/* List */}
        <div className="overflow-y-auto section-scroll flex-1 pr-1 custom-scrollbar">
          {coins?.map((coin, i) => (
            <div
              key={coin.symbol}
              onClick={() => setSelectedCoin(coin.symbol)}
              className="grid grid-cols-[24px_1fr_80px_60px] gap-2 py-2 px-3 hover:bg-white/5 border-b border-white/5 cursor-pointer group items-center transition-colors relative"
            >
              {/* Hover Effect Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity ${isGainer ? 'bg-gain' : 'bg-loss'}`} />

              <div className="text-[10px] text-muted font-mono text-center opacity-40 group-hover:opacity-100">{i + 1}</div>

              <div className="flex items-center gap-2.5 min-w-0">
                <CoinIcon symbol={coin.symbol} className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all flex-shrink-0 opacity-70 group-hover:opacity-100" />
                <span className="font-bold text-xs text-white font-mono truncate group-hover:text-primary transition-colors tracking-tight">
                  {cleanSymbol(coin.symbol)}
                </span>
              </div>

              <div className="text-right font-mono text-xs text-muted group-hover:text-white tabular-nums opacity-80 group-hover:opacity-100">
                {formatPrice(coin.price)}
              </div>

              <div className={`text-right font-mono text-xs font-bold tabular-nums flex items-center justify-end gap-1 ${colorClass} bg-opacity-10 rounded px-1`}>
                {isGainer ? '+' : ''}{formatPercent(coin.change)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="tech-border h-full relative overflow-hidden bg-black/40 flex flex-col backdrop-blur-sm border-t border-white/5">
        {/* Header */}
        <div className="p-3 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <TrendingUp size={14} />
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] font-display text-white/90">Market Movers</h2>
            </div>
            <div className="flex bg-black/40 rounded p-0.5 border border-white/5">
              {['1h', '4h', '1d'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`text-[9px] px-2.5 py-1 font-mono uppercase rounded-sm transition-all ${timeframe === tf ? 'bg-primary/20 text-primary font-bold shadow-[0_0_10px_-4px_rgba(0,229,188,0.5)] border border-primary/20' : 'text-muted hover:text-white border border-transparent'
                    }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content - Two Columns */}
        <div className="grid md:grid-cols-2 h-full divide-x divide-white/5 overflow-hidden">
          {/* Gainers Col */}
          <div className="flex flex-col h-full bg-gradient-to-b from-gain/5 via-transparent to-transparent">
            <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2 bg-gain/5">
              <ArrowUpRight size={12} className="text-gain" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gain">Top Gainers</span>
            </div>
            {loading ? (
              <div className="p-3 space-y-2 animate-pulse">
                {[...Array(8)].map((_, i) => <div key={i} className="h-6 bg-white/5 w-full rounded" />)}
              </div>
            ) : (
              <CoinList coins={data.gainers} type="gainers" />
            )}
          </div>

          {/* Losers Col */}
          <div className="flex flex-col h-full bg-gradient-to-b from-loss/5 via-transparent to-transparent">
            <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2 bg-loss/5">
              <ArrowDownRight size={12} className="text-loss" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-loss">Top Losers</span>
            </div>
            {loading ? (
              <div className="p-3 space-y-2 animate-pulse">
                {[...Array(8)].map((_, i) => <div key={i} className="h-6 bg-white/5 w-full rounded" />)}
              </div>
            ) : (
              <CoinList coins={data.losers} type="losers" />
            )}
          </div>
        </div>
      </div>

      {selectedCoin && <ChartModal symbol={selectedCoin} onClose={() => setSelectedCoin(null)} />}
    </>
  );
}
