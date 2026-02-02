'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import DashboardView from '@/components/DashboardView';
import HeatmapView from '@/components/HeatmapView';
import NewsView from '@/components/NewsView';
import UserWallet from '@/components/UserWallet';
import { LayoutGrid, Flame, Radio, Wallet, LogOut } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';

export default function MainTerminal() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { data: session } = useSession();

    const tabs = [
        { id: 'dashboard', label: 'TERMINAL', icon: LayoutGrid },
        { id: 'smart-wallet', label: 'SMART WALLET', icon: Wallet },
        { id: 'heatmap', label: 'HEATMAP', icon: Flame },
        { id: 'news', label: 'INTEL', icon: Radio },
    ];

    return (
        <div className="min-h-screen font-sans text-text selection:bg-white/10 selection:text-white pb-20 bg-[#050505] overflow-hidden">

            <Header />

            <main className="relative z-10 h-screen pt-16 flex flex-col">

                {/* TOOLBAR (Fixed Top) */}
                <div className="h-14 border-b border-white/5 bg-[#09090b]/80 backdrop-blur px-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    relative px-4 py-1.5 flex items-center gap-2 text-[10px] font-bold transition-all duration-200 uppercase tracking-widest rounded-md
                                    ${activeTab === tab.id
                                        ? 'text-black bg-white shadow-lg shadow-white/10 scale-105'
                                        : 'text-muted hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                <tab.icon size={12} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-[10px] text-muted font-mono flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            STREAM: ACTIVE
                        </div>
                    </div>
                </div>

                {/* DYNAMIC CONTENT AREA (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                    <div className="max-w-[1920px] mx-auto h-full">
                        <AnimatePresence mode="wait">
                            {activeTab === 'dashboard' && <DashboardView key="dashboard" />}
                            {activeTab === 'smart-wallet' && (
                                <div className="h-full">
                                    <UserWallet />
                                </div>
                            )}
                            {activeTab === 'heatmap' && <HeatmapView key="heatmap" />}
                            {activeTab === 'news' && <NewsView key="news" />}
                        </AnimatePresence>
                    </div>
                </div>

            </main>
        </div>
    );
}
