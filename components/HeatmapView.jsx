'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, Download, Camera, X } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function HeatmapView() {
    const containerRef = useRef();
    const heatmapRef = useRef();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        // TradingView Crypto Heatmap Widget
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
            "dataSource": "Crypto",
            "blockSize": "market_cap_calc",
            "blockColor": "change",
            "locale": "en",
            "symbolUrl": "",
            "colorTheme": "dark",
            "hasTopBar": true,
            "isDataSetEnabled": true,
            "isZoomEnabled": true,
            "hasSymbolTooltip": true,
            "width": "100%",
            "height": "100%",
            "colorSettings": {
                "color1": "#f50000",
                "color2": "#2C3E50",
                "color3": "#00ff00"
            }
        });

        if (containerRef.current) {
            // Check if script already exists to avoid duplicates
            if (!containerRef.current.querySelector('script')) {
                containerRef.current.appendChild(script);
            }
        }
    }, []);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(() => {
        if (!isFullscreen) {
            if (heatmapRef.current?.requestFullscreen) {
                heatmapRef.current.requestFullscreen();
            } else if (heatmapRef.current?.webkitRequestFullscreen) {
                heatmapRef.current.webkitRequestFullscreen();
            } else if (heatmapRef.current?.msRequestFullscreen) {
                heatmapRef.current.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }, [isFullscreen]);

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Escape key to exit fullscreen
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isFullscreen) {
                toggleFullscreen();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen, toggleFullscreen]);

    // Save chart as image
    const saveChart = async () => {
        if (!heatmapRef.current || isSaving) return;

        setIsSaving(true);
        try {
            // Wait a bit for any animations to settle
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(heatmapRef.current, {
                backgroundColor: '#000000',
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
            });

            // Create download link
            const link = document.createElement('a');
            link.download = `mournbit-heatmap-${new Date().toISOString().slice(0, 10)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (error) {
            console.error('Failed to save chart:', error);
            alert('Failed to save chart. Try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            ref={heatmapRef}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`w-full bg-card/40 backdrop-blur-xl border border-border rounded-xl overflow-hidden relative ${isFullscreen ? 'fixed inset-0 z-[9999] rounded-none h-screen' : 'h-[800px]'
                }`}
        >
            {/* Toolbar - positioned on the right edge, vertically centered to avoid TradingView overlap */}
            <div className="absolute top-1/2 -translate-y-1/2 right-3 z-50 flex flex-col items-center gap-2">
                {/* Save Success Toast */}
                <AnimatePresence>
                    {saveSuccess && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute right-12 top-0 bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 whitespace-nowrap"
                        >
                            <Camera size={12} />
                            Saved!
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Save Button */}
                <button
                    onClick={saveChart}
                    disabled={isSaving}
                    className="p-2.5 bg-black/80 hover:bg-white/10 border border-white/20 rounded-lg text-white/70 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg"
                    title="Save as PNG"
                >
                    {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Download size={16} className="group-hover:scale-110 transition-transform" />
                    )}
                </button>

                {/* Fullscreen Button */}
                <button
                    onClick={toggleFullscreen}
                    className="p-2.5 bg-black/80 hover:bg-white/10 border border-white/20 rounded-lg text-white/70 hover:text-white transition-all group shadow-lg"
                    title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen"}
                >
                    {isFullscreen ? (
                        <Minimize2 size={16} className="group-hover:scale-110 transition-transform" />
                    ) : (
                        <Maximize2 size={16} className="group-hover:scale-110 transition-transform" />
                    )}
                </button>

                {/* Close button in fullscreen */}
                {isFullscreen && (
                    <button
                        onClick={toggleFullscreen}
                        className="p-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-all shadow-lg"
                        title="Exit Fullscreen"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Fullscreen indicator */}
            {isFullscreen && (
                <div className="absolute bottom-4 right-3 z-50 bg-black/60 border border-white/10 px-3 py-1.5 rounded-lg">
                    <span className="text-xs text-white/60 font-mono">Press ESC to exit</span>
                </div>
            )}

            {/* Loading spinner */}
            <div className="absolute inset-0 flex items-center justify-center -z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>

            {/* TradingView Widget */}
            <div className="tradingview-widget-container h-full w-full p-1" ref={containerRef}>
                <div className="tradingview-widget-container__widget h-full w-full"></div>
                <div className="tradingview-widget-copyright text-xs text-muted text-center p-2">
                    <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">Track all markets on TradingView</a>
                </div>
            </div>
        </motion.div>
    );
}
