'use client';
import { SessionProvider, useSession, signIn } from "next-auth/react"
import { ShieldCheck, Lock, ChevronRight, Terminal } from "lucide-react";
import MainTerminal from "@/components/MainTerminal";
import { useEffect, useState } from "react";

function AuthGate() {
    const { data: session, status } = useSession();
    const [error, setError] = useState(null);
    const [acceptedToS, setAcceptedToS] = useState(false);

    useEffect(() => {
        // Check for error in URL (e.g., failed OAuth)
        const urlParams = new URLSearchParams(window.location.search);
        const err = urlParams.get('error');
        if (err) setError('Authentication Failed. Access Denied.');
    }, []);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    <span className="text-[10px] text-muted font-mono tracking-widest uppercase">Initializing Secure Handshake...</span>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden font-sans text-text">

                {/* Cinematic Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-[#050505] to-[#050505] opacity-50"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

                {/* Login Container */}
                <div className="z-10 w-full max-w-[420px] p-2">

                    {/* Terminal Header */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5 rounded-t-lg backdrop-blur-md">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                        </div>
                        <div className="text-[9px] font-mono text-muted uppercase tracking-widest">Client v2.5.0-RC</div>
                    </div>

                    {/* Main Card */}
                    <div className="bg-[#0a0a0a] border border-white/10 border-t-0 p-8 rounded-b-lg shadow-2xl relative overflow-hidden">

                        {/* Branding */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white text-black mb-4 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                <Terminal size={24} strokeWidth={3} />
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">MOURNBIT</h1>
                            <p className="text-sm text-muted font-medium">Advanced Derivatives Terminal</p>
                        </div>

                        {/* ToS Section */}
                        <div className="mb-6 p-3 bg-white/5 rounded border border-white/5 text-[10px] text-muted leading-relaxed font-mono text-justify h-24 overflow-y-auto scrollbar-hide">
                            <strong className="text-white block mb-1">DISCLAIMER & TERMS OF SERVICE</strong>
                            Mournbit is a data aggregation and analytics tool designed solely for informational purposes.
                            We do NOT provide financial, investment, legal, or tax advice.
                            Trading cryptocurrencies and derivatives involves significant risk and can result in the loss of your entire capital.
                            By using this tool, you acknowledge that you are solely responsible for your trading decisions and agree to hold Mournbit harmless from any losses incurred.
                            This platform does not facilitate trading execution but provides data to assist in your own analysis.
                        </div>

                        {/* Agreement Checkbox */}
                        <div className="mb-6 flex items-start gap-3 px-1">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    id="tos"
                                    checked={acceptedToS}
                                    onChange={(e) => setAcceptedToS(e.target.checked)}
                                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-white/20 bg-black checked:border-white checked:bg-white transition-all"
                                />
                                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100">
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            <label htmlFor="tos" className="text-[11px] text-muted cursor-pointer select-none leading-tight hover:text-white transition-colors">
                                I confirm I have read and agree to the <span className="text-white underline decoration-white/30 underline-offset-2">Terms of Service</span> and Disclaimer.
                            </label>
                        </div>

                        {/* Action */}
                        <div className="space-y-4">
                            <button
                                onClick={() => signIn('discord')}
                                disabled={!acceptedToS}
                                className={`group w-full py-3.5 px-4 font-bold text-sm tracking-wide rounded transition-all flex items-center justify-between
                      ${acceptedToS
                                        ? 'bg-white text-black hover:bg-white/90 cursor-pointer'
                                        : 'bg-white/10 text-white/20 cursor-not-allowed'
                                    }
                    `}
                            >
                                <span className="flex items-center gap-3">
                                    <ShieldCheck size={18} />
                                    Start Session
                                </span>
                                <ChevronRight size={16} className={`transition-transform ${acceptedToS ? 'opacity-50 group-hover:translate-x-1' : 'opacity-20'}`} />
                            </button>

                            <div className="flex items-center gap-3 text-[10px] text-muted font-mono justify-center mt-6 opacity-60">
                                <Lock size={10} />
                                <span>END-TO-END ENCRYPTED</span>
                                <span className="w-1 h-1 bg-muted rounded-full"></span>
                                <span>SSO ENABLED</span>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded text-[11px] text-red-400 text-center font-mono">
                     //! ERROR: {error}
                            </div>
                        )}

                    </div>

                    {/* Access Note */}
                    <p className="text-[10px] text-center text-muted mt-8 font-mono max-w-xs mx-auto leading-relaxed">
                        UNAUTHORIZED ACCESS IS PROHIBITED. IP ADDRESS LOGGED. By accessing this terminal, you agree to the usage telemetry policy.
                    </p>

                </div>
            </div>
        );
    }

    return <MainTerminal />;
}

export default function Page() {
    return (
        <SessionProvider>
            <AuthGate />
        </SessionProvider>
    )
}
