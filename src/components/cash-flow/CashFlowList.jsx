import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

export default function CashFlowList() {
  const navigate = useNavigate()

  const sampleCashFlows = [
    {
      id: '1',
      company: { displayName: 'Apple' },
      period: 'QUARTERLY',
      fiscalYear: 2024,
      fiscalQuarter: 1,
      periodEndDate: '2024-03-31',
      currency: 'USD',
      netCashFromOperations: '28000000000',
      netCashFromInvesting: '-12000000000',
      netCashFromFinancing: '-15000000000'
    }
  ]

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in text-sm text-zinc-300">

      {/* HEADER SECTION: Clean & Flat */}
      <div className="flex items-end justify-between border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Cash Flow Statements
          </h1>
          <p className="text-zinc-500 text-xs mt-1.5 font-normal tracking-normal">
            Monitor institutional liquidity velocity across core operations, asset capital expenditures, and funding mechanisms.
          </p>
        </div>

        {/* Button Add Cash Flow: Solid Minimalist Contrast */}
        <button
          onClick={() => navigate('/dashboard/cash-flows/create')}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-xs rounded-lg transition-all duration-150 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Add Cash Flow
        </button>
      </div>

      {/* DATA GRID GRID CONTAINER */}
      <div className="bg-[#09090b] border border-zinc-900 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">

            {/* Table Header: Micro Typography */}
            <thead className="bg-[#0c0c0e] border-b border-zinc-900">
              <tr>
                <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-[20%]">
                  Company
                </th>
                <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Reporting Period
                </th>
                <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Period End Date
                </th>
                <th className="text-right px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Operating Cash Flow (OCF)
                </th>
                <th className="text-right px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Investing Cash Flow
                </th>
                <th className="text-right px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Financing Cash Flow
                </th>
                <th className="text-right px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-[100px]">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-zinc-900">
              {sampleCashFlows.map((cf) => (
                <tr
                  key={cf.id}
                  className="hover:bg-[#0c0c0e]/60 transition-colors duration-100 group"
                >
                  {/* Company Name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 group-hover:text-emerald-400 group-hover:border-zinc-700/50 transition-colors">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-zinc-200 text-[13px]">
                        {cf.company?.displayName}
                      </span>
                    </div>
                  </td>

                  {/* Reporting Period Badge Combo */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-300 text-[13px] font-medium">
                        FY {cf.fiscalYear}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-zinc-400 tracking-wider">
                        {cf.period}
                      </span>
                      {cf.fiscalQuarter && (
                        <span className="text-[11px] text-zinc-500 font-mono">
                          Q{cf.fiscalQuarter}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* End Date */}
                  <td className="px-5 py-4 text-zinc-500 font-mono text-xs">
                    {cf.periodEndDate}
                  </td>

                  {/* Operating Cash Flow: Net positive cash influx is highlighted with emerald */}
                  <td className="px-5 py-4 text-right">
                    <span className="text-emerald-400 font-mono text-[13px] font-medium">
                      {formatCurrency(cf.netCashFromOperations, cf.currency)}
                    </span>
                  </td>

                  {/* Investing Cash Flow */}
                  <td className="px-5 py-4 text-right text-zinc-400 font-mono text-[13px]">
                    {formatCurrency(cf.netCashFromInvesting, cf.currency)}
                  </td>

                  {/* Financing Cash Flow */}
                  <td className="px-5 py-4 text-right text-zinc-400 font-mono text-[13px]">
                    {formatCurrency(cf.netCashFromFinancing, cf.currency)}
                  </td>

                  {/* Micro Actions Context Controller */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">

                      {/* Button Edit */}
                      <button
                        onClick={() => navigate(`/dashboard/cash-flows/${cf.id}/edit`)}
                        className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                        title="Edit Cash Flow"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Button Hapus */}
                      <button
                        className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        title="Delete Cash Flow"
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
      </div>

    </div>
  )
}
