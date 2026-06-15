import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose }) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setVisible(true))

        const timer = setTimeout(() => {
            setVisible(false)
            setTimeout(onClose, 300) // tunggu exit animation selesai
        }, 4000)

        return () => clearTimeout(timer)
    }, [onClose])

    const isSuccess = type === 'success'

    return (
        <div
            className={`
                fixed bottom-6 right-6 z-50 min-w-[320px] max-w-sm
                transition-all duration-300 ease-out
                ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
        >
            {/* Card */}
            <div className={`
                relative overflow-hidden rounded-xl border bg-[#0c0c0e] shadow-2xl
                ${isSuccess ? 'border-emerald-500/20' : 'border-red-500/20'}
            `}>
                {/* Top accent line */}
                <div className={`absolute top-0 left-0 right-0 h-px ${isSuccess ? 'bg-emerald-500/50' : 'bg-red-500/50'}`} />

                {/* Progress bar */}
                <div className={`absolute bottom-0 left-0 h-px ${isSuccess ? 'bg-emerald-500/40' : 'bg-red-500/40'} animate-[shrink_4s_linear_forwards]`} />

                <div className="flex items-start gap-3 px-4 py-3.5">
                    {/* Icon */}
                    <div className={`
                        mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                        ${isSuccess ? 'bg-emerald-500/10' : 'bg-red-500/10'}
                    `}>
                        {isSuccess
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            : <XCircle className="w-4 h-4 text-red-400" />
                        }
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-xs font-semibold text-zinc-100 leading-relaxed">{message}</p>
                    </div>

                    {/* Close */}
                    <button
                        type="button"
                        onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
                        className="mt-0.5 flex-shrink-0 p-1 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    )
}