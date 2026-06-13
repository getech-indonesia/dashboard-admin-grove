import { create } from 'zustand'
import { formBlueprints } from '../types/formBlueprints'

export const useFormStore = create((set, get) => ({
    companyData: {},
    listingData: {},
    incomeStatementData: {},
    balanceSheetData: {},
    cashFlowData: {},

    getFormData: (formKey) => {
        if (!formKey) return {}
        if (formKey === 'companies') return get().companyData
        if (formKey === 'listings') return get().listingData
        if (formKey === 'income-statements') return get().incomeStatementData
        if (formKey === 'balance-sheets') return get().balanceSheetData
        if (formKey === 'cash-flows') return get().cashFlowData
        return {}
    },

    updateFormData: (formKey, newData) => {
        const stateKey =
            formKey === 'companies' ? 'companyData' :
                formKey === 'listings' ? 'listingData' :
                    formKey === 'income-statements' ? 'incomeStatementData' :
                        formKey === 'balance-sheets' ? 'balanceSheetData' :
                            formKey === 'cash-flows' ? 'cashFlowData' : null

        if (stateKey) {
            set({ [stateKey]: newData })
        }
    },

    addArrayItem: (formKey) => {
        const currentData = get().getFormData(formKey)
        const blueprint = formBlueprints[formKey]

        if (!Array.isArray(currentData) || currentData.length === 0) {
            const hasData = Object.keys(currentData).length > 0
            const initialArray = hasData ? [currentData, { ...blueprint }] : [{ ...blueprint }]
            get().updateFormData(formKey, initialArray)
        } else {
            get().updateFormData(formKey, [...currentData, { ...blueprint }])
        }
    },

    removeLastArrayItem: (formKey) => {
        const currentData = get().getFormData(formKey)
        if (!Array.isArray(currentData)) return

        if (currentData.length <= 1) {
            get().updateFormData(formKey, { ...formBlueprints[formKey] })
        } else {
            get().updateFormData(formKey, currentData.slice(0, -1))
        }
    },

    toast: null,

    showToast: (message, type = 'success') => set({
        toast: { message, type }
    }),

    hideToast: () => set({ toast: null })
}))