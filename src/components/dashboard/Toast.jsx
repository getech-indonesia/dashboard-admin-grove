import { useEffect } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, 4000)
        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border bg-[#0c0c0e] animate-slide-in shadow-2xl min-w-[300px] max-w-md text-xs">
            <div className="flex-shrink-0">
                {type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                )}
            </div>
            <div className="flex-1 font-medium text-zinc-200">
                {message}
            </div>
            <button
                type="button"
                onClick={onClose}
                className="p-1 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    )
}