'use client';

import { useState, useEffect } from 'react';
import { formatPrice, cleanSymbol } from '@/lib/utils';
import CoinIcon from './CoinIcon';
import ChartModal from './ChartModal';
import { Zap, Clock, ArrowUp, ArrowDown } from 'lucide-react';

export default function FundingCard() {
  const [data, setData] = useState({ positive: [], negative: [] });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('positive');
  const [countdown, setCountdown] = useState('00:00:00');
  const [selectedCoin, setSelectedCoin] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/funding');
      const result = await response.json();
      if (result.success) setData(result.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const dataInterval = setInterval(fetchData, 60000);

    // Countdown Timer logic (Every 8 hours: 00, 08, 16 UTC)
    const timer = setInterval(() => {
      const now = new Date();
      const nextFund = new Date(now);
      nextFund.setUTCHours(Math.ceil(now.getUTCHours() / 8) * 8, 0, 0, 0);
      if (nextFund <= now) nextFund.setUTCHours(nextFund.getUTCHours() + 8);
      const diff = nextFund - now;
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setCountdown(`${h}:${m}:${s}`);
    }, 1000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(timer);
    }
  }, []);

  const currentData = view === 'positive' ? data.positive : data.negative;
  const isPositive = view === 'positive';
  const accentColor = isPositive ? 'text-gain' : 'text-loss';
  const bgAccent = isPositive ? 'bg-gain/10' : 'bg-loss/10';
  const borderAccent = isPositive ? 'border-gain/20' : 'border-loss/20';

  return (
    <>
      <div className={`card h-full flex flex-col bg-card/40 backdrop-blur-xl border-l-[2px] transition-all hover:bg-card/60 ${isPositive ? 'border-l-gain shadow-[0_0_20px_-10px_rgba(0,229,188,0.1)]' : 'border-l-loss shadow-[0_0_20px_-10px_rgba(255,26,26,0.1)]'}`}>

        {/* Header */}
        <div className="p-4 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-md border ${bgAccent} ${borderAccent} ${accentColor}`}>
                <Zap size={14} fill="currentColor" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white font-display uppercase tracking-wider leading-none mb-1">Funding Rates</h2>
                <div className="flex items-center gap-1.5 opacity-80">
                  <div className={`w-1 h-1 rounded-full animate-pulse ${isPositive ? 'bg-gain' : 'bg-loss'}`} />
                  <span className="text-[9px] text-muted font-mono leading-none">{isPositive ? 'Shorts Paying Longs' : 'Longs Paying Shorts'}</span>
                </div>
              </div>
            </div>

            <div className="text-right bg-black/40 px-2 py-1 rounded border border-white/5">
              <div className="flex items-center gap-1 text-[8px] text-muted font-mono justify-end mb-0.5 uppercase tracking-wider">
                <Clock size={8} />
                <span>Next Funding</span>
              </div>
              <span className="text-xs font-bold text-white font-mono tracking-widest">{countdown}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex p-0.5 bg-black/40 rounded border border-white/5 mb-3">
            <button
              onClick={() => setView('positive')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-bold uppercase tracking-wide rounded transition-all ${isPositive ? 'bg-gain/90 text-black shadow-lg shadow-gain/20' : 'text-muted hover:text-white hover:bg-white/5'}`}
            >
              <ArrowUp size={8} strokeWidth={3} />
              High (Long)
            </button>
            <button
              onClick={() => setView('negative')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-bold uppercase tracking-wide rounded transition-all ${!isPositive ? 'bg-loss/90 text-white shadow-lg shadow-loss/20' : 'text-muted hover:text-white hover:bg-white/5'}`}
            >
              <ArrowDown size={8} strokeWidth={3} />
              Low (Short)
            </button>
          </div>
        </div>

        {/* List Header */}
        <div className="grid grid-cols-[30px_1fr_60px_60px] gap-2 px-4 py-2 text-[8px] uppercase tracking-wider text-muted font-bold border-b border-t border-white/5 bg-[#0e1014]/50">
          <div className="text-center">#</div>
          <div>Asset</div>
          <div className="text-right">Rate</div>
          <div className="text-right">Predicted</div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto section-scroll scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent custom-scrollbar">
          {loading ? (
            <div className="p-4 space-y-1.5 animate-pulse">
              {[...Array(6)].map((_, i) => <div key={i} className="h-8 bg-white/5 rounded w-full" />)}
            </div>
          ) : (
            <div>
              {currentData?.map((item, i) => (
                <div
                  key={item.symbol}
                  onClick={() => setSelectedCoin(item.symbol)}
                  className="grid grid-cols-[30px_1fr_60px_60px] gap-2 px-4 py-2 hover:bg-white/5 border-b border-white/5 items-center group cursor-pointer transition-colors relative"
                >
                  {/* Left accent bar on hover */}
                  <div className={`absolute left-0 top-0 bottom-0 w-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isPositive ? 'bg-gain' : 'bg-loss'}`} />

                  <div className="text-[9px] text-muted text-center font-mono opacity-50">{i + 1}</div>

                  <div className="flex items-center gap-2">
                    <CoinIcon symbol={item.symbol} className="w-4 h-4 grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-bold text-white font-mono group-hover:text-primary leading-tight truncate">{cleanSymbol(item.symbol)}</span>
                      <span className="text-[8px] text-muted hidden md:block leading-tight">{formatPrice(item.price)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-bold tabular-nums px-1 py-0.5 rounded border border-transparent ${isPositive ? 'text-gain bg-gain/5 group-hover:border-gain/20' : 'text-loss bg-loss/5 group-hover:border-loss/20'}`}>
                      {item.funding > 0 ? '+' : ''}{(item.funding * 100).toFixed(4)}%
                    </span>
                  </div>

                  <div className="text-right text-[9px] text-muted font-mono tabular-nums opacity-60">
                    {/* Mock predicted rate as slight variation used in UI for 'Details' */}
                    {item.funding > 0 ? '+' : ''}{(item.funding * 100 * 1.01).toFixed(4)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-2 border-t border-white/5 bg-black/20 text-[8px] text-muted/60 text-center font-mono">
          Click any coin for chart • Next Settlement in {countdown}
        </div>
      </div>

      {/* Chart Modal */}
      {selectedCoin && (
        <ChartModal
          symbol={selectedCoin}
          onClose={() => setSelectedCoin(null)}
        />
      )}
    </>
  );
}
