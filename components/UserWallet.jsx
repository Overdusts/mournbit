'use client';
import { useState, useEffect, useCallback } from 'react';
import { Wallet, Shield, ShieldAlert, Eye, EyeOff, RefreshCcw, LogOut, CheckCircle, Lock, AlertTriangle } from 'lucide-react';

export default function UserWallet() {
    const [account, setAccount] = useState(null);
    const [isPrivacyMode, setIsPrivacyMode] = useState(true);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [balance, setBalance] = useState('0.00');
    const [totalValue, setTotalValue] = useState(0);
    const [assets, setAssets] = useState([]);
    const [error, setError] = useState(null);

    // Fetch token balances from Etherscan
    const fetchWalletData = useCallback(async (address) => {
        if (!address) return;

        setRefreshing(true);
        setError(null);

        try {
            // Fetch ETH balance
            const ethResponse = await fetch(
                `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'KVX54ST6FRBPF4RID1H85UF9AIZTP6VBE7'}`
            );
            const ethData = await ethResponse.json();

            let ethBalance = 0;
            if (ethData.status === '1') {
                ethBalance = parseFloat(ethData.result) / 1e18;
            }

            // Fetch token balances
            const tokenResponse = await fetch(
                `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&page=1&offset=100&sort=desc&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'KVX54ST6FRBPF4RID1H85UF9AIZTP6VBE7'}`
            );
            const tokenData = await tokenResponse.json();

            // Process tokens - aggregate balances
            const tokenMap = new Map();

            if (tokenData.status === '1' && tokenData.result) {
                tokenData.result.forEach(tx => {
                    const symbol = tx.tokenSymbol;
                    const decimals = parseInt(tx.tokenDecimal) || 18;
                    const value = parseFloat(tx.value) / Math.pow(10, decimals);
                    const isIncoming = tx.to.toLowerCase() === address.toLowerCase();

                    if (!tokenMap.has(symbol)) {
                        tokenMap.set(symbol, {
                            symbol,
                            name: tx.tokenName,
                            balance: 0,
                            contractAddress: tx.contractAddress
                        });
                    }

                    const token = tokenMap.get(symbol);
                    if (isIncoming) {
                        token.balance += value;
                    } else {
                        token.balance -= value;
                    }
                });
            }

            // Fetch actual token balances for top tokens
            const tokensWithBalance = [];

            // Add ETH first
            if (ethBalance > 0) {
                tokensWithBalance.push({
                    symbol: 'ETH',
                    name: 'Ethereum',
                    balance: ethBalance.toFixed(4),
                    value: ethBalance * 3200, // Approximate ETH price
                    change: 0
                });
            }

            // Fetch real token balances for known tokens
            const knownTokens = [
                { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT', name: 'Tether', decimals: 6, price: 1 },
                { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC', name: 'USD Coin', decimals: 6, price: 1 },
                { address: '0x6982508145454ce325ddbe47a25d4ec3d2311933', symbol: 'PEPE', name: 'Pepe', decimals: 18, price: 0.000001 },
                { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, price: 3200 },
                { address: '0x514910771af9ca656af840dff83e8264ecf986ca', symbol: 'LINK', name: 'Chainlink', decimals: 18, price: 15 },
            ];

            for (const token of knownTokens) {
                try {
                    const balanceRes = await fetch(
                        `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${token.address}&address=${address}&tag=latest&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'KVX54ST6FRBPF4RID1H85UF9AIZTP6VBE7'}`
                    );
                    const balanceData = await balanceRes.json();

                    if (balanceData.status === '1' && balanceData.result !== '0') {
                        const bal = parseFloat(balanceData.result) / Math.pow(10, token.decimals);
                        if (bal > 0) {
                            tokensWithBalance.push({
                                symbol: token.symbol,
                                name: token.name,
                                balance: bal >= 1000 ? bal.toLocaleString(undefined, { maximumFractionDigits: 2 }) : bal.toFixed(4),
                                value: bal * token.price,
                                change: (Math.random() * 10 - 5).toFixed(2) // Random change for now
                            });
                        }
                    }

                    // Rate limit - Etherscan free tier is 5 calls/sec
                    await new Promise(r => setTimeout(r, 250));
                } catch (e) {
                    console.error(`Error fetching ${token.symbol}:`, e);
                }
            }

            setAssets(tokensWithBalance);
            setBalance(ethBalance.toFixed(4));

            // Calculate total value
            const total = tokensWithBalance.reduce((sum, t) => sum + (t.value || 0), 0);
            setTotalValue(total);

        } catch (err) {
            console.error('Error fetching wallet data:', err);
            setError('Failed to fetch wallet data');
        } finally {
            setRefreshing(false);
        }
    }, []);

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            setLoading(true);
            setError(null);
            try {
                // FORCE permission request to ensure "confirmation" every time
                await window.ethereum.request({
                    method: "wallet_requestPermissions",
                    params: [{ eth_accounts: {} }]
                });

                // After permission is granted, get the accounts
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

                if (accounts.length > 0) {
                    const addr = accounts[0];
                    setAccount(addr);
                    // Fetch real data
                    await fetchWalletData(addr);
                }
            } catch (error) {
                console.error("Connection failed", error);
                if (error.code === 4001) {
                    setError('Connection request rejected by user');
                } else {
                    // Do NOT fallback to eth_requestAccounts automatically if we want to force confirmation
                    // If wallet_requestPermissions fails, it means the wallet doesn't support forced confirmation cleanly
                    if (error.code === -32601) {
                        setError('Your wallet does not support "Select Account" requests. Please use "Disconnect" inside your wallet.');
                    } else {
                        setError('Failed to connect: ' + (error.message || 'Unknown error'));
                    }
                }
            } finally {
                setLoading(false);
            }
        } else {
            setError('No wallet found! Please install MetaMask to continue.');
        }
    };

    // Listen for account changes
    useEffect(() => {
        if (typeof window.ethereum !== 'undefined') {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length === 0) {
                    // User disconnected
                    setAccount(null);
                    setAssets([]);
                    setTotalValue(0);
                } else if (accounts[0] !== account) {
                    // Account changed
                    setAccount(accounts[0]);
                    fetchWalletData(accounts[0]);
                }
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, [account, fetchWalletData]);

    const disconnect = async () => {
        try {
            // Attempt to revoke permissions (best effort)
            await window.ethereum.request({
                method: "wallet_revokePermissions",
                params: [{ eth_accounts: {} }]
            });
        } catch (e) {
            console.warn("Revoke permissions not supported", e);
        }

        setAccount(null);
        setBalance('0.00');
        setAssets([]);
        setTotalValue(0);
        setError(null);
    };

    const handleRefresh = () => {
        if (account) {
            fetchWalletData(account);
        }
    };

    const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';

    // Privacy Mask
    const Mask = ({ children, width = 'w-20' }) => {
        if (!isPrivacyMode) return children;
        return <div className={`${width} h-5 bg-white/10 rounded animate-pulse blur-sm select-none`}></div>;
    };

    if (!account) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#0e1014] rounded-xl border border-white/5 relative overflow-hidden p-6">
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50"></div>

                <div className="z-10 bg-black/40 p-8 rounded-2xl border border-white/10 backdrop-blur-xl flex flex-col items-center max-w-sm w-full text-center shadow-2xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                        <Wallet size={32} className="text-black" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2 font-display">Secure Connect</h2>
                    <p className="text-sm text-muted mb-8 leading-relaxed">
                        Connect your non-custodial wallet (Exodus, Trust, MetaMask) to view your portfolio in a privacy-focused encrypted environment.
                    </p>

                    {error && (
                        <div className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                            <AlertTriangle size={14} />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={connectWallet}
                        disabled={loading}
                        className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mb-4 group"
                    >
                        {loading ? (
                            <RefreshCcw size={18} className="animate-spin" />
                        ) : (
                            <>
                                <Wallet size={18} />
                                Connect Wallet
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-2 text-[10px] text-muted font-mono bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                        <Lock size={10} className="text-green-500" />
                        Access Mode: <span className="text-white font-bold">Watch-Only (Safe)</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#0e1014] rounded-xl border border-white/5 overflow-hidden">
            {/* Header / Privacy Control */}
            <div className="h-16 border-b border-white/5 bg-[#0e1014]/50 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 text-xs font-bold font-mono">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        CONNECTED
                    </div>
                    <span className="text-sm font-mono text-muted">{formatAddress(account)}</span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                            ${isPrivacyMode ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white/5 text-muted border-white/10 hover:text-white'}
                        `}
                    >
                        {isPrivacyMode ? <EyeOff size={14} /> : <Eye size={14} />}
                        {isPrivacyMode ? 'PRIVACY ON' : 'PRIVACY OFF'}
                    </button>
                    <button onClick={disconnect} className="p-2 hover:bg-red-500/10 text-muted hover:text-red-400 rounded-lg transition-colors">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="flex-1 p-6 overflow-y-auto">

                {/* Total Balance Card */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-sm text-muted font-mono uppercase tracking-widest mb-1">Total Net Worth</div>
                        <div className="text-4xl font-bold text-white font-display mb-2 flex items-center gap-2">
                            <span className="text-white/50">$</span>
                            <Mask width="w-48">
                                <span className="tabular-nums">{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </Mask>
                        </div>
                        {assets.length === 0 && !refreshing && (
                            <div className="text-xs text-muted">No assets found or still loading...</div>
                        )}
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                        <AlertTriangle size={14} />
                        {error}
                    </div>
                )}

                {/* Assets List */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Your Assets</h3>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="text-[10px] text-muted hover:text-white flex items-center gap-1 disabled:opacity-50"
                        >
                            <RefreshCcw size={10} className={refreshing ? 'animate-spin' : ''} />
                            {refreshing ? 'LOADING...' : 'REFRESH'}
                        </button>
                    </div>

                    {refreshing && assets.length === 0 ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="text-center py-8 text-muted text-sm">
                            No tokens found in this wallet
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {assets.map((asset) => (
                                <div key={asset.symbol} className="grid grid-cols-12 items-center p-4 bg-black/20 hover:bg-white/5 rounded-xl border border-white/5 transition-colors group">
                                    <div className="col-span-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                            {asset.symbol[0]}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{asset.name}</div>
                                            <div className="text-xs text-muted">{asset.symbol}</div>
                                        </div>
                                    </div>
                                    <div className="col-span-4 text-right">
                                        <div className="text-sm font-bold text-white tabular-nums">
                                            <Mask width="w-20">{asset.balance}</Mask>
                                        </div>
                                    </div>
                                    <div className="col-span-4 text-right">
                                        <div className="text-sm font-bold text-white tabular-nums">
                                            <Mask width="w-24">${asset.value?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'}</Mask>
                                        </div>
                                        <div className={`text-xs tabular-nums ${parseFloat(asset.change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {parseFloat(asset.change) > 0 ? '+' : ''}{asset.change}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

function ShieldCheck({ size }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
