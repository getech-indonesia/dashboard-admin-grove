import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from '../api/axiosClient'

export function useGetStockPrices(page = 1, pageSize = 20, keyword = '', period = '') {
    return useQuery({
        queryKey: ['admin-stock-prices', page, pageSize, keyword, period, sectorId],
        queryFn: async () => {
            const response = await axiosClient.get('/admin/stock-prices', {
                params: {
                    page,
                    pageSize,
                    keyword: keyword || undefined,
                    period: period || undefined,
                    sectorId: sectorId || undefined
                }
            })
            return response.data
        },
        placeholderData: (previousData) => previousData,
    })
}

export function useGetStockPriceDetail(id) {
    return useQuery({
        queryKey: ['admin-stock-prices', id],
        queryFn: async () => {
            const response = await axiosClient.get(`/admin/stock-prices/${id}`)
            return response.data
        },
        enabled: !!id,
        staleTime: 0,
    })
}

export function useUpsertStockPrice() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload) => {
            const response = await axiosClient.post('/admin/stock-prices/upsert', payload)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-stock-prices'] })
        }
    })
}
