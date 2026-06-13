import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, DollarSign, Search } from 'lucide-react'
import { useFormStore } from '@/store/useFormStore'

export default function CashFlowForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  // 1. KONSUMSI GLOBAL STORE ZUSTAND
  const currentFormData = useFormStore((state) => state.getFormData('cash-flows'))
  const updateGlobalStore = useFormStore((state) => state.updateFormData)

  // Master data tiruan untuk relasi Company Connect
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
    netIncomeStart: '',
    depreciationAmort: '',
    stockBasedCompensation: '',
    changeInWorkingCapital: '',
    changeInReceivables: '',
    changeInInventory: '',
    changeInPayables: '',
    otherOperatingActivities: '',
    netCashFromOperations: '',
    capitalExpenditures: '',
    acquisitions: '',
    purchaseOfInvestments: '',
    saleOfInvestments: '',
    otherInvestingActivities: '',
    netCashFromInvesting: '',
    debtIssuance: '',
    debtRepayment: '',
    commonStockIssuance: '',
    commonStockRepurchase: '',
    dividendsPaid: '',
    otherFinancingActivities: '',
    netCashFromFinancing: '',
    netChangeInCash: '',
    cashBeginningPeriod: '',
    cashEndPeriod: '',
    freeCashFlow: ''
  }

  const [form, setForm] = useState(defaultBlueprint)
  const [companyQuery, setCompanyQuery] = useState('')
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)

  // 2. SINKRONISASI SEARAH DARI ZUSTAND GLOBAL KE STATE FORM LOKAL (ARRAY & OBJECT SUPPORT)
  useEffect(() => {
    if (currentFormData) {
      // Ambil elemen pertama index [0] jika editor eksternal berupa Array massal
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

  // Helper sinkronisasi data balik ke Zustand global secara aman
  const syncToGlobalStore = (updatedForm) => {
    if (Array.isArray(currentFormData)) {
      const updatedArray = [...currentFormData]
      updatedArray[0] = updatedForm // Update indeks 0, pertahankan elemen array di bawahnya
      updateGlobalStore('cash-flows', updatedArray)
    } else {
      updateGlobalStore('cash-flows', updatedForm)
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
    console.log('Safe Cash Flow Payload:', currentFormData)
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
          onClick={() => navigate('/dashboard/cash-flows')}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            {isEdit ? 'Modify Cash Flow Statement' : 'New Cash Flow Registry'}
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            {isEdit ? 'Adjust data velocity line items for this reporting segment.' : 'Record comprehensive institutional liquidity inflows and outflows.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* BLOCK 1: STATEMENT CONTEXT */}
        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Statement Meta & Timing</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Searchable Dropdown: Connected Company */}
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
                  placeholder="Search corporate entity..."
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

            {/* Period Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Reporting Period Type</label>
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
              <label className="text-xs font-medium text-zinc-400">Period End Date</label>
              <input
                type="date"
                name="periodEndDate"
                value={form.periodEndDate || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-300 text-zinc-300 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono"
              />
            </div>

            {/* Reporting Currency Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Reporting Currency</label>
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
                <option value="REVIEWED">REVIEWED</option>
              </select>
            </div>
          </div>
          {form.fiscalQuarter && (
            <div className="text-[11px] font-mono text-zinc-500 bg-[#0c0c0e] px-2.5 py-1 rounded border border-zinc-900 inline-block">
              Auto Mapped: <span className="text-emerald-500 font-bold">fiscalQuarter = {form.fiscalQuarter}</span>
            </div>
          )}
        </div>

        {/* BLOCK 2: OPERATING ACTIVITIES */}
        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-900">1. Operating Activities</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInputField('netIncomeStart', 'Net Income (Starting Point)')}
            {renderInputField('depreciationAmort', 'Depreciation & Amortization')}
            {renderInputField('stockBasedCompensation', 'Stock-Based Compensation')}
            {renderInputField('changeInWorkingCapital', 'Change In Working Capital')}
            {renderInputField('changeInReceivables', 'Change In Receivables')}
            {renderInputField('changeInInventory', 'Change In Inventory')}
            {renderInputField('changeInPayables', 'Change In Payables')}
            {renderInputField('otherOperatingActivities', 'Other Operating Activities')}
          </div>
          <div className="pt-2 border-t border-zinc-900/60 max-w-sm">
            {renderInputField('netCashFromOperations', 'Net Cash From Operations', '0.00', true)}
          </div>
        </div>

        {/* BLOCK 3: INVESTING ACTIVITIES */}
        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-900">2. Investing Activities</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInputField('capitalExpenditures', 'Capital Expenditures (CapEx)')}
            {renderInputField('acquisitions', 'Business Acquisitions')}
            {renderInputField('purchaseOfInvestments', 'Purchase Of Investments')}
            {renderInputField('saleOfInvestments', 'Sale Of Investments')}
            {renderInputField('otherInvestingActivities', 'Other Investing Activities')}
            {renderInputField('netCashFromInvesting', 'Net Cash From Investing')}
          </div>
        </div>

        {/* BLOCK 4: FINANCING ACTIVITIES */}
        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-900">3. Financing Activities</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInputField('debtIssuance', 'Debt Issuance (Inflow)')}
            {renderInputField('debtRepayment', 'Debt Repayment (Outflow)')}
            {renderInputField('commonStockIssuance', 'Common Stock Issuance')}
            {renderInputField('commonStockRepurchase', 'Common Stock Repurchase')}
            {renderInputField('dividendsPaid', 'Dividends Paid Out')}
            {renderInputField('otherFinancingActivities', 'Other Financing Activities')}
          </div>
          <div className="pt-2 border-t border-zinc-900/60 max-w-sm">
            {renderInputField('netCashFromFinancing', 'Net Cash From Financing')}
          </div>
        </div>

        {/* BLOCK 5: SUMMARY & LEVERAGE METRICS */}
        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider pb-2 border-b border-zinc-900">4. Liquidity Summary & Derived Metrics</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInputField('netChangeInCash', 'Net Change In Cash')}
            {renderInputField('cashBeginningPeriod', 'Cash Balance (Beginning of Period)')}
            {renderInputField('cashEndPeriod', 'Cash Balance (End of Period)')}
            {renderInputField('freeCashFlow', 'Free Cash Flow (FCF)', '0.00')}
          </div>
        </div>

        {/* FOOTER ACTIONS CONTROLLER */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/cash-flows')}
            className="px-4 py-2 bg-transparent text-zinc-400 rounded-lg hover:text-zinc-200 hover:bg-zinc-900 transition-all text-xs font-medium"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5 stroke-[2.5]" />
            Save Cash Flow
          </button>
        </div>

      </form>

      {/* Dropdown overlay click shield */}
      {showCompanyDropdown && (
        <div className="fixed inset-0 z-0" onClick={() => setShowCompanyDropdown(false)} />
      )}
    </div>
  )
}