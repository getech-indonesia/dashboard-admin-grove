import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Wallet, Eye } from 'lucide-react'
import { useGetBalanceSheets } from '@/hooks/useBalanceSheets'
import { useGetSectors } from '@/hooks/useSectors'
import TableFilters from '@/components/dashboard/TableFilters'
import Pagination from '@/components/dashboard/Pagination'
import { formatCurrency } from '@/utils/formatters'
import BalanceSheetDetail from './BalanceSheetDetail'

export default function BalanceSheetList() {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const pageSize = 20

  const [searchInput, setSearchInput] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')

  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [selectedSector, setSelectedSector] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchInput)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchInput])

  const [activeDetailId, setActiveDetailId] = useState(null)

  const { data: sectorsData } = useGetSectors()
  const sectors = sectorsData || []

  const { data, isLoading, isError, error } = useGetBalanceSheets(
    page,
    pageSize,
    debouncedKeyword,
    selectedPeriod,
    selectedSector
  )

  const sampleSheets = data?.items || []
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 }

  const activeFiltersCount = [
    debouncedKeyword !== '',
    selectedPeriod !== '',
    selectedSector !== ''
  ].filter(Boolean).length

  const handleResetFilters = () => {
    setSearchInput('')
    setDebouncedKeyword('')
    setSelectedPeriod('')
    setSelectedSector('')
    setPage(1)
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in text-sm text-zinc-300">

      <div className="flex items-end justify-between border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Balance Sheets
          </h1>
          <p className="text-zinc-500 text-xs mt-1.5 font-normal tracking-normal">
            Track institutional solvency, asset structures, long-term liabilities, and shareholder equity maps.
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard/balance-sheets/create')}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-xs rounded-lg transition-all duration-150 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Add Balance Sheet
        </button>
      </div>

      <TableFilters
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        selectedSector={selectedSector}
        setSelectedSector={setSelectedSector}
        sectors={sectors}
        setPage={setPage}
        handleResetFilters={handleResetFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {isLoading && (
        <div className="h-48 border border-zinc-900 bg-[#09090b] rounded-xl flex items-center justify-center text-xs text-zinc-500 font-mono animate-pulse">
          Loading synchronized assets balance spreadsheets...
        </div>
      )}

      {isError && (
        <div className="h-48 border border-red-950/40 bg-red-950/10 rounded-xl flex items-center justify-center text-xs text-red-400 font-mono p-4 text-center">
          Failed to load solvency database registries: {error?.response?.data?.message || error.message}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-4">
          <div className="bg-[#09090b] border border-zinc-900 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">

                <thead className="bg-[#0c0c0e] border-b border-zinc-900">
                  <tr>
                    <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-[25%]">
                      Company
                    </th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                      Reporting Period
                    </th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                      Period End Date
                    </th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                      Total Assets
                    </th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                      Total Liabilities
                    </th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                      Total Equity
                    </th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-[120px]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-900">
                  {sampleSheets.length > 0 ? (
                    sampleSheets.map((sheet) => (
                      <tr
                        key={sheet.id}
                        className="hover:bg-[#0c0c0e]/60 transition-colors duration-100 group"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 group-hover:text-emerald-400 group-hover:border-zinc-700/50 transition-colors overflow-hidden flex-shrink-0">
                              {sheet.company?.logoUrl ? (
                                <img src={sheet.company.logoUrl} alt={sheet.company.displayName} className="w-full h-full object-contain p-1" />
                              ) : (
                                <Wallet className="w-4 h-4" />
                              )}
                            </div>
                            <div className="truncate">
                              <span className="font-medium text-zinc-200 text-[13px] block truncate">
                                {sheet.company?.displayName || 'Unknown Entity'}
                              </span>
                              <span className="text-[11px] text-zinc-500 font-mono mt-0.5 block truncate">
                                {sheet.company?.legalName || '—'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-300 text-[13px] font-medium">
                              FY {sheet.fiscalYear}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-zinc-400 tracking-wider">
                              {sheet.period}
                            </span>
                            {sheet.fiscalQuarter && (
                              <span className="text-[11px] text-zinc-500 font-mono">
                                Q{sheet.fiscalQuarter}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-zinc-500 font-mono text-xs">
                          {sheet.periodEndDate ? sheet.periodEndDate.split('T')[0] : '—'}
                        </td>

                        <td className="px-5 py-4 text-right text-zinc-300 font-mono text-[13px]">
                          {formatCurrency(sheet.totalAssets, sheet.currency)}
                        </td>

                        <td className="px-5 py-4 text-right text-zinc-400 font-mono text-[13px]">
                          {formatCurrency(sheet.totalLiabilities, sheet.currency)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <span className="text-emerald-400 font-mono text-[13px] font-medium">
                            {formatCurrency(sheet.totalEquity, sheet.currency)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setActiveDetailId(sheet.id)}
                              className="p-1.5 rounded-md text-zinc-500 hover:text-emerald-400 hover:bg-zinc-900 transition-colors"
                              title="View Full Solvency Data"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => navigate(`/dashboard/balance-sheets/${sheet.id}/edit`)}
                              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                              title="Edit Balance Sheet"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                              title="Delete Balance Sheet"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-zinc-600 font-mono text-xs">
                        No solvency asset balance structures found in server records.
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </div>

          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            itemsCount={sampleSheets.length}
            onPageChange={(targetPage) => setPage(targetPage)}
          />
        </div>
      )}

      {activeDetailId && (
        <BalanceSheetDetail
          id={activeDetailId}
          onClose={() => setActiveDetailId(null)}
        />
      )}

    </div>
  )
}