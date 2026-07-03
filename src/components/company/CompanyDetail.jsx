import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, Plus, Edit, Trash2, Globe, Calendar, Users, MapPin, Layers, DollarSign, Percent, PlusCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useGetCompanyDetail } from '@/hooks/useCompanies'
import {
    useGetCompanyShareholdings,
    useCreateShareholding,
    useUpdateShareholding,
    useDeleteShareholding
} from '@/hooks/useShareholdings'
import { useFormStore } from '@/store/useFormStore'

export default function CompanyDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const showToast = useFormStore((state) => state.showToast)

    // Modal Control State
    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
    const [selectedShareholdingId, setSelectedShareholdingId] = useState(null)

    // Form Local State
    const [form, setForm] = useState({
        shareholderName: '',
        shareholderType: 'PUBLIC',
        sharesHeld: '',
        percentageOwned: '',
        currency: 'IDR',
        date: new Date().toISOString().split('T')[0],
        managementId: ''
    })

    // Fetch Details & Shareholdings
    const { data: company, isLoading: companyLoading, isError: companyError } = useGetCompanyDetail(id)
    const { data: shareholdings = [], isLoading: shareholdingsLoading, refetch: refetchShareholdings } = useGetCompanyShareholdings(id)

    // Mutation Hooks
    const createShareholdingMutation = useCreateShareholding()
    const updateShareholdingMutation = useUpdateShareholding(selectedShareholdingId)
    const deleteShareholdingMutation = useDeleteShareholding(id)

    if (companyLoading) {
        return (
            <div className="h-64 border border-zinc-900 bg-[#09090b] rounded-xl flex flex-col items-center justify-center gap-3 text-xs text-zinc-500 font-mono animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                <span>Loading corporate registry profile...</span>
            </div>
        )
    }

    if (companyError || !company) {
        return (
            <div className="h-64 border border-red-950/40 bg-red-950/10 rounded-xl flex items-center justify-center text-xs text-red-400 font-mono p-4 text-center">
                Failed to load corporate profile directory. Please verify that this company ID is valid.
            </div>
        )
    }

    // Modal helpers
    const openCreateModal = () => {
        setForm({
            shareholderName: '',
            shareholderType: 'PUBLIC',
            sharesHeld: '',
            percentageOwned: '',
            currency: 'IDR',
            date: new Date().toISOString().split('T')[0],
            managementId: ''
        })
        setModalMode('create')
        setSelectedShareholdingId(null)
        setModalOpen(true)
    }

    const openEditModal = (sh) => {
        setForm({
            shareholderName: sh.shareholderName,
            shareholderType: sh.shareholderType,
            sharesHeld: sh.sharesHeld,
            percentageOwned: sh.percentageOwned,
            currency: sh.currency,
            date: sh.date ? sh.date.split('T')[0] : new Date().toISOString().split('T')[0],
            managementId: sh.managementId || ''
        })
        setModalMode('edit')
        setSelectedShareholdingId(sh.id)
        setModalOpen(true)
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()

        const payload = {
            companyId: id,
            shareholderName: form.shareholderName.trim(),
            shareholderType: form.shareholderType,
            sharesHeld: form.sharesHeld.toString(),
            percentageOwned: form.percentageOwned.toString(),
            currency: form.currency.trim(),
            date: new Date(form.date).toISOString(),
            managementId: form.managementId.trim() || undefined
        }

        try {
            if (modalMode === 'create') {
                await createShareholdingMutation.mutateAsync(payload)
                showToast('Shareholder registered successfully', 'success')
            } else {
                await updateShareholdingMutation.mutateAsync(payload)
                showToast('Shareholder profile updated successfully', 'success')
            }
            setModalOpen(false)
            refetchShareholdings()
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to submit shareholder data', 'error')
        }
    }

    const handleDeleteShareholder = async (shId, name) => {
        if (window.confirm(`Are you sure you want to remove shareholder "${name}"?`)) {
            try {
                await deleteShareholdingMutation.mutateAsync(shId)
                showToast('Shareholder record removed successfully', 'success')
                refetchShareholdings()
            } catch (err) {
                showToast(err.response?.data?.message || 'Failed to delete shareholder', 'error')
            }
        }
    }

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in text-sm text-zinc-300">
            {/* BACK BAR & TITLE */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/companies-listings?tab=companies')}
                    className="p-1.5 rounded-lg border border-zinc-900 hover:border-zinc-800 bg-[#09090b] hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-zinc-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <div className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase font-mono">Corporate Detail Profile</div>
                    <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2 mt-0.5">
                        {company.displayName}
                    </h1>
                </div>
            </div>

            {/* TWO COLUMN SUMMARY & DETAILS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* COMPANY PROFILE CARD */}
                <div className="lg:col-span-2 bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                            {company.logoUrl ? (
                                <img src={company.logoUrl} alt={company.displayName} className="w-full h-full object-contain p-2" />
                            ) : (
                                <Building2 className="w-8 h-8 text-zinc-650" />
                            )}
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-lg font-bold text-zinc-100">{company.displayName}</h2>
                            <p className="text-xs text-zinc-500 font-mono">{company.legalName}</p>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border mt-2 ${
                                company.status === 'ACTIVE'
                                    ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
                                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                            }`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {company.status}
                            </span>
                        </div>
                    </div>

                    <div className="border-t border-zinc-900/60 pt-5">
                        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">Corporate Description</h3>
                        <p className="text-zinc-400 text-xs leading-relaxed font-normal">
                            {company.description || 'No formal description has been indexed for this emiten registry segment.'}
                        </p>
                    </div>

                    {/* METADATA LIST */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-900/60 pt-5">
                        <div className="flex items-center gap-3 text-xs">
                            <Users className="w-4 h-4 text-zinc-600" />
                            <div>
                                <span className="text-zinc-500 block">CEO Executive</span>
                                <span className="text-zinc-300 font-medium">{company.ceo || '—'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                            <Calendar className="w-4 h-4 text-zinc-600" />
                            <div>
                                <span className="text-zinc-500 block">Founded In</span>
                                <span className="text-zinc-300 font-mono font-medium">{company.foundedYear || '—'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                            <MapPin className="w-4 h-4 text-zinc-600" />
                            <div>
                                <span className="text-zinc-500 block">Headquarters</span>
                                <span className="text-zinc-300 font-medium">{company.headquarters || '—'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                            <Globe className="w-4 h-4 text-zinc-600" />
                            <div>
                                <span className="text-zinc-500 block">Official Website</span>
                                {company.website ? (
                                    <a href={company.website} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-mono">
                                        {company.website.replace('https://', '')}
                                    </a>
                                ) : (
                                    <span className="text-zinc-400">—</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RELATIONS / SECTOR CARD */}
                <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-6 shadow-sm">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-900/60 pb-3">Classification & Tickers</h3>

                    <div className="space-y-4">
                        <div className="space-y-1 text-xs">
                            <span className="text-zinc-500 block">Sector Classification</span>
                            <span className="text-zinc-300 font-semibold">{company.industry?.sector?.name || '—'}</span>
                        </div>

                        <div className="space-y-1 text-xs">
                            <span className="text-zinc-500 block">Industry Node</span>
                            <span className="text-zinc-300 font-medium">{company.industry?.name || '—'}</span>
                        </div>

                        <div className="space-y-1.5 text-xs">
                            <span className="text-zinc-500 block">Exchange Tickers</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {company.listings && company.listings.length > 0 ? (
                                    company.listings.map((l) => (
                                        <div
                                            key={l.id}
                                            onClick={() => navigate(`/dashboard/listings/${l.id}/detail`)}
                                            className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 flex items-center gap-1.5 cursor-pointer transition-all font-mono"
                                            title="View stock ticker detail"
                                        >
                                            <span className="font-bold text-emerald-400">{l.symbol}</span>
                                            <span className="text-[9px] text-zinc-500 uppercase">({l.exchange?.name || l.exchange?.code})</span>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-zinc-600 italic font-mono">No public exchange tickers bound</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SHAREHOLDERS LISTING SECTION */}
            <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                    <div>
                        <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-emerald-400" />
                            Shareholdings & Cap Table
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1">Manage stakeholder ownership profiles and corporate capitalisation tables.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-lg transition-all"
                    >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        Add Shareholder
                    </button>
                </div>

                {shareholdingsLoading ? (
                    <div className="h-32 flex items-center justify-center text-xs text-zinc-500 font-mono animate-pulse">
                        Fetching shareholder listings...
                    </div>
                ) : shareholdings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-900 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                                    <th className="text-left py-3.5 px-2">Shareholder Name</th>
                                    <th className="text-left py-3.5 px-2">Type</th>
                                    <th className="text-right py-3.5 px-2">Shares Held</th>
                                    <th className="text-right py-3.5 px-2">Percentage</th>
                                    <th className="text-left py-3.5 px-2 pl-6">Currency</th>
                                    <th className="text-left py-3.5 px-2">Date Report</th>
                                    <th className="text-right py-3.5 px-2 w-[100px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900/60">
                                {shareholdings.map((sh) => (
                                    <tr key={sh.id} className="hover:bg-[#0c0c0e]/30 transition-colors group">
                                        <td className="py-3 px-2 font-medium text-zinc-200 text-[13px]">{sh.shareholderName}</td>
                                        <td className="py-3 px-2">
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 tracking-wider">
                                                {sh.shareholderType}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-right font-mono text-zinc-300 text-[13px]">
                                            {Number(sh.sharesHeld).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-2 text-right">
                                            <div className="inline-flex items-center gap-1 font-mono text-emerald-400 text-[13px]">
                                                {parseFloat(sh.percentageOwned).toFixed(2)}%
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 pl-6 font-mono text-zinc-500 text-xs">{sh.currency}</td>
                                        <td className="py-3 px-2 font-mono text-zinc-400 text-xs">
                                            {sh.date ? sh.date.split('T')[0] : '—'}
                                        </td>
                                        <td className="py-3 px-2 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(sh)}
                                                    className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                                                    title="Edit Record"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteShareholder(sh.id, sh.shareholderName)}
                                                    className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 border border-dashed border-zinc-900 rounded-xl text-center text-zinc-550 font-mono text-xs">
                        No shareholder records currently indexed for this emiten registry.
                    </div>
                )}
            </div>

            {/* CREATE / EDIT MODAL SCREEN */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
                    <div className="w-full max-w-lg bg-[#09090b] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="px-5 py-4 border-b border-zinc-900 bg-[#0c0c0e] flex items-center justify-between">
                            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                                <PlusCircle className="w-4 h-4 text-emerald-400" />
                                {modalMode === 'create' ? 'Register New Shareholding' : 'Update Shareholder Record'}
                            </h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-5 space-y-4 text-xs">
                            {/* Shareholder Name */}
                            <div className="space-y-1.5">
                                <label className="text-zinc-400 font-medium">Shareholder / Entity Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.shareholderName}
                                    onChange={(e) => setForm(prev => ({ ...prev, shareholderName: e.target.value }))}
                                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                                    placeholder="e.g., Vanguard Group, Inc."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Shareholder Type */}
                                <div className="space-y-1.5">
                                    <label className="text-zinc-400 font-medium">Shareholder Type *</label>
                                    <select
                                        value={form.shareholderType}
                                        onChange={(e) => setForm(prev => ({ ...prev, shareholderType: e.target.value }))}
                                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                                    >
                                        <option value="PROMOTER">PROMOTER</option>
                                        <option value="INSTITUTIONAL">INSTITUTIONAL</option>
                                        <option value="INSIDER">INSIDER</option>
                                        <option value="GOVERNMENT">GOVERNMENT</option>
                                        <option value="FOREIGN">FOREIGN</option>
                                        <option value="PUBLIC">PUBLIC</option>
                                    </select>
                                </div>

                                {/* Currency */}
                                <div className="space-y-1.5">
                                    <label className="text-zinc-400 font-medium">Currency *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.currency}
                                        onChange={(e) => setForm(prev => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 font-mono focus:outline-none focus:border-zinc-700 transition-colors"
                                        placeholder="e.g., IDR"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Shares Held */}
                                <div className="space-y-1.5">
                                    <label className="text-zinc-400 font-medium flex items-center gap-1">
                                        <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                                        Shares Held Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={1}
                                        value={form.sharesHeld}
                                        onChange={(e) => setForm(prev => ({ ...prev, sharesHeld: e.target.value }))}
                                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 font-mono focus:outline-none focus:border-zinc-700 transition-colors"
                                        placeholder="e.g., 5000000"
                                    />
                                </div>

                                {/* Percentage Owned */}
                                <div className="space-y-1.5">
                                    <label className="text-zinc-400 font-medium flex items-center gap-1">
                                        <Percent className="w-3.5 h-3.5 text-zinc-500" />
                                        Percentage Owned (%) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        step="0.0001"
                                        min={0}
                                        max={100}
                                        value={form.percentageOwned}
                                        onChange={(e) => setForm(prev => ({ ...prev, percentageOwned: e.target.value }))}
                                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 font-mono focus:outline-none focus:border-zinc-700 transition-colors"
                                        placeholder="e.g., 5.24"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Date */}
                                <div className="space-y-1.5">
                                    <label className="text-zinc-400 font-medium">Record Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.date}
                                        onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 font-mono focus:outline-none focus:border-zinc-700 transition-colors"
                                    />
                                </div>

                                {/* Optional Management ID */}
                                <div className="space-y-1.5">
                                    <label className="text-zinc-400 font-medium">Management ID (Optional)</label>
                                    <input
                                        type="text"
                                        value={form.managementId}
                                        onChange={(e) => setForm(prev => ({ ...prev, managementId: e.target.value }))}
                                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 font-mono focus:outline-none focus:border-zinc-700 transition-colors"
                                        placeholder="Management UUID (Optional)"
                                    />
                                </div>
                            </div>

                            {/* SUBMIT BUTTONS */}
                            <div className="flex items-center justify-end gap-3 border-t border-zinc-900 pt-4 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 bg-transparent text-zinc-400 rounded-lg hover:text-zinc-200 hover:bg-zinc-900 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createShareholdingMutation.isPending || updateShareholdingMutation.isPending}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded-lg transition-colors shadow-sm disabled:opacity-40"
                                >
                                    {(createShareholdingMutation.isPending || updateShareholdingMutation.isPending) ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                                    ) : (
                                        <CheckCircle className="w-3.5 h-3.5" />
                                    )}
                                    Save Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
