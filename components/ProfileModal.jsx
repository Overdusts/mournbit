'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, LogOut, Clock, Activity } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ProfileModal({ isOpen, onClose, session }) {
    const [sessionTime, setSessionTime] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setSessionTime(0);
            return;
        }
        const start = Date.now();
        const interval = setInterval(() => {
            setSessionTime(Math.floor((Date.now() - start) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [isOpen]);

    // Escape key to close
    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!mounted) return null;

    const modalContent = (
        <AnimatePresence mode="wait">
            {isOpen && session && (
                <motion.div
                    key="profile-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    style={{ zIndex: 99999 }}
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        key="profile-modal-content"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="w-full max-w-sm bg-[#0a0a0b] border border-white/10 rounded-xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with Avatar */}
                        <div className="relative p-6 pb-4 border-b border-white/5">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                            >
                                <X size={14} />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-lg border border-white/10 bg-black overflow-hidden flex-shrink-0">
                                    {session.user.image ? (
                                        <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-white/5 text-white font-bold text-lg">
                                            {session.user.name?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-base font-bold text-white truncate">{session.user.name}</h2>
                                    <span className="text-xs text-muted font-mono block truncate">{session.user.email || 'Discord User'}</span>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        <span className="text-[10px] text-green-500/80 font-mono">CONNECTED</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Session Stats */}
                        <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <StatBox
                                    icon={Clock}
                                    label="Session Time"
                                    value={formatTime(sessionTime)}
                                />
                                <StatBox
                                    icon={Activity}
                                    label="Status"
                                    value="Active"
                                    valueColor="text-green-400"
                                />
                            </div>

                            {/* Terminal Info */}
                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Terminal size={12} className="text-muted" />
                                    <span className="text-[10px] text-muted uppercase tracking-wider">Terminal Access</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-white/60">All features unlocked</span>
                                    <span className="text-[9px] bg-white/10 text-white/80 px-2 py-0.5 rounded font-mono">v1.0.0</span>
                                </div>
                            </div>
                        </div>

                        {/* Disconnect Button */}
                        <div className="p-4 pt-0">
                            <button
                                onClick={() => signOut()}
                                className="w-full py-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-sm font-medium flex items-center justify-center gap-2 transition-all"
                            >
                                <LogOut size={14} />
                                Disconnect Session
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Use portal to render at document.body level, escaping any overflow:hidden containers
    return createPortal(modalContent, document.body);
}

function StatBox({ icon: Icon, label, value, valueColor = "text-white" }) {
    return (
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
                <Icon size={10} className="text-muted" />
                <span className="text-[9px] text-muted uppercase tracking-wider">{label}</span>
            </div>
            <span className={`text-sm font-mono font-bold ${valueColor}`}>{value}</span>
        </div>
    );
}
