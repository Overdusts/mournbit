'use client';

import { shortenAddress, timeAgo } from '@/lib/utils';
import { Wallet, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

export default function WalletCard({ wallet, index }) {
  const { label, address, winRate, style, recentAction, pattern, chain } = wallet;

  const formatAmount = (amount, token) => {
    // Format token amounts (not USD values)
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(2)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(2)}K`;
    } else if (amount >= 1) {
      return `${amount.toFixed(2)}`;
    }
    return `${amount.toFixed(4)}`;
  };

  const isBuy = recentAction?.action === 'Bought';

  return (
    <div className="group grid grid-cols-[24px_1fr_55px_110px_65px] gap-2 px-3 py-2.5 hover:bg-white/5 border-b border-white/5 items-center cursor-pointer transition-colors relative">
      {/* Left accent bar on hover */}
      <div className={`absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity ${isBuy ? 'bg-gain' : 'bg-loss'}`} />

      {/* Rank */}
      <div className="text-[10px] text-muted font-mono text-center opacity-40 group-hover:opacity-100">
        {index + 1}
      </div>

      {/* Wallet Info */}
      <div className="flex items-center gap-2 min-w-0">
        <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
          isBuy ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
        }`}>
          <Wallet size={12} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-white truncate group-hover:text-primary transition-colors">
              {label}
            </span>
            <a
              href={`https://${chain === 'bsc' ? 'bscscan.com' : 'etherscan.io'}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={9} />
            </a>
          </div>
          <span className="text-[8px] text-muted font-mono">{shortenAddress(address)}</span>
        </div>
      </div>

      {/* Win Rate */}
      <div className="flex justify-center">
        <span
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
            winRate >= 70
              ? 'bg-gain/10 text-gain border-gain/20'
              : winRate >= 50
              ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
              : 'bg-loss/10 text-loss border-loss/20'
          }`}
        >
          {winRate}%
        </span>
      </div>

      {/* Last Action */}
      <div className="text-right">
        {recentAction && (
          <div className="flex items-center justify-end gap-1">
            {isBuy ? (
              <TrendingUp size={10} className="text-gain" />
            ) : (
              <TrendingDown size={10} className="text-loss" />
            )}
            <span className={`text-[10px] font-bold ${isBuy ? 'text-gain' : 'text-loss'}`}>
              {formatAmount(recentAction.amount, recentAction.token)} {recentAction.token}
            </span>
          </div>
        )}
        <span className="text-[8px] text-muted font-mono">
          {recentAction ? (isBuy ? 'Bought' : 'Sold') : '-'}
        </span>
      </div>

      {/* Time */}
      <div className="text-right">
        <span className="text-[9px] text-muted font-mono">
          {recentAction ? timeAgo(recentAction.timestamp) : '-'}
        </span>
      </div>
    </div>
  );
}
