'use client';

import GainersCard from '@/components/GainersCard';
import VolumeCard from '@/components/VolumeCard';
import FundingCard from '@/components/FundingCard';
import WalletSection from '@/components/WalletSection';
import { motion } from 'framer-motion';

export default function DashboardView() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-[calc(100vh-140px)] w-full grid grid-cols-1 lg:grid-cols-12 gap-4 pb-2"
        >
            {/* LEFT GROUP (Span 8) */}
            <div className="lg:col-span-8 flex flex-col h-full gap-4">

                {/* 1. Market Movers (Top 60%) */}
                <div className="h-[60%] w-full bg-[#0e1014] rounded-xl border border-white/5 shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity z-20"></div>
                    <GainersCard />
                </div>

                {/* 2. Volume Analysis (Bottom 40%) */}
                <div className="h-[40%] w-full bg-[#0e1014] rounded-xl border border-white/5 shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity z-20"></div>
                    <VolumeCard />
                </div>
            </div>

            {/* RIGHT GROUP (Span 4) */}
            <div className="lg:col-span-4 flex flex-col h-full gap-4">

                {/* 3. Funding Rates (Top 70%) */}
                <div className="h-[70%] w-full bg-[#0e1014] rounded-xl border border-white/5 shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity z-20"></div>
                    <FundingCard />
                </div>

                {/* 4. Portfolio / Wallet (Bottom 30%) */}
                <div className="h-[30%] w-full bg-[#0e1014] rounded-xl border border-white/5 shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity z-20"></div>
                    <WalletSection />
                </div>

            </div>

        </motion.div>
    );
}
