import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from '../api/axiosClient'

// Hook untuk Fetch Data List (GET)
export function useGetCompanies(page = 1, pageSize = 20) {
    return useQuery({
        // Masukkan page dan pageSize ke queryKey agar TanStack Query mendeteksi pergantian halaman
        queryKey: ['admin-companies', page, pageSize],
        queryFn: async () => {
            const response = await axiosClient.get('/admin/companies', {
                params: {
                    page,
                    pageSize,
                },
            })
            return response.data // Mengembalikan total objek sesuai contoh response Anda ({ items: [], pagination: {} })
        },
        placeholderData: (previousData) => previousData, // Pengaman agar UI tidak berkedip (flicker) saat berpindah halaman
        staleTime: 5 * 60 * 1000, // Cache aman selama 5 menit
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