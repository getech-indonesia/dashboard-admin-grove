import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Building2 } from 'lucide-react'
import { useFormStore } from '@/store/useFormStore'

export default function CompanyForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  // Konsumsi global store Zustand
  const currentFormData = useFormStore((state) => state.getFormData('companies'))
  const updateGlobalStore = useFormStore((state) => state.updateFormData)

  const [form, setForm] = useState({
    legalName: '', displayName: '', description: '', foundedYear: null,
    website: '', logoUrl: '', employeeCount: null, ceo: '', headquarters: '',
    status: 'ACTIVE', fiscalYearEndMonth: 12
  })

  // Sinkronisasi searah dari Zustand Global (JSON Editor) ke Local Input Form
  useEffect(() => {
    const targetData = Array.isArray(currentFormData) ? currentFormData[0] : currentFormData
    if (targetData && Object.keys(targetData).length > 0) {
      const currentFormStr = JSON.stringify(form)
      const incomingDataStr = JSON.stringify({ ...form, ...targetData })

      if (currentFormStr !== incomingDataStr) {
        setForm(prev => ({ ...prev, ...targetData }))
      }
    }
  }, [currentFormData])

  const handleChange = (e) => {
    const { name, value } = e.target
    const numberFields = ['foundedYear', 'employeeCount', 'fiscalYearEndMonth']

    let updatedValue = value
    if (!numberFields.includes(name) && value === '') updatedValue = ''
    else if (numberFields.includes(name)) updatedValue = value !== '' ? parseInt(value, 10) : null

    const newForm = { ...form, [name]: updatedValue }
    setForm(newForm)

    // Perbarui data di Store Global Zustand secara aman
    if (Array.isArray(currentFormData)) {
      const updatedArray = [...currentFormData]
      updatedArray[0] = newForm
      updateGlobalStore('companies', updatedArray)
    } else {
      updateGlobalStore('companies', newForm)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Payload Ready to API via Zustand:', currentFormData)
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-fade-in text-sm text-zinc-300">

      {/* HEADER BAR */}
      <div className="flex items-center gap-4 border-b border-zinc-900 pb-5">
        <button
          type="button"
          onClick={() => navigate('/dashboard/companies')}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            {isEdit ? 'Modify Company' : 'New Company Registry'}
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            {isEdit ? 'Update metadata for this financial entity.' : 'Register a new institutional profile.'}
          </p>
        </div>
      </div>

      {/* FORM CONFIGURATOR */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* SECTION 1: CORE PROFILE */}
        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
            <Building2 className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Entity Core Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Legal Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">
                Legal Name <span className="text-emerald-500">*</span>
              </label>
              <input
                type="text"
                name="legalName"
                value={form.legalName || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-700 transition-colors"
                placeholder="Apple Inc. or Microsoft Corporation"
              />
            </div>

            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">
                Display Name <span className="text-emerald-500">*</span>
              </label>
              <input
                type="text"
                name="displayName"
                value={form.displayName || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-700 transition-colors"
                placeholder="Apple / Microsoft"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Entity Status</label>
              <select
                name="status"
                value={form.status || 'ACTIVE'}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-zinc-700 transition-colors appearance-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="DELISTED">DELISTED</option>
              </select>
            </div>

            {/* Fiscal Year End Month */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">
                Fiscal Year End Month <span className="text-zinc-500 text-[11px]">(1-12)</span>
              </label>
              <input
                type="number"
                name="fiscalYearEndMonth"
                min="1"
                max="12"
                value={form.fiscalYearEndMonth === null ? '' : form.fiscalYearEndMonth}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono"
                placeholder="12"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: OPERATIONAL & DETAILS */}
        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
            <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Firmographics & Logistics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CEO */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Current CEO</label>
              <input
                type="text"
                name="ceo"
                value={form.ceo || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-700 transition-colors"
                placeholder="Satya Nadella"
              />
            </div>

            {/* Founded Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Founded Year</label>
              <input
                type="number"
                name="foundedYear"
                value={form.foundedYear === null ? '' : form.foundedYear}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono"
                placeholder="1975"
              />
            </div>

            {/* Employee Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Total Employees</label>
              <input
                type="number"
                name="employeeCount"
                value={form.employeeCount === null ? '' : form.employeeCount}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono"
                placeholder="221000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Headquarters */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Corporate HQ Location</label>
              <input
                type="text"
                name="headquarters"
                value={form.headquarters || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-700 transition-colors"
                placeholder="Redmond, WA"
              />
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Official Website URL</label>
              <input
                type="url"
                name="website"
                value={form.website || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono"
                placeholder="https://company.com"
              />
            </div>

            {/* Logo URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Asset Logo CDN URL</label>
              <input
                type="url"
                name="logoUrl"
                value={form.logoUrl || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono"
                placeholder="https://cdn.logo.com/asset.png"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Business Summary & Context Description</label>
            <textarea
              name="description"
              value={form.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-700 transition-colors resize-none leading-relaxed"
              placeholder="Provide complex institutional details or business model summaries here..."
            />
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/companies')}
            className="px-4 py-2 bg-transparent text-zinc-400 rounded-lg hover:text-zinc-200 hover:bg-zinc-900 transition-all text-xs font-medium"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5 stroke-[2.5]" />
            Save Profile
          </button>
        </div>

      </form>
    </div>
  )
}