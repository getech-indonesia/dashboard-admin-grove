import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, BarChart3 } from 'lucide-react'

export default function ListingList() {
  const navigate = useNavigate()

  const sampleListings = [
    {
      id: '1',
      symbol: 'AAPL',
      isin: 'US0378331005',
      cusip: '037833100',
      assetType: 'STOCK',
      company: { displayName: 'Apple' },
      exchange: { name: 'NASDAQ' }
    },
    {
      id: '2',
      symbol: 'MSFT',
      isin: 'US5949181045',
      cusip: '594918104',
      assetType: 'STOCK',
      company: { displayName: 'Microsoft' },
      exchange: { name: 'NASDAQ' }
    }
  ]

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in text-sm text-zinc-300">

      {/* HEADER SECTION: Clean, Flat & Minimalist */}
      <div className="flex items-end justify-between border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Listings
          </h1>
          <p className="text-zinc-500 text-xs mt-1.5 font-normal tracking-normal">
            Manage public exchange tickers, market listings, and regulatory security codes.
          </p>
        </div>

        {/* Button Add Listing: Solid Contrast White Style */}
        <button
          onClick={() => navigate('/dashboard/listings/create')}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-xs rounded-lg transition-all duration-150 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Add Listing
        </button>
      </div>

      {/* TABLE CONTAINER: Borderless Subtle Frame */}
      <div className="bg-[#09090b] border border-zinc-900 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">

            {/* Table Header: Micro Text & Deep Zinc Tone */}
            <thead className="bg-[#0c0c0e] border-b border-zinc-900">
              <tr>
                <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-[18%]">
                  Symbol
                </th>
                <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Exchange
                </th>
                <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  ISIN Code
                </th>
                <th className="text-left px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Asset Type
                </th>
                <th className="text-right px-5 py-3.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-[100px]">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body: Compact Data Grid */}
            <tbody className="divide-y divide-zinc-900">
              {sampleListings.map((listing) => (
                <tr
                  key={listing.id}
                  className="hover:bg-[#0c0c0e]/60 transition-colors duration-100 group"
                >
                  {/* Kolom Simbol / Ticker */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {/* Icon Ticker Box */}
                      <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 group-hover:text-emerald-400 group-hover:border-zinc-700/50 transition-colors">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-zinc-100 text-[13px] tracking-wider font-mono">
                        {listing.symbol}
                      </span>
                    </div>
                  </td>

                  {/* Kolom Nama Kompeni */}
                  <td className="px-5 py-4 text-zinc-300 text-[13px]">
                    {listing.company?.displayName}
                  </td>

                  {/* Kolom Bursa / Exchange */}
                  <td className="px-5 py-4 text-zinc-400 text-[13px]">
                    <span className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-[11px] font-medium text-zinc-300">
                      {listing.exchange?.name}
                    </span>
                  </td>

                  {/* Kolom Kode ISIN */}
                  <td className="px-5 py-4 text-zinc-500 font-mono text-xs tracking-normal">
                    {listing.isin}
                  </td>

                  {/* Kolom Asset Type: Micro Badge */}
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800 tracking-wider">
                      {listing.assetType}
                    </span>
                  </td>

                  {/* Kolom Manajemen Aksi Mikro */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">

                      {/* Button Edit */}
                      <button
                        onClick={() => navigate(`/dashboard/listings/${listing.id}/edit`)}
                        className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                        title="Edit Listing"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Button Hapus */}
                      <button
                        className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        title="Delete Listing"
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
