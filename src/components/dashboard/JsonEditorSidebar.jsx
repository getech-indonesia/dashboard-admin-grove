import { Code2, Plus, Trash2 } from 'lucide-react'
import { useFormStore } from '@/store/useFormStore'

export default function JsonEditorSidebar({ formKey }) {
    const currentData = useFormStore((state) => state.getFormData(formKey))
    const updateFormData = useFormStore((state) => state.updateFormData)
    const addArrayItem = useFormStore((state) => state.addArrayItem)
    const removeLastArrayItem = useFormStore((state) => state.removeLastArrayItem)

    if (!formKey) return null

    const handleJsonChange = (e) => {
        try {
            const parsed = JSON.parse(e.target.value)
            updateFormData(formKey, parsed)
        } catch (error) {
            // Hiraukan sementara ketika user sedang mengetik format JSON
        }
    }

    const isArrayData = Array.isArray(currentData)

    return (
        <aside className="w-96 bg-[#09090b] border-l border-zinc-900 flex flex-col overflow-hidden animate-slide-in">
            <div className="p-4 border-b border-zinc-900 bg-[#09090b] flex items-center justify-between">
                <h3 className="font-medium text-zinc-200 text-xs flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-emerald-500" />
                    Live JSON Editor
                </h3>

                <div className="flex items-center gap-1.5">
                    {isArrayData && (
                        <button
                            type="button"
                            onClick={() => removeLastArrayItem(formKey)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-900/50 hover:bg-red-950/30 text-[11px] font-medium text-zinc-500 hover:text-red-400 border border-zinc-900 hover:border-red-900/40 transition-colors"
                        >
                            <Trash2 className="w-3 h-3" />
                            <span>Pop</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => addArrayItem(formKey)}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-[11px] font-medium text-emerald-400 border border-zinc-800 hover:border-zinc-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                        <span>Add Item</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
                <textarea
                    value={JSON.stringify(currentData, null, 2)}
                    onChange={handleJsonChange}
                    className="w-full h-full min-h-[500px] bg-[#0c0c0e] text-zinc-400 font-mono text-[11px] p-4 rounded-xl border border-zinc-900 focus:border-emerald-950/80 focus:ring-1 focus:ring-emerald-950 focus:outline-none transition-all resize-none leading-relaxed"
                    spellCheck={false}
                />
            </div>
        </aside>
    )
}