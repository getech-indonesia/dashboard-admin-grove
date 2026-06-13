import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Wallet, Search } from 'lucide-react'

export default function BalanceSheetForm({ formData, setFormData }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const mockCompanies = [
    { id: 'c1-uuid-apple', displayName: 'Apple Inc.', symbol: 'AAPL' },
    { id: 'c2-uuid-msft', displayName: 'Microsoft Corp.', symbol: 'MSFT' },
    { id: 'c3-uuid-bbca', displayName: 'Bank Central Asia Tbk.', symbol: 'BBCA' }
  ]

  const [form, setForm] = useState({
    companyId: '',
    period: 'ANNUAL',
    fiscalYear: '',
    fiscalQuarter: null,
    periodEndDate: '',
    currency: 'USD',
    auditStatus: 'UNAUDITED',
    cash: '',
    shortTermInvestments: '',
    accountsReceivable: '',
    inventory: '',
    otherCurrentAssets: '',
    totalCurrentAssets: '',
    propertyPlantEquipment: '',
    intangibleAssets: '',
    goodwill: '',
    longTermInvestments: '',
    otherNonCurrentAssets: '',
    totalNonCurrentAssets: '',
    totalAssets: '',
    shortTermDebt: '',
    accountsPayable: '',
    deferredRevenue: '',
    otherCurrentLiabilities: '',
    totalCurrentLiabilities: '',
    longTermDebt: '',
    deferredTaxLiabilities: '',
    otherNonCurrentLiabilities: '',
    totalNonCurrentLiabilities: '',
    totalLiabilities: '',
    commonStock: '',
    additionalPaidInCapital: '',
    retainedEarnings: '',
    treasuryStock: '',
    otherEquity: '',
    minorityInterestEquity: '',
    totalEquity: '',
    bookValuePerShare: '',
    netDebt: '',
    workingCapital: ''
  })

  const [companyQuery, setCompanyQuery] = useState('')
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)

  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      const currentFormStr = JSON.stringify(form)
      const incomingDataStr = JSON.stringify({ ...form, ...formData })

      if (currentFormStr !== incomingDataStr) {
        setForm(prev => {
          const updated = { ...prev, ...formData }
          const matched = mockCompanies.find(c => c.id === updated.companyId)
          if (matched) setCompanyQuery(matched.displayName)
          return updated
        })
      }
    }
  }, [formData])

  const handleChange = (e) => {
    const { name, value } = e.target
    const textFields = ['companyId', 'period', 'periodEndDate', 'currency', 'auditStatus']

    let updatedValue = value
    if (!textFields.includes(name) && value !== '') {
      updatedValue = name === 'fiscalYear' || name === 'fiscalQuarter' ? parseInt(value, 10) : parseFloat(value)
    } else if (!textFields.includes(name) && value === '') {
      updatedValue = name === 'fiscalQuarter' ? null : ''
    }

    let newForm = { ...form, [name]: updatedValue }

    if (name === 'period') {
      if (value.startsWith('Q')) {
        newForm.fiscalQuarter = parseInt(value.charAt(1), 10)
      } else {
        newForm.fiscalQuarter = null
      }
    }

    setForm(newForm)
    setFormData(newForm)
  }

  const handleSelectCompany = (company) => {
    const newForm = { ...form, companyId: company.id }
    setForm(newForm)
    setFormData(newForm)
    setCompanyQuery(company.displayName)
    setShowCompanyDropdown(false)
  }

  const filteredCompanies = mockCompanies.filter(c =>
    c.displayName.toLowerCase().includes(companyQuery.toLowerCase()) ||
    c.symbol.toLowerCase().includes(companyQuery.toLowerCase())
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Safe Balance Sheet Payload:', form)
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
        value={form[name] === null ? '' : form[name]}
        onChange={handleChange}
        required={isRequired}
        className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-700 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono"
        placeholder={placeholder}
      />
    </div>
  )

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 animate-fade-in text-sm text-zinc-300 pb-12">

      <div className="flex items-center gap-4 border-b border-zinc-900 pb-5">
        <button
          type="button"
          onClick={() => navigate('/dashboard/balance-sheets')}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            {isEdit ? 'Modify Balance Sheet' : 'New Balance Sheet Registry'}
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            {isEdit ? 'Adjust statement items for this asset registry period.' : 'Record statement metrics for assets, liabilities, and equities.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
            <Wallet className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Statement Meta & Timing</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Reporting Period Type</label>
              <select
                name="period"
                value={form.period}
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

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Fiscal Calendar Year</label>
              <input
                type="number"
                name="fiscalYear"
                value={form.fiscalYear}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 placeholder-zinc-700 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono"
                placeholder="2026"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Period End Date</label>
              <input
                type="date"
                name="periodEndDate"
                value={form.periodEndDate}
                onChange={handleChange}
                required
                className="w-full h-[34px] px-3 py-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-zinc-700 transition-colors font-mono block box-border leading-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Reporting Currency</label>
              <div className="relative">
                <select
                  name="currency"
                  value={form.currency}
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

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Audit Status</label>
              <select
                name="auditStatus"
                value={form.auditStatus}
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
              Mapped Field Param: <span className="text-emerald-500 font-bold">fiscalQuarter = {form.fiscalQuarter}</span>
            </div>
          )}
        </div>

        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-900">1. Current Assets</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInputField('cash', 'Cash & Equivalents')}
            {renderInputField('shortTermInvestments', 'Short-Term Investments')}
            {renderInputField('accountsReceivable', 'Accounts Receivable')}
            {renderInputField('inventory', 'Inventory Asset Valuation')}
            {renderInputField('otherCurrentAssets', 'Other Current Assets')}
            {renderInputField('totalCurrentAssets', 'Total Current Assets')}
          </div>
        </div>

        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-900">2. Non-Current Assets</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInputField('propertyPlantEquipment', 'Property, Plant & Equip (PP&E)')}
            {renderInputField('intangibleAssets', 'Intangible Assets')}
            {renderInputField('goodwill', 'Goodwill Asset Premium')}
            {renderInputField('longTermInvestments', 'Long-Term Investments')}
            {renderInputField('otherNonCurrentAssets', 'Other Non-Current Assets')}
            {renderInputField('totalNonCurrentAssets', 'Total Non-Current Assets')}
          </div>
          <div className="pt-2 border-t border-zinc-900/60 max-w-sm">
            {renderInputField('totalAssets', 'Total Aggregated Assets (A)', '0.00', true)}
          </div>
        </div>

        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-900">3. Current Liabilities</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInputField('shortTermDebt', 'Short-Term Debt & Notes')}
            {renderInputField('accountsPayable', 'Accounts Payable Obligations')}
            {renderInputField('deferredRevenue', 'Deferred / Unearned Revenue')}
            {renderInputField('otherCurrentLiabilities', 'Other Current Liabilities')}
            <div className="md:col-span-2 max-w-sm">
              {renderInputField('totalCurrentLiabilities', 'Total Current Liabilities')}
            </div>
          </div>
        </div>

        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-900">4. Non-Current Liabilities</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInputField('longTermDebt', 'Long-Term Debt Obligations')}
            {renderInputField('deferredTaxLiabilities', 'Deferred Tax Liabilities')}
            {renderInputField('otherNonCurrentLiabilities', 'Other Non-Current Liabilities')}
            {renderInputField('totalNonCurrentLiabilities', 'Total Non-Current Liabilities')}
            {renderInputField('totalLiabilities', 'Total Liabilities (L)')}
          </div>
        </div>

        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider pb-2 border-b border-zinc-900">5. Shareholder Equity (E)</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInputField('commonStock', 'Common Stock Capital')}
            {renderInputField('additionalPaidInCapital', 'Additional Paid-In Capital (APIC)')}
            {renderInputField('retainedEarnings', 'Retained Earnings Balance')}
            {renderInputField('treasuryStock', 'Treasury Stock Buybacks')}
            {renderInputField('otherEquity', 'Other Comprehensive Equity')}
            {renderInputField('minorityInterestEquity', 'Minority Interest Equity')}
          </div>
          <div className="pt-2 border-t border-zinc-900/60 max-w-sm">
            {renderInputField('totalEquity', 'Total Shareholder Equity (E)', '0.00', true)}
          </div>
        </div>

        <div className="bg-[#09090b] border border-zinc-900 rounded-xl p-6 space-y-4">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-900">6. Derived System Performance Metrics</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInputField('bookValuePerShare', 'Book Value Per Share (BVPS)', '0.0000')}
            {renderInputField('netDebt', 'Calculated Net Debt')}
            {renderInputField('workingCapital', 'Net Working Capital')}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/balance-sheets')}
            className="px-4 py-2 bg-transparent text-zinc-400 rounded-lg hover:text-zinc-200 hover:bg-zinc-900 transition-all text-xs font-medium"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5 stroke-[2.5]" />
            Save Balance Sheet
          </button>
        </div>

      </form>

      {showCompanyDropdown && (
        <div className="fixed inset-0 z-0" onClick={() => setShowCompanyDropdown(false)} />
      )}
    </div>
  )
}