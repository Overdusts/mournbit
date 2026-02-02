'use client';
import { useState, useEffect } from 'react';
import { Globe, Clock, ExternalLink, Newspaper, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NewsView() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
                const data = await res.json();
                if (data.Data) {
                    setNews(data.Data.slice(0, 20)); // Get more news for full page
                }
            } catch (err) {
                console.error(err);
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
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto"
        >
            <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <Newspaper size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Global Intel Feed</h2>
                    <p className="text-muted text-sm">Aggregated crypto news from top sources</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-40 bg-card rounded-lg animate-pulse border border-white/5"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {news.map((item, i) => (
                        <a
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group bg-card hover:bg-white/5 border border-border rounded-xl p-5 transition-all flex flex-col justify-between h-full"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <img src={item.source_info?.img} alt="" className="w-5 h-5 rounded-full" />
                                        <span className="text-xs font-bold text-primary uppercase">{item.source}</span>
                                    </div>
                                    <span className="text-xs text-muted flex items-center gap-1">
                                        <Clock size={12} /> {timeAgo(item.published_on)}
                                    </span>
                                </div>

                                <h3 className="text-base font-semibold text-white group-hover:text-primary transition-colors leading-snug mb-3">
                                    {item.title}
                                </h3>

                                <p className="text-sm text-muted line-clamp-2 mb-4">
                                    {item.body}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                <div className="flex gap-2">
                                    {item.categories.split('|').slice(0, 2).map(cat => (
                                        <span key={cat} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-muted">#{cat}</span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    Read Story <ArrowUpRight size={14} />
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
