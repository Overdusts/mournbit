'use client';
import { useState, useEffect } from 'react';
import { Activity, Wifi, Clock, Timer, User, Zap, ChevronDown, LogOut } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import ProfileModal from './ProfileModal';

export default function Header() {
  const { data: session } = useSession();
  const [time, setTime] = useState(null);
  const [nextFunding, setNextFunding] = useState('');
  const [btcPrice, setBtcPrice] = useState(null);
  const [latency, setLatency] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    setTime(new Date());

    // Timer + Funding
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);

      const nextFund = new Date(now);
      nextFund.setUTCHours(Math.ceil(now.getUTCHours() / 8) * 8, 0, 0, 0);
      if (nextFund <= now) nextFund.setUTCHours(nextFund.getUTCHours() + 8);

      const diff = nextFund - now;
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setNextFunding(`${h}:${m}:${s}`);
    }, 1000);

    // BTC Price & Latency
    const fetchTicker = async () => {
      const start = Date.now();
      try {
        const res = await fetch('https://api.bybit.com/v5/market/tickers?category=linear&symbol=BTCUSDT');
        const data = await res.json();
        if (data.result?.list?.[0]) {
          setBtcPrice(parseFloat(data.result.list[0].lastPrice));
        }
        setLatency(Date.now() - start);
      } catch (e) { }
    };
    fetchTicker();
    const tickerInterval = setInterval(fetchTicker, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(tickerInterval);
    };
  }, []);

  return (
    <header className="fixed top-0 w-full z-[100] bg-[#09090b]/90 backdrop-blur-xl border-b border-white/5 group/header h-16">
      {/* Animated Top Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-50 group-hover/header:opacity-100 transition-opacity"></div>

      <div className="max-w-[1920px] mx-auto px-4 h-full flex items-center justify-between">

        {/* Left: LOGO */}
        <div className="flex items-center gap-4 group cursor-pointer w-[200px]">
          <div className="relative transform -skew-x-12 transition-all duration-300 hover:skew-x-0 group-hover:scale-105">
            <div className="w-9 h-9 bg-primary flex items-center justify-center font-black text-black text-xl shadow-[0_0_20px_rgba(204,255,0,0.3)] group-hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] transition-all border border-white/20 relative overflow-hidden">
              <div className="transform skew-x-12 z-10 font-display">M</div>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-black tracking-tighter text-white leading-none font-display italic">
              MOURN<span className="text-primary text-shadow-neon">BIT</span>
            </h1>
            <span className="text-[8px] font-mono text-muted uppercase tracking-[0.3em] pl-0.5">Terminal v1.0</span>
          </div>
        </div>

        {/* Center: SYSTEM HUD */}
        <div className="hidden xl:flex items-center gap-6 text-xs font-mono px-6 h-10 rounded border border-white/5 bg-white/[0.02]">
          {/* BTC Ticker */}
          <div className="flex items-center gap-2 border-r border-white/10 pr-6">
            <span className="text-muted text-[10px] uppercase font-bold">BTC/USDT</span>
            <span className={`font-bold tabular-nums tracking-wide ${!btcPrice ? 'text-muted' : 'text-white'}`}>
              {btcPrice ? `$${btcPrice.toLocaleString(undefined, { minimumFractionDigits: 1 })}` : 'Loading...'}
            </span>
          </div>

          {/* Latency */}
          <div className="flex items-center gap-2 border-r border-white/10 pr-6">
            <Wifi size={12} className={latency < 100 ? "text-green-500" : "text-yellow-500"} />
            <span className="text-muted text-[10px] uppercase font-bold">Latency</span>
            <span className="font-bold tabular-nums text-white">{latency}ms</span>
          </div>

          {/* Funding Timer */}
          <div className="flex items-center gap-2">
            <Timer size={12} className="text-primary" />
            <span className="text-muted text-[10px] uppercase font-bold">Funding</span>
            <span className="font-bold tabular-nums text-white">{nextFunding || '00:00:00'}</span>
          </div>
        </div>

        {/* Right: Clock & User Profile */}
        <div className="flex items-center gap-6 w-[200px] justify-end">
          {/* Clock */}
          <div className="hidden md:block text-right">
            <div className="text-lg font-bold text-white tabular-nums leading-none">
              {time ? time.toLocaleTimeString([], { hour12: false }) : '--:--:--'}
            </div>
            <div className="text-[8px] text-muted font-mono uppercase tracking-widest text-right">UTC</div>
          </div>

          {/* User Profile */}
          {session?.user ? (
            <div
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 pl-4 border-l border-white/10 group relative cursor-pointer hover:bg-white/5 p-2 rounded-r-lg transition-colors"
            >
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-white max-w-[100px] truncate">{session.user.name}</div>
                <div className="text-[9px] text-muted font-mono uppercase tracking-wider">Member</div>
              </div>

              <button className="relative w-9 h-9 rounded bg-white/5 border border-white/10 overflow-hidden hover:border-primary/50 transition-all flex items-center justify-center">
                {session.user.image ? (
                  <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-muted" />
                )}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full"></div>
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn('discord')}
              className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-black transition-all rounded text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_-5px_rgba(204,255,0,0.3)]"
            >
              <User size={12} />
              <span>Connect</span>
            </button>
          )}
        </div>

      </div>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} session={session} />
    </header>
  );
}
