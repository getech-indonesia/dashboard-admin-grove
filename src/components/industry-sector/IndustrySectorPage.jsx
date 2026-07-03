import { useState, useEffect } from 'react'
import {
    FolderTree, Plus, Edit, Trash2, ChevronDown, ChevronRight, Tag, Loader2, Search, X, Folder, HelpCircle
} from 'lucide-react'
import { useFormStore } from '@/store/useFormStore'
import {
    useGetSectors,
    useCreateSector,
    useUpdateSector,
    useDeleteSector
} from '@/hooks/useSectors'
import {
    useGetIndustries,
    useCreateIndustry,
    useUpdateIndustry,
    useDeleteIndustry
} from '@/hooks/useIndustries'

export default function IndustrySectorPage() {
    const showToast = useFormStore((state) => state.showToast)

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedSectors, setExpandedSectors] = useState({})

    // Modal management states
    const [sectorModal, setSectorModal] = useState({
        isOpen: false,
        mode: 'create', // 'create' | 'edit'
        sector: null // { id, name }
    })

    const [industryModal, setIndustryModal] = useState({
        isOpen: false,
        mode: 'create', // 'create' | 'edit'
        industry: null, // { id, name, sectorId }
        preselectedSectorId: null
    })

    const [deleteConfirm, setDeleteConfirm] = useState({
        isOpen: false,
        type: 'sector', // 'sector' | 'industry'
        id: '',
        name: ''
    })

    // Fetch data using TanStack Query hooks (100 page size to get all records)
    const {
        data: sectorsData,
        isLoading: sectorsLoading,
        isError: sectorsError,
        error: sectorsErrDetails
    } = useGetSectors({ page: 1, pageSize: 100 })

    const {
        data: industriesData,
        isLoading: industriesLoading,
        isError: industriesError,
        error: industriesErrDetails
    } = useGetIndustries({ page: 1, pageSize: 100 })

    const sectors = Array.isArray(sectorsData) ? sectorsData : (sectorsData?.items || [])
    const industries = Array.isArray(industriesData) ? industriesData : (industriesData?.items || [])

    // Group industries by sectorId
    const industriesBySector = {}
    industries.forEach((ind) => {
        if (!industriesBySector[ind.sectorId]) {
            industriesBySector[ind.sectorId] = []
        }
        industriesBySector[ind.sectorId].push(ind)
    })

    // Auto-expand sectors when searching
    useEffect(() => {
        if (searchQuery.trim() !== '') {
            const newExpanded = {}
            sectors.forEach((sec) => {
                const sectorInds = industriesBySector[sec.id] || []
                const hasMatchingIndustry = sectorInds.some((ind) =>
                    ind.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                if (hasMatchingIndustry) {
                    newExpanded[sec.id] = true
                }
            })
            setExpandedSectors(newExpanded)
        }
    }, [searchQuery, sectorsData, industriesData])

    // Mutation hooks
    const createSectorMutation = useCreateSector()
    const updateSectorMutation = useUpdateSector()
    const deleteSectorMutation = useDeleteSector()

    const createIndustryMutation = useCreateIndustry()
    const updateIndustryMutation = useUpdateIndustry()
    const deleteIndustryMutation = useDeleteIndustry()

    // Form inputs state
    const [sectorFormName, setSectorFormName] = useState('')
    const [industryFormName, setIndustryFormName] = useState('')
    const [industryFormSectorId, setIndustryFormSectorId] = useState('')

    // Toggle expand/collapse
    const toggleSector = (sectorId) => {
        setExpandedSectors((prev) => ({
            ...prev,
            [sectorId]: !prev[sectorId]
        }))
    }

    // Modal Triggers
    const openAddSector = () => {
        setSectorFormName('')
        setSectorModal({ isOpen: true, mode: 'create', sector: null })
    }

    const openEditSector = (sector) => {
        setSectorFormName(sector.name)
        setSectorModal({ isOpen: true, mode: 'edit', sector })
    }

    const openAddIndustry = (sectorId = '') => {
        setIndustryFormName('')
        setIndustryFormSectorId(sectorId || (sectors[0]?.id || ''))
        setIndustryModal({
            isOpen: true,
            mode: 'create',
            industry: null,
            preselectedSectorId: sectorId
        })
    }

    const openEditIndustry = (industry) => {
        setIndustryFormName(industry.name)
        setIndustryFormSectorId(industry.sectorId)
        setIndustryModal({ isOpen: true, mode: 'edit', industry })
    }

    const openDeleteConfirm = (type, id, name) => {
        setDeleteConfirm({ isOpen: true, type, id, name })
    }

    // Handlers
    const handleSectorSubmit = async (e) => {
        e.preventDefault()
        if (!sectorFormName.trim()) {
            showToast('Sector name cannot be empty', 'error')
            return
        }

        try {
            if (sectorModal.mode === 'create') {
                await createSectorMutation.mutateAsync({ name: sectorFormName.trim() })
                showToast('Sector created successfully', 'success')
            } else {
                await updateSectorMutation.mutateAsync({
                    id: sectorModal.sector.id,
                    payload: { name: sectorFormName.trim() }
                })
                showToast('Sector updated successfully', 'success')
            }
            setSectorModal({ isOpen: false, mode: 'create', sector: null })
            setSectorFormName('')
        } catch (err) {
            showToast(err.response?.data?.message || 'Operation failed', 'error')
        }
    }

    const handleIndustrySubmit = async (e) => {
        e.preventDefault()
        if (!industryFormName.trim()) {
            showToast('Industry name cannot be empty', 'error')
            return
        }
        if (!industryFormSectorId) {
            showToast('Please select a parent sector', 'error')
            return
        }

        try {
            if (industryModal.mode === 'create') {
                await createIndustryMutation.mutateAsync({
                    name: industryFormName.trim(),
                    sectorId: industryFormSectorId
                })
                showToast('Industry created successfully', 'success')
            } else {
                await updateIndustryMutation.mutateAsync({
                    id: industryModal.industry.id,
                    payload: {
                        name: industryFormName.trim(),
                        sectorId: industryFormSectorId
                    }
                })
                showToast('Industry updated successfully', 'success')
            }
            setIndustryModal({ isOpen: false, mode: 'create', industry: null, preselectedSectorId: null })
            setIndustryFormName('')
        } catch (err) {
            showToast(err.response?.data?.message || 'Operation failed', 'error')
        }
    }

    const handleDeleteSubmit = async () => {
        try {
            if (deleteConfirm.type === 'sector') {
                await deleteSectorMutation.mutateAsync(deleteConfirm.id)
                showToast('Sector deleted successfully', 'success')
            } else {
                await deleteIndustryMutation.mutateAsync(deleteConfirm.id)
                showToast('Industry deleted successfully', 'success')
            }
            setDeleteConfirm({ isOpen: false, type: 'sector', id: '', name: '' })
        } catch (err) {
            showToast(err.response?.data?.message || 'Delete failed', 'error')
        }
    }

    // Filter logic
    const filteredSectors = sectors.filter((sec) => {
        const secMatches = sec.name.toLowerCase().includes(searchQuery.toLowerCase())
        const sectorInds = industriesBySector[sec.id] || []
        const indMatches = sectorInds.some((ind) =>
            ind.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        return secMatches || indMatches
    })

    const getFilteredIndustries = (sectorId) => {
        const sectorInds = industriesBySector[sectorId] || []
        if (!searchQuery.trim()) return sectorInds
        return sectorInds.filter((ind) =>
            ind.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sectors.find((s) => s.id === sectorId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }

    const isLoading = sectorsLoading || industriesLoading

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in text-sm text-zinc-300">
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-900 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2.5">
                        <FolderTree className="w-6 h-6 text-emerald-400" />
                        Industry & Sector
                    </h1>
                    <p className="text-zinc-500 text-xs mt-1.5 font-normal tracking-normal">
                        Configure institutional classification taxonomy, market sectors, and industry relationships.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={openAddSector}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-xs rounded-lg transition-all duration-150 shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        Add Sector
                    </button>
                    <button
                        onClick={() => openAddIndustry()}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 font-medium text-xs rounded-lg transition-all duration-150 shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5 stroke-[2]" />
                        Add Industry
                    </button>
                </div>
            </div>

            {/* FILTER SEARCH BAR */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Filter sectors or industries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-[#09090b] border border-zinc-900 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5 rounded"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* ERROR HANDLING */}
            {(sectorsError || industriesError) && (
                <div className="h-32 border border-red-950/40 bg-red-950/10 rounded-xl flex flex-col items-center justify-center text-xs text-red-400 font-mono p-4 text-center">
                    <span className="font-semibold mb-1">Failed to load classification database registries</span>
                    <span>{sectorsErrDetails?.response?.data?.message || industriesErrDetails?.response?.data?.message || 'Unknown network error occurred.'}</span>
                </div>
            )}

            {/* LOADING STATE */}
            {isLoading && (
                <div className="space-y-4">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-16 border border-zinc-900 bg-[#09090b] rounded-xl flex items-center justify-between px-6 animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-zinc-900 rounded" />
                                <div className="w-40 h-4 bg-zinc-900 rounded" />
                                <div className="w-16 h-3 bg-zinc-900 rounded-full" />
                            </div>
                            <div className="flex gap-2">
                                <div className="w-8 h-8 bg-zinc-900 rounded-lg" />
                                <div className="w-8 h-8 bg-zinc-900 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* SECTORS AND INDUSTRIES HIERARCHICAL TREE VIEW */}
            {!isLoading && !sectorsError && !industriesError && (
                <div className="space-y-4">
                    {filteredSectors.length > 0 ? (
                        filteredSectors.map((sector) => {
                            const isExpanded = !!expandedSectors[sector.id]
                            const sectorIndustries = getFilteredIndustries(sector.id)
                            const count = sectorIndustries.length

                            return (
                                <div
                                    key={sector.id}
                                    className="bg-[#0c0c0e]/30 border border-zinc-900 rounded-xl overflow-hidden shadow-sm transition-all duration-200"
                                >
                                    {/* Sector Row */}
                                    <div className="flex items-center justify-between p-4 hover:bg-[#0c0c0e]/60 transition-colors duration-100 group">
                                        <div
                                            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                                            onClick={() => toggleSector(sector.id)}
                                        >
                                            <button className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition-transform">
                                                {isExpanded ? (
                                                    <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </button>
                                            <Folder className="w-4 h-4 text-emerald-500/60" />
                                            <span className="font-semibold text-zinc-100 text-sm tracking-tight truncate">
                                                {sector.name}
                                            </span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-900 text-zinc-500 border border-zinc-800/80">
                                                {count} {count === 1 ? 'Industry' : 'Industries'}
                                            </span>
                                        </div>

                                        {/* Actions Controller */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity ml-4">
                                            <button
                                                onClick={() => openAddIndustry(sector.id)}
                                                className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors flex items-center gap-1 text-[11px]"
                                                title="Add Industry under this Sector"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span className="hidden md:inline">Industry</span>
                                            </button>
                                            <button
                                                onClick={() => openEditSector(sector)}
                                                className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                                                title="Edit Sector"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteConfirm('sector', sector.id, sector.name)}
                                                className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                                                title="Delete Sector"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Industry Nested List */}
                                    {isExpanded && (
                                        <div className="bg-[#09090b]/40 border-t border-zinc-900/60">
                                            {sectorIndustries.length > 0 ? (
                                                <div className="divide-y divide-zinc-900/50">
                                                    {sectorIndustries.map((ind) => (
                                                        <div
                                                            key={ind.id}
                                                            className="flex items-center justify-between py-3 pl-12 pr-6 hover:bg-[#0c0c0e]/30 transition-colors duration-100 group/industry"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <Tag className="w-3.5 h-3.5 text-zinc-600" />
                                                                <span className="text-zinc-300 text-[13px] font-medium truncate">
                                                                    {ind.name}
                                                                </span>
                                                                <span className="text-[10px] text-zinc-600 font-mono hidden md:inline truncate select-all">
                                                                    ID: {ind.id}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-1 opacity-0 group-hover/industry:opacity-100 focus-within:opacity-100 transition-opacity ml-4">
                                                                <button
                                                                    onClick={() => openEditIndustry(ind)}
                                                                    className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                                                                    title="Edit Industry"
                                                                >
                                                                    <Edit className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => openDeleteConfirm('industry', ind.id, ind.name)}
                                                                    className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                                                                    title="Delete Industry"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-4 pl-12 pr-6 text-zinc-600 font-mono text-xs italic">
                                                    No industries registered under this classification segment.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    ) : (
                        <div className="border border-zinc-900 bg-[#09090b] rounded-xl py-12 text-center text-zinc-600 font-mono text-xs">
                            No classification registries found matching this query parameters.
                        </div>
                    )}
                </div>
            )}

            {/* SECTOR MODAL (CREATE/EDIT) */}
            {sectorModal.isOpen && (
                <div className="fixed inset-0 -top-[2rem] bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900">
                            <h3 className="font-bold text-zinc-100 text-sm">
                                {sectorModal.mode === 'create' ? 'Create New Sector' : 'Modify Sector Name'}
                            </h3>
                            <button
                                onClick={() => setSectorModal({ isOpen: false, mode: 'create', sector: null })}
                                className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md hover:bg-zinc-900 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSectorSubmit}>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400">
                                        Sector Name <span className="text-emerald-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Technology, Healthcare"
                                        value={sectorFormName}
                                        onChange={(e) => setSectorFormName(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-zinc-950/40 border-t border-zinc-900 flex justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setSectorModal({ isOpen: false, mode: 'create', sector: null })}
                                    className="px-4 py-2 border border-zinc-850 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createSectorMutation.isPending || updateSectorMutation.isPending}
                                    className="px-4 py-2 bg-[#f4f4f5] hover:bg-[#e4e4e7] text-zinc-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {(createSectorMutation.isPending || updateSectorMutation.isPending) && (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    )}
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* INDUSTRY MODAL (CREATE/EDIT) */}
            {industryModal.isOpen && (
                <div className="fixed inset-0 -top-[2rem] bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900">
                            <h3 className="font-bold text-zinc-100 text-sm">
                                {industryModal.mode === 'create' ? 'Create New Industry' : 'Modify Industry Details'}
                            </h3>
                            <button
                                onClick={() => setIndustryModal({ isOpen: false, mode: 'create', industry: null, preselectedSectorId: null })}
                                className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md hover:bg-zinc-900 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleIndustrySubmit}>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400">
                                        Parent Sector <span className="text-emerald-500">*</span>
                                    </label>
                                    <select
                                        value={industryFormSectorId}
                                        onChange={(e) => setIndustryFormSectorId(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition-all cursor-pointer"
                                    >
                                        <option value="" disabled>Select parent sector</option>
                                        {sectors.map((sec) => (
                                            <option key={sec.id} value={sec.id}>
                                                {sec.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400">
                                        Industry Name <span className="text-emerald-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Software—Infrastructure, Banks—Regional"
                                        value={industryFormName}
                                        onChange={(e) => setIndustryFormName(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-zinc-950/40 border-t border-zinc-900 flex justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIndustryModal({ isOpen: false, mode: 'create', industry: null, preselectedSectorId: null })}
                                    className="px-4 py-2 border border-zinc-850 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createIndustryMutation.isPending || updateIndustryMutation.isPending}
                                    className="px-4 py-2 bg-[#f4f4f5] hover:bg-[#e4e4e7] text-zinc-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {(createIndustryMutation.isPending || updateIndustryMutation.isPending) && (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    )}
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRM MODAL */}
            {deleteConfirm.isOpen && (
                <div className="fixed inset-0 -top-[2rem] bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900">
                            <h3 className="font-bold text-red-400 text-sm flex items-center gap-2">
                                <Trash2 className="w-4 h-4 text-red-500" />
                                Delete Confirmation
                            </h3>
                            <button
                                onClick={() => setDeleteConfirm({ isOpen: false, type: 'sector', id: '', name: '' })}
                                className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md hover:bg-zinc-900 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-3">
                            <p className="text-xs text-zinc-300 leading-relaxed">
                                Are you sure you want to permanently delete the {deleteConfirm.type} <strong className="text-zinc-100">"{deleteConfirm.name}"</strong>?
                            </p>
                            <div className="p-3 bg-red-950/10 border border-red-950/30 rounded-lg flex items-start gap-3">
                                <HelpCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="text-[11px] text-red-400 leading-normal font-sans">
                                    {deleteConfirm.type === 'sector' ? (
                                        <span>This sector cannot be deleted if there are any associated industries under it.</span>
                                    ) : (
                                        <span>This industry cannot be deleted if there are any companies categorized under it.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-zinc-950/40 border-t border-zinc-900 flex justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setDeleteConfirm({ isOpen: false, type: 'sector', id: '', name: '' })}
                                className="px-4 py-2 border border-zinc-850 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteSubmit}
                                disabled={deleteSectorMutation.isPending || deleteIndustryMutation.isPending}
                                className="px-4 py-2 bg-red-650 hover:bg-red-650/90 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {(deleteSectorMutation.isPending || deleteIndustryMutation.isPending) && (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                )}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
