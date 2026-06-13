import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, total, itemsCount, onPageChange }) {
    // Pengaman jika data belum dimuat oleh TanStack Query
    if (!totalPages || totalPages <= 1) {
        if (total > 0) {
            return (
                <div className="flex items-center justify-between px-2 py-1 text-xs text-zinc-500 font-medium">
                    <div>
                        Showing <span className="text-zinc-300 font-mono">{itemsCount}</span> rows of{' '}
                        <span className="text-zinc-300 font-mono">{total}</span> entries.
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <div className="flex items-center justify-between px-2 py-1 text-xs text-zinc-500 font-medium animate-fade-in">
            {/* Informasi Baris Data */}
            <div>
                Showing <span className="text-zinc-300 font-mono">{itemsCount}</span> rows of{' '}
                <span className="text-zinc-300 font-mono">{total}</span> entries.
            </div>

            {/* Kontrol Navigasi Halaman */}
            <div className="flex items-center gap-4">
                <div className="font-mono text-zinc-500 text-[11px]">
                    Page <span className="text-zinc-300">{page}</span> of <span className="text-zinc-300">{totalPages}</span>
                </div>

                <div className="flex items-center gap-1">
                    {/* Button Previous */}
                    <button
                        type="button"
                        onClick={() => onPageChange(Math.max(page - 1, 1))}
                        disabled={page === 1}
                        className="p-1.5 rounded-md bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-400 transition-all cursor-pointer disabled:cursor-not-allowed"
                        title="Previous Page"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Button Next */}
                    <button
                        type="button"
                        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                        disabled={page === totalPages}
                        className="p-1.5 rounded-md bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-400 transition-all cursor-pointer disabled:cursor-not-allowed"
                        title="Next Page"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}