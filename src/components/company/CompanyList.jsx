import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Eye, Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useGetCompanies } from '@/hooks/useCompanies'
import { useGetSectors } from '@/hooks/useSectors'
import Pagination from '@/components/dashboard/Pagination'
import TableFilters from '@/components/dashboard/TableFilters'

export default function CompanyList() {
  const navigate = useNavigate()

  // State untuk mengontrol halaman aktif saat ini
  const [page, setPage] = useState(1)
  const pageSize = 20 // Sesuai dengan spesifikasi API default Anda

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

  // Panggil data langsung menggunakan TanStack Query Hook
  const { data, isLoading, isError, error } = useGetCompanies(page, pageSize, debouncedKeyword, selectedSector)

  // Ekstrak properti response API secara aman
  const companies = data?.items || []
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

      {/* HEADER SECTION */}
      <div className="flex items-end justify-between border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Companies
          </h1>
          <p className="text-zinc-500 text-xs mt-1.5 font-normal tracking-normal">
            Manage and monitor all internal company master data information.
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard/companies/create')}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-xs rounded-lg transition-all duration-150 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Add Company
        </button>
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

      {/* CONDITION HANDLING: LOADING & ERROR */}
      {isLoading && (
        <div className="h-48 border border-zinc-900 bg-[#09090b] rounded-xl flex items-center justify-center text-xs text-zinc-500 font-mono animate-pulse">
          Loading synchronized financial institutions...
        </div>
      )}

      {isError && (
        <div className="h-48 border border-red-950/40 bg-red-950/10 rounded-xl flex items-center justify-center text-xs text-red-400 font-mono p-4 text-center">
          Failed to load database registries: {error?.response?.data?.message || error.message}
        </div>
      )}

      {/* TABLE GRID VIEW */}
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
                    <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-[30%]!">
                      Listings
                    </th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                      Founded
                    </th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                      CEO
                    </th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                      Website
                    </th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-[100px]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-900">
                  {companies.length > 0 ? (
                    companies.map((company) => (
                      <tr
                        key={company.id}
                        className="hover:bg-[#0c0c0e]/60 transition-colors duration-100 group"
                      >
                        {/* Avatar Logo & Identitas */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {company.logoUrl ? (
                                <img src={company.logoUrl} alt={company.displayName} className="w-full h-full object-contain p-1" />
                              ) : (
                                <Building2 className="w-4 h-4 text-zinc-500" />
                              )}
                            </div>
                            <div className="truncate">
                              <div className="font-medium text-zinc-200 text-[13px] tracking-normal truncate">
                                {company.displayName}
                              </div>
                              <div className="text-[11px] text-zinc-500 font-mono mt-0.5 truncate">
                                {company.legalName}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Associated Ticker Listings Badges */}
                        <td className="px-5 py-4">
                          {company.listings && company.listings.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {company.listings.map((l) => (
                                <span
                                  key={l.id}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/dashboard/listings/${l.id}/detail`)
                                  }}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-emerald-500/30 hover:text-emerald-400 cursor-pointer transition-colors"
                                  title={`View detail for ${l.symbol}`}
                                >
                                  {l.symbol}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-zinc-650 text-[11px] font-mono italic">No listings</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider border ${company.status === 'ACTIVE'
                            ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10'
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                            }`}>
                            ● {company.status}
                          </span>
                        </td>

                        {/* Founded Year */}
                        <td className="px-5 py-4 text-zinc-400 text-[13px] font-mono">
                          {company.foundedYear || '—'}
                        </td>

                        {/* CEO Name */}
                        <td className="px-5 py-4 text-zinc-300 text-[13px]">
                          {company.ceo || '—'}
                        </td>

                        {/* Website Link */}
                        <td className="px-5 py-4 text-zinc-500 text-xs truncate max-w-[200px] font-mono">
                          {company.website ? (
                            <a href={company.website} target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition-colors underline decoration-zinc-800 underline-offset-2">
                              {company.website.replace('https://', '')}
                            </a>
                          ) : '—'}
                        </td>

                        {/* Actions Controller */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => navigate(`/dashboard/companies/${company.id}/detail`)}
                              className="p-1.5 rounded-md text-zinc-500 hover:text-emerald-400 hover:bg-zinc-900 transition-colors"
                              title="View Detail"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => navigate(`/dashboard/companies/${company.id}/edit`)}
                              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                              title="Edit Company"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-zinc-600 font-mono text-xs">
                        No corporate data available in this index segment.
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </div>

          {/* COMPACT FINTECH PAGINATION BAR */}
          {!isLoading && !isError && (
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              itemsCount={companies.length}
              onPageChange={(targetPage) => setPage(targetPage)}
            />
          )}
        </div>
      )}

    </div>
  )
}