'use client';
import { useState, useEffect } from 'react';
import { formatPrice, cleanSymbol } from '@/lib/utils';
import CoinIcon from './CoinIcon';
import { Wallet, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export default function SmartMoneySignals() {
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock Signal Generator
    useEffect(() => {
        const generateSignal = () => {
            const coins = ['BTC', 'ETH', 'SOL', 'PEPE', 'WIF', 'DOGE', 'XRP', 'BNB', 'LINK', 'TRB'];
            const types = ['buy', 'sell'];
            const sizes = [50000, 150000, 500000, 1200000, 2500000];

            return {
                id: Date.now(),
                time: new Date(),
                symbol: coins[Math.floor(Math.random() * coins.length)] + 'USDT',
                type: types[Math.floor(Math.random() * types.length)],
                size: sizes[Math.floor(Math.random() * sizes.length)] * (0.8 + Math.random() * 0.4),
                wallet: '0x' + Math.random().toString(16).substr(2, 4) + '...' + Math.random().toString(16).substr(2, 4)
            };
        };

        // Initial Data
        const initial = Array.from({ length: 15 }, generateSignal).sort((a, b) => b.time - a.time);
        setSignals(initial);
        setLoading(false);

        // Live Feed
        const interval = setInterval(() => {
            setSignals(prev => [generateSignal(), ...prev].slice(0, 50));
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatSize = (num) => {
        if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
        return `$${(num / 1000).toFixed(1)}K`;
    };

    return (
        <div className="h-full flex flex-col bg-[#0e1014] rounded-lg border border-white/5 overflow-hidden shadow-xl">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Wallet size={16} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white font-display uppercase tracking-wider leading-none mb-1">Smart Money</h2>
                        <div className="flex items-center gap-1.5 opacity-60">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                            </span>
                            <span className="text-[9px] text-muted font-mono leading-none">Live Whale Tracking</span>
                        </div>
                    </div>
                </div>
                <div className="px-2 py-1 bg-white/5 rounded border border-white/5 text-[10px] text-muted font-mono">
                    FILTER: &gt;$50K
                </div>
            </div>

            {/* List Header */}
            <div className="grid grid-cols-[60px_1fr_60px_80px_100px] gap-2 px-4 py-2 text-[9px] uppercase tracking-wider text-muted font-bold border-b border-white/5 bg-black/20">
                <div>Time</div>
                <div>Symbol</div>
                <div className="text-center">Side</div>
                <div className="text-right">Price</div>
                <div className="text-right">Size</div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto section-scroll scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent custom-scrollbar">
                {loading ? (
                    <div className="p-4 space-y-2 animate-pulse">
                        {[...Array(8)].map((_, i) => <div key={i} className="h-8 bg-white/5 rounded" />)}
                    </div>
                ) : (
                    <div>
                        {signals.map((signal) => (
                            <div key={signal.id} className="grid grid-cols-[60px_1fr_60px_80px_100px] gap-2 px-4 py-2.5 hover:bg-white/5 border-b border-white/5 items-center group transition-colors animate-in fade-in slide-in-from-top-2 duration-300">

                                <div className="text-[10px] text-muted font-mono opacity-60">{formatTime(signal.time)}</div>

                                <div className="flex items-center gap-2">
                                    <CoinIcon symbol={signal.symbol} className="w-4 h-4 grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100" />
                                    <span className="text-xs font-bold text-white font-mono group-hover:text-primary">{cleanSymbol(signal.symbol)}</span>
                                </div>

                                <div className="flex justify-center">
                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${signal.type === 'buy' ? 'text-gain bg-gain/10 border-gain/20' : 'text-loss bg-loss/10 border-loss/20'}`}>
                                        {signal.type}
                                    </span>
                                </div>

                                <div className="text-right text-[10px] text-white font-mono opacity-80">
                                    MARKET
                                </div>

                                <div className="text-right font-mono text-xs font-bold tabular-nums text-white">
                                    {formatSize(signal.size)}
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-white/5 bg-black/40 text-[9px] text-center text-muted font-mono">
                Tracking on-chain large transactions (simulation)
            </div>

        </div>
    );
}
