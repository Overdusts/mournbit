'use client';

import { useState, useEffect } from 'react';
import WalletCard from './WalletCard';
import { Radar, Clock, RefreshCw, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

// Mock activity history data
const generateMockActivity = () => {
  const tokens = ['WETH', 'USDC', 'PEPE', 'LINK', 'UNI', 'AAVE', 'WBTC', 'DAI'];
  const actions = ['BUY', 'SELL'];
  const wallets = ['0x9c5...ac5', '0x3dd...296', '0x5a5...fcb', '0x1db...ee6', '0x824...1c1'];

  return Array.from({ length: 12 }, (_, i) => {
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    let amount;

    // Generate realistic amounts based on token
    if (token === 'WBTC') {
      amount = (Math.random() * 2 + 0.1).toFixed(2);
    } else if (token === 'WETH') {
      amount = (Math.random() * 50 + 1).toFixed(2);
    } else if (token === 'USDC' || token === 'DAI') {
      amount = (Math.random() * 50 + 1).toFixed(1) + 'K';
    } else if (token === 'PEPE') {
      amount = (Math.random() * 500 + 10).toFixed(0) + 'M';
    } else {
      amount = (Math.random() * 500 + 10).toFixed(1);
    }

    return {
      id: i,
      time: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      wallet: wallets[Math.floor(Math.random() * wallets.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      token,
      amount,
    };
  });
};

export default function WalletSection() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activity, setActivity] = useState([]);
  const [view, setView] = useState('wallets'); // 'wallets' or 'activity'
  const [isDemo, setIsDemo] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/wallets');
      const result = await response.json();

      if (result.success) {
        setWallets(result.data);
        setLastUpdate(new Date());
        setError(null);
        setIsDemo(result.mock === true);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setActivity(generateMockActivity());

    const interval = setInterval(fetchData, 5 * 60 * 1000);

    // Update activity every 8 seconds for "live" feel
    const activityInterval = setInterval(() => {
      setActivity(prev => {
        const tokens = ['WETH', 'USDC', 'PEPE', 'LINK', 'UNI', 'AAVE', 'WBTC'];
        const token = tokens[Math.floor(Math.random() * tokens.length)];
        let amount;

        if (token === 'WBTC') {
          amount = (Math.random() * 2 + 0.1).toFixed(2);
        } else if (token === 'WETH') {
          amount = (Math.random() * 50 + 1).toFixed(2);
        } else if (token === 'USDC') {
          amount = (Math.random() * 50 + 1).toFixed(1) + 'K';
        } else if (token === 'PEPE') {
          amount = (Math.random() * 500 + 10).toFixed(0) + 'M';
        } else {
          amount = (Math.random() * 500 + 10).toFixed(1);
        }

        const newActivity = {
          id: Date.now(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          wallet: ['0x9c5...ac5', '0x3dd...296', '0x5a5...fcb'][Math.floor(Math.random() * 3)],
          action: Math.random() > 0.5 ? 'BUY' : 'SELL',
          token,
          amount,
        };
        return [newActivity, ...prev.slice(0, 11)];
      });
    }, 8000);

    return () => {
      clearInterval(interval);
      clearInterval(activityInterval);
    };
  }, []);

  return (
    <div className="card h-full flex flex-col bg-card/40 backdrop-blur-xl">
      {/* Header */}
      <div className="p-3 flex-shrink-0 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md border bg-white/5 border-white/10 text-white">
              <Radar size={12} />
            </div>
            <div>
              <h2 className="text-[11px] font-bold text-white uppercase tracking-wider leading-none">
                On-Chain Intel
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1 h-1 rounded-full animate-pulse ${isDemo ? 'bg-yellow-500' : 'bg-gain'}`} />
                <span className="text-[8px] text-muted font-mono">
                  {isDemo ? 'Demo Mode' : 'Live Tracking'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isDemo && (
              <div className="flex items-center gap-1 text-[7px] text-yellow-500/80 font-mono bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                <AlertTriangle size={8} />
                <span>DEMO</span>
              </div>
            )}
            {lastUpdate && (
              <div className="flex items-center gap-1 text-[8px] text-muted font-mono bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                <Clock size={8} />
                <span>{lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex mt-2 p-0.5 bg-black/40 rounded border border-white/5">
          <button
            onClick={() => setView('wallets')}
            className={`flex-1 py-1 text-[8px] font-bold uppercase tracking-wide rounded transition-all ${
              view === 'wallets'
                ? 'bg-white text-black'
                : 'text-muted hover:text-white'
            }`}
          >
            Wallets ({wallets.length})
          </button>
          <button
            onClick={() => setView('activity')}
            className={`flex-1 py-1 text-[8px] font-bold uppercase tracking-wide rounded transition-all ${
              view === 'activity'
                ? 'bg-white text-black'
                : 'text-muted hover:text-white'
            }`}
          >
            Activity
          </button>
        </div>
      </div>

      {/* Column Headers */}
      {view === 'wallets' ? (
        <div className="grid grid-cols-[24px_1fr_55px_110px_65px] gap-2 px-3 py-1.5 text-[8px] uppercase tracking-wider text-muted font-bold border-b border-white/5 bg-[#0e1014]/50">
          <div className="text-center">#</div>
          <div>Wallet</div>
          <div className="text-center">Win%</div>
          <div className="text-right">Last Trade</div>
          <div className="text-right">Time</div>
        </div>
      ) : (
        <div className="grid grid-cols-[45px_70px_45px_55px_55px] gap-2 px-3 py-1.5 text-[8px] uppercase tracking-wider text-muted font-bold border-b border-white/5 bg-[#0e1014]/50">
          <div>Time</div>
          <div>Wallet</div>
          <div className="text-center">Side</div>
          <div>Token</div>
          <div className="text-right">Amount</div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto section-scroll custom-scrollbar">
        {loading ? (
          <div className="p-3 space-y-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 shimmer rounded w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full py-4">
            <span className="text-[10px] text-loss font-mono">{error}</span>
            <button
              onClick={fetchData}
              className="mt-2 flex items-center gap-1 text-[9px] text-muted hover:text-white transition-colors"
            >
              <RefreshCw size={10} />
              Retry
            </button>
          </div>
        ) : view === 'wallets' ? (
          wallets.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-[10px] text-muted font-mono">No activity detected</span>
            </div>
          ) : (
            <div>
              {wallets.map((wallet, index) => (
                <WalletCard key={wallet.address} wallet={wallet} index={index} />
              ))}
            </div>
          )
        ) : (
          /* Activity Feed */
          <div>
            {activity.map((item, i) => (
              <div
                key={item.id}
                className={`grid grid-cols-[45px_70px_45px_55px_55px] gap-2 px-3 py-2 border-b border-white/5 items-center transition-all ${
                  i === 0 ? 'bg-white/5 animate-pulse' : 'hover:bg-white/5'
                }`}
              >
                <span className="text-[9px] text-muted font-mono">{item.time}</span>
                <span className="text-[9px] text-white/70 font-mono truncate">{item.wallet}</span>
                <div className="flex justify-center">
                  {item.action === 'BUY' ? (
                    <span className="flex items-center gap-0.5 text-[8px] font-bold text-gain bg-gain/10 px-1.5 py-0.5 rounded">
                      <TrendingUp size={8} />
                      BUY
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[8px] font-bold text-loss bg-loss/10 px-1.5 py-0.5 rounded">
                      <TrendingDown size={8} />
                      SELL
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-white font-bold font-mono">{item.token}</span>
                <span className="text-[9px] text-muted font-mono text-right">{item.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-white/5 bg-black/20 text-[8px] text-muted/60 text-center font-mono flex-shrink-0">
        {view === 'wallets'
          ? (isDemo ? 'Demo data • Add API key for live tracking' : 'Auto-refresh: 5min')
          : 'Simulated activity feed'
        }
      </div>
    </div>
  );
}
