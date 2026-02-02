'use client';
import { useEffect, useRef } from 'react';

export default function CryptoChart({ data, colors }) {
    const chartContainerRef = useRef();
    const chartRef = useRef();

    useEffect(() => {
        if (!chartContainerRef.current) return;

        let cleanup = () => { };

        const initChart = async () => {
            // Import CandlestickSeries for v5+ compatibility
            const { createChart, ColorType, CandlestickSeries } = await import('lightweight-charts');

            if (!chartContainerRef.current) return;

            if (chartRef.current) {
                try {
                    chartRef.current.remove();
                } catch (e) {
                    // ignore
                }
            }

            const chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: 'transparent' },
                    textColor: colors?.text || '#9ca3af',
                },
                grid: {
                    vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
                    horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
                },
                width: chartContainerRef.current.clientWidth,
                height: 400,
                timeScale: {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    timeVisible: true,
                },
                rightPriceScale: {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                },
            });

            chartRef.current = chart;

            // v5.x Syntax: Use addSeries(SeriesType, options)
            const newSeries = chart.addSeries(CandlestickSeries, {
                upColor: '#00e5bc',
                downColor: '#ef4444',
                borderVisible: false,
                wickUpColor: '#00e5bc',
                wickDownColor: '#ef4444',
            });

            if (data && data.length > 0) {
                newSeries.setData(data);
                chart.timeScale().fitContent();
            }

            const handleResize = () => {
                if (chartContainerRef.current && chart) {
                    chart.applyOptions({ width: chartContainerRef.current.clientWidth });
                }
            };

            window.addEventListener('resize', handleResize);

            cleanup = () => {
                window.removeEventListener('resize', handleResize);
                chart.remove();
                chartRef.current = null;
            };
        };

        initChart();

        return () => {
            cleanup();
        };
    }, [data, colors]);

    return (
        <div
            ref={chartContainerRef}
            className="w-full h-[400px]"
        />
    );
}
