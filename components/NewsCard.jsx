'use client';

import { useState, useEffect } from 'react';
import { Globe, ExternalLink, Clock, Newspaper } from 'lucide-react';

export default function NewsCard() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Using CryptoCompare public API (no key required for basic rate)
                const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
                const data = await res.json();

                if (data.Data) {
                    setNews(data.Data.slice(0, 8)); // Get top 8 stories
                } else {
                    throw new Error('No news data');
                }
            } catch (err) {
                console.error('Failed to fetch news:', err);
                setError('Unable to load news feed');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    const timeAgo = (ts) => {
        const seconds = Math.floor(Date.now() / 1000 - ts);
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
        return Math.floor(seconds / 86400) + 'd ago';
    };

    return (
        <div className="card p-0 bg-card/40 backdrop-blur-xl border border-border h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Globe size={18} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white font-display uppercase tracking-wide">Global Intel</h2>
                        <p className="text-[10px] text-muted tracking-wider">Live Crypto Wire</p>
                    </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto max-h-[600px] p-2 space-y-1 custom-scrollbar">
                {loading ? (
                    <div className="space-y-3 p-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-muted text-xs">{error}</div>
                ) : (
                    news.map((item) => (
                        <a
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group block p-3 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                        >
                            <div className="flex justify-between items-start gap-3 mb-1">
                                <div className="flex items-center gap-2">
                                    {item.source_info?.img && (
                                        <img src={item.source_info.img} alt={item.source} className="w-4 h-4 rounded-full" />
                                    )}
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                                        {item.source}
                                    </span>
                                </div>
                                <span className="text-[10px] text-muted flex items-center gap-1">
                                    <Clock size={10} />
                                    {timeAgo(item.published_on)}
                                </span>
                            </div>

                            <h3 className="text-sm font-medium text-text group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-2">
                                {item.title}
                            </h3>

                            <div className="flex items-center gap-2">
                                {item.categories.split('|').slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-muted group-hover:text-white transition-colors">
                                        #{tag}
                                    </span>
                                ))}
                                <ExternalLink size={10} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                            </div>
                        </a>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/5 bg-black/20 text-center">
                <a href="https://cryptocompare.com" target="_blank" className="text-[10px] text-muted hover:text-white transition-colors">
                    Data provided by CryptoCompare
                </a>
            </div>
        </div>
    );
}
