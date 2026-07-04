import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, Search, Sparkles, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { useGetGroveFormulas } from '@/hooks/useGroveFormulas'
import { useGetGroveScores } from '@/hooks/useListings'
import { useGetSectors } from '@/hooks/useSectors'
import GroveFormulaDetail from './GroveFormulaDetail'
import GroveScoreBreakdownModal from './GroveScoreBreakdownModal'
import Pagination from '@/components/dashboard/Pagination'

const groveOrder = ['G', 'R', 'O', 'V', 'E']

const metricBlurb = {
  G: 'Analisis pertumbuhan laba dan performa pendapatan emiten.',
  R: 'Kekuatan relatif harga saham dibandingkan sektor/pasar.',
  O: 'Arah trend pergerakan saham jangka menengah hingga panjang.',
  V: 'Penilaian valuasi harga saham wajar berdasarkan rasio keuangan.',
  E: 'Aksi akumulasi institusi asing dan domestik serta bandarmologi.'
}

export default function GroveScore() {
  const [page, setPage] = useState(1)
  const pageSize = 20

  const [searchInput, setSearchInput] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [selectedSector, setSelectedSector] = useState('')
  const [selectedSort, setSelectedSort] = useState('')

  const [activeFormulaId, setActiveFormulaId] = useState(null)
  const [selectedBreakdown, setSelectedBreakdown] = useState(null)

  // Debouncing keyword search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchInput)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchInput])

  // Queries
  const { data: formulasData, isLoading: formulasLoading, isError: formulasError, error: formulasErrorData } = useGetGroveFormulas()
  const { data: sectorsData } = useGetSectors()
  const sectors = sectorsData || []

  const { data: scoresData, isLoading: scoresLoading, isError: scoresError, error: scoresErrorData } = useGetGroveScores(
    page,
    pageSize,
    debouncedKeyword,
    selectedSector,
    selectedSort
  )

  const groveFormulaCards = (formulasData?.items || [])
    .slice()
    .sort((a, b) => {
      const indexA = groveOrder.indexOf(a.code)
      const indexB = groveOrder.indexOf(b.code)
      const safeIndexA = indexA === -1 ? groveOrder.length : indexA
      const safeIndexB = indexB === -1 ? groveOrder.length : indexB
      return safeIndexA - safeIndexB
    })
    .filter((formula) => groveOrder.includes(formula.code))

  const listings = scoresData?.items || []
  const pagination = scoresData?.pagination || { page: 1, totalPages: 1, total: 0 }

  const handleResetFilters = () => {
    setSearchInput('')
    setDebouncedKeyword('')
    setSelectedSector('')
    setSelectedSort('')
    setPage(1)
  }

  const getStanceClass = (stance) => {
    if (!stance) return 'text-[11px] font-semibold text-zinc-500 bg-zinc-500/5 border border-zinc-500/20 px-3 py-1 rounded-full'
    switch (stance) {
      case 'Overweight':
      case 'Buy':
        return 'text-[11px] font-semibold text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-3 py-1 rounded-full'
      case 'Neutral':
      case 'Hold':
        return 'text-[11px] font-semibold text-amber-400 bg-amber-500/5 border border-amber-500/20 px-3 py-1 rounded-full'
      case 'Underweight':
      case 'Sell':
        return 'text-[11px] font-semibold text-rose-400 bg-rose-500/5 border border-rose-500/20 px-3 py-1 rounded-full'
      default:
        return 'text-[11px] font-semibold text-zinc-400 bg-zinc-500/5 border border-zinc-500/20 px-3 py-1 rounded-full'
    }
  }

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'text-zinc-500'
    if (score >= 80) return 'text-emerald-400'
    if (score >= 65) return 'text-amber-400'
    return 'text-rose-400'
  }

  const activeFiltersCount = [
    debouncedKeyword !== '',
    selectedSector !== '',
    selectedSort !== ''
  ].filter(Boolean).length

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-fade-in text-sm text-zinc-300">
      <div className="flex items-end justify-between border-b border-zinc-900 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Algorithmic Scoring</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Grove Score Registry</h1>
          <p className="text-zinc-500 text-xs mt-1">
            Emiten score evaluation breakdown based on Growth, Strength, Trend, Valuation, and Endorsement metrics.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono">Last updated: 14:30 WIB</span>
        </div>
      </div>

      {/* Formula Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {formulasLoading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-[260px] rounded-xl border border-zinc-900 bg-[#0c0c0e] animate-pulse" />
          ))
        ) : formulasError ? (
          <div className="md:col-span-5 p-4 rounded-xl border border-red-950/40 bg-red-950/10 text-red-300 text-xs">
            Failed to load Grove formulas: {formulasErrorData?.response?.data?.message || formulasErrorData.message}
          </div>
        ) : groveFormulaCards.length > 0 ? (
          groveFormulaCards.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveFormulaId(item.id)}
              className="text-left group relative bg-[#0c0c0e] border border-zinc-900 rounded-xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 shadow-sm focus:outline-none focus:border-emerald-500/40"
            >
              <div className="h-1 w-full bg-[#5cb38d] opacity-90" />
              <div className="p-6 flex flex-col items-center text-center space-y-4">
                <span className="text-[84px] font-bold text-[#5cb38d] tracking-normal select-none leading-none pt-2">
                  {item.code}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200 tracking-tight mb-1 group-hover:text-emerald-400 transition-colors">
                    {item.description || item.code}
                  </h3>
                  <p className="text-[11px] text-zinc-500 leading-normal line-clamp-3">
                    {metricBlurb[item.code] || 'Grove formula detail dari backend.'}
                  </p>
                </div>
              </div>
              <div className="absolute right-2 bottom-2 text-zinc-900 font-bold text-5xl opacity-5 pointer-events-none select-none">
                {idx + 1}
              </div>
            </button>
          ))
        ) : (
          <div className="md:col-span-5 p-4 rounded-xl border border-zinc-900 bg-[#0c0c0e] text-zinc-500 text-xs">
            No Grove formulas found from backend.
          </div>
        )}
      </div>

      {/* Filters Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0c0c0e] border border-zinc-900 rounded-xl p-4">
        <div className="flex flex-1 flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                setPage(1)
              }}
              className="w-full pl-9 pr-8 py-1.5 bg-[#09090b] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-800 transition-colors"
              placeholder="Cari emiten atau kode..."
            />
            <Search className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-2.5" />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  setPage(1)
                }}
                className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sector select option */}
          <div className="relative min-w-[180px]">
            <select
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value)
                setPage(1)
              }}
              className="w-full pl-8 pr-8 py-1.5 bg-[#09090b] border border-zinc-900 rounded-lg text-zinc-300 text-xs focus:outline-none focus:border-zinc-800 transition-colors appearance-none cursor-pointer truncate"
            >
              <option value="">Semua Sektor</option>
              {sectors.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Sort dropdown option */}
          <div className="relative min-w-[180px]">
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value)
                setPage(1)
              }}
              className="w-full pl-8 pr-8 py-1.5 bg-[#09090b] border border-zinc-900 rounded-lg text-zinc-300 text-xs focus:outline-none focus:border-zinc-800 transition-colors appearance-none cursor-pointer truncate"
            >
              <option value="">Urutan Score (Default)</option>
              <option value="desc">Score Tertinggi (DESC)</option>
              <option value="asc">Score Terendah (ASC)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
              {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} aktif
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-zinc-500 hover:text-red-400 font-medium px-2 py-1 transition-colors rounded border border-transparent hover:border-red-950/20 hover:bg-red-950/10"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Scoring Table */}
      {scoresLoading ? (
        <div className="h-48 border border-zinc-900 bg-[#0c0c0e] rounded-xl flex items-center justify-center text-xs text-zinc-500 font-mono animate-pulse">
          Loading score registry...
        </div>
      ) : scoresError ? (
        <div className="h-48 border border-red-950/40 bg-red-950/10 rounded-xl flex items-center justify-center text-xs text-red-400 font-mono p-4 text-center">
          Failed to load scores: {scoresErrorData?.response?.data?.message || scoresErrorData.message}
        </div>
      ) : (
        <div className="bg-[#0c0c0e] border border-zinc-900 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#09090b] border-b border-zinc-900">
                <tr>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider w-[5%]">#</th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider w-[35%]">SAHAM</th>
                  <th className="px-4 py-4 text-center text-[11px] font-semibold text-[#5cb38d] uppercase tracking-wider w-[8%]">G</th>
                  <th className="px-4 py-4 text-center text-[11px] font-semibold text-[#5cb38d] uppercase tracking-wider w-[8%]">R</th>
                  <th className="px-4 py-4 text-center text-[11px] font-semibold text-[#5cb38d] uppercase tracking-wider w-[8%]">O</th>
                  <th className="px-4 py-4 text-center text-[11px] font-semibold text-[#5cb38d] uppercase tracking-wider w-[8%]">V</th>
                  <th className="px-4 py-4 text-center text-[11px] font-semibold text-[#5cb38d] uppercase tracking-wider w-[8%]">E</th>
                  <th className="px-5 py-4 text-center text-[11px] font-semibold text-zinc-200 uppercase tracking-wider w-[10%] select-none">
                    <button
                      type="button"
                      onClick={() => {
                        const nextSort = selectedSort === 'desc' ? 'asc' : selectedSort === 'asc' ? '' : 'desc'
                        setSelectedSort(nextSort)
                        setPage(1)
                      }}
                      className="inline-flex items-center gap-1 mx-auto hover:text-emerald-400 transition-colors focus:outline-none"
                    >
                      SCORE
                      <ArrowUpDown className={`w-3.5 h-3.5 transition-colors ${selectedSort ? 'text-emerald-400' : 'text-zinc-600'}`} />
                    </button>
                  </th>
                  <th className="px-5 py-4 text-center text-[11px] font-semibold text-zinc-500 uppercase tracking-wider w-[10%]">STANCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {listings.length > 0 ? (
                  listings.map((emiten, index) => {
                    const globalIndex = (page - 1) * pageSize + index + 1
                    return (
                      <tr key={emiten.symbol} className="hover:bg-[#09090b]/40 transition-colors group">
                        <td className="px-5 py-4 font-mono text-zinc-600 text-xs">{globalIndex}</td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                              {emiten.companyLogoUrl ? (
                                <img src={emiten.companyLogoUrl} alt={emiten.companyName} className="w-full h-full object-contain p-1" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 border border-zinc-800 text-emerald-400 select-none shadow-inner flex-shrink-0">
                                  {emiten.symbol.slice(0, 2)}
                                </div>
                              )}
                            </div>
                            <div className="truncate">
                              <span className="font-bold text-zinc-100 text-[13px] tracking-wide block truncate">{emiten.symbol}</span>
                              <span className="text-[10px] text-zinc-500 font-normal truncate block">
                                {emiten.companyName} <span className="text-zinc-600">/</span> {emiten.sector?.name || 'Unknown Sektor'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {['g', 'r', 'o', 'v', 'e'].map((key) => {
                          const val = emiten[key]
                          const displayVal = val === null || val === undefined ? '-' : val
                          return (
                            <td key={key} className="px-4 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => setSelectedBreakdown({
                                  companyName: emiten.companyName,
                                  symbol: emiten.symbol,
                                  companyLogoUrl: emiten.companyLogoUrl,
                                  metric: key.toUpperCase(),
                                  data: emiten.scoreBreakdown?.[key]
                                })}
                                className="group/score mx-auto flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-zinc-800/50 border border-transparent hover:border-zinc-800/80 transition-all duration-200 focus:outline-none"
                              >
                                <div className={`text-base font-bold tracking-tight transition-transform group-hover/score:scale-105 ${getScoreColor(val)}`}>
                                  {displayVal}
                                </div>
                                <div className="text-[9px] font-semibold text-zinc-600 group-hover/score:text-emerald-500/80 transition-colors uppercase mt-0.5">{key}</div>
                              </button>
                            </td>
                          )
                        })}

                        <td className="px-5 py-4 text-center">
                          <div className="inline-block relative">
                            <span className={`text-base font-black tracking-tight ${getScoreColor(emiten.score)}`}>
                              {emiten.score === null || emiten.score === undefined ? '-' : emiten.score}
                            </span>
                            <div className={`h-[2px] w-5 mx-auto mt-0.5 rounded-full ${emiten.score >= 80 ? 'bg-emerald-400' : emiten.score >= 65 ? 'bg-amber-400' : (emiten.score === null || emiten.score === undefined) ? 'bg-zinc-600' : 'bg-rose-400'
                              }`} />
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className={getStanceClass(emiten.stance)}>
                            {emiten.stance || '-'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-zinc-600 font-mono text-xs">
                      Tidak ada emiten yang cocok dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            itemsCount={listings.length}
            onPageChange={(targetPage) => setPage(targetPage)}
          />
        </div>
      )}

      {/* Formula cards modal detail */}
      {activeFormulaId && (
        <GroveFormulaDetail
          id={activeFormulaId}
          onClose={() => setActiveFormulaId(null)}
        />
      )}

      {/* Score breakdown detail modal */}
      {selectedBreakdown && (
        <GroveScoreBreakdownModal
          companyName={selectedBreakdown.companyName}
          symbol={selectedBreakdown.symbol}
          companyLogoUrl={selectedBreakdown.companyLogoUrl}
          metric={selectedBreakdown.metric}
          data={selectedBreakdown.data}
          onClose={() => setSelectedBreakdown(null)}
        />
      )}
    </div>
  )
}
