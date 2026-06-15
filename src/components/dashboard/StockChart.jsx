import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts'
import { useGetStockPrices } from '@/hooks/useListings'

export default function StockChart({ symbol }) {
    const containerRef = useRef(null)
    const chartRef = useRef(null)
    const seriesRef = useRef(null)
    const allCandlesRef = useRef([])
    const [before, setBefore] = useState(null)
    const { data, isLoading } = useGetStockPrices(symbol, before)

    useEffect(() => {
        if (!containerRef.current || chartRef.current) return

        const chart = createChart(containerRef.current, {
            autoSize: true, // ← ganti ini, hapus width & height manual
            layout: { background: { type: ColorType.Solid, color: '#09090b' }, textColor: '#71717a' },
            grid: { vertLines: { color: '#18181b' }, horzLines: { color: '#18181b' } },
        })

        const series = chart.addSeries(CandlestickSeries, {
            upColor: '#10b981', downColor: '#ef4444',
            borderVisible: false, wickUpColor: '#10b981', wickDownColor: '#ef4444',
        })

        chartRef.current = chart
        seriesRef.current = series

        chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
            if (range && range.from < 0 && data?.hasMore && !isLoading) {
                setBefore(data.before)
            }
        })

        return () => {
            chart.remove()
            chartRef.current = null
            seriesRef.current = null
            allCandlesRef.current = []
        }
    }, [])

    useEffect(() => {
        if (!data?.candles || !seriesRef.current) return

        const newCandles = data.candles.map(c => ({
            time: c.time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
        }))

        const merged = [...allCandlesRef.current, ...newCandles]
        const deduped = Object.values(
            merged.reduce((acc, c) => ({ ...acc, [c.time]: c }), {})
        )
        deduped.sort((a, b) => a.time - b.time)

        allCandlesRef.current = deduped
        seriesRef.current.setData(deduped)
    }, [data])

    return <div ref={containerRef} className="w-full h-64" />
}