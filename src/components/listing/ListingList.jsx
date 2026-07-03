import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, BarChart3, Eye, RefreshCw, Loader2 } from 'lucide-react'
import { useGetListings, useDeleteListing } from '@/hooks/useListings'
import { useGetSectors } from '@/hooks/useSectors'
import { useSyncIncomeStatementsBySector } from '@/hooks/useIncomeStatements'
import { useSyncBalanceSheetsBySector } from '@/hooks/useBalanceSheets'
import TableFilters from '@/components/dashboard/TableFilters'
import Pagination from '@/components/dashboard/Pagination'
import ActionMenu from '@/components/ui/ActionMenu'
import { useFormStore } from '@/store/useFormStore'

export default function ListingList() {
  const navigate = useNavigate()
  const showToast = useFormStore((state) => state.showToast)
  const deleteListingMutation = useDeleteListing()

  const handleDeleteListing = (id, symbol) => {
    if (window.confirm(`Are you sure you want to delete listing for "${symbol}"?`)) {
      deleteListingMutation.mutate(id, {
        onSuccess: () => {
          showToast(`Listing ${symbol} deleted successfully`, 'success')
        },
        onError: (err) => {
          showToast(err.response?.data?.message || `Failed to delete listing ${symbol}`, 'error')
        }
      })
    }
  }

  const [page, setPage] = useState(1)
  const pageSize = 20

  const [searchInput, setSearchInput] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')

  const [selectedSector, setSelectedSector] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchInput)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchInput])

  const { data: sectorsData } = useGetSectors()
  const sectors = sectorsData || []

  const { data, isLoading, isError, error, refetch } = useGetListings(
    page,
    pageSize,
    debouncedKeyword,
    selectedSector
  )

  const syncIncomeStatementMutation = useSyncIncomeStatementsBySector()
  const syncBalanceSheetMutation = useSyncBalanceSheetsBySector()

  const handleSyncIncomeStatements = () => {
    syncIncomeStatementMutation.mutate(selectedSector, {
      onSuccess: async () => {
        await refetch()
        showToast('Income statements synchronized successfully for selected sector', 'success')
      },
      onError: (err) => {
        showToast(err.response?.data?.message || 'Failed to sync income statements', 'error')
      }
    })
  }

  const handleSyncBalanceSheets = () => {
    syncBalanceSheetMutation.mutate(selectedSector, {
      onSuccess: async () => {
        await refetch()
        showToast('Balance sheets synchronized successfully for selected sector', 'success')
      },
      onError: (err) => {
        showToast(err.response?.data?.message || 'Failed to sync balance sheets', 'error')
      }
    })
  }

  const listings = data?.items || []
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 }

  const activeFiltersCount = [
    debouncedKeyword !== '',
    selectedSector !== ''
  ].filter(Boolean).length

  const handleResetFilters = () => {
    setSearchInput('')
    setDebouncedKeyword('')
    setSelectedSector('')
    setPage(1)
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in text-sm text-zinc-300">

      <div className="flex items-end justify-between border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Listings</h1>
          <p className="text-zinc-500 text-xs mt-1.5">Manage public exchange tickers and security codes.</p>
        </div>
        <div className="flex items-center gap-2">
          <ActionMenu
            label="Sync Financials"
            disabled={!selectedSector}
            items={[
              {
                label: 'Sync Income Statement',
                description: 'Refresh sector-wide income statement data.',
                pendingLabel: 'Syncing income statements...',
                isPending: syncIncomeStatementMutation.isPending,
                icon: <RefreshCw className="h-3.5 w-3.5" />,
                onClick: handleSyncIncomeStatements,
              },
              {
                label: 'Sync Balance Sheet',
                description: 'Refresh sector-wide balance sheet data.',
                pendingLabel: 'Syncing balance sheets...',
                isPending: syncBalanceSheetMutation.isPending,
                icon: <RefreshCw className="h-3.5 w-3.5" />,
                onClick: handleSyncBalanceSheets,
              },
            ]}
          />
          <button
            onClick={() => navigate('/dashboard/listings/create')}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-xs rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Add Listing
          </button>
        </div>
      </div>

      <TableFilters
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        selectedSector={selectedSector}
        setSelectedSector={setSelectedSector}
        sectors={sectors}
        setPage={setPage}
        handleResetFilters={handleResetFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {isLoading && (
        <div className="h-48 border border-zinc-900 bg-[#09090b] rounded-xl flex items-center justify-center text-xs text-zinc-500 font-mono animate-pulse">
          Loading market registry...
        </div>
      )}

      {isError && (
        <div className="h-48 border border-red-950/40 bg-red-950/10 rounded-xl flex items-center justify-center text-xs text-red-400 font-mono p-4 text-center">
          Failed to load: {error?.response?.data?.message || error.message}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="bg-[#09090b] border border-zinc-900 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#0c0c0e] border-b border-zinc-900">
                <tr>
                  <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-[20%]">Symbol</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-[25%]">Company</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Exchange</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Identifiers</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {listings.length > 0 ? (
                  listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-[#0c0c0e]/60 transition-colors group">
                      {/* Symbol & Asset Type */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-zinc-100 text-[14px] font-mono tracking-wider">{listing.symbol}</span>
                          <span className="inline-flex items-center w-max px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-900 text-zinc-500 border border-zinc-800 tracking-wider uppercase">
                            {listing.assetType}
                          </span>
                        </div>
                      </td>

                      {/* Connected Company Display */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="size-6 bg-zinc-900 border border-zinc-800 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                            {listing.company?.logoUrl ? (
                              <img src={listing.company.logoUrl} alt={listing.company.displayName} className="w-full h-full object-contain p-0.5" />
                            ) : (
                              <BarChart3 className="w-3.5 h-3.5 text-zinc-500" />
                            )}
                          </div>
                          <span className="font-medium text-zinc-300 text-[13px] truncate max-w-[180px]">{listing.company?.displayName || '—'}</span>
                        </div>
                      </td>

                      {/* Exchange Code */}
                      <td className="px-5 py-4 text-zinc-400 text-[13px]">
                        <span className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-[11px] font-medium text-zinc-300">
                          {listing.exchange?.name || listing.exchange?.code || '—'}
                        </span>
                      </td>

                      {/* Identifiers: ISIN / CUSIP */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5 text-[10.5px] font-mono text-zinc-500">
                          <div><span className="text-zinc-600">ISIN:</span> {listing.isin || '—'}</div>
                          <div><span className="text-zinc-600">CUSIP:</span> {listing.cusip || '—'}</div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/dashboard/listings/${listing.id}/detail`)}
                            className="p-1.5 rounded-md text-zinc-500 hover:text-emerald-400 hover:bg-zinc-900 transition-colors"
                            title="View Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => navigate(`/dashboard/listings/${listing.id}/edit`)}
                            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                            title="Edit Listing"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteListing(listing.id, listing.symbol)}
                            disabled={deleteListingMutation.isPending}
                            className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors disabled:opacity-40"
                            title="Delete Listing"
                          >
                            {deleteListingMutation.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-zinc-600 font-mono text-xs">No listings found.</td></tr>
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
    </div>
  )
}
