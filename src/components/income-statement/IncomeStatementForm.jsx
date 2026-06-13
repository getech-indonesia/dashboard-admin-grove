import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, TrendingUp, Search, DollarSign } from 'lucide-react'
import { useFormStore } from '@/store/useFormStore'

export default function IncomeStatementForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  // 1. KONSUMSI GLOBAL STORE ZUSTAND
  const currentFormData = useFormStore((state) => state.getFormData('income-statements'))
  const updateGlobalStore = useFormStore((state) => state.updateFormData)

  // Data master tiruan untuk pencarian entitas relasional
  const mockCompanies = [
    { id: 'c1-uuid-apple', displayName: 'Apple Inc.', symbol: 'AAPL' },
    { id: 'c2-uuid-msft', displayName: 'Microsoft Corp.', symbol: 'MSFT' },
    { id: 'c3-uuid-bbca', displayName: 'Bank Central Asia Tbk.', symbol: 'BBCA' }
  ]

  const defaultBlueprint = {
    companyId: '',
    period: 'ANNUAL',
    fiscalYear: new Date().getFullYear(),
    fiscalQuarter: null,
    periodEndDate: '',
    currency: 'USD',
    auditStatus: 'UNAUDITED',
    revenue: '',
    revenueGrowthYoY: '',
    cogs: '',
    grossProfit: '',
    operatingExpenses: '',
    sellingExpenses: '',
    generalAdminExpenses: '',
    rdExpenses: '',
    depreciationAmort: '',
    ebit: '',
    ebitda: '',
    operatingIncome: '',
    interestExpense: '',
    interestIncome: '',
    otherNonOperatingIncome: '',
    pretaxIncome: '',
    incomeTaxExpense: '',
    effectiveTaxRate: '',
    netIncome: '',
    netIncomeAttributable: '',
    minorityInterest: '',
    eps: '',
    epsDiluted: '',
    sharesWeightedAvg: ''
  }

  const [form, setForm] = useState(defaultBlueprint)
  const [companyQuery, setCompanyQuery] = useState('')
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)

  // 2. SINKRONISASI SEARAH DARI ZUSTAND GLOBAL KE STATE FORM LOKAL (ARRAY & OBJECT SUPPORT)
  useEffect(() => {
    if (currentFormData) {
      const targetData = Array.isArray(currentFormData) ? currentFormData[0] : currentFormData

      if (targetData && Object.keys(targetData).length > 0) {
        const currentFormStr = JSON.stringify(form)
        const incomingDataStr = JSON.stringify({ ...form, ...targetData })

        if (currentFormStr !== incomingDataStr) {
          setForm(prev => {
            const updated = { ...prev, ...targetData }
            const matched = mockCompanies.find(c => c.id === updated.companyId)
            if (matched) setCompanyQuery(matched.displayName)
            return updated
          })
        }
      } else if (targetData && Object.keys(targetData).length === 0) {
        setForm(defaultBlueprint)
        setCompanyQuery('')
      }
    }
  }, [currentFormData])

  // Helper untuk sinkronisasi state lokal balik ke Zustand global secara aman
  const syncToGlobalStore = (updatedForm) => {
    if (Array.isArray(currentFormData)) {
      const updatedArray = [...currentFormData]
      updatedArray[0] = updatedForm
      updateGlobalStore('income-statements', updatedArray)
    } else {
      updateGlobalStore('income-statements', updatedForm)
    }
  }

  // 3. LOGIKA HANDLE INPUT CHANGE & AUTOMATION
  const handleChange = (e) => {
    const { name, value } = e.target
    const textFields = ['companyId', 'period', 'periodEndDate', 'currency', 'auditStatus']

    let updatedValue = value
    if (!textFields.includes(name) && value !== '') {
      updatedValue = name === 'fiscalYear' || name === 'fiscalQuarter' ? parseInt(value, 10) : parseFloat(value)
    } else if (!textFields.includes(name) && value === '') {
      updatedValue = name === 'fiscalQuarter' ? null : ''
    }

    let updatedForm = { ...form, [name]: updatedValue }

    // Otomatisasi kuartal berdasarkan Enum PeriodType
    if (name === 'period') {
      if (value.startsWith('Q')) {
        updatedForm.fiscalQuarter = parseInt(value.charAt(1), 10)
      } else {
        updatedForm.fiscalQuarter = null
      }
    }

    setForm(updatedForm)
    syncToGlobalStore(updatedForm)
  }

  const handleSelectCompany = (company) => {
    const updatedForm = { ...form, companyId: company.id }
    setForm(updatedForm)
    setCompanyQuery(company.displayName)
    setShowCompanyDropdown(false)
    syncToGlobalStore(updatedForm)
  }

  const filteredCompanies = mockCompanies.filter(c =>
    c.displayName.toLowerCase().includes(companyQuery.toLowerCase()) ||
    c.symbol.toLowerCase().includes(companyQuery.toLowerCase())
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Submitted Store Payload:', currentFormData)
  }

  const renderInputField = (name, label, placeholder = '0.00', isRequired = false) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-400">
        {label} {isRequired && <span className="text-emerald-500">*</span>}
      </label>
      <input
        type="number"
        step="any"
        name={name}
        value={form[name] === null || form[name] === undefined ? '' : form[name]}
        onChange={handleChange}
        required={isRequired}
        className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-700 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono"
        placeholder={placeholder}
      />
    </div>
  )

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 animate-fade-in text-sm text-zinc-300 pb-12">

      {/* HEADER SECTION */}
      <div className="flex items-center gap-4 border-b border-zinc-900 pb-5">
        <button
          type="button"
          onClick={() => navigate('/dashboard/income-statements')}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            {isEdit ? 'Modify Income Statement' : 'New Income Statement Registry'}
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            {isEdit ? 'Adjust line items for this financial statement period.' : 'Record comprehensive top-to-bottom spreadsheet metrics.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* BLOCK 1: STATEMENT CONTEXT */}
        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Statement Context & Filing</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Searchable Dropdown: Company Connect */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-medium text-zinc-400">
                Connected Company <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={companyQuery}
                  onChange={(e) => {
                    setCompanyQuery(e.target.value)
                    setShowCompanyDropdown(true)
                  }}
                  onFocus={() => setShowCompanyDropdown(true)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-700 transition-colors"
                  placeholder="Search corporate target..."
                />
                <Search className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-2.5" />
              </div>

              {showCompanyDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-[#0c0c0e] border border-zinc-800 rounded-lg max-h-40 overflow-y-auto shadow-xl divide-y divide-zinc-900">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCompany(c)}
                        className="px-3 py-2 text-xs hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 cursor-pointer flex justify-between items-center"
                      >
                        <span>{c.displayName}</span>
                        <span className="font-mono text-[10px] text-zinc-600 bg-zinc-950 px-1 rounded">{c.symbol}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-zinc-600 font-mono">No entities matched</div>
                  )}
                </div>
              )}
            </div>

            {/* Period Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Filing Period Type</label>
              <select
                name="period"
                value={form.period || 'ANNUAL'}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-zinc-700 transition-colors appearance-none"
              >
                <option value="ANNUAL">ANNUAL</option>
                <option value="Q1">Q1 (Quarter 1)</option>
                <option value="Q2">Q2 (Quarter 2)</option>
                <option value="Q3">Q3 (Quarter 3)</option>
                <option value="Q4">Q4 (Quarter 4)</option>
                <option value="TTM">TTM (Trailing 12M)</option>
              </select>
            </div>

            {/* Fiscal Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Fiscal Calendar Year</label>
              <input
                type="number"
                name="fiscalYear"
                value={form.fiscalYear === null || form.fiscalYear === undefined ? '' : form.fiscalYear}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-700 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono"
                placeholder="2026"
              />
            </div>

            {/* Period End Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Period Closing Date</label>
              <input
                type="date"
                name="periodEndDate"
                value={form.periodEndDate || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-300 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono"
              />
            </div>

            {/* Reporting Currency */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">
                Reporting Currency <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="currency"
                  value={form.currency || 'USD'}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-zinc-700 transition-colors appearance-none font-mono"
                >
                  <option value="USD">USD ($) — United States Dollar</option>
                  <option value="IDR">IDR (Rp) — Indonesian Rupiah</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="JPY">JPY (¥) — Japanese Yen</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-600">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Audit Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Filing Audit Status</label>
              <select
                name="auditStatus"
                value={form.auditStatus || 'UNAUDITED'}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-zinc-700 transition-colors appearance-none"
              >
                <option value="UNAUDITED">UNAUDITED</option>
                <option value="AUDITED">AUDITED</option>
                <option value="RESTATED">RESTATED</option>
              </select>
            </div>
          </div>
          {form.fiscalQuarter && (
            <div className="text-[11px] font-mono text-zinc-500 bg-[#0c0c0e] px-2.5 py-1 rounded border border-zinc-900 inline-block">
              Auto-mapped Parameter: <span className="text-emerald-500 font-bold">fiscalQuarter = {form.fiscalQuarter}</span>
            </div>
          )}
        </div>

        {/* BLOCK 2: TOP LINE REVENUE & COGS */}
        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-900 flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-zinc-500" /> Top-Line Performance
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderInputField('revenue', 'Total Revenue', '0.00', true)}
            {renderInputField('revenueGrowthYoY', 'Revenue Growth YoY', '0.0450')}
            {renderInputField('cogs', 'Cost of Goods Sold (COGS)')}
            {renderInputField('grossProfit', 'Gross Profit')}
          </div>
        </div>

        {/* BLOCK 3: OPERATING EXPENDITURES */}
        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-900">Operating Expenses (OpEx)</div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {renderInputField('operatingExpenses', 'Total OpEx')}
            {renderInputField('sellingExpenses', 'Selling Expenses')}
            {renderInputField('generalAdminExpenses', 'Gen & Admin Expenses')}
            {renderInputField('rdExpenses', 'R&D Expenditures')}
            {renderInputField('depreciationAmort', 'Depr & Amortization')}
          </div>
        </div>

        {/* BLOCK 4: OPERATING INCOME & EBIT/EBITDA */}
        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-900">Profitability Intermediaries</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInputField('operatingIncome', 'Operating Income')}
            {renderInputField('ebit', 'EBIT (Operating Earnings)')}
            {renderInputField('ebitda', 'EBITDA')}
          </div>
        </div>

        {/* BLOCK 5: BELOW THE LINE METRICS */}
        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-900">Non-Operating & Financial Taxes</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInputField('interestExpense', 'Interest Expense')}
            {renderInputField('interestIncome', 'Interest Income')}
            {renderInputField('otherNonOperatingIncome', 'Other Non-Operating')}
            {renderInputField('pretaxIncome', 'Pretax Income')}
            {renderInputField('incomeTaxExpense', 'Income Tax Expense')}
            {renderInputField('effectiveTaxRate', 'Effective Tax Rate', '0.2100')}
          </div>
        </div>

        {/* BLOCK 6: BOTTOM LINE & CAPITAL PER SHARE */}
        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-900 ">Bottom Line Earnings & Per Share Data</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInputField('netIncome', 'Net Income', '0.00', true)}
            {renderInputField('netIncomeAttributable', 'Net Income Attributable')}
            {renderInputField('minorityInterest', 'Minority Interest')}
            {renderInputField('eps', 'Basic EPS (Earnings Per Share)', '0.0000')}
            {renderInputField('epsDiluted', 'Diluted EPS', '0.0000')}
            {renderInputField('sharesWeightedAvg', 'Weighted Avg Shares', '10000000')}
          </div>
        </div>

        {/* FOOTER CONTROLLER ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/income-statements')}
            className="px-4 py-2 bg-transparent text-zinc-400 rounded-lg hover:text-zinc-200 hover:bg-zinc-900 transition-all text-xs font-medium"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5 stroke-[2.5]" />
            Save Statement
          </button>
        </div>

      </form>

      {/* Backdrop overlay click shield */}
      {showCompanyDropdown && (
        <div className="fixed inset-0 z-0" onClick={() => setShowCompanyDropdown(false)} />
      )}
    </div>
  )
}