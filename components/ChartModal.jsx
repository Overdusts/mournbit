'use client';
import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CryptoChart from './CryptoChart';

export default function ChartModal({ symbol, onClose }) {
    const [useTradingView, setUseTradingView] = useState(true);

    useEffect(() => {
        // Lock Body Scroll
        document.body.style.overflow = 'hidden';
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl pt-20 pb-10 px-4 md:px-8 overflow-y-auto"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-full h-full max-w-[1600px] max-h-[90vh] bg-[#09090b] border border-white/10 shadow-2xl flex flex-col rounded-lg overflow-hidden relative"
                >
                    {/* Header */}
                    <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#0e1014] shrunk-0">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <h2 className="text-xl font-bold text-white tracking-tight font-display leading-none">{symbol}</h2>
                                <span className="text-[10px] text-primary font-mono uppercase tracking-wider">Perpetual Contract</span>
                            </div>

                            <div className="flex bg-black/40 rounded p-1 border border-white/5">
                                <button
                                    onClick={() => setUseTradingView(true)}
                                    className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded transition-all ${useTradingView ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-muted hover:text-white'}`}
                                >
                                    Heading View
                                </button>
                                <button
                                    onClick={() => setUseTradingView(false)}
                                    className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded transition-all ${!useTradingView ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-muted hover:text-white'}`}
                                >
                                    Lightweight
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg text-muted transition-all duration-200 border border-transparent hover:border-red-500/20"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 relative bg-black w-full h-full min-h-[500px]">
                        {useTradingView ? (
                            <TradingViewWidget symbol={symbol} />
                        ) : (
                            <CustomChart symbol={symbol} />
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="h-8 border-t border-white/10 bg-[#0e1014] flex items-center px-4 justify-between text-[10px] text-muted font-mono">
                        <span>MOURNBIT ENGINE V1.0</span>
                        <span>DATA: BYBIT PERPETUALS</span>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function TradingViewWidget({ symbol }) {
    const container = useRef();

    useEffect(() => {
        if (!container.current) return;

        // FORMATTING LOGIC
        // Ensure strictly BYBIT:{SYMBOL}.P for perps
        let clean = symbol.replace('USDT', '').replace('PERP', '');
        let tvSymbol = `BYBIT:${clean}USDT.P`;

        // Edge case: 1000PEPE -> BYBIT:1000PEPEUSDT.P
        // This standard format usually works.

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "autosize": true,
            "symbol": tvSymbol,
            "interval": "15",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "calendar": false,
            "support_host": "https://www.tradingview.com",
            "hide_side_toolbar": false,
            "details": true,
            "hotlist": true,
            "backgroundColor": "rgba(0, 0, 0, 1)",
            "gridColor": "rgba(255, 255, 255, 0.05)",
            "save_image": false,
            "hide_volume": false
        });

        container.current.innerHTML = '';
        container.current.appendChild(script);
    }, [symbol]);

    return <div className="h-full w-full" ref={container} />;
}

function CustomChart({ symbol }) {
    // Basic wrapper for lightweight chart
    const [data, setData] = useState([]);

    useEffect(() => {
        // Fetch kline data...
        // For visual fix, just placeholder logic here to match existing file structure
    }, [symbol]);

    return (
        <div className="h-full bg-black flex items-center justify-center text-muted font-mono text-xs">
            <div className="text-center">
                <p className="mb-2">LIGHTWEIGHT CHART ENGINE</p>
                <p className="text-white font-bold text-lg">{symbol}</p>
            </div>
        </div>
    );
}
