import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from '../api/axiosClient'

// Hook untuk Fetch Data List (GET)
export function useGetCompanies(page = 1, pageSize = 20, keyword = '', sectorId = '') {
    return useQuery({
        queryKey: ['admin-companies', page, pageSize, keyword, sectorId],
        queryFn: async () => {
            const response = await axiosClient.get('/admin/companies', {
                params: {
                    page,
                    pageSize,
                    keyword: keyword || undefined,
                    sectorId: sectorId || undefined,
                },
            })
            return response.data
        },
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000,
    })
}

export function useGetCompanyDetail(id) {
    return useQuery({
        queryKey: ['admin-companies', id],
        queryFn: async () => {
            const response = await axiosClient.get(`/admin/companies/${id}`)
            return response.data
        },
        enabled: !!id,
    })
}

// Hook untuk Create Data Baru (POST) - Mendukung Single & Bulk Array
export function useCreateCompany() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload) => {
            // Jika payload berupa array, tembak ke endpoint bulk, jika objek ke endpoint biasa
            const endpoint = Array.isArray(payload) ? '/companies/bulk' : '/companies'
            const response = await axiosClient.post(endpoint, payload)
            return response.data
        },
        onSuccess: () => {
            // Otomatis bersihkan cache 'companies' agar halaman List langsung terupdate otomatis
            queryClient.invalidateQueries({ queryKey: ['companies'] })
        },
    })
}